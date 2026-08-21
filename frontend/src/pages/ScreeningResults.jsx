import {
    useEffect,
    useState
} from "react";


import {
    getJobs,
    getJobScreeningResults,
    calculateScreeningResults,
    exportFinalShortlist
} from "../services/api";


import CandidateTable from "../components/CandidateTable";


import Loading from "../components/Loading";


import ScreeningCandidateDetails from "../components/ScreeningCandidateDetails";


import {
    useAuth
} from "../context/AuthContext";


function ScreeningResults() {

    const {
        user
    } = useAuth();


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        selectedJob,
        setSelectedJob
    ] = useState("");


    const [
        results,
        setResults
    ] = useState([]);


    const [
        selectedCandidate,
        setSelectedCandidate
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(false);


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
        totalCandidates,
        setTotalCandidates
    ] = useState(0);


    const loadJobs = async () => {

        try {

            setError("");

            const data =
                await getJobs();

            setJobs(
                data.jobs || []
            );

        } catch (jobError) {

            console.error(
                "Job loading error:",
                jobError
            );

            setError(
                jobError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to load jobs."
            );
        }
    };


    useEffect(() => {

        loadJobs();

    }, []);


    const loadResults = async (
        jobId
    ) => {

        if (!jobId) {

            setResults([]);

            setTotalCandidates(0);

            return;
        }


        try {

            setLoading(true);

            setError("");

            const data =
                await getJobScreeningResults(
                    jobId
                );


            setResults(
                data.results || []
            );


            setTotalCandidates(
                data.total || 0
            );

        } catch (resultError) {

            console.error(
                "Screening results error:",
                resultError
            );

            setError(
                resultError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to load screening results."
            );

            setResults([]);

            setTotalCandidates(0);

        } finally {

            setLoading(false);
        }
    };


    const handleJobChange = async (
        event
    ) => {

        const jobId =
            event.target.value;


        setSelectedJob(
            jobId
        );


        setSelectedCandidate(
            null
        );


        setSuccessMessage("");

        setError("");


        await loadResults(
            jobId
        );
    };


    const handleCalculate = async () => {

        if (!selectedJob) {

            setError(
                "Please select a job first."
            );

            return;
        }


        if (
            user?.role !==
            "ADMIN"
        ) {

            setError(
                "Only administrators can calculate screening results."
            );

            return;
        }


        try {

            setCalculating(true);

            setError("");

            setSuccessMessage("");

            setSelectedCandidate(
                null
            );


            const data =
                await calculateScreeningResults(
                    selectedJob
                );


            setResults(
                data.candidates || []
            );


            setTotalCandidates(
                data.total_candidates || 0
            );


            setSuccessMessage(

                `Screening completed for ${
                    data.total_candidates || 0
                } candidates. ${
                    data.shortlisted || 0
                } candidate(s) shortlisted.`

            );

        } catch (calculationError) {

            console.error(
                "Screening calculation error:",
                calculationError
            );

            setError(
                calculationError
                    ?.response
                    ?.data
                    ?.detail
                ||
                "Unable to calculate screening results."
            );

        } finally {

            setCalculating(false);
        }
    };


    const handleExportShortlist =
        async () => {

            if (!selectedJob) {

                setError(
                    "Please select a job first."
                );

                return;
            }


            if (
                user?.role !==
                "ADMIN"
            ) {

                setError(
                    "Only administrators can export the final shortlist."
                );

                return;
            }


            try {

                setExporting(true);

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


                const selectedJobData =
                    jobs.find(
                        job =>
                            job._id ===
                            selectedJob
                    );


                const jobTitle =
                    selectedJobData?.title ||
                    "job";


                const safeJobTitle =
                    jobTitle
                        .replace(
                            /[^a-z0-9]/gi,
                            "_"
                        );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;


                link.download =
                    `${safeJobTitle}_final_shortlist.xlsx`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                window.URL.revokeObjectURL(
                    url
                );


                setSuccessMessage(
                    "Final shortlist Excel file downloaded successfully."
                );

            } catch (exportError) {

                console.error(
                    "Excel export error:",
                    exportError
                );


                setError(
                    exportError
                        ?.response
                        ?.data
                        ?.detail
                    ||
                    "Unable to export final shortlist."
                );

            } finally {

                setExporting(false);
            }
        };


    const handleCandidateSelect = (
        candidate
    ) => {

        setSelectedCandidate(
            candidate
        );
    };


    const handleCloseDetails = () => {

        setSelectedCandidate(
            null
        );
    };


    const selectedJobObject =
        jobs.find(
            job =>
                job._id ===
                selectedJob
        );


    const shortlistedCount =
        results.filter(
            candidate =>
                candidate.recommendation ===
                "SHORTLIST"
        ).length;


    return (

        <div className="page-container">

            <div className="page-header">

                <h1>
                    Screening Results
                </h1>

                <p>
                    Compare all candidates
                    against the selected job.
                </p>

            </div>


            <div className="filter-card">

                <label>
                    Select Job
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

                    <option value="">
                        Select a job
                    </option>


                    {jobs.map(
                        job => (

                            <option
                                value={
                                    job._id
                                }
                                key={
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


                {selectedJobObject && (

                    <div
                        style={{
                            marginTop: "18px",
                            padding: "18px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                        }}
                    >

                        <strong>
                            Selected Job
                        </strong>


                        <div
                            style={{
                                marginTop: "6px",
                                color: "#64748b"
                            }}
                        >

                            {
                                selectedJobObject.title
                            }

                        </div>

                    </div>

                )}

            </div>


            {selectedJob && (

                <div
                    style={{
                        marginTop: "20px",
                        padding: "22px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        boxShadow:
                            "0 4px 14px rgba(15, 23, 42, 0.05)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                            flexWrap: "wrap"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    margin:
                                        "0 0 6px"
                                }}
                            >
                                Calculate Screening
                            </h2>


                            <p
                                style={{
                                    margin: 0,
                                    color: "#64748b"
                                }}
                            >
                                Compare every candidate
                                in the database against
                                this job.
                            </p>

                        </div>


                        {user?.role === "ADMIN" && (

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={
                                        handleCalculate
                                    }
                                    disabled={
                                        calculating ||
                                        exporting
                                    }
                                    className="primary-button"
                                >

                                    {calculating
                                        ? "Calculating..."
                                        : "Calculate Screening Results"
                                    }

                                </button>


                                {results.length > 0 && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleExportShortlist
                                        }
                                        disabled={
                                            calculating ||
                                            exporting ||
                                            shortlistedCount === 0
                                        }
                                        className="export-button"
                                    >

                                        {exporting
                                            ? "Preparing Excel..."
                                            : "Export Final Shortlist"
                                        }

                                    </button>

                                )}

                            </div>

                        )}

                    </div>


                    {user?.role !== "ADMIN" && (

                        <div
                            style={{
                                marginTop: "15px",
                                padding:
                                    "12px 15px",
                                background:
                                    "#eff6ff",
                                border:
                                    "1px solid #bfdbfe",
                                borderRadius: "8px",
                                color:
                                    "#1d4ed8"
                            }}
                        >

                            Only an administrator
                            can calculate or
                            export screening
                            results.

                        </div>

                    )}

                </div>

            )}


            {successMessage && (

                <div
                    className="success-message"
                    style={{
                        marginTop: "20px"
                    }}
                >

                    {successMessage}

                </div>

            )}


            {error && (

                <div
                    className="error-message"
                    style={{
                        marginTop: "20px"
                    }}
                >

                    {error}

                </div>

            )}


            {loading ? (

                <Loading
                    message="Loading screening results..."
                />

            ) : (

                selectedJob && (

                    results.length > 0 ? (

                        <div
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    flexWrap:
                                        "wrap",
                                    gap: "10px",
                                    marginBottom:
                                        "15px"
                                }}
                            >

                                <div
                                    style={{
                                        fontWeight:
                                            "600",
                                        color:
                                            "#334155"
                                    }}
                                >

                                    {totalCandidates}
                                    {" "}
                                    candidates screened

                                </div>


                                <div
                                    style={{
                                        fontWeight:
                                            "600",
                                        color:
                                            "#16a34a"
                                    }}
                                >

                                    {shortlistedCount}
                                    {" "}
                                    shortlisted

                                </div>

                            </div>


                            <CandidateTable
                                candidates={
                                    results
                                }
                                onCandidateSelect={
                                    handleCandidateSelect
                                }
                            />

                        </div>

                    ) : (

                        <div
                            className="empty-state"
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <h3>
                                No screening results yet
                            </h3>


                            <p>
                                Select the job and click
                                "Calculate Screening Results"
                                to compare all candidates.
                            </p>

                        </div>

                    )

                )

            )}


            {selectedCandidate && (

                <ScreeningCandidateDetails
                    candidate={
                        selectedCandidate
                    }
                    onClose={
                        handleCloseDetails
                    }
                />

            )}

        </div>

    );
}


export default ScreeningResults;