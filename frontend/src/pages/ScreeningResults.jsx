import {
    useEffect,
    useState
} from "react";

import {
    getJobs,
    getMyResume,
    getJobScreeningResults,
    getMyScreeningResults,
    matchMyResume,
    calculateScreeningResults,
    exportFinalShortlist
} from "../services/api";

import Loading from "../components/Loading";

import {
    useAuth
} from "../context/AuthContext";


function ScreeningResults()
{
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


    const isRecruiter =
        role === "RECRUITER";


    const isAdmin =
        role === "ADMIN";


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        selectedJob,
        setSelectedJob
    ] = useState("");


    const [
        resumes,
        setResumes
    ] = useState([]);


    const [
        selectedResume,
        setSelectedResume
    ] = useState("");


    const [
        results,
        setResults
    ] = useState([]);


    const [
        viewerResults,
        setViewerResults
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        calculating,
        setCalculating
    ] = useState(false);


    const [
        exporting,
        setExporting
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    const [
        selectedResult,
        setSelectedResult
    ] = useState(null);


    const getRecommendationFromScore =
        score =>
        {
            const numericScore =
                Number(
                    score
                ) || 0;


            if (
                numericScore >= 75
            )
            {
                return "SHORTLIST";
            }


            if (
                numericScore >= 55
            )
            {
                return "REVIEW";
            }


            return "REJECT";
        };


    const getScore =
        result =>
        {
            return Number(
                result?.match_score
            ) || 0;
        };


    const getCandidateName =
        result =>
        {
            return (
                result?.candidate_name ||
                result?.candidate ||
                result?.name ||
                "Unknown Candidate"
            );
        };


    const getCandidateEmail =
        result =>
        {
            return (
                result?.candidate_email ||
                result?.email ||
                "Candidate"
            );
        };


    const getJobTitle =
        result =>
        {
            if (
                result?.job_title
            )
            {
                return result.job_title;
            }


            const job =
                jobs.find(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(
                            result?.job_id
                        )
                );


            return (
                job?.title ||
                "Job"
            );
        };


    const getRecommendation =
        result =>
        {
            const existingRecommendation =
                String(
                    result?.recommendation ||
                    ""
                ).toUpperCase();


            if (
                existingRecommendation ===
                "SHORTLIST"
            )
            {
                return "SHORTLIST";
            }


            if (
                existingRecommendation ===
                "REVIEW"
            )
            {
                return "REVIEW";
            }


            if (
                existingRecommendation ===
                "REJECT"
            )
            {
                return "REJECT";
            }


            return getRecommendationFromScore(
                getScore(
                    result
                )
            );
        };


    const getRecommendationClass =
        recommendation =>
        {
            const value =
                String(
                    recommendation
                ).toUpperCase();


            if (
                value ===
                "SHORTLIST"
            )
            {
                return "recommendation-shortlist";
            }


            if (
                value ===
                "REJECT"
            )
            {
                return "recommendation-reject";
            }


            return "recommendation-review";
        };


    const getScoreClass =
        score =>
        {
            const numericScore =
                Number(
                    score
                ) || 0;


            if (
                numericScore >= 75
            )
            {
                return "score-high";
            }


            if (
                numericScore >= 55
            )
            {
                return "score-medium";
            }


            return "score-low";
        };


    const selectedResumeObject =
        resumes.find(
            resume =>
                String(
                    resume._id
                ) ===
                String(
                    selectedResume
                )
        );


    const selectedJobObject =
        jobs.find(
            job =>
                String(
                    job._id
                ) ===
                String(
                    selectedJob
                )
        );


    const findExistingViewerResult =
        (
            resumeId,
            jobId
        ) =>
        {
            return viewerResults.find(
                result =>
                    String(
                        result.candidate_id
                    ) ===
                    String(
                        resumeId
                    ) &&
                    String(
                        result.job_id
                    ) ===
                    String(
                        jobId
                    )
            );
        };


    const normalizeViewerResult =
        result =>
        {
            const score =
                Number(
                    result?.match_score
                ) || 0;


            return {

                ...result,

                candidate_id:
                    result?.candidate_id ||
                    selectedResume,

                candidate_name:
                    result?.candidate_name ||
                    result?.candidate ||
                    selectedResumeObject?.name ||
                    "My Resume",

                candidate_email:
                    result?.candidate_email ||
                    result?.email ||
                    selectedResumeObject?.email ||
                    "",

                job_id:
                    result?.job_id ||
                    selectedJob,

                job_title:
                    result?.job_title ||
                    result?.job ||
                    selectedJobObject?.title ||
                    "Selected Job",

                match_score:
                    score,

                recommendation:
                    result?.recommendation ||
                    getRecommendationFromScore(
                        score
                    ),

                matched_skills:
                    Array.isArray(
                        result?.matched_skills
                    )
                        ? result.matched_skills
                        : [],

                missing_skills:
                    Array.isArray(
                        result?.missing_skills
                    )
                        ? result.missing_skills
                        : [],

                strengths:
                    Array.isArray(
                        result?.strengths
                    )
                        ? result.strengths
                        : [],

                justification:
                    result?.justification ||
                    ""

            };
        };


    const loadJobs =
        async () =>
        {
            try
            {
                setLoading(
                    true
                );

                setError("");


                const response =
                    await getJobs();


                setJobs(
                    response?.jobs ||
                    []
                );
            }
            catch (
                loadError
            )
            {
                console.error(
                    loadError
                );


                setError(
                    loadError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to load jobs."
                );
            }
            finally
            {
                setLoading(
                    false
                );
            }
        };


    const loadViewerData =
        async () =>
        {
            try
            {
                setLoading(
                    true
                );

                setError("");

                setSuccessMessage("");


                const [
                    jobsResponse,
                    resumeResponse,
                    resultsResponse
                ] =
                    await Promise.all([
                        getJobs(),
                        getMyResume(),
                        getMyScreeningResults()
                    ]);


                const availableJobs =
                    Array.isArray(
                        jobsResponse?.jobs
                    )
                        ? jobsResponse.jobs
                        : [];


                let myResumes = [];


                if (
                    Array.isArray(
                        resumeResponse?.candidates
                    )
                )
                {
                    myResumes =
                        resumeResponse.candidates;
                }
                else if (
                    Array.isArray(
                        resumeResponse?.candidate
                    )
                )
                {
                    myResumes =
                        resumeResponse.candidate;
                }
                else if (
                    resumeResponse?.candidate
                )
                {
                    myResumes = [
                        resumeResponse.candidate
                    ];
                }


                const previousResults =
                    Array.isArray(
                        resultsResponse?.results
                    )
                        ? resultsResponse.results
                        : [];


                setJobs(
                    availableJobs
                );


                setResumes(
                    myResumes
                );


                setViewerResults(
                    previousResults
                );


                setResults(
                    previousResults
                );


                if (
                    myResumes.length > 0
                )
                {
                    setSelectedResume(
                        previousResume =>
                        {
                            const exists =
                                myResumes.some(
                                    resume =>
                                        String(
                                            resume._id
                                        ) ===
                                        String(
                                            previousResume
                                        )
                                );


                            if (
                                exists
                            )
                            {
                                return previousResume;
                            }


                            return String(
                                myResumes[0]._id
                            );
                        }
                    );
                }
                else
                {
                    setSelectedResume(
                        ""
                    );
                }


                if (
                    availableJobs.length > 0
                )
                {
                    setSelectedJob(
                        previousJob =>
                        {
                            const exists =
                                availableJobs.some(
                                    job =>
                                        String(
                                            job._id
                                        ) ===
                                        String(
                                            previousJob
                                        )
                                );


                            if (
                                exists
                            )
                            {
                                return previousJob;
                            }


                            return String(
                                availableJobs[0]._id
                            );
                        }
                    );
                }
                else
                {
                    setSelectedJob(
                        ""
                    );
                }
            }
            catch (
                viewerError
            )
            {
                console.error(
                    viewerError
                );


                setJobs([]);

                setResumes([]);

                setResults([]);

                setViewerResults([]);


                setError(
                    viewerError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to load jobs and your resumes."
                );
            }
            finally
            {
                setLoading(
                    false
                );
            }
        };


    const loadResults =
        async jobId =>
        {
            if (
                !jobId
            )
            {
                setResults([]);

                return;
            }


            try
            {
                setLoading(
                    true
                );

                setError("");


                const response =
                    await getJobScreeningResults(
                        jobId
                    );


                const screeningResults =
                    response?.results ||
                    [];


                setResults(
                    screeningResults
                );
            }
            catch (
                resultError
            )
            {
                console.error(
                    resultError
                );


                setResults([]);


                setError(
                    resultError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to load screening results."
                );
            }
            finally
            {
                setLoading(
                    false
                );
            }
        };


    useEffect(
        () =>
        {
            if (
                isViewer
            )
            {
                loadViewerData();

                return;
            }


            loadJobs();
        },
        [
            isViewer
        ]
    );


    useEffect(
        () =>
        {
            if (
                !isViewer
            )
            {
                return;
            }


            if (
                !selectedResume ||
                !selectedJob
            )
            {
                setSelectedResult(
                    null
                );

                return;
            }


            const existingResult =
                findExistingViewerResult(
                    selectedResume,
                    selectedJob
                );


            if (
                existingResult
            )
            {
                setSelectedResult(
                    normalizeViewerResult(
                        existingResult
                    )
                );


                setSuccessMessage(
                    `Previous score loaded: ${getScore(
                        existingResult
                    ).toFixed(1)}%.`
                );
            }
            else
            {
                setSelectedResult(
                    null
                );

                setSuccessMessage(
                    ""
                );
            }

        },
        [
            selectedResume,
            selectedJob,
            viewerResults
        ]
    );


    const handleRefresh =
        async () =>
        {
            setError("");

            setSuccessMessage("");


            if (
                isViewer
            )
            {
                await loadViewerData();

                return;
            }


            await loadJobs();


            if (
                selectedJob
            )
            {
                await loadResults(
                    selectedJob
                );
            }
        };


    const handleViewerResumeChange =
        event =>
        {
            const resumeId =
                event.target.value;


            setSelectedResume(
                resumeId
            );


            setError("");

            setSuccessMessage("");

            setSelectedResult(
                null
            );


            if (
                resumeId &&
                selectedJob
            )
            {
                const existingResult =
                    findExistingViewerResult(
                        resumeId,
                        selectedJob
                    );


                if (
                    existingResult
                )
                {
                    setSelectedResult(
                        normalizeViewerResult(
                            existingResult
                        )
                    );


                    setSuccessMessage(
                        `Previous score loaded: ${getScore(
                            existingResult
                        ).toFixed(1)}%.`
                    );
                }
            }
        };


    const handleJobChange =
        event =>
        {
            const jobId =
                event.target.value;


            setSelectedJob(
                jobId
            );


            setError("");

            setSuccessMessage("");

            setSelectedResult(
                null
            );


            if (
                isViewer
            )
            {
                if (
                    selectedResume &&
                    jobId
                )
                {
                    const existingResult =
                        findExistingViewerResult(
                            selectedResume,
                            jobId
                        );


                    if (
                        existingResult
                    )
                    {
                        setSelectedResult(
                            normalizeViewerResult(
                                existingResult
                            )
                        );


                        setSuccessMessage(
                            `Previous score loaded: ${getScore(
                                existingResult
                            ).toFixed(1)}%.`
                        );
                    }
                }


                return;
            }


            loadResults(
                jobId
            );
        };


    const handleCheckScore =
        async () =>
        {
            setError("");

            setSuccessMessage("");


            if (
                !selectedResume
            )
            {
                setError(
                    "Please select a resume."
                );

                return;
            }


            if (
                !selectedJob
            )
            {
                setError(
                    "Please select a job."
                );

                return;
            }


            const previousResult =
                findExistingViewerResult(
                    selectedResume,
                    selectedJob
                );


            if (
                previousResult
            )
            {
                const oldResult =
                    normalizeViewerResult(
                        previousResult
                    );


                setSelectedResult(
                    oldResult
                );


                setSuccessMessage(
                    `Previous score loaded: ${getScore(
                        oldResult
                    ).toFixed(1)}%.`
                );


                return;
            }


            try
            {
                setCalculating(
                    true
                );


                const response =
                    await matchMyResume(
                        selectedResume,
                        selectedJob
                    );


                const apiResult =
                    response?.result ||
                    {};


                const score =
                    Number(
                        apiResult?.match_score
                    ) || 0;


                const newResult =
                {
                    result_id:
                        response?.screening_id,

                    candidate_id:
                        response?.candidate_id ||
                        selectedResume,

                    candidate_name:
                        response?.candidate ||
                        selectedResumeObject?.name ||
                        "My Resume",

                    candidate_email:
                        selectedResumeObject?.email ||
                        "",

                    job_id:
                        selectedJob,

                    job_title:
                        response?.job ||
                        response?.job_title ||
                        selectedJobObject?.title ||
                        "Selected Job",

                    match_score:
                        score,

                    recommendation:
                        apiResult?.recommendation ||
                        getRecommendationFromScore(
                            score
                        ),

                    matched_skills:
                        Array.isArray(
                            apiResult?.matched_skills
                        )
                            ? apiResult.matched_skills
                            : [],

                    missing_skills:
                        Array.isArray(
                            apiResult?.missing_skills
                        )
                            ? apiResult.missing_skills
                            : [],

                    strengths:
                        Array.isArray(
                            apiResult?.strengths
                        )
                            ? apiResult.strengths
                            : [],

                    justification:
                        apiResult?.justification ||
                        ""
                };


                setViewerResults(
                    previousResults =>
                    {
                        const filtered =
                            previousResults.filter(
                                result =>
                                    !(
                                        String(
                                            result.candidate_id
                                        ) ===
                                        String(
                                            selectedResume
                                        ) &&
                                        String(
                                            result.job_id
                                        ) ===
                                        String(
                                            selectedJob
                                        )
                                    )
                            );


                        return [
                            newResult,
                            ...filtered
                        ];
                    }
                );


                setResults(
                    previousResults =>
                    {
                        const filtered =
                            previousResults.filter(
                                result =>
                                    !(
                                        String(
                                            result.candidate_id
                                        ) ===
                                        String(
                                            selectedResume
                                        ) &&
                                        String(
                                            result.job_id
                                        ) ===
                                        String(
                                            selectedJob
                                        )
                                    )
                            );


                        return [
                            newResult,
                            ...filtered
                        ];
                    }
                );


                setSelectedResult(
                    newResult
                );


                setSuccessMessage(
                    `Your resume scored ${score.toFixed(
                        1
                    )}% for ${
                        newResult.job_title
                    }.`
                );
            }
            catch (
                scoreError
            )
            {
                console.error(
                    scoreError
                );


                setError(
                    scoreError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to calculate your resume score."
                );
            }
            finally
            {
                setCalculating(
                    false
                );
            }
        };


    const handleCalculate =
        async () =>
        {
            if (
                !selectedJob
            )
            {
                setError(
                    "Please select a job first."
                );

                return;
            }


            if (
                !isAdmin &&
                !isRecruiter
            )
            {
                setError(
                    "You do not have permission to calculate screening results."
                );

                return;
            }


            try
            {
                setCalculating(
                    true
                );

                setError("");

                setSuccessMessage("");

                setSelectedResult(
                    null
                );


                const response =
                    await calculateScreeningResults(
                        selectedJob
                    );


                const calculatedResults =
                    response?.candidates ||
                    response?.results ||
                    [];


                const normalizedResults =
                    calculatedResults.map(
                        result =>
                        {
                            const score =
                                Number(
                                    result.match_score
                                ) || 0;


                            return {

                                ...result,

                                match_score:
                                    score,

                                recommendation:
                                    result.recommendation ||
                                    getRecommendationFromScore(
                                        score
                                    )

                            };
                        }
                    );


                setResults(
                    normalizedResults
                );


                const total =
                    response?.total_candidates ||
                    response?.total ||
                    normalizedResults.length;


                const shortlisted =
                    normalizedResults.filter(
                        candidate =>
                            String(
                                candidate.recommendation ||
                                ""
                            ).toUpperCase() ===
                            "SHORTLIST"
                    ).length;


                setSuccessMessage(
                    `Screening completed for ${total} candidates. ${shortlisted} candidate(s) shortlisted.`
                );
            }
            catch (
                calculationError
            )
            {
                console.error(
                    calculationError
                );


                setError(
                    calculationError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to calculate screening results."
                );
            }
            finally
            {
                setCalculating(
                    false
                );
            }
        };


    const handleExport =
        async () =>
        {
            if (
                !selectedJob
            )
            {
                setError(
                    "Please select a job first."
                );

                return;
            }


            if (
                results.length === 0
            )
            {
                setError(
                    "There are no screening results to export."
                );

                return;
            }


            try
            {
                setExporting(
                    true
                );

                setError("");

                setSuccessMessage("");


                const file =
                    await exportFinalShortlist(
                        selectedJob
                    );


                const blob =
                    new Blob(
                        [file],
                        {
                            type:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        }
                    );


                const url =
                    window.URL.createObjectURL(
                        blob
                    );


                const job =
                    jobs.find(
                        item =>
                            String(
                                item._id
                            ) ===
                            String(
                                selectedJob
                            )
                    );


                const jobTitle =
                    job?.title ||
                    "Screening";


                const safeName =
                    jobTitle.replace(
                        /[^a-z0-9]/gi,
                        "_"
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    `${safeName}_screening_results.xlsx`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                window.URL.revokeObjectURL(
                    url
                );


                setSuccessMessage(
                    "Excel file downloaded successfully."
                );
            }
            catch (
                exportError
            )
            {
                console.error(
                    exportError
                );


                setError(
                    exportError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to export Excel file."
                );
            }
            finally
            {
                setExporting(
                    false
                );
            }
        };


    const shortlistedCount =
        results.filter(
            result =>
                getRecommendation(
                    result
                ) ===
                "SHORTLIST"
        ).length;


    const reviewCount =
        results.filter(
            result =>
                getRecommendation(
                    result
                ) ===
                "REVIEW"
        ).length;


    const rejectedCount =
        results.filter(
            result =>
                getRecommendation(
                    result
                ) ===
                "REJECT"
        ).length;


    const openResultDetails =
        result =>
        {
            setSelectedResult(
                result
            );
        };


    if (
        loading
    )
    {
        return (
            <Loading
                message={
                    isViewer
                        ? "Loading jobs and your resumes..."
                        : "Loading screening system..."
                }
            />
        );
    }


    return (

        <div
            className="screening-page"
        >

            <div
                className="screening-header"
            >

                <div>

                    <h1>
                        {
                            isViewer
                                ? "My Screening Results"
                                : "Screening Results"
                        }
                    </h1>


                    <p>
                        {
                            isViewer
                                ? "View your saved resume scores and calculate scores only for new resume-job combinations."
                                : "Select a job and evaluate candidates using AI-powered resume matching."
                        }
                    </p>

                </div>


                <button
                    type="button"
                    className="screening-refresh-button"
                    onClick={
                        handleRefresh
                    }
                    disabled={
                        loading ||
                        calculating ||
                        exporting
                    }
                >
                    ↻ Refresh
                </button>

            </div>


            {error && (

                <div
                    className="screening-error"
                >
                    {error}
                </div>

            )}


            {successMessage && (

                <div
                    className="screening-success"
                >
                    {successMessage}
                </div>

            )}


            {isViewer ? (

                <>

                    <div
                        className="recruiter-control-card"
                        style={{
                            marginBottom:
                                "25px"
                        }}
                    >

                        <div
                            className="control-header"
                        >

                            <div>

                                <span
                                    className="control-label"
                                >
                                    RESUME SCREENING
                                </span>


                                <h2>
                                    Check Your Resume Score
                                </h2>


                                <p>
                                    Select your resume and an available job. Existing scores are loaded automatically.
                                </p>

                            </div>

                        </div>


                        <div
                            className="job-selection-row"
                        >

                            <div
                                className="job-select-wrapper"
                            >

                                <label>
                                    Your Resume
                                </label>


                                <select
                                    value={
                                        selectedResume
                                    }
                                    onChange={
                                        handleViewerResumeChange
                                    }
                                    disabled={
                                        calculating
                                    }
                                >

                                    <option
                                        value=""
                                    >
                                        Select a resume
                                    </option>


                                    {resumes.map(
                                        resume => (

                                            <option
                                                key={
                                                    resume._id
                                                }
                                                value={
                                                    resume._id
                                                }
                                            >
                                                {
                                                    resume.resume_filename ||
                                                    resume.name ||
                                                    "Uploaded Resume"
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div
                                className="job-select-wrapper"
                            >

                                <label>
                                    Job Position
                                </label>


                                <select
                                    value={
                                        selectedJob
                                    }
                                    onChange={
                                        handleJobChange
                                    }
                                    disabled={
                                        calculating
                                    }
                                >

                                    <option
                                        value=""
                                    >
                                        Select a job
                                    </option>


                                    {jobs.map(
                                        job => (

                                            <option
                                                key={
                                                    job._id
                                                }
                                                value={
                                                    job._id
                                                }
                                            >
                                                {
                                                    job.title
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <button
                                type="button"
                                className="calculate-button"
                                onClick={
                                    handleCheckScore
                                }
                                disabled={
                                    calculating ||
                                    !selectedResume ||
                                    !selectedJob ||
                                    Boolean(
                                        findExistingViewerResult(
                                            selectedResume,
                                            selectedJob
                                        )
                                    )
                                }
                            >

                                {calculating
                                    ? "Calculating..."
                                    : findExistingViewerResult(
                                        selectedResume,
                                        selectedJob
                                    )
                                        ? "Score Already Calculated"
                                        : "Calculate Score"
                                }

                            </button>

                        </div>


                        {selectedResumeObject && (

                            <div
                                className="selected-job-card"
                                style={{
                                    marginTop:
                                        "18px"
                                }}
                            >

                                <div
                                    className="selected-job-icon"
                                >
                                    📄
                                </div>


                                <div>

                                    <span>
                                        Selected Resume
                                    </span>


                                    <strong>
                                        {
                                            selectedResumeObject.resume_filename ||
                                            selectedResumeObject.name ||
                                            "Uploaded Resume"
                                        }
                                    </strong>

                                </div>

                            </div>

                        )}


                        {selectedJobObject && (

                            <div
                                className="selected-job-card"
                                style={{
                                    marginTop:
                                        "12px"
                                }}
                            >

                                <div
                                    className="selected-job-icon"
                                >
                                    💼
                                </div>


                                <div>

                                    <span>
                                        Selected Position
                                    </span>


                                    <strong>
                                        {
                                            selectedJobObject.title
                                        }
                                    </strong>

                                </div>

                            </div>

                        )}


                        {resumes.length === 0 && (

                            <div
                                className="screening-empty"
                                style={{
                                    marginTop:
                                        "20px"
                                }}
                            >

                                <div
                                    className="empty-icon"
                                >
                                    📄
                                </div>


                                <h3>
                                    No Resumes Uploaded
                                </h3>


                                <p>
                                    Upload a resume first, then return here to check your score.
                                </p>

                            </div>

                        )}


                        {jobs.length === 0 && (

                            <div
                                className="screening-empty"
                                style={{
                                    marginTop:
                                        "20px"
                                }}
                            >

                                <div
                                    className="empty-icon"
                                >
                                    💼
                                </div>


                                <h3>
                                    No Active Jobs Available
                                </h3>


                                <p>
                                    There are currently no active jobs available for screening.
                                </p>

                            </div>

                        )}

                    </div>


                    {selectedResult && (

                        <div
                            className="screening-results-container"
                        >

                            <div
                                className="screening-results-title"
                            >

                                <div>

                                    <h2>
                                        Your Screening Result
                                    </h2>


                                    <p>
                                        Previously calculated results are loaded without recalculating.
                                    </p>

                                </div>

                            </div>


                            <div
                                style={{
                                    background:
                                        "#ffffff",
                                    border:
                                        "1px solid #e2e8f0",
                                    borderRadius:
                                        "16px",
                                    padding:
                                        "28px",
                                    boxShadow:
                                        "0 4px 14px rgba(15, 23, 42, 0.06)"
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "flex-start",
                                        gap:
                                            "20px",
                                        marginBottom:
                                            "25px"
                                    }}
                                >

                                    <div>

                                        <span
                                            style={{
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#64748b",
                                                fontWeight:
                                                    "700",
                                                textTransform:
                                                    "uppercase"
                                            }}
                                        >
                                            Screening Result
                                        </span>


                                        <h2
                                            style={{
                                                margin:
                                                    "8px 0 0",
                                                color:
                                                    "#0f172a"
                                            }}
                                        >
                                            {
                                                selectedResult.job_title ||
                                                selectedJobObject?.title ||
                                                "Selected Job"
                                            }
                                        </h2>

                                    </div>


                                    <div
                                        className={
                                            `score-circle ${getScoreClass(
                                                getScore(
                                                    selectedResult
                                                )
                                            )}`
                                        }
                                    >
                                        {
                                            getScore(
                                                selectedResult
                                            ).toFixed(
                                                1
                                            )
                                        }%
                                    </div>

                                </div>


                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap:
                                            "16px",
                                        marginBottom:
                                            "25px"
                                    }}
                                >

                                    <div
                                        className="screening-stat-card"
                                    >

                                        <div>

                                            <p>
                                                Match Score
                                            </p>


                                            <h2>
                                                {
                                                    getScore(
                                                        selectedResult
                                                    ).toFixed(
                                                        1
                                                    )
                                                }%
                                            </h2>

                                        </div>

                                    </div>


                                    <div
                                        className="screening-stat-card"
                                    >

                                        <div>

                                            <p>
                                                Recommendation
                                            </p>


                                            <h2>
                                                {
                                                    getRecommendation(
                                                        selectedResult
                                                    )
                                                }
                                            </h2>

                                        </div>

                                    </div>


                                    <div
                                        className="screening-stat-card"
                                    >

                                        <div>

                                            <p>
                                                Job
                                            </p>


                                            <h2
                                                style={{
                                                    fontSize:
                                                        "18px"
                                                }}
                                            >
                                                {
                                                    selectedResult.job_title ||
                                                    selectedJobObject?.title ||
                                                    "Job"
                                                }
                                            </h2>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(280px, 1fr))",
                                        gap:
                                            "20px"
                                    }}
                                >

                                    <div
                                        className="modal-section"
                                    >

                                        <h3>
                                            Matched Skills
                                        </h3>


                                        <div
                                            className="skill-list"
                                        >

                                            {
                                                selectedResult.matched_skills?.length >
                                                0
                                                    ? selectedResult.matched_skills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={
                                                                    `${skill}-${index}`
                                                                }
                                                                className="skill-chip matched"
                                                            >
                                                                {
                                                                    skill
                                                                }
                                                            </span>

                                                        )
                                                    )
                                                    : (
                                                        <span>
                                                            No matched skills found.
                                                        </span>
                                                    )
                                            }

                                        </div>

                                    </div>


                                    <div
                                        className="modal-section"
                                    >

                                        <h3>
                                            Missing Skills
                                        </h3>


                                        <div
                                            className="skill-list"
                                        >

                                            {
                                                selectedResult.missing_skills?.length >
                                                0
                                                    ? selectedResult.missing_skills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={
                                                                    `${skill}-${index}`
                                                                }
                                                                className="skill-chip missing"
                                                            >
                                                                {
                                                                    skill
                                                                }
                                                            </span>

                                                        )
                                                    )
                                                    : (
                                                        <span>
                                                            No important missing skills.
                                                        </span>
                                                    )
                                            }

                                        </div>

                                    </div>

                                </div>


                                {selectedResult.strengths?.length >
                                    0 && (

                                    <div
                                        className="modal-section"
                                        style={{
                                            marginTop:
                                                "22px"
                                        }}
                                    >

                                        <h3>
                                            Strengths
                                        </h3>


                                        <div
                                            className="strength-list"
                                        >

                                            {selectedResult.strengths.map(
                                                (
                                                    strength,
                                                    index
                                                ) => (

                                                    <div
                                                        key={
                                                            `${strength}-${index}`
                                                        }
                                                        className="strength-item"
                                                    >

                                                        <span>
                                                            ✓
                                                        </span>


                                                        <p>
                                                            {
                                                                strength
                                                            }
                                                        </p>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}


                                {selectedResult.justification && (

                                    <div
                                        className="modal-section"
                                        style={{
                                            marginTop:
                                                "22px"
                                        }}
                                    >

                                        <h3>
                                            AI Justification
                                        </h3>


                                        <div
                                            className="justification-box"
                                        >
                                            {
                                                selectedResult.justification
                                            }
                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {!selectedResult &&
                        selectedResume &&
                        selectedJob && (

                            <div
                                className="screening-empty"
                            >

                                <div
                                    className="empty-icon"
                                >
                                    📊
                                </div>


                                <h3>
                                    Score Not Calculated Yet
                                </h3>


                                <p>
                                    This resume has not been evaluated for the selected job.
                                </p>


                                <p>
                                    Click
                                    {" "}
                                    <strong>
                                        Calculate Score
                                    </strong>
                                    {" "}
                                    to run the AI screening.
                                </p>

                            </div>

                        )}


                    {viewerResults.length > 0 && (

                        <div
                            className="screening-results-container"
                            style={{
                                marginTop:
                                    "25px"
                            }}
                        >

                            <div
                                className="screening-results-title"
                            >

                                <div>

                                    <h2>
                                        Previous Screening Results
                                    </h2>


                                    <p>
                                        Saved scores are reused and are not recalculated.
                                    </p>

                                </div>

                            </div>


                            <div
                                className="screening-table-wrapper"
                            >

                                <table
                                    className="screening-table"
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                RESUME
                                            </th>

                                            <th>
                                                JOB
                                            </th>

                                            <th>
                                                MATCH SCORE
                                            </th>

                                            <th>
                                                RECOMMENDATION
                                            </th>

                                            <th>
                                                ACTION
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {viewerResults.map(
                                            (
                                                result,
                                                index
                                            ) =>
                                            {

                                                const score =
                                                    getScore(
                                                        result
                                                    );


                                                const recommendation =
                                                    getRecommendation(
                                                        result
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            result.result_id ||
                                                            result._id ||
                                                            `${result.candidate_id}-${result.job_id}-${index}`
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    result.candidate_name ||
                                                                    selectedResumeObject?.name ||
                                                                    "My Resume"
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    getJobTitle(
                                                                        result
                                                                    )
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <strong
                                                                className={
                                                                    `score-value ${getScoreClass(
                                                                        score
                                                                    )}`
                                                                }
                                                            >
                                                                {
                                                                    score.toFixed(
                                                                        1
                                                                    )
                                                                }%
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `recommendation-badge ${getRecommendationClass(
                                                                        recommendation
                                                                    )}`
                                                                }
                                                            >

                                                                <span
                                                                    className="status-dot"
                                                                />

                                                                {
                                                                    recommendation
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="view-details-button"
                                                                onClick={() =>
                                                                {
                                                                    setSelectedResume(
                                                                        String(
                                                                            result.candidate_id
                                                                        )
                                                                    );

                                                                    setSelectedJob(
                                                                        String(
                                                                            result.job_id
                                                                        )
                                                                    );

                                                                    setSelectedResult(
                                                                        normalizeViewerResult(
                                                                            result
                                                                        )
                                                                    );

                                                                    setSuccessMessage(
                                                                        `Previous score loaded: ${score.toFixed(
                                                                            1
                                                                        )}%.`
                                                                    );
                                                                }}
                                                            >
                                                                View Details →
                                                            </button>

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </>

            ) : (

                <>

                    <div
                        className="recruiter-control-card"
                    >

                        <div
                            className="control-header"
                        >

                            <div>

                                <span
                                    className="control-label"
                                >
                                    JOB SCREENING
                                </span>


                                <h2>
                                    Select a Job
                                </h2>


                                <p>
                                    Choose the job position you want to screen candidates for.
                                </p>

                            </div>

                        </div>


                        <div
                            className="job-selection-row"
                        >

                            <div
                                className="job-select-wrapper"
                            >

                                <label>
                                    Job Position
                                </label>


                                <select
                                    value={
                                        selectedJob
                                    }
                                    onChange={
                                        handleJobChange
                                    }
                                    disabled={
                                        calculating ||
                                        exporting
                                    }
                                >

                                    <option
                                        value=""
                                    >
                                        Select a job
                                    </option>


                                    {jobs.map(
                                        job => (

                                            <option
                                                key={
                                                    job._id
                                                }
                                                value={
                                                    job._id
                                                }
                                            >
                                                {
                                                    job.title
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <button
                                type="button"
                                className="calculate-button"
                                onClick={
                                    handleCalculate
                                }
                                disabled={
                                    !selectedJob ||
                                    calculating ||
                                    exporting
                                }
                            >

                                {
                                    calculating
                                        ? "Calculating..."
                                        : "Calculate Screening"
                                }

                            </button>


                            <button
                                type="button"
                                className="excel-button"
                                onClick={
                                    handleExport
                                }
                                disabled={
                                    !selectedJob ||
                                    results.length === 0 ||
                                    calculating ||
                                    exporting
                                }
                            >

                                {
                                    exporting
                                        ? "Preparing Excel..."
                                        : "Download Excel"
                                }

                            </button>

                        </div>


                        {selectedJobObject && (

                            <div
                                className="selected-job-card"
                            >

                                <div
                                    className="selected-job-icon"
                                >
                                    💼
                                </div>


                                <div>

                                    <span>
                                        Selected Position
                                    </span>


                                    <strong>
                                        {
                                            selectedJobObject.title
                                        }
                                    </strong>

                                </div>

                            </div>

                        )}

                    </div>


                    {selectedJob &&
                        results.length > 0 && (

                            <div
                                className="screening-stats"
                            >

                                <div
                                    className="screening-stat-card"
                                >

                                    <div
                                        className="screening-stat-icon"
                                    >
                                        👥
                                    </div>


                                    <div>

                                        <p>
                                            Candidates
                                        </p>


                                        <h2>
                                            {
                                                results.length
                                            }
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="screening-stat-card"
                                >

                                    <div
                                        className="screening-stat-icon"
                                    >
                                        ✓
                                    </div>


                                    <div>

                                        <p>
                                            Shortlisted
                                        </p>


                                        <h2>
                                            {
                                                shortlistedCount
                                            }
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="screening-stat-card"
                                >

                                    <div
                                        className="screening-stat-icon"
                                    >
                                        ◐
                                    </div>


                                    <div>

                                        <p>
                                            Review
                                        </p>


                                        <h2>
                                            {
                                                reviewCount
                                            }
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className="screening-stat-card"
                                >

                                    <div
                                        className="screening-stat-icon"
                                    >
                                        ✕
                                    </div>


                                    <div>

                                        <p>
                                            Rejected
                                        </p>


                                        <h2>
                                            {
                                                rejectedCount
                                            }
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        )}


                    {!selectedJob && (

                        <div
                            className="screening-empty"
                        >

                            <div
                                className="empty-icon"
                            >
                                💼
                            </div>


                            <h3>
                                Select a Job to Begin
                            </h3>


                            <p>
                                Select a job position above and click "Calculate Screening" to evaluate all candidates.
                            </p>

                        </div>

                    )}


                    {selectedJob &&
                        results.length === 0 &&
                        !calculating && (

                            <div
                                className="screening-empty"
                            >

                                <div
                                    className="empty-icon"
                                >
                                    📊
                                </div>


                                <h3>
                                    No Screening Results
                                </h3>


                                <p>
                                    Click "Calculate Screening" to analyze candidates for this job.
                                </p>

                            </div>

                        )}


                    {results.length > 0 && (

                        <div
                            className="screening-results-container"
                        >

                            <div
                                className="screening-results-title"
                            >

                                <div>

                                    <h2>
                                        Candidate Rankings
                                    </h2>


                                    <p>
                                        Candidates ranked by their match percentage.
                                    </p>

                                </div>


                                <div
                                    className="results-count"
                                >
                                    {
                                        results.length
                                    }{" "}
                                    Candidates
                                </div>

                            </div>


                            <div
                                className="screening-table-wrapper"
                            >

                                <table
                                    className="screening-table"
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                CANDIDATE
                                            </th>

                                            <th>
                                                JOB
                                            </th>

                                            <th>
                                                MATCH SCORE
                                            </th>

                                            <th>
                                                RECOMMENDATION
                                            </th>

                                            <th>
                                                ACTION
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {results.map(
                                            (
                                                result,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        result.result_id ||
                                                        result._id ||
                                                        index
                                                    }
                                                >

                                                    <td>

                                                        <span
                                                            className="row-number"
                                                        >
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className="candidate-cell"
                                                        >

                                                            <div
                                                                className="candidate-avatar"
                                                            >
                                                                {
                                                                    getCandidateName(
                                                                        result
                                                                    )
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()
                                                                }
                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        getCandidateName(
                                                                            result
                                                                        )
                                                                    }
                                                                </strong>


                                                                <span>
                                                                    Candidate
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className="job-cell"
                                                        >

                                                            <div
                                                                className="job-icon"
                                                            >
                                                                💼
                                                            </div>


                                                            <strong>
                                                                {
                                                                    selectedJobObject?.title ||
                                                                    getJobTitle(
                                                                        result
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className="score-cell"
                                                        >

                                                            <div
                                                                className={
                                                                    `score-circle ${getScoreClass(
                                                                        getScore(
                                                                            result
                                                                        )
                                                                    )}`
                                                                }
                                                            >
                                                                {
                                                                    getScore(
                                                                        result
                                                                    ).toFixed(
                                                                        1
                                                                    )
                                                                }%
                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                `recommendation-badge ${getRecommendationClass(
                                                                    getRecommendation(
                                                                        result
                                                                    )
                                                                )}`
                                                            }
                                                        >

                                                            <span
                                                                className="status-dot"
                                                            />


                                                            {
                                                                getRecommendation(
                                                                    result
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="view-details-button"
                                                            onClick={() =>
                                                                openResultDetails(
                                                                    result
                                                                )
                                                            }
                                                        >
                                                            View Details →
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </>

            )}


            {selectedResult &&
                !isViewer && (

                    <div
                        className="screening-modal-overlay"
                        onClick={
                            event =>
                            {
                                if (
                                    event.target.className ===
                                    "screening-modal-overlay"
                                )
                                {
                                    setSelectedResult(
                                        null
                                    );
                                }
                            }
                        }
                    >

                        <div
                            className="screening-modal"
                        >

                            <div
                                className="screening-modal-header"
                            >

                                <div>

                                    <span
                                        className="modal-eyebrow"
                                    >
                                        CANDIDATE ANALYSIS
                                    </span>


                                    <h2>
                                        Screening Details
                                    </h2>


                                    <p>
                                        AI-powered resume evaluation
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={() =>
                                        setSelectedResult(
                                            null
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div
                                className="modal-content"
                            >

                                <div
                                    className="modal-profile-card"
                                >

                                    <div
                                        className="modal-profile-avatar"
                                    >
                                        {
                                            getCandidateName(
                                                selectedResult
                                            )
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()
                                        }
                                    </div>


                                    <div>

                                        <h3>
                                            {
                                                getCandidateName(
                                                    selectedResult
                                                )
                                            }
                                        </h3>


                                        <p>
                                            {
                                                getCandidateEmail(
                                                    selectedResult
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className="modal-score-grid"
                                >

                                    <div
                                        className="modal-score-card"
                                    >

                                        <span>
                                            MATCH SCORE
                                        </span>


                                        <strong
                                            className={
                                                getScoreClass(
                                                    getScore(
                                                        selectedResult
                                                    )
                                                )
                                            }
                                        >
                                            {
                                                getScore(
                                                    selectedResult
                                                ).toFixed(
                                                    1
                                                )
                                            }%
                                        </strong>

                                    </div>


                                    <div
                                        className="modal-score-card"
                                    >

                                        <span>
                                            RECOMMENDATION
                                        </span>


                                        <strong>
                                            {
                                                getRecommendation(
                                                    selectedResult
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div
                                        className="modal-score-card"
                                    >

                                        <span>
                                            JOB
                                        </span>


                                        <strong>
                                            {
                                                getJobTitle(
                                                    selectedResult
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    className="modal-section"
                                >

                                    <h3>
                                        Matched Skills
                                    </h3>


                                    <div
                                        className="skill-list"
                                    >

                                        {
                                            (
                                                selectedResult.matched_skills ||
                                                []
                                            ).length > 0
                                                ? selectedResult.matched_skills.map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={
                                                                `${skill}-${index}`
                                                            }
                                                            className="skill-chip matched"
                                                        >
                                                            {
                                                                skill
                                                            }
                                                        </span>

                                                    )
                                                )
                                                : (
                                                    <span>
                                                        No matched skills found.
                                                    </span>
                                                )
                                        }

                                    </div>

                                </div>


                                <div
                                    className="modal-section"
                                >

                                    <h3>
                                        Missing Skills
                                    </h3>


                                    <div
                                        className="skill-list"
                                    >

                                        {
                                            (
                                                selectedResult.missing_skills ||
                                                []
                                            ).length > 0
                                                ? selectedResult.missing_skills.map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={
                                                                `${skill}-${index}`
                                                            }
                                                            className="skill-chip missing"
                                                        >
                                                            {
                                                                skill
                                                            }
                                                        </span>

                                                    )
                                                )
                                                : (
                                                    <span>
                                                        No important missing skills.
                                                    </span>
                                                )
                                        }

                                    </div>

                                </div>


                                <div
                                    className="modal-section"
                                >

                                    <h3>
                                        Strengths
                                    </h3>


                                    <div
                                        className="strength-list"
                                    >

                                        {
                                            (
                                                selectedResult.strengths ||
                                                []
                                            ).length > 0
                                                ? selectedResult.strengths.map(
                                                    (
                                                        strength,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={
                                                                `${strength}-${index}`
                                                            }
                                                            className="strength-item"
                                                        >

                                                            <span>
                                                                ✓
                                                            </span>


                                                            <p>
                                                                {
                                                                    strength
                                                                }
                                                            </p>

                                                        </div>

                                                    )
                                                )
                                                : (
                                                    <p>
                                                        No strengths available.
                                                    </p>
                                                )
                                        }

                                    </div>

                                </div>


                                <div
                                    className="modal-section"
                                >

                                    <h3>
                                        AI Justification
                                    </h3>


                                    <div
                                        className="justification-box"
                                    >
                                        {
                                            selectedResult.justification ||
                                            "No justification available."
                                        }
                                    </div>

                                </div>


                                <div
                                    className="modal-footer"
                                >

                                    <button
                                        type="button"
                                        className="modal-secondary-button"
                                        onClick={() =>
                                            setSelectedResult(
                                                null
                                            )
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );
}


export default ScreeningResults;