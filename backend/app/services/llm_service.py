from google import genai

from app.config import settings

from app.schemas.candidate_schema import (
    CandidateProfile
)


client = genai.Client(
    api_key=settings.gemini_api_key
)


def extract_resume_information(
    resume_text
):

    prompt = f"""
You are an expert resume information extraction system.

Extract information only when it is explicitly present
in the resume.

Never invent information.

If information is missing:

- return an empty string for string fields
- return an empty list for list fields

Extract:

1. Candidate name
2. Email
3. Phone
4. Skills
5. Education
6. Work experience

For education extract:

- degree
- field
- institution
- year

For experience extract:

- company
- role
- duration
- description

Important rules:

- Use only information contained in the resume.
- Do not infer missing information.
- Do not create skills that are not mentioned.
- Do not create education details that are not mentioned.
- Do not create work experience that is not mentioned.

Resume:

{resume_text}
"""


    response = client.models.generate_content(

        model=settings.gemini_model,

        contents=prompt,

        config={
            "temperature": 0,
            "response_mime_type":
                "application/json",
            "response_schema":
                CandidateProfile.model_json_schema()
        }
    )


    if not response.text:

        raise ValueError(
            "Gemini returned an empty response"
        )


    candidate_profile = (
        CandidateProfile.model_validate_json(
            response.text
        )
    )


    return candidate_profile.model_dump()