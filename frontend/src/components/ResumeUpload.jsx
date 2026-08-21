import { useState } from "react";

import {
    uploadResume
} from "../services/api";

import {
    useAuth
} from "../context/AuthContext";

import Loading from "./Loading";


function ResumeUpload({
    onUploadSuccess
}) {

    const {
        user
    } = useAuth();

    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);

    const [
        result,
        setResult
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);


    const role = String(
        user?.role || "VIEWER"
    ).toUpperCase();


    const handleFileChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        setError("");
        setResult(null);

        if (!file) {

            setSelectedFile(null);

            return;
        }

        const fileName =
            file.name.toLowerCase();

        const validFile =
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".txt");

        if (!validFile) {

            setSelectedFile(null);

            setError(
                "Only PDF and TXT files are supported."
            );

            return;
        }

        setSelectedFile(file);
    };


    const handleUpload = async () => {

        if (!selectedFile) {

            setError(
                "Please select a PDF or TXT resume."
            );

            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {

            const data =
                await uploadResume(
                    selectedFile
                );

            setResult(data);

            setSelectedFile(null);

            const fileInput =
                document.getElementById(
                    "resume-file-input"
                );

            if (fileInput) {

                fileInput.value = "";

            }

            if (onUploadSuccess) {

                onUploadSuccess(data);

            }

        } catch (uploadError) {

            console.error(
                "Resume upload error:",
                uploadError
            );

            const serverMessage =
                uploadError
                    ?.response
                    ?.data
                    ?.detail;

            setError(
                serverMessage ||
                "Resume upload failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="upload-card">

            <div className="upload-header">

                <div>

                    <h2>
                        Upload My Resume
                    </h2>

                    <p>
                        Upload your resume to receive
                        AI-powered job matching scores.
                    </p>

                </div>

            </div>


            <div className="upload-area">

                <div className="upload-icon">
                    📄
                </div>

                <h3>
                    Choose your resume
                </h3>

                <p>
                    PDF or TXT files only
                </p>


                <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={
                        handleFileChange
                    }
                    disabled={
                        loading
                    }
                    hidden
                />


                <label
                    htmlFor="resume-file-input"
                    className="secondary-button"
                >
                    Choose File
                </label>


                {selectedFile && (

                    <div className="selected-file">

                        <span>
                            Selected file:
                        </span>

                        <strong>
                            {selectedFile.name}
                        </strong>

                    </div>

                )}


                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {loading ? (

                    <Loading
                        message={
                            "Parsing resume with AI..."
                        }
                    />

                ) : (

                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            handleUpload
                        }
                        disabled={
                            !selectedFile
                        }
                    >
                        Upload Resume
                    </button>

                )}

            </div>


            {result && (

                <div className="success-message">

                    <strong>
                        Resume uploaded successfully!
                    </strong>

                    <p>
                        Candidate:{" "}
                        {result.candidate?.name ||
                            "Candidate"}
                    </p>

                    <p>
                        Your resume has been
                        saved to your account.
                    </p>

                    <p>
                        Go to
                        {" "}
                        <strong>
                            My Screening Results
                        </strong>
                        {" "}
                        to view your scores.
                    </p>

                </div>

            )}

        </div>

    );
}


export default ResumeUpload;