export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsPromise: Promise<any> | null = null;

async function getPdfJs() {
  if (typeof window === "undefined") return null;

  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      const workerSrc = (await import(
        "pdfjs-dist/build/pdf.worker.min.mjs?url"
      )).default;

      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    })();
  }

  return pdfjsPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const pdfjs = await getPdfJs();
    if (!pdfjs) throw new Error("Browser only");

    const pdf = await pdfjs.getDocument({
      data: await file.arrayBuffer(),
    }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 3 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve({ imageUrl: "", file: null });

        resolve({
          imageUrl: URL.createObjectURL(blob),
          file: new File(
            [blob],
            file.name.replace(/\.pdf$/i, ".png"),
            { type: "image/png" }
          ),
        });
      }, "image/png");
    });
  } catch (err) {
    return { imageUrl: "", file: null, error: String(err) };
  }
}
