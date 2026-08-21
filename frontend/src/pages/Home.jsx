function Home({
    setCurrentPage
}) {

    return (
        <div className="home-page">

            <div className="hero">

                <div className="hero-content">

                    <h1>
                        Smart Resume Screener
                    </h1>

                    <p>
                        AI-powered resume screening
                        and candidate ranking system.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            setCurrentPage(
                                "dashboard"
                            )
                        }
                    >
                        Open Dashboard
                    </button>

                </div>

            </div>


            <div className="feature-grid">

                <div className="feature-card">

                    <h3>
                        PDF & TXT Support
                    </h3>

                    <p>
                        Upload resumes in PDF
                        or text format.
                    </p>

                </div>


                <div className="feature-card">

                    <h3>
                        AI Analysis
                    </h3>

                    <p>
                        Extract skills,
                        education and experience.
                    </p>

                </div>


                <div className="feature-card">

                    <h3>
                        Smart Matching
                    </h3>

                    <p>
                        Compare candidates
                        against job requirements.
                    </p>

                </div>


                <div className="feature-card">

                    <h3>
                        Candidate Ranking
                    </h3>

                    <p>
                        Automatically rank and
                        shortlist candidates.
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Home;