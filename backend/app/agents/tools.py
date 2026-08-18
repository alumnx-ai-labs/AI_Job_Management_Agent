from __future__ import annotations

import json
import re
from typing import Any

from app.config import GEMINI_API_KEY, GEMINI_MODEL

REQUIRED_FIELDS = ["title", "company", "location", "work_type", "salary", "description"]


def _extract_with_gemini(text: str, current_draft: dict[str, Any] | None = None) -> dict[str, Any] | None:
    if not GEMINI_API_KEY:
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        draft_context = json.dumps(current_draft or {})
        prompt = f"""You are an expert AI job posting parser. Extract structured job information from the following user message.
Current draft already collected: {draft_context}
User message:
\"\"\"{text}\"\"\"

Extract whatever information is available for these 6 fields:
1. "title": Job title / position name (string or null)
2. "company": Company / employer name (string or null)
3. "location": Location such as city, state, country, or "Remote" (string or null)
4. "work_type": Work arrangement like "Full-time", "Part-time", "Contract", "Remote", "Hybrid", "Internship" (string or null)
5. "salary": Salary, compensation range, or pay rate (string or null)
6. "description": Summary or full text of job responsibilities and overview (string or null)

CRITICAL RULES:
- Never invent or hallucinate missing information.
- If a field is not explicitly mentioned or clearly stated in the message, set its value to null.
- If the user is answering a follow-up question (e.g. "Salary is $120k" or "At Stripe"), extract just that field accurately.
- Return ONLY a valid JSON object with keys: "title", "company", "location", "work_type", "salary", "description".
"""
        response = client.models.generate_content(
            model=GEMINI_MODEL or "gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        if response.text:
            parsed = json.loads(response.text)
            if isinstance(parsed, dict):
                return {
                    k: str(v).strip()
                    for k, v in parsed.items()
                    if k in REQUIRED_FIELDS and v is not None and str(v).strip() and str(v).lower() != "null"
                }
    except Exception:
        pass

    return None


def _extract_with_heuristics(text: str, current_draft: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = (text or "").strip()
    if not cleaned:
        return {}

    result: dict[str, Any] = {}
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]

    # 1. Key-value explicit labels (e.g. "title: Dev", "company: Stripe")
    label_patterns = {
        "title": [r"^(?:job\s+)?title\s*[:=-]\s*(.+)$", r"^(?:position|role)\s*[:=-]\s*(.+)$"],
        "company": [r"^(?:company(?:\s+name)?|organization|employer)\s*[:=-]\s*(.+)$"],
        "location": [r"^(?:location|city|place|office|where)\s*[:=-]\s*(.+)$"],
        "work_type": [r"^(?:work\s+type|employment\s+type|job\s+type|type)\s*[:=-]\s*(.+)$"],
        "salary": [r"^(?:salary|compensation|pay|rate|package)\s*[:=-]\s*(.+)$"],
        "description": [r"^(?:description|job\s+description|about\s+(?:the\s+)?role|responsibilities|summary)\s*[:=-]\s*(.+)$"],
    }

    for line in lines:
        for field, patterns in label_patterns.items():
            if field not in result:
                for pattern in patterns:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        val = match.group(1).strip()
                        if val:
                            result[field] = val
                        break

    # 2. Conversational / Natural language parsing
    # Salary extraction
    if "salary" not in result:
        # e.g. "salary is $150k", "$120,000 - $180,000", "$95k/year", "120k USD", "$60/hr"
        sal_match = re.search(
            r"(?:salary|compensation|pay|package)\s*(?:is|of|:|=)?\s*(\$?\d[\d,]*(?:\.\d+)?\s*(?:k|K|k\/yr|\/yr|\/year|\/hr|USD|EUR|GBP|INR)?(?:\s*-\s*\$?\d[\d,]*(?:k|K|\/yr|\/year)?)?)",
            cleaned,
            re.IGNORECASE,
        )
        if sal_match:
            result["salary"] = sal_match.group(1).strip()
        else:
            sal_symbol_match = re.search(
                r"(\$\s*\d[\d,]*(?:\.\d+)?\s*(?:k|K|k\/yr|\/yr|\/year|\/hr|per\s+year|per\s+hour)?(?:\s*-\s*\$?\d[\d,]*(?:k|K)?)?)",
                cleaned,
                re.IGNORECASE,
            )
            if sal_symbol_match:
                result["salary"] = sal_symbol_match.group(1).strip()

    # Work type extraction
    if "work_type" not in result:
        wt_match = re.search(
            r"\b(full[\s-]time|part[\s-]time|contract(?:or)?|freelance|internship|remote|hybrid|on[\s-]site)\b",
            cleaned,
            re.IGNORECASE,
        )
        if wt_match:
            raw_wt = wt_match.group(1).lower()
            if "full" in raw_wt:
                result["work_type"] = "Full-time"
            elif "part" in raw_wt:
                result["work_type"] = "Part-time"
            elif "contract" in raw_wt or "freelance" in raw_wt:
                result["work_type"] = "Contract"
            elif "intern" in raw_wt:
                result["work_type"] = "Internship"
            elif "hybrid" in raw_wt:
                result["work_type"] = "Hybrid"
            elif "remote" in raw_wt:
                result["work_type"] = "Remote"
            elif "on" in raw_wt:
                result["work_type"] = "On-site"

    # Company extraction
    if "company" not in result:
        comp_match = re.search(
            r"(?:company\s+(?:is|name\s+is|:|=)\s+|at\s+|for\s+)([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+in|\s+is|\s+looking|\s+hiring|\.|\,|$|\n)",
            cleaned,
        )
        if comp_match:
            val = comp_match.group(1).strip()
            if len(val) > 1 and val.lower() not in {"least", "present", "our", "a", "an", "this", "home", "remote", "full-time", "the"}:
                result["company"] = val

    # Location extraction
    if "location" not in result:
        loc_match = re.search(
            r"(?:location\s+(?:is|:|=)\s+|based\s+in\s+|located\s+in\s+|in\s+)([A-Z][A-Za-z\s,.-]+?)(?:\s+with|\s+paying|\s+salary|\s+offering|\.|\,|$|\n)",
            cleaned,
        )
        if loc_match:
            val = loc_match.group(1).strip()
            if len(val) > 1 and val.lower() not in {"the", "a", "our", "this", "addition", "order", "full-time"}:
                result["location"] = val
        elif re.search(r"\b(remote|work\s+from\s+home)\b", cleaned, re.IGNORECASE):
            result["location"] = "Remote"

    # Title extraction
    if "title" not in result:
        title_match = re.search(
            r"(?:job\s+title\s+(?:is|:|=)\s+|role\s+(?:is|:|=)\s+|position\s+(?:is|:|=)\s+|hiring\s+(?:a|an)\s+|looking\s+for\s+(?:a|an)\s+)([A-Z][A-Za-z0-9\s/.,'-]+?)(?:\s+at|\s+in|\s+for|\s+with|\s+to|\.|\,|$|\n)",
            cleaned,
        )
        if title_match:
            val = title_match.group(1).strip()
            if len(val) > 2:
                result["title"] = val

    # Description extraction
    if "description" not in result:
        desc_match = re.search(r"(?:description\s*(?:is|:|=)\s*)(.+)", cleaned, re.IGNORECASE | re.DOTALL)
        if desc_match:
            result["description"] = desc_match.group(1).strip()
        elif len(cleaned) > 25 and not any(line.lower().startswith(k) for k in REQUIRED_FIELDS for line in lines):
            # If user sent a full description block
            result["description"] = cleaned

    return result


def extract_job_fields(text: str, current_draft: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = (text or "").strip()
    if not cleaned:
        return {}

    # 1. Try Gemini LLM extraction first if key available
    gemini_result = _extract_with_gemini(cleaned, current_draft)
    if gemini_result:
        return gemini_result

    # 2. Fallback to robust heuristic extraction
    return _extract_with_heuristics(cleaned, current_draft)


def validate_job_data(job: dict[str, Any]) -> tuple[bool, list[str]]:
    missing_fields = [
        field_name
        for field_name in REQUIRED_FIELDS
        if not isinstance(job.get(field_name), str) or not str(job.get(field_name, "")).strip()
    ]
    return len(missing_fields) == 0, missing_fields


def build_missing_fields_message(missing_fields: list[str]) -> str:
    if not missing_fields:
        return "All required fields are present."

    friendly_names = {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location (or Remote)",
        "work_type": "Work Type (e.g. Full-time, Remote, Contract)",
        "salary": "Salary / Compensation",
        "description": "Job Description / Responsibilities",
    }

    missing_readable = [friendly_names.get(f, f) for f in missing_fields]
    if len(missing_readable) == 1:
        return f"Please provide the {missing_readable[0]} to complete this job posting."

    return f"We still need the following information to create this job: {', '.join(missing_readable)}. Please provide these details."
