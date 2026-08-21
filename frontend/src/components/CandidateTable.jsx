function CandidateTable({
    candidates,
    onCandidateSelect
}) {

    return (
        <div className="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            Rank
                        </th>

                        <th>
                            Candidate
                        </th>

                        <th>
                            Score
                        </th>

                        <th>
                            Recommendation
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {candidates.map(
                        candidate => (

                            <tr
                                key={
                                    candidate.result_id ||
                                    candidate.candidate_id
                                }
                            >

                                <td>
                                    #{candidate.rank}
                                </td>


                                <td>

                                    <div className="candidate-name-cell">

                                        <strong>
                                            {
                                                candidate.candidate_name
                                            }
                                        </strong>

                                        {candidate.candidate_email && (

                                            <span>
                                                {
                                                    candidate.candidate_email
                                                }
                                            </span>

                                        )}

                                    </div>

                                </td>


                                <td>

                                    <strong>

                                        {
                                            Number(
                                                candidate.match_score
                                            ).toFixed(1)
                                        }

                                        /10

                                    </strong>

                                </td>


                                <td>

                                    <span
                                        className={
                                            `recommendation ${candidate.recommendation.toLowerCase()}`
                                        }
                                    >

                                        {
                                            candidate.recommendation
                                        }

                                    </span>

                                </td>


                                <td>

                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            onCandidateSelect(
                                                candidate
                                            )
                                        }
                                    >
                                        View
                                    </button>

                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}


export default CandidateTable;