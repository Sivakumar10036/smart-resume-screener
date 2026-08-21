import re


SKILL_ALIASES = {
    "react.js": "React",
    "reactjs": "React",
    "react": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express.js": "Express.js",
    "express": "Express.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "fast api": "FastAPI",
    "fastapi": "FastAPI",
    "mongo db": "MongoDB",
    "mongodb": "MongoDB",
    "postgre sql": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "my sql": "MySQL",
    "mysql": "MySQL",
    "java script": "JavaScript",
    "javascript": "JavaScript",
    "type script": "TypeScript",
    "typescript": "TypeScript",
    "c plus plus": "C++",
    "c++": "C++",
    "python": "Python",
    "java": "Java",
    "sql": "SQL",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "git": "Git",
    "github": "GitHub",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",
    "llm": "LLM",
    "large language models": "LLM",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "data structures and algorithms": "Data Structures",
    "oop": "OOP",
    "object oriented programming": "OOP",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs"
}


def normalize_skill(skill):

    skill = skill.strip()

    skill_lower = skill.lower()

    if skill_lower in SKILL_ALIASES:

        return SKILL_ALIASES[skill_lower]

    return skill


def split_skill_group(skill):

    skill = skill.strip()

    if ":" in skill:

        _, skill_values = skill.split(
            ":",
            1
        )

        parts = re.split(
            r",|/|\|",
            skill_values
        )

        return [
            part.strip()
            for part in parts
            if part.strip()
        ]

    return [skill]


def normalize_skills(skills):

    normalized_skills = []

    for skill in skills:

        skill_parts = split_skill_group(
            skill
        )

        for skill_part in skill_parts:

            normalized_skill = normalize_skill(
                skill_part
            )

            if normalized_skill and normalized_skill not in normalized_skills:

                normalized_skills.append(
                    normalized_skill
                )

    return normalized_skills


def extract_job_skills(description):

    skill_patterns = [
        "python",
        "java",
        "c++",
        "javascript",
        "typescript",
        "react.js",
        "react",
        "next.js",
        "node.js",
        "express.js",
        "fastapi",
        "django",
        "spring boot",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "git",
        "github",
        "machine learning",
        "deep learning",
        "generative ai",
        "llm",
        "data structures",
        "algorithms",
        "oop",
        "rest api"
    ]

    description_lower = description.lower()

    found_skills = []

    for skill in skill_patterns:

        if re.search(
            r"(?<!\w)"
            + re.escape(skill.lower())
            + r"(?!\w)",
            description_lower
        ):

            normalized_skill = normalize_skill(
                skill
            )

            if normalized_skill not in found_skills:

                found_skills.append(
                    normalized_skill
                )

    return found_skills