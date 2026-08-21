import json

from google import genai

from app.config import settings

from app.schemas.screening_schema import (
    ScreeningResult
)


client = genai.Client(
    api_key=settings.gemini_api_key
)


def match_resume_with_job(
    candidate,
    job
):

    resume_information = {

        "name":
            candidate.get(
                "name",
                ""
            ),

        "skills":
            candidate.get(
                "skills",
                []
            ),

        "education":
            candidate.get(
                "education",
                []
            ),

        "experience":
            candidate.get(
                "experience",
                []
            )
    }


    job_information = {

        "title":
            job.get(
                "title",
                ""
            ),

        "description":
            job.get(
                "description",
                ""
            ),

        "required_skills":
            job.get(
                "required_skills",
                []
            )
    }


    prompt = f"""
Compare the candidate resume with the job description.

Candidate Resume:

{json.dumps(
    resume_information,
    indent=2,
    default=str
)}


Job Description:

{json.dumps(
    job_information,
    indent=2,
    default=str
)}


Evaluate the candidate objectively based on:

1. Technical skills
2. Relevant experience
3. Education
4. Job responsibilities
5. Overall suitability


Scoring:

Technical skills = 40%

Relevant experience = 25%

Education = 15%

Job responsibilities = 10%

Overall suitability = 10%


Important rules:

- Give the match score from 0 to 100.
- The match score is a percentage.
- Do not give a score from 1 to 10.
- Do not multiply or divide the score.
- Do not invent candidate skills.
- Do not invent candidate experience.
- Do not assume experience that is not present.
- matched_skills must contain only skills demonstrated by the candidate.
- missing_skills must contain important job skills that the candidate does not demonstrate.
- strengths must contain only actual strengths found in the candidate data.
- justification must explain the score.
- Compare the candidate only against the provided job.
- Be objective and consistent.
- A candidate with only one or two matching skills must not automatically receive a high score.


Score interpretation:

90 - 100 = Excellent match

75 - 89 = Strong match

60 - 74 = Moderate match

40 - 59 = Weak match

0 - 39 = Very weak match


Return only the requested JSON.
"""


    system_instruction = """
You are an expert technical recruiter.

Evaluate the candidate only using the
candidate information and job information
provided.

Never invent information.

The match_score MUST be a number between
0 and 100.

The match_score represents a percentage.

Examples:

95 means 95 percent.

82 means 82 percent.

67 means 67 percent.

43 means 43 percent.

20 means 20 percent.

Never return a score using a 1 to 10 scale.

matched_skills must contain only skills
demonstrated by the candidate.

missing_skills must contain only important
job requirements that the candidate does
not demonstrate.

Return valid structured JSON only.
"""


    response = client.models.generate_content(

        model=settings.gemini_model,

        contents=[
            system_instruction,
            prompt
        ],

        config={
            "temperature": 0,

            "response_mime_type":
                "application/json",

            "response_schema":
                ScreeningResult.model_json_schema()
        }
    )


    if not response.text:

        raise ValueError(
            "Gemini returned an empty screening response"
        )


    screening_result = (
        ScreeningResult.model_validate_json(
            response.text
        )
    )


    result = screening_result.model_dump()


    score = float(
        result.get(
            "match_score",
            0
        )
    )


    score = max(
        0,
        min(
            score,
            100
        )
    )


    result["match_score"] = round(
        score,
        1
    )


    return result