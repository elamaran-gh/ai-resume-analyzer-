import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/component/FileUploader';
import Navbar from '~/component/Navbar'
import { convertPdfToImage } from '~/lib/pdftoimage';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from './constant';
import Details from '~/component/Details';

const USE_MOCK_AI = true; // set false when Puter AI works

const MOCK_FEEDBACK = {
  overallScore: Math.floor(Math.random() * 20) + 70, // 80-99
  ATSScore: Math.floor(Math.random() * 20) + 70, // 80-99
  toneAndStyle: { score: Math.floor(Math.random() * 10) + 40},
  content: { score: Math.floor(Math.random() * 10) + 60 },
  structure: { score: Math.floor(Math.random() * 10) + 50 },
  skills: { score: Math.floor(Math.random() * 10) + 70 }
};



const upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
   
     

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string; jobTitle: string; jobDescription: string; file: File; }) => {
        setIsProcessing(true);
        setStatusText('Uploading the file...');

        const uploadFile = await fs.upload([file]);
        if (!uploadFile) return setStatusText('Error: Failed to Upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to Image');

        setStatusText('Uploading the image...');
        const uploadImage = await fs.upload([imageFile.file]);
        if (!uploadImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadFile.path,
            imagePath: uploadImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing ...');


        //  MOCK AI (EXACT REPLACEMENT)
        let feedbackData: any;

        if (USE_MOCK_AI) {
            feedbackData = MOCK_FEEDBACK;
        } else {
            const feedback = await ai.feedback(
                uploadImage.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            if (!feedback) {
                setStatusText('Error: Failed to analyze resume');
                return;
            }

            const feedbackText =
                typeof feedback.message.content === 'string'
                    ? feedback.message.content
                    : feedback.message.content[0].text;

            try {
                feedbackData = JSON.parse(feedbackText);
            } catch {
                feedbackData = { text: feedbackText };
            }
        }

        data.feedback = feedbackData;
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analysis complete! Redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
        return <Details feedback={feedbackData} />;


    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget.closest('form');
        if (!form) return;

        const formData = new FormData(form);


        const companyName = formData.get('company-name')?.toString() || '';
        const jobTitle = formData.get('job-title')?.toString() || '';
        const jobDescription = formData.get('job-description')?.toString() || '';

        if (!file) return;

        handleAnalyze({ file, companyName, jobTitle, jobDescription });

    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">

            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream jobs</h1>
                    {isProcessing ? (
                        <>

                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="Company-name"> Company Name </label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title"> Job Title </label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description"> Job Description  </label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader"> Uploade resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>

                        </form>
                    )

                    }
                </div>


            </section>
        </main>
    )
}


export default upload