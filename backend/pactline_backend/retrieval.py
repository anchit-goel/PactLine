"""Retrieval and grading module for Pactline knowledge sources."""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Literal

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

SourceType = Literal["clauses", "regulatory", "creators", "deliverables"]


def retrieve(source: SourceType, query: str, k: int = 3) -> List[Dict[str, Any]]:
    """Retrieve relevant records from the requested knowledge source."""
    fixture_file = FIXTURES_DIR / f"{source}.json"
    if not fixture_file.exists():
        # Fallback empty list or mock deliverable structure
        if source == "deliverables":
            return [
                {
                    "id": "del_video_long_01",
                    "score": 0.88,
                    "snippet": "SYNTHETIC PLACEHOLDER - 1x 60s dedicated YouTube review with pinned comment and link in description.",
                },
                {
                    "id": "del_short_02",
                    "score": 0.74,
                    "snippet": "SYNTHETIC PLACEHOLDER - 2x Instagram reels / TikTok short clips featuring product hands-on.",
                },
            ][:k]
        return []

    with open(fixture_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    hits = []
    for idx, item in enumerate(data[:k]):
        score = max(0.95 - (idx * 0.12), 0.50)
        snippet = item.get("snippet") or item.get("name") or json.dumps(item)
        hits.append({
            "id": item.get("id", f"hit_{idx}"),
            "score": round(score, 2),
            "snippet": snippet,
        })
    return hits


def grade(query: str, hits: List[Dict[str, Any]]) -> float:
    """Evaluate retrieval quality / relevance score between 0.0 and 1.0."""
    if not hits:
        return 0.0
    # In stub mode, if query is the initial broad query, grade lower to test requery
    if "initial" in query.lower() or "broad" in query.lower() or len(query.strip()) < 15:
        return 0.42
    avg_score = sum(h.get("score", 0.7) for h in hits) / len(hits)
    return round(min(max(avg_score, 0.0), 1.0), 2)
