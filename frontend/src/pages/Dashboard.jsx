import {
    useEffect,
    useState
} from "react";

import {
    getCandidates,
    getJobs
} from "../services/api";

import CandidateTable from "../components/CandidateTable";
import Loading from "../components/Loading";


function Dashboard() {

    const [
        candidates,
        setCandidates
    ] = useState([]);

    const [
        jobs,
        setJobs
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");


    const loadData = async () => {

        try {

            setLoading(true);

            const [
                candidateData,
                jobData
            ] = await Promise.all([

                getCandidates(),

                getJobs()

            ]);

            setCandidates(
                candidateData.candidates || []
            );

            setJobs(
                jobData.jobs || []
            );

        } catch {

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadData();

    }, []);


    if (loading) {

        return (
            <Loading
                message="Loading dashboard..."
            />
        );
    }


    return (
        <div className="dashboard-page">

            <div className="page-header">

                <h1>
                    Dashboard
                </h1>

                <p>
                    Overview of your
                    resume screening system.
                </p>

            </div>


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            <div className="stats-grid">

                <div className="stat-card">

                    <span>
                        Candidates
                    </span>

                    <strong>
                        {candidates.length}
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        Jobs
                    </span>

                    <strong>
                        {jobs.length}
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        PDF/TXT Support
                    </span>

                    <strong>
                        Yes
                    </strong>

                </div>


                <div className="stat-card">

                    <span>
                        AI Matching
                    </span>

                    <strong>
                        Active
                    </strong>

                </div>

            </div>


            <div className="dashboard-section">

                <h2>
                    Uploaded Candidates
                </h2>

                {candidates.length === 0 ? (

                    <p>
                        No candidates uploaded yet.
                    </p>

                ) : (

                    <div className="candidate-list">

                        {candidates.map(
                            candidate => (

                                <div
                                    className="simple-candidate"
                                    key={
                                        candidate._id
                                    }
                                >

                                    <strong>
                                        {
                                            candidate.name
                                        }
                                    </strong>

                                    <span>
                                        {
                                            candidate.email
                                        }
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}


export default Dashboard;