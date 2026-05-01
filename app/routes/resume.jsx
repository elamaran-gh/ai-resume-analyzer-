import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
  { title: "Resume | Review" },
  {
    name: "description",
    content: "View detailed resume analysis and feedback.",
  },
]);

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState(null);

  // protect route
  useEffect(() => {
    if (!isLoading && !auth?.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading, auth?.isAuthenticated, navigate, id]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const resumeData = await kv.get(`resume:${id}`);
        if (!resumeData) return;

        const data = JSON.parse(resumeData);

        // PDF
        const resumeBlob = await fs.read(data.resumePath);
        if (!resumeBlob) return;

        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        const resumeUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeUrl);

        // Image
        const imageBlob = await fs.read(data.imagePath);
        if (!imageBlob) return;

        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);

        setFeedback(data.feedback);

        console.log({
          resumeUrl,
          imageUrl,
          feedback: data.feedback,
        });
      } catch (error) {
        console.error("Error loading resume:", error);
      }
    };

    if (id && auth?.isAuthenticated) {
      loadResume();
    }
  }, [id, auth?.isAuthenticated, fs, kv]);

  return (
    <main className="!pt-0 bg-gray-800 bg-cover min-h-screen">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icon/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* LEFT SIDE */}
        <section className="feedback-section bg-gray-800 bg-cover h-[100vh] sticky top-0 flex items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:mx-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  alt="Resume Preview"
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        {/* RIGHT SIDE */}
        <section className="feedback-section">
          <h2 className="text-4xl text-white font-bold">
            Resume Review
          </h2>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback?.ATS?.score ?? 0}
                suggestion={feedback?.ATS?.tips ?? []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
             
            <div className="w-full flex items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;