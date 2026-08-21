import MatchScore from "./MatchScore";
import SkillsMatch from "./SkillsMatch";


function CandidateCard({
    candidate
}) {

    return (
        <div className="candidate-card">

            <div className="candidate-header">

                <div>

                    <h3>
                        {candidate.candidate_name}
                    </h3>

                    <p>
                        Rank #{candidate.rank}
                    </p>

                </div>

                <div
                    className={
                        `recommendation ${candidate.recommendation.toLowerCase()}`
                    }
                >
                    {candidate.recommendation}
                </div>

            </div>


            <MatchScore
                score={candidate.match_score}
            />


            <SkillsMatch
                matchedSkills={
                    candidate.matched_skills
                }
                missingSkills={
                    candidate.missing_skills
                }
            />

        </div>
    );
}


export default CandidateCard;