import React from "react";

const ScoreBadge = ({ score }) => {
  const s = typeof score === "number" ? score : NaN;

  let bg = "bg-red-100 text-red-800";
  let label = "Needs Work";

  if (!Number.isFinite(s)) {
    bg = "bg-gray-100 text-gray-800";
    label = "N/A";
  } else if (s > 70) {
    bg = "bg-green-100 text-green-800";
    label = "Strong";
  } else if (s > 49) {
    bg = "bg-yellow-100 text-yellow-800";
    label = "Good Start";
  } else {
    bg = "bg-red-100 text-red-800";
    label = "Needs Work";
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bg}`}
      aria-label={`Score badge: ${label}`}
    >
      {label}
    </span>
  );
};

export default ScoreBadge;