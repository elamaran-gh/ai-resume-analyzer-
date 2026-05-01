import { useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdftoimage";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "./constant";

const USE_MOCK_AI = true;

const MOCK_FEEDBACK = {
  overallScore: Math.floor(Math.random() * 20) + 70,
  ATSScore: Math.floor(Math.random() * 20) + 70,
  toneAndStyle: { score: Math.floor(Math.random() * 10) + 40 },
  content: { score: Math.floor(Math.random() * 10) + 60 },
  structure: { score: Math.floor(Math.random() * 10) + 50 },
  skills: { score: Math.floor(Math.random() * 10) + 70 },
};

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState(null);

  const handleFileSelect = (file) => {
    setFile(file);
  };

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading the file...");

      const uploadFile = await fs.upload([file]);
      if (!uploadFile) return setStatusText("Error: Failed to upload file");

      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile?.file) return setStatusText("Error: Failed to convert PDF");

      setStatusText("Uploading the image...");
      const uploadImage = await fs.upload([imageFile.file]);
      if (!uploadImage) return setStatusText("Error: Failed to upload image");

      setStatusText("Preparing data...");

      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadFile.path,
        imagePath: uploadImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing resume...");

      let feedbackData;

      if (USE_MOCK_AI) {
        feedbackData = MOCK_FEEDBACK;
      } else {
        const feedback = await ai.feedback(
          uploadImage.path,
          prepareInstructions({ jobTitle, jobDescription })
        );

        if (!feedback) {
          setStatusText("Error: Failed to analyze resume");
          return;
        }

        const feedbackText =
          typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content?.[0]?.text;

        try {
          feedbackData = JSON.parse(feedbackText);
        } catch {
          feedbackData = { text: feedbackText };
        }
      }

      data.feedback = feedbackData;
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analysis complete! Redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setStatusText("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name")?.toString() || "";
    const jobTitle = formData.get("job-title")?.toString() || "";
    const jobDescription = formData.get("job-description")?.toString() || "";

    if (!file) return;

    handleAnalyze({ file, companyName, jobTitle, jobDescription });
  };

  return (
    <main className="bg-gray-800 min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="text-white font-[mono]">
            Smart feedback for your dream jobs
          </h1>

          {/*  Spinner Loader */}
          {isProcessing ? (
            <div className="flex flex-col items-center gap-6 mt-6">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
              <h2 className="text-white text-center">{statusText}</h2>
            </div>
          ) : (
            <h2 className="text-white">
              Drop your resume for an ATS score and improvement tips
            </h2>
          )}

          {/* Form */}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">
                  <p className="text-white">Company Name</p>
                </label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">
                  <p className="text-white">Job Title</p>
                </label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">
                  <p className="text-white">Job Description</p>
                </label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">
                  <p className="text-white">Upload resume</p>
                </label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;