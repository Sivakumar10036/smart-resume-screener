function SkillsMatch({
    matchedSkills = [],
    missingSkills = []
}) {

    return (
        <div className="skills-section">

            <div className="skills-group">

                <h4>
                    Matched Skills
                </h4>

                <div className="skills-list">

                    {matchedSkills.length === 0 ? (

                        <span className="empty-skill">
                            No matched skills
                        </span>

                    ) : (

                        matchedSkills.map(
                            (skill, index) => (

                                <span
                                    className="skill matched"
                                    key={index}
                                >
                                    {skill}
                                </span>

                            )
                        )

                    )}

                </div>

            </div>


            <div className="skills-group">

                <h4>
                    Missing Skills
                </h4>

                <div className="skills-list">

                    {missingSkills.length === 0 ? (

                        <span className="skill matched">
                            No missing skills
                        </span>

                    ) : (

                        missingSkills.map(
                            (skill, index) => (

                                <span
                                    className="skill missing"
                                    key={index}
                                >
                                    {skill}
                                </span>

                            )
                        )

                    )}

                </div>

            </div>

        </div>
    );
}


export default SkillsMatch;