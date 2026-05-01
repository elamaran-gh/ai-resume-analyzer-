import { Link } from "react-router-dom";
import ScoreCircle from "./ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume }) => {
  const { id, companyName, jobTitle, feedback, imagePath } = resume || {};

  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";

    const loadResume = async () => {
      try {
        if (!imagePath) return;

        const blob = await fs.read(imagePath);
        if (!blob) return;

        objectUrl = URL.createObjectURL(blob);
        setResumeUrl(objectUrl);
      } catch (err) {
        console.error("Error loading resume:", err);
      }
    };

    loadResume();

    
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imagePath, fs]);

  return (
    <Link
      to={`/resume/${id}`}
      className="
        bg-white rounded-xl shadow-md overflow-hidden
        w-full sm:w-[300px] flex-shrink-0
        transition-transform duration-300 hover:scale-105
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start p-4 gap-3">
        <div className="flex flex-col gap-1 overflow-hidden">
          {companyName && (
            <h2 className="text-black font-bold break-words text-lg">
              {companyName}
            </h2>
          )}

          {jobTitle && (
            <h3 className="text-gray-500 text-sm break-words">
              {jobTitle}
            </h3>
          )}

          {!companyName && !jobTitle && (
            <h2 className="text-black font-bold">Resume</h2>
          )}
        </div>

        <div className="flex-shrink-0">
          <ScoreCircle score={feedback?.overallScore || 0} />
        </div>
      </div>

      {/* Image */}
      {resumeUrl && (
        <div className="w-full h-[300px] bg-gray-100 overflow-hidden">
          <img
            src={resumeUrl}
            alt="resume"
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}
    </Link>
  );
};

export default ResumeCard;