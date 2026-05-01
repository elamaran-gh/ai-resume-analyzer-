import React from "react";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

// Category Component
const Category = ({ title, score }) => {
  const safeScore = Number(score);

  const textColor =
    safeScore > 70
      ? "text-green-600"
      : safeScore > 49
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-2xl font-semibold">{title}</p>
          <ScoreBadge score={safeScore} />
        </div>

        <p className="text-2xl font-semibold">
          <span className={textColor}>
            {Number.isFinite(safeScore) ? safeScore : "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

// Main Component
const Summary = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading summary...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback?.overallScore} />

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Your Resume Score</h2>
          <p>
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>

      <Category title="Tone & Style" score={feedback?.toneAndStyle?.score} />
      <Category title="Content" score={feedback?.content?.score} />
      <Category title="Structure" score={feedback?.structure?.score} />
      <Category title="Skills" score={feedback?.skills?.score} />
    </div>
  );
};

export default Summary;