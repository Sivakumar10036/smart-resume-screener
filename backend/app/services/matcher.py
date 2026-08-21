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


Important rules:

- Give a score from 1 to 10.
- Do not invent candidate skills.
- Do not invent candidate experience.
- Do not assume experience that is not present.
- matched_skills must contain only skills supported by the candidate.
- missing_skills must contain important job skills that the candidate does not demonstrate.
- strengths must describe actual strengths found in the candidate data.
- justification must explain why the candidate received the score.
- Compare the candidate only against the provided job.
- Be objective and consistent.


Scoring guidance:

9.0 - 10.0 = Excellent match

7.0 - 8.9 = Strong match

5.0 - 6.9 = Moderate match

1.0 - 4.9 = Weak match


Return only the requested structured JSON.
"""


    system_instruction = """
You are an expert technical recruiter.

Evaluate candidates objectively against
job descriptions.

Never invent information.

Use only the candidate information
and job information provided.

Return a structured screening result.

The match score must be between
1 and 10.

matched_skills must only contain
skills demonstrated by the candidate.

missing_skills must only contain
important job requirements that the
candidate does not demonstrate.
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


    return screening_result.model_dump()