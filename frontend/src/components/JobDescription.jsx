import { useState } from "react";

import {
    createJob
} from "../services/api";

import Loading from "./Loading";


function JobDescription({
    onJobCreated
}) {

    const [
        title,
        setTitle
    ] = useState("");

    const [
        description,
        setDescription
    ] = useState("");

    const [
        job,
        setJob
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setJob(null);

        const trimmedTitle =
            title.trim();

        const trimmedDescription =
            description.trim();


        if (!trimmedTitle) {

            setError(
                "Please enter a job title."
            );

            return;
        }


        if (!trimmedDescription) {

            setError(
                "Please enter a job description."
            );

            return;
        }


        try {

            setLoading(true);


            const jobData = {

                title:
                    trimmedTitle,

                description:
                    trimmedDescription

            };


            const data =
                await createJob(
                    jobData
                );


            setJob(data);

            setTitle("");
            setDescription("");


            if (onJobCreated) {

                onJobCreated(
                    data
                );

            }

        } catch (jobError) {

            const responseDetail =
                jobError
                    ?.response
                    ?.data
                    ?.detail;


            if (
                Array.isArray(
                    responseDetail
                )
            ) {

                setError(
                    responseDetail
                        .map(
                            item =>
                                item.msg
                        )
                        .join(
                            ", "
                        )
                );

            } else {

                setError(
                    responseDetail
                    ||
                    jobError?.message
                    ||
                    "Failed to create job."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="job-card">

            <h2>
                Create Job Description
            </h2>


            <p className="job-card-description">
                Enter the job title and complete
                requirements for candidate screening.
            </p>


            <form
                onSubmit={
                    handleSubmit
                }
            >

                <label
                    htmlFor="job-title"
                >
                    Job Title
                </label>


                <input
                    id="job-title"
                    type="text"
                    placeholder="Full Stack Developer"
                    value={title}
                    onChange={
                        event =>
                            setTitle(
                                event.target.value
                            )
                    }
                    disabled={
                        loading
                    }
                />


                <label
                    htmlFor="job-description"
                >
                    Job Description
                </label>


                <textarea
                    id="job-description"
                    rows="12"
                    placeholder="Enter the complete job description..."
                    value={description}
                    onChange={
                        event =>
                            setDescription(
                                event.target.value
                            )
                    }
                    disabled={
                        loading
                    }
                />


                {error && (

                    <div
                        className="error-message"
                    >
                        {error}
                    </div>

                )}


                {loading ? (

                    <Loading
                        message="Creating job..."
                    />

                ) : (

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Create Job
                    </button>

                )}

            </form>


            {job && (

                <div
                    className="success-message"
                >

                    <strong>
                        Job created successfully
                    </strong>


                    <p>
                        Job ID:
                        {" "}
                        {job.job_id}
                    </p>


                    <p>
                        Required Skills:
                    </p>


                    <div
                        className="skills-list"
                    >

                        {(
                            job.required_skills
                            || []
                        ).map(
                            (
                                skill,
                                index
                            ) => (

                                <span
                                    className="skill matched"
                                    key={
                                        `${skill}-${index}`
                                    }
                                >
                                    {skill}
                                </span>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>

    );
}


export default JobDescription;