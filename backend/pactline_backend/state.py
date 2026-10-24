"""DealState TypedDict definition for Pactline LangGraph workflow."""

import operator
from typing import Annotated, Any, Dict, List, Optional, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class DealState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    sender: str
    brief: str
    run_id: str
    creators: List[Dict[str, Any]]
    payment_model: Dict[str, Any]
    draft: Dict[str, Any]
    compliance: Dict[str, Any]
    revision_count: int
    settlement: Dict[str, Any]
    approvals: Dict[str, Any]
    trace: Annotated[List[Dict[str, Any]], operator.add]
