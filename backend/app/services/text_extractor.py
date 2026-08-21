def extract_text_from_txt(file_bytes):

    try:

        return file_bytes.decode(
            "utf-8"
        ).strip()

    except UnicodeDecodeError:

        return file_bytes.decode(
            "latin-1"
        ).strip()