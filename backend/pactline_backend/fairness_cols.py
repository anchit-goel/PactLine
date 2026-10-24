"""Shared heuristics for picking the protected attribute and outcome column of a dataset.

Used by both the static audit generator and the Docker sandbox audit stream so that
both paths report the same Disparate Impact numbers for the same CSV.
"""

import re
from typing import List, Optional, Tuple

import pandas as pd

PROTECTED_KEYWORDS = [
    "gender", "sex", "race", "ethnic", "age_group", "age", "religion", "marital",
    "disab", "nationality", "caste", "region", "platform",
]
OUTCOME_KEYWORDS = [
    "hired", "approved", "selected", "outcome", "decision", "label", "target",
    "default", "accepted", "status", "result", "pass",
]
POSITIVE_VALUES = {
    "1", "true", "yes", "y", "hired", "approved", "selected", "accepted",
    "verified", "pass", "passed", "granted", "positive",
}


def _kw_match(kw: str, col: str) -> bool:
    """Short keywords must match a whole token; longer ones may match a substring."""
    name = col.lower()
    tokens = [t for t in re.split(r"[^a-z0-9]+", name) if t]
    if len(kw) <= 4:
        return kw in tokens
    return kw in name


def _is_id_like(df: pd.DataFrame, col: str) -> bool:
    name = col.lower()
    if name == "id" or name.endswith("_id") or name.endswith("id") and len(name) <= 4:
        return True
    return df[col].nunique() > max(10, 0.5 * len(df))


def pick_outcome(df: pd.DataFrame, exclude: Optional[str] = None) -> Tuple[Optional[str], Optional[pd.Series]]:
    """Return (column_name, binary 0/1 series) for the most plausible outcome column."""
    binary_cols = [c for c in df.columns if c != exclude and df[c].nunique(dropna=True) == 2]
    # Prefer columns whose name looks like an outcome
    binary_cols.sort(key=lambda c: 0 if any(_kw_match(k, c) for k in OUTCOME_KEYWORDS) else 1)
    for col in binary_cols:
        s = df[col]
        if pd.api.types.is_numeric_dtype(s) or pd.api.types.is_bool_dtype(s):
            hi = s.max()
            return col, (s == hi).astype(int)
        vals = [str(v) for v in s.dropna().unique()]
        pos = [v for v in vals if v.strip().lower() in POSITIVE_VALUES]
        if pos:
            return col, (s.astype(str) == pos[0]).astype(int)
    return None, None


def pick_protected(df: pd.DataFrame, outcome: Optional[str] = None) -> str:
    """Return the most plausible protected-attribute column."""
    cols = [c for c in df.columns if c != outcome and not _is_id_like(df, c)]
    low_card = [c for c in cols if 2 <= df[c].nunique() <= 12]
    for kw in PROTECTED_KEYWORDS:
        for c in low_card:
            if _kw_match(kw, c):
                return c
    cat = [c for c in low_card if df[c].dtype == "object"]
    if cat:
        return cat[0]
    if low_card:
        return low_card[0]
    return df.columns[0]


def candidate_protected(df: pd.DataFrame, limit: int = 4) -> List[str]:
    cols = [c for c in df.columns if not _is_id_like(df, c) and 2 <= df[c].nunique() <= 12]
    hits = [c for c in cols if any(_kw_match(k, c) for k in PROTECTED_KEYWORDS)]
    return (hits or cols)[:limit]


def select_columns(df: pd.DataFrame) -> Tuple[str, Optional[str], Optional[pd.Series]]:
    """Pick (protected_attr, outcome_col, outcome_binary_series)."""
    outcome, y = pick_outcome(df)
    protected = pick_protected(df, outcome)
    if outcome == protected:
        outcome, y = pick_outcome(df, exclude=protected)
    return protected, outcome, y
