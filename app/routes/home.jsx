import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta() {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loadingResume, setLoadingResume] = useState(false);

  // protect route
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth?.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoadingResume(true);

        const resumeList = await kv.list("resume:*", true);

        const parseResume = resumeList
          ?.map((item) => {
            try {
              return JSON.parse(item.value);
            } catch (e) {
              console.error("Invalid JSON:", item.value);
              return null;
            }
          })
          .filter(Boolean);

        setResumes(parseResume || []);
      } catch (error) {
        console.error("Error loading resumes:", error);
      } finally {
        setLoadingResume(false);
      }
    };

    if (auth?.isAuthenticated) {
      loadResume();
    }
  }, [auth?.isAuthenticated, kv]);

  return (
    <main className="bg-gray-800 min-h-screen">

      <Navbar />

      <section className="main-section max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="page-heading py-16 text-center">
          <h1 className="text-white text-3xl font-bold">
            Track Your Application & Resume Ratings
          </h1>

          {!loadingResume && resumes.length === 0 && (
            <h2 className="text-white mt-4 text-center">
              No resume found. Upload your first resume to get feedback.
            </h2>
          )}

          {!loadingResume && resumes.length > 0 && (
            <h2 className="text-white mt-4 text-center">
              Review your submissions and check AI-powered feedback.
            </h2>
          )}
        </div>

        {/* Spinner Loader */}
        {loadingResume && (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Resume Cards */}
        {!loadingResume && resumes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 pb-10">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingResume && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button text-lg font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}