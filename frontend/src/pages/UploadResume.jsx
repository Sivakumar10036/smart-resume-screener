import ResumeUpload from "../components/ResumeUpload";


function UploadResume() {

    return (
        <div className="page-container">

            <div className="page-header">

                <h1>
                    Upload Resumes
                </h1>

                <p>
                    Upload PDF or TXT resumes
                    for AI-powered parsing.
                </p>

            </div>

            <ResumeUpload />

        </div>
    );
}


export default UploadResume;