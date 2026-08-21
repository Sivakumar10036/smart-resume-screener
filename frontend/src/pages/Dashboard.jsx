import {
    useEffect,
    useState
} from "react";

import {
    getCandidates,
    getJobs,
    getScreeningResults,
    getMyResume,
    getMyScreeningResults
} from "../services/api";

import {
    useAuth
} from "../context/AuthContext";


function Dashboard()
{
    const {
        user
    } = useAuth();


    const [
        candidates,
        setCandidates
    ] = useState([]);


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        results,
        setResults
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const role =
        String(
            user?.role ||
            "VIEWER"
        ).toUpperCase();


    const isViewer =
        role === "VIEWER";


    const loadDashboard =
        async () =>
        {
            try
            {
                setLoading(true);

                setError("");


                if (isViewer)
                {
                    const [
                        resumeResponse,
                        resultsResponse
                    ] =
                        await Promise.all([
                            getMyResume(),
                            getMyScreeningResults()
                        ]);


                    let viewerCandidates = [];


                    if (
                        Array.isArray(
                            resumeResponse
                        )
                    )
                    {
                        viewerCandidates =
                            resumeResponse;
                    }
                    else if (
                        Array.isArray(
                            resumeResponse?.candidates
                        )
                    )
                    {
                        viewerCandidates =
                            resumeResponse.candidates;
                    }
                    else if (
                        resumeResponse &&
                        typeof resumeResponse === "object" &&
                        resumeResponse._id
                    )
                    {
                        viewerCandidates = [
                            resumeResponse
                        ];
                    }


                    setCandidates(
                        viewerCandidates
                    );


                    setResults(
                        resultsResponse?.results ||
                        []
                    );


                    try
                    {
                        const jobsResponse =
                            await getJobs();


                        setJobs(
                            jobsResponse?.jobs ||
                            []
                        );
                    }
                    catch
                    {
                        setJobs([]);
                    }
                }
                else
                {
                    const [
                        candidatesResponse,
                        jobsResponse,
                        resultsResponse
                    ] =
                        await Promise.all([
                            getCandidates(),
                            getJobs(),
                            getScreeningResults()
                        ]);


                    setCandidates(
                        candidatesResponse?.candidates ||
                        []
                    );


                    setJobs(
                        jobsResponse?.jobs ||
                        []
                    );


                    setResults(
                        resultsResponse?.results ||
                        []
                    );
                }
            }
            catch (
                dashboardError
            )
            {
                console.error(
                    "Dashboard error:",
                    dashboardError
                );


                setError(
                    dashboardError
                        ?.response
                        ?.data
                        ?.detail ||
                    "Unable to load dashboard data."
                );
            }
            finally
            {
                setLoading(false);
            }
        };


    useEffect(
        () =>
        {
            if (user)
            {
                loadDashboard();
            }
        },
        [
            user
        ]
    );


    const getCandidateName =
        candidate =>
        {
            return (
                candidate?.name ||
                candidate?.full_name ||
                candidate?.candidate_name ||
                "Unknown Candidate"
            );
        };


    const getCandidateEmail =
        candidate =>
        {
            return (
                candidate?.email ||
                "No email"
            );
        };


    const getResumeName =
        candidate =>
        {
            return (
                candidate?.filename ||
                candidate?.file_name ||
                candidate?.resume_filename ||
                "Resume file"
            );
        };


    const getInitial =
        candidate =>
        {
            return getCandidateName(
                candidate
            )
                .charAt(0)
                .toUpperCase();
        };


    const formatDate =
        candidate =>
        {
            const date =
                candidate?.created_at ||
                candidate?.uploaded_at ||
                candidate?.updated_at;


            if (!date)
            {
                return "Recently";
            }


            try
            {
                return new Date(
                    date
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
            }
            catch
            {
                return "Recently";
            }
        };


    const recentCandidates =
        [...candidates]
            .sort(
                (
                    first,
                    second
                ) =>
                {
                    const firstDate =
                        new Date(
                            first?.created_at ||
                            first?.uploaded_at ||
                            0
                        );


                    const secondDate =
                        new Date(
                            second?.created_at ||
                            second?.uploaded_at ||
                            0
                        );


                    return (
                        secondDate -
                        firstDate
                    );
                }
            )
            .slice(
                0,
                10
            );


    if (loading)
    {
        return (
            <div className="dashboard-loading">

                <div className="dashboard-spinner">
                </div>

                <p>
                    Loading dashboard...
                </p>

            </div>
        );
    }


    return (

        <div className="dashboard-page">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Welcome, {
                            user?.username ||
                            "User"
                        }
                    </h1>


                    <p>
                        {
                            isViewer
                                ? "Manage your resume and view your screening results."
                                : "Resume screening system overview."
                        }
                    </p>

                </div>


                <button
                    className="dashboard-refresh-button"
                    onClick={
                        loadDashboard
                    }
                >

                    <span>
                        ↻
                    </span>

                    Refresh

                </button>

            </div>


            {
                error && (
                    <div className="dashboard-error">
                        {error}
                    </div>
                )
            }


            <div className="dashboard-stats">

                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        👤
                    </div>

                    <div>

                        <span>
                            {
                                isViewer
                                    ? "My Resume"
                                    : "Candidates"
                            }
                        </span>

                        <strong>
                            {candidates.length}
                        </strong>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        💼
                    </div>

                    <div>

                        <span>
                            Available Jobs
                        </span>

                        <strong>
                            {jobs.length}
                        </strong>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        📊
                    </div>

                    <div>

                        <span>
                            {
                                isViewer
                                    ? "My Screening Results"
                                    : "Screening Results"
                            }
                        </span>

                        <strong>
                            {results.length}
                        </strong>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon">
                        👥
                    </div>

                    <div>

                        <span>
                            Account
                        </span>

                        <strong className="dashboard-role">
                            {
                                user?.role ||
                                "USER"
                            }
                        </strong>

                    </div>

                </div>

            </div>


            <div className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>

                        <h2>
                            {
                                isViewer
                                    ? "My Resume"
                                    : "Recent Candidates"
                            }
                        </h2>


                        <p>
                            {
                                isViewer
                                    ? "Your uploaded resume information."
                                    : "Recently uploaded resumes."
                            }
                        </p>

                    </div>


                    <span className="candidate-count">

                        {candidates.length}

                        {" "}

                        {
                            isViewer
                                ? "Resume"
                                : "Candidates"
                        }

                    </span>

                </div>


                {
                    recentCandidates.length === 0
                        ? (

                            <div className="dashboard-empty">

                                <div className="dashboard-empty-icon">
                                    📄
                                </div>


                                <h3>

                                    {
                                        isViewer
                                            ? "No Resume Uploaded Yet"
                                            : "No Candidates Yet"
                                    }

                                </h3>


                                <p>

                                    {
                                        isViewer
                                            ? "Go to Upload My Resume from the navigation menu to upload your resume."
                                            : "Upload a resume to see candidates here."
                                    }

                                </p>

                            </div>

                        )
                        : (

                            <div className="candidate-table-wrapper">

                                <table className="candidate-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                CANDIDATE
                                            </th>

                                            <th>
                                                EMAIL
                                            </th>

                                            <th>
                                                RESUME
                                            </th>

                                            <th>
                                                UPLOADED
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            recentCandidates.map(
                                                (
                                                    candidate,
                                                    index
                                                ) =>
                                                (

                                                    <tr
                                                        key={
                                                            candidate?._id ||
                                                            candidate?.id ||
                                                            index
                                                        }
                                                    >

                                                        <td>

                                                            <span className="candidate-number">
                                                                {
                                                                    index + 1
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="candidate-info">

                                                                <div className="candidate-avatar">

                                                                    {
                                                                        getInitial(
                                                                            candidate
                                                                        )
                                                                    }

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            getCandidateName(
                                                                                candidate
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

                                                            <span className="candidate-email">
                                                                {
                                                                    getCandidateEmail(
                                                                        candidate
                                                                    )
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="resume-info">

                                                                <span className="resume-icon">
                                                                    📄
                                                                </span>


                                                                <span className="resume-name">

                                                                    {
                                                                        getResumeName(
                                                                            candidate
                                                                        )
                                                                    }

                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span className="upload-date">
                                                                {
                                                                    formatDate(
                                                                        candidate
                                                                    )
                                                                }
                                                            </span>

                                                        </td>

                                                    </tr>

                                                )
                                            )
                                        }

                                    </tbody>

                                </table>

                            </div>

                        )
                }

            </div>


            <div className="dashboard-bottom-grid">

                <div className="dashboard-info-card">

                    <div className="info-card-icon">
                        💡
                    </div>


                    <div>

                        <h3>
                            Resume Screening
                        </h3>


                        <p>

                            {
                                isViewer
                                    ? "Upload your resume from Upload My Resume and check how well it matches available jobs."
                                    : "Review uploaded resumes and compare candidates against available job descriptions."
                            }

                        </p>

                    </div>

                </div>


                <div className="dashboard-info-card">

                    <div className="info-card-icon">
                        🎯
                    </div>


                    <div>

                        <h3>
                            Candidate Matching
                        </h3>


                        <p>

                            {
                                isViewer
                                    ? "View your AI-powered screening scores and recommendations."
                                    : "Use screening scores to identify candidates who best match your job requirements."
                            }

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}


export default Dashboard;