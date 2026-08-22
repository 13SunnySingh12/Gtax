"""Deterministic keyword fallbacks used when no LLM is configured, so
categorization and deduction flags still return sensible values offline."""
from __future__ import annotations

# category -> (keywords, is_deductible_by_default)
_RULES: list[tuple[str, list[str], bool]] = [
    ("Travel", ["uber", "ola", "fuel", "petrol", "diesel", "taxi", "flight", "train",
                "toll", "parking", "cab", "metro", "bus"], True),
    ("Food", ["restaurant", "cafe", "coffee", "lunch", "dinner", "food", "swiggy",
              "zomato", "grocery", "meal"], False),
    ("Software & Subscriptions", ["adobe", "figma", "github", "notion", "canva",
                                   "subscription", "saas", "aws", "google workspace",
                                   "microsoft 365", "spotify", "zoom"], True),
    ("Equipment", ["laptop", "camera", "monitor", "keyboard", "phone", "printer",
                   "hard drive", "ssd", "tripod", "equipment", "tool"], True),
    ("Home Office", ["rent", "desk", "chair", "office"], True),
    ("Utilities", ["electricity", "internet", "broadband", "wifi", "mobile bill",
                   "phone bill", "water", "gas bill"], True),
    ("Fees & Commissions", ["commission", "platform fee", "service fee",
                            "processing fee", "gst"], True),
    ("Marketing", ["ads", "advertising", "promotion", "marketing", "boost"], True),
    ("Professional Services", ["accountant", "lawyer", "consultant", "legal",
                               "freelancer"], True),
    ("Supplies", ["stationery", "paper", "supplies", "ink", "cable"], True),
]


def categorize(text: str | None, vendor: str | None) -> tuple[str, bool, str]:
    """Return (category, is_deductible, reason)."""
    haystack = " ".join(filter(None, [text, vendor])).lower()
    for category, keywords, deductible in _RULES:
        if any(kw in haystack for kw in keywords):
            reason = (
                f"Matched '{category}' from the description; "
                + ("commonly deductible for gig work." if deductible
                   else "usually a personal expense, not deductible.")
            )
            return category, deductible, reason
    return "Other", False, "No clear category matched; review manually."
