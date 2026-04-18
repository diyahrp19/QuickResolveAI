"""AI-powered complaint analysis service.

This module provides a structured analysis function that can use OpenAI or Gemini,
with safe normalization to always return valid category/priority values.
"""

import json
import os
from typing import Any
from urllib import error, request

from services.complaint_service import process_complaint

ALLOWED_CATEGORIES = {"Product Issue", "Packaging Issue", "Trade Inquiry", "Spam"}
ALLOWED_PRIORITIES = {"High", "Medium", "Low"}
PRIORITY_RANK = {"Low": 1, "Medium": 2, "High": 3}
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.2"))

TRADE_KEYWORDS = {
    "distributor",
    "distribution",
    "wholesale",
    "bulk",
    "moq",
    "retailer",
    "reseller",
    "dealer",
    "quote",
    "pricing",
    "price list",
    "margin",
    "partnership",
    "supplier",
    "vendor",
}

SPAM_KEYWORDS = {
    "spam",
    "test",
    "testing",
    "hello",
    "hi",
    "random",
    "fun",
    "joke",
    "just checking",
    "asdf",
    "qwerty",
    "lorem ipsum",
    "subscribe",
    "click here",
    "promo",
    "offer",
    "win money",
    "lottery",
    "bitcoin",
    "telegram",
    "http://",
    "https://",
    "www.",
}

PACKAGING_KEYWORDS = {
    "leak",
    "leaking",
    "spilled",
    "spill",
    "packaging",
    "package",
    "box",
    "carton",
    "seal",
    "cap",
    "damaged box",
    "crushed",
    "torn",
    "delivery damaged",
}

PRODUCT_KEYWORDS = {
    "defective",
    "faulty",
    "not working",
    "stopped working",
    "malfunction",
    "broken",
    "burnt",
    "smells burnt",
    "does not start",
    "wrong item",
    "wrong variant",
    "wrong color",
    "quality issue",
}

HIGH_PRIORITY_KEYWORDS = {
    "urgent",
    "critical",
    "emergency",
    "danger",
    "dangerous",
    "safety",
    "leaking",
    "spilled",
    "burnt",
    "smells burnt",
    "stopped working",
    "not working",
    "broken",
    "defective",
}

MEDIUM_PRIORITY_KEYWORDS = {
    "wrong",
    "incorrect",
    "exchange",
    "replacement",
    "delay",
    "late",
    "damaged",
    "concern",
    "issue",
    "problem",
}

MINOR_INDICATORS = {
    "slight",
    "slightly",
    "minor",
    "small",
    "little",
}

USABLE_INDICATORS = {
    "works fine",
    "working fine",
    "usable",
    "still works",
    "functioning",
}


def analyze_complaint_text(complaint: str) -> dict[str, str]:
    """Analyze complaint text and return structured category/priority/recommendation.

    Uses configured AI provider when credentials are available.
    Falls back to the existing rule-based classifier if AI is unavailable.
    """
    complaint_clean = complaint.strip()
    if not complaint_clean:
        raise ValueError("Complaint text is required")

    provider = os.getenv("AI_PROVIDER", "openai").strip().lower()

    ai_result: dict[str, Any] | None = None
    if provider == "gemini":
        ai_result = _analyze_with_gemini(complaint_clean)
    else:
        ai_result = _analyze_with_openai(complaint_clean)

    fallback = _normalize_result(process_complaint(complaint_clean))
    ai_normalized = _normalize_result(ai_result) if ai_result is not None else None

    return _blend_analysis(
        complaint=complaint_clean,
        ai_result=ai_normalized,
        fallback_result=fallback,
    )


