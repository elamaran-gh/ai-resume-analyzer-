import Navbar from "~/component/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/component/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter"; 


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() { 
  const { auth, kv} = usePuterStore();
  const navigate= useNavigate();
  const[resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState(false);
 
useEffect( () => {
  if(!auth.isAuthenticated) navigate('/auth?next=/');
}, [auth.isAuthenticated])

useEffect(() => {
  const loadResume= async () => {
    setLoadingResume(true);

    const resume = (await kv.list('resume:*', true)) as KVItem [];

    const parseResume = resume?.map((resume)=> (
      JSON.parse(resume.value) as Resume 
    ))

    console.log('parseResume', parseResume);
    setResumes(parseResume || []);
    setLoadingResume(false);
  }

  loadResume();
}, []);


 


  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    
    <Navbar/>

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume ratings</h1>
        {!loadingResume && resumes?.length === 0 ? (
                <h2>No resume found. Upload your first resume to get feedback.</h2>
        ): (
               <h2>Review your submissions and check AI-Powered feedback.</h2>
        )}
      </div>
      {loadingResume && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
        </div>
      )}

     {!loadingResume && resumes.length > 0 && (
      <div className="resumes-section">
       {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume}/>
     ))}
     </div>
    )}
     {!loadingResume && resumes?.length === 0 && (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
          Upload Resume
        </Link>
      </div>
     )}
    </section>
  </main>
}
