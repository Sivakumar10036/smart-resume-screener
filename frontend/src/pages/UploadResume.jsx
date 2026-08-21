import ResumeUpload from "../components/ResumeUpload";

import {
    useAuth
} from "../context/AuthContext";


function UploadResume() {

    const {
        user
    } = useAuth();


    const role =
        String(
            user?.role ||
            "VIEWER"
        ).toUpperCase();


    const isViewer =
        role === "VIEWER";


    return (

        <div className="page-container">

            <div className="page-header">

                <h1>

                    {isViewer
                        ? "Upload My Resume"
                        : "Upload Resumes"
                    }

                </h1>


                <p>

                    {isViewer

                        ? "Upload your resume to get your AI-powered job screening score."

                        : "Upload PDF or TXT resumes for AI-powered parsing."
                    }

                </p>

            </div>


            <ResumeUpload />

        </div>

    );

}


export default UploadResume;