def _build_prompt(complaint: str) -> list[dict[str, str]]:
    system = (
        "You are an expert customer complaint triage assistant. "
        "Read the complaint and classify it into strict fields. "
        "Return ONLY JSON with keys: category, priority, recommendation. "
        "Allowed category values: Product Issue, Packaging Issue, Trade Inquiry, Spam. "
        "Allowed priority values: High, Medium, Low. "
        "Recommendation must be one concise action-oriented sentence."
    )
    user = (
        "Analyze this complaint text and return strict JSON only.\n"
        f"Complaint: {complaint}"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _analyze_with_openai(complaint: str) -> dict[str, Any] | None:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    payload = {
        "model": model,
        "messages": _build_prompt(complaint),
        "temperature": AI_TEMPERATURE,
        "response_format": {"type": "json_object"},
    }

    try:
        data = _post_json(
            url="https://api.openai.com/v1/chat/completions",
            payload=payload,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        content = data["choices"][0]["message"]["content"]
        return _parse_json_text(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError, error.URLError):
        return None


def _analyze_with_gemini(complaint: str) -> dict[str, Any] | None:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
    prompt_parts = _build_prompt(complaint)
    prompt_text = "\n\n".join(part["content"] for part in prompt_parts)

    payload = {
        "contents": [{"parts": [{"text": prompt_text}]}],
        "generationConfig": {
            "temperature": AI_TEMPERATURE,
            "responseMimeType": "application/json",
        },
    }

    try:
        data = _post_json(
            url=f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
            payload=payload,
            headers={},
        )
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return _parse_json_text(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError, error.URLError):
        return None


def _post_json(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            **headers,
        },
        method="POST",
    )

    with request.urlopen(req, timeout=20) as response:
        response_text = response.read().decode("utf-8")
        return json.loads(response_text)


def _parse_json_text(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


def _normalize_result(result: dict[str, Any]) -> dict[str, str]:
    category = _normalize_category(str(result.get("category", "")).strip())
    priority = _normalize_priority(str(result.get("priority", "")).strip())

    recommendation = str(result.get("recommendation", "")).strip()
    if not recommendation:
        recommendation = _default_recommendation(category, priority)

    return {
        "category": category,
        "priority": priority,
        "recommendation": recommendation,
    }


def _normalize_category(category: str) -> str:
    if category in ALLOWED_CATEGORIES:
        return category

    value = category.lower()
    if "spam" in value or "irrelevant" in value or "fake" in value:
        return "Spam"
    if "trade" in value or "sales" in value or "inquiry" in value:
        return "Trade Inquiry"
    if "pack" in value or "leak" in value or "delivery" in value:
        return "Packaging Issue"
    return "Product Issue"


def _normalize_priority(priority: str) -> str:
    if priority in ALLOWED_PRIORITIES:
        return priority

    value = priority.lower()
    if "high" in value or "urgent" in value or "critical" in value:
        return "High"
    if "medium" in value or "normal" in value:
        return "Medium"
    return "Low"


def _default_recommendation(category: str, priority: str) -> str:
    if category == "Spam":
        return "Mark this message as spam and ignore it unless further verification is needed."

    if category == "Trade Inquiry":
        return "Forward the request to the sales team and follow up with the customer."

    if category == "Packaging Issue" and priority == "High":
        return "Replace the product and escalate the issue to the quality assurance team."

    if category == "Packaging Issue" and priority == "Medium":
        return "Offer replacement or refund options and follow up with the customer."

    if category == "Packaging Issue" and priority == "Low":
        return "Apologize and follow up with the customer to confirm resolution."

    if category == "Product Issue" and priority == "High":
        return "Issue a replacement or refund and escalate to the quality assurance team."

    if category == "Product Issue" and priority == "Medium":
        return "Follow up with the customer and provide replacement or refund options."

    if category == "Product Issue" and priority == "Low":
        return "Follow up with the customer and provide standard support guidance."

    return "Follow up with the customer and resolve the issue promptly."


def _blend_analysis(
    complaint: str,
    ai_result: dict[str, str] | None,
    fallback_result: dict[str, str],
) -> dict[str, str]:
    text_category, category_score = _infer_category_from_text(complaint)
    text_priority = _infer_priority_from_text(complaint, text_category)

    # Make the keyword/text rules authoritative so obvious Medium/High cases
    # are not lowered by the AI model.
    chosen_category = text_category

    ai_priority = ai_result["priority"] if ai_result is not None else fallback_result["priority"]
    fallback_priority = fallback_result["priority"]
    chosen_priority = _max_priority(text_priority, fallback_priority)
    chosen_priority = _max_priority(chosen_priority, ai_priority)

    recommendation = ""
    if ai_result is not None:
        recommendation = ai_result.get("recommendation", "").strip()
    if not recommendation:
        recommendation = fallback_result.get("recommendation", "").strip()
    if not recommendation or _is_weak_recommendation(recommendation):
        recommendation = _default_recommendation(chosen_category, chosen_priority)

    return {
        "category": chosen_category,
        "priority": chosen_priority,
        "recommendation": recommendation,
    }


def _infer_category_from_text(text: str) -> tuple[str, int]:
    value = text.lower()
    spam_score = _spam_score(value)
    trade_score = _keyword_score(value, TRADE_KEYWORDS)
    packaging_score = _keyword_score(value, PACKAGING_KEYWORDS)
    product_score = _keyword_score(value, PRODUCT_KEYWORDS)

    scores = {
        "Spam": spam_score,
        "Trade Inquiry": trade_score,
        "Packaging Issue": packaging_score,
        "Product Issue": product_score,
    }

    if max(scores.values()) == 0:
        return "Product Issue", 0

    category = max(scores, key=scores.get)
    return category, scores[category]


def _infer_priority_from_text(text: str, category: str) -> str:
    value = text.lower()

    if category == "Spam":
        return "Low"

    has_minor_context = _contains_any(value, MINOR_INDICATORS) and _contains_any(
        value, USABLE_INDICATORS
    )

    if _contains_any(value, HIGH_PRIORITY_KEYWORDS):
        return "High"

    if "third" in value and "defective" in value:
        return "High"

    if category == "Packaging Issue":
        if _contains_any(value, {"leak", "leaking", "spilled", "crushed", "torn", "broken"}):
            return "High"
        if has_minor_context or _contains_any(value, {"dent", "dented", "slightly", "minor"}):
            return "Medium"

    if category == "Product Issue":
        if _contains_any(value, {"stopped working", "not working", "defective", "burnt", "broken"}):
            return "High"
        if _contains_any(
            value,
            {
                "lower than",
                "different from the picture",
                "different from picture",
                "looks different",
                "lower volume",
                "audio is lower",
                "weaker",
                "imbalanced",
            },
        ):
            return "Medium"
        if has_minor_context or _contains_any(value, {"slightly", "minor", "a bit", "somewhat", "works fine", "usable"}):
            return "Medium"
        if _contains_any(value, {"wrong", "incorrect", "exchange", "replacement"}):
            return "Medium"

    if category == "Trade Inquiry":
        if _contains_any(value, {"urgent", "asap", "immediately"}):
            return "Medium"
        return "Low"

    if _contains_any(value, MEDIUM_PRIORITY_KEYWORDS):
        return "Medium"

    return "Low"


def _keyword_score(text: str, keywords: set[str]) -> int:
    return sum(1 for kw in keywords if kw in text)


def _contains_any(text: str, keywords: set[str]) -> bool:
    return any(kw in text for kw in keywords)


def _spam_score(text: str) -> int:
    score = _keyword_score(text, SPAM_KEYWORDS)

    words = [w for w in text.split() if w]
    if len(words) <= 2:
        score += 1

    # Repeated single characters like "aaaa" or numeric noise look suspicious.
    if any(ch * 4 in text for ch in "abcdefghijklmnopqrstuvwxyz0123456789"):
        score += 2

    if "anonymous" in text and not _contains_any(
        text, TRADE_KEYWORDS | PACKAGING_KEYWORDS | PRODUCT_KEYWORDS
    ):
        score += 2

    return score


def _max_priority(a: str, b: str) -> str:
    if PRIORITY_RANK.get(a, 1) >= PRIORITY_RANK.get(b, 1):
        return a
    return b


def _is_weak_recommendation(value: str) -> bool:
    text = value.lower().strip()

    # Treat very short/generic answers as weak so we can provide a better fallback.
    if len(text) < 18:
        return True

    weak_values = {
        "follow up with customer",
        "follow up with the customer",
        "follow up",
        "contact customer",
    }
    return text in weak_values
