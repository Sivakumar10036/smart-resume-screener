import {
    useEffect,
    useState
} from "react";

import {
    getCandidate
} from "../services/api";

import Loading from "../components/Loading";


function CandidateDetails({
    candidateId
}) {

    const [
        candidate,
        setCandidate
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        const loadCandidate =
            async () => {

                try {

                    const data =
                        await getCandidate(
                            candidateId
                        );

                    setCandidate(data);

                } finally {

                    setLoading(false);
                }
            };

        if (candidateId) {

            loadCandidate();
        }

    }, [candidateId]);


    if (loading) {

        return (
            <Loading
                message="Loading candidate..."
            />
        );
    }


    if (!candidate) {

        return (
            <div>
                Candidate not found.
            </div>
        );
    }


    return (
        <div className="page-container">

            <div className="page-header">

                <h1>
                    {candidate.name}
                </h1>

                <p>
                    {candidate.email}
                </p>

                <p>
                    {candidate.phone}
                </p>

            </div>


            <section className="details-card">

                <h2>
                    Skills
                </h2>

                <div className="skills-list">

                    {candidate.skills?.map(
                        (skill, index) => (

                            <span
                                className="skill matched"
                                key={index}
                            >
                                {skill}
                            </span>

                        )
                    )}

                </div>

            </section>


            <section className="details-card">

                <h2>
                    Education
                </h2>

                {candidate.education?.map(
                    (education, index) => (

                        <div
                            className="education-item"
                            key={index}
                        >

                            <strong>
                                {education.degree}
                            </strong>

                            <p>
                                {education.field}
                            </p>

                            <p>
                                {education.institution}
                            </p>

                            <span>
                                {education.year}
                            </span>

                        </div>

                    )
                )}

            </section>


            <section className="details-card">

                <h2>
                    Experience
                </h2>

                {candidate.experience?.map(
                    (experience, index) => (

                        <div
                            className="experience-item"
                            key={index}
                        >

                            <strong>
                                {experience.role}
                            </strong>

                            <p>
                                {experience.company}
                            </p>

                            <span>
                                {experience.duration}
                            </span>

                            <p>
                                {experience.description}
                            </p>

                        </div>

                    )
                )}

            </section>

        </div>
    );
}


export default CandidateDetails;