from fastapi import HTTPException

from app.services.pdf_extractor import (
    extract_text_from_pdf
)

from app.services.text_extractor import (
    extract_text_from_txt
)


def extract_resume_text(
    filename,
    file_bytes
):

    if not filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):

        text = extract_text_from_pdf(
            file_bytes
        )

    elif filename_lower.endswith(".txt"):

        text = extract_text_from_txt(
            file_bytes
        )

    else:

        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported"
        )

    if not text:

        raise HTTPException(
            status_code=400,
            detail="The uploaded resume contains no readable text"
        )

    return text