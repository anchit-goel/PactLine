"""LLM usage tracking and telemetry for Pactline."""

import time
from typing import Any, Dict, List, Optional
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult

from backend.pactline_backend.events import make_event

# PLACEHOLDER: Cost estimates per 1M tokens. Not verified billing rates.
PLACEHOLDER_PRICING_PER_MILLION = {
    "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-2.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-3.1-pro-preview": {"input": 1.25, "output": 5.00},
    "default": {"input": 1.00, "output": 4.00},
}


class TokenUsageTracker(BaseCallbackHandler):
    """LangChain callback handler capturing usage metadata from model calls."""

    def __init__(self, run_id: str, agent: str, event_sink: Optional[List[Dict[str, Any]]] = None):
        super().__init__()
        self.run_id = run_id
        self.agent = agent
        self.event_sink = event_sink if event_sink is not None else []
        self._start_time: Optional[float] = None

    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any) -> None:
        self._start_time = time.time()

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        latency_ms = (time.time() - self._start_time) * 1000.0 if self._start_time else 0.0
        model_name = "default"
        tokens_in = 0
        tokens_out = 0

        llm_output = response.llm_output or {}
        if "model_name" in llm_output:
            model_name = llm_output["model_name"]
        elif "model" in llm_output:
            model_name = llm_output["model"]

        # Parse usage metadata
        usage = llm_output.get("usage_metadata") or llm_output.get("token_usage") or {}
        if not usage and response.generations:
            gen = response.generations[0][0]
            if hasattr(gen, "message") and hasattr(gen.message, "usage_metadata"):
                usage = gen.message.usage_metadata or {}

        tokens_in = usage.get("input_tokens") or usage.get("prompt_tokens") or 0
        tokens_out = usage.get("output_tokens") or usage.get("completion_tokens") or 0

        rates = PLACEHOLDER_PRICING_PER_MILLION.get(model_name, PLACEHOLDER_PRICING_PER_MILLION["default"])
        cost = (tokens_in * rates["input"] + tokens_out * rates["output"]) / 1_000_000.0

        seq = len(self.event_sink) + 1
        event = make_event(
            "llm_usage",
            run_id=self.run_id,
            seq=seq,
            agent=self.agent,
            model=model_name,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            latency_ms=round(latency_ms, 2),
            cost_usd=round(cost, 6),
        )
        self.event_sink.append(event)


def generate_stub_usage(
    run_id: str,
    seq: int,
    agent: str,
    model: str = "gemini-3.1-pro-preview",
    tokens_in: int = 420,
    tokens_out: int = 180,
    latency_ms: float = 640.0,
) -> Dict[str, Any]:
    """Generates plausible synthetic LLM usage in stub mode."""
    rates = PLACEHOLDER_PRICING_PER_MILLION.get(model, PLACEHOLDER_PRICING_PER_MILLION["default"])
    cost = (tokens_in * rates["input"] + tokens_out * rates["output"]) / 1_000_000.0
    return make_event(
        "llm_usage",
        run_id=run_id,
        seq=seq,
        agent=agent,
        model=model,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        latency_ms=round(latency_ms, 2),
        cost_usd=round(cost, 6),
    )
