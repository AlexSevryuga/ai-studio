from typing import Any

from anthropic import Anthropic
from openai import OpenAI

from app.config import settings


class LLMClient:
    """OpenAI-compatible LLM client with Claude and OpenAI backends."""

    def __init__(self) -> None:
        self.provider = settings.LLM_PROVIDER
        if self.provider == "anthropic":
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        else:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def complete(
        self,
        system: str,
        messages: list[dict[str, str]],
        tools: list[dict[str, Any]] | None = None,
        tool_choice: dict[str, str] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Send a completion request to the LLM."""
        if self.provider == "anthropic":
            return self._anthropic_complete(system, messages, tools, tool_choice, **kwargs)
        return self._openai_complete(system, messages, tools, tool_choice, **kwargs)

    def _anthropic_complete(
        self,
        system: str,
        messages: list[dict[str, str]],
        tools: list[dict[str, Any]] | None,
        tool_choice: dict[str, str] | None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Anthropic Claude completion."""
        params: dict[str, Any] = {
            "model": settings.ANTHROPIC_MODEL,
            "system": system,
            "messages": messages,
            **kwargs,
        }
        if tools:
            params["tools"] = tools
        if tool_choice:
            params["tool_choice"] = tool_choice

        client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(**params)
        return {
            "content": response.content[0].text if response.content else "",
            "stop_reason": response.stop_reason,
            "tool_calls": getattr(response, "tool_calls", None),
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        }

    def _openai_complete(
        self,
        system: str,
        messages: list[dict[str, str]],
        tools: list[dict[str, Any]] | None,
        tool_choice: dict[str, str] | None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """OpenAI-compatible completion."""
        params: dict[str, Any] = {
            "model": settings.OPENAI_MODEL,
            "messages": [{"role": "system", "content": system}, *messages],
            **kwargs,
        }
        if tools:
            params["tools"] = tools
        if tool_choice:
            params["tool_choice"] = tool_choice

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(**params)
        choice = response.choices[0]
        return {
            "content": choice.message.content or "",
            "stop_reason": choice.finish_reason,
            "tool_calls": choice.message.tool_calls,
            "usage": {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
            },
        }


llm_client = LLMClient()
