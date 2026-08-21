import { useState } from "react";

import {
    uploadResume
} from "../services/api";

import Loading from "./Loading";


function ResumeUpload({
    onUploadSuccess
}) {

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


    const handleFileChange = (
        event
    ) => {

        const file =
            event.target.files[0];

        setError("");
        setResult(null);

        if (!file) {

            setSelectedFile(null);

            return;
        }

        const fileName =
            file.name.toLowerCase();

        if (
            !fileName.endsWith(".pdf") &&
            !fileName.endsWith(".txt")
        ) {

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

        try {

            setLoading(true);
            setError("");

            const data =
                await uploadResume(
                    selectedFile
                );

            setResult(data);

            setSelectedFile(null);

            if (onUploadSuccess) {

                onUploadSuccess(data);
            }

        } catch (uploadError) {

            setError(
                uploadError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Resume upload failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="upload-card">

            <h2>
                Upload Resume
            </h2>

            <p>
                Supported formats: PDF, TXT
            </p>

            <input
                type="file"
                accept=".pdf,.txt"
                onChange={
                    handleFileChange
                }
            />

            {selectedFile && (

                <div className="selected-file">

                    Selected:
                    {" "}
                    {selectedFile.name}

                </div>

            )}


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {loading ? (

                <Loading
                    message="Parsing resume with AI..."
                />

            ) : (

                <button
                    className="primary-button"
                    onClick={
                        handleUpload
                    }
                >
                    Upload Resume
                </button>

            )}


            {result && (

                <div className="success-message">

                    Resume processed successfully.

                    <br />

                    Candidate:
                    {" "}
                    {result.candidate?.name}

                </div>

            )}

        </div>
    );
}


export default ResumeUpload;