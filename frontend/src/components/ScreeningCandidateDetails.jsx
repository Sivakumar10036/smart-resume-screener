import MatchScore from "./MatchScore";

import SkillsMatch from "./SkillsMatch";


function ScreeningCandidateDetails({
    candidate,
    onClose
}) {

    if (!candidate) {

        return null;
    }


    return (
        <div className="modal-overlay">

            <div className="candidate-details-modal">

                <div className="modal-header">

                    <div>

                        <h2>
                            {
                                candidate.candidate_name
                            }
                        </h2>

                        <p>
                            {
                                candidate.candidate_email
                            }
                        </p>

                        {candidate.candidate_phone && (

                            <p>
                                {
                                    candidate.candidate_phone
                                }
                            </p>

                        )}

                    </div>


                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <div className="modal-section">

                    <div className="candidate-result-header">

                        <div>

                            <span className="detail-label">
                                Rank
                            </span>

                            <strong>
                                #{candidate.rank}
                            </strong>

                        </div>


                        <div>

                            <span className="detail-label">
                                Recommendation
                            </span>

                            <span
                                className={
                                    `recommendation ${candidate.recommendation.toLowerCase()}`
                                }
                            >
                                {
                                    candidate.recommendation
                                }
                            </span>

                        </div>

                    </div>


                    <MatchScore
                        score={
                            candidate.match_score
                        }
                    />

                </div>


                <div className="modal-section">

                    <h3>
                        Skills Analysis
                    </h3>

                    <SkillsMatch
                        matchedSkills={
                            candidate.matched_skills
                        }
                        missingSkills={
                            candidate.missing_skills
                        }
                    />

                </div>


                <div className="modal-section">

                    <h3>
                        Strengths
                    </h3>

                    {candidate.strengths?.length > 0 ? (

                        <ul className="strength-list">

                            {candidate.strengths.map(
                                (
                                    strength,
                                    index
                                ) => (

                                    <li
                                        key={index}
                                    >
                                        {strength}
                                    </li>

                                )
                            )}

                        </ul>

                    ) : (

                        <p className="muted-text">
                            No strengths available.
                        </p>

                    )}

                </div>


                <div className="modal-section">

                    <h3>
                        AI Justification
                    </h3>

                    <div className="justification-box">

                        {
                            candidate.justification
                            ||
                            "No justification available."
                        }

                    </div>

                </div>


                <div className="modal-section">

                    <h3>
                        Education
                    </h3>

                    {candidate.candidate_education?.length > 0 ? (

                        candidate.candidate_education.map(
                            (
                                education,
                                index
                            ) => (

                                <div
                                    className="detail-item"
                                    key={index}
                                >

                                    <strong>
                                        {
                                            education.degree
                                        }
                                    </strong>

                                    <p>
                                        {
                                            education.field
                                        }
                                    </p>

                                    <p>
                                        {
                                            education.institution
                                        }
                                    </p>

                                    <span>
                                        {
                                            education.year
                                        }
                                    </span>

                                </div>

                            )

                        )

                    ) : (

                        <p className="muted-text">
                            No education information available.
                        </p>

                    )}

                </div>


                <div className="modal-section">

                    <h3>
                        Experience
                    </h3>

                    {candidate.candidate_experience?.length > 0 ? (

                        candidate.candidate_experience.map(
                            (
                                experience,
                                index
                            ) => (

                                <div
                                    className="detail-item"
                                    key={index}
                                >

                                    <strong>
                                        {
                                            experience.role
                                        }
                                    </strong>

                                    <p>
                                        {
                                            experience.company
                                        }
                                    </p>

                                    <span>
                                        {
                                            experience.duration
                                        }
                                    </span>

                                    <p>
                                        {
                                            experience.description
                                        }
                                    </p>

                                </div>

                            )

                        )

                    ) : (

                        <p className="muted-text">
                            No experience information available.
                        </p>

                    )}

                </div>

            </div>

        </div>
    );
}


export default ScreeningCandidateDetails;