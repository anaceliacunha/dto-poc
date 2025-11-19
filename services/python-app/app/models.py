from __future__ import annotations

from typing import Any, Annotated, Dict

from pydantic.functional_validators import BeforeValidator
from py_models.models.demo_message import DemoMessage
from py_models.models.demo_message_notes import DemoMessageNotes
from py_models.models.demo_message_notes_one_of import DemoMessageNotesOneOf


def _coerce_notes_value(value: Any) -> Any:
    if value is None or isinstance(value, DemoMessageNotesOneOf):
        return value
    if isinstance(value, DemoMessageNotes):
        return DemoMessageNotesOneOf(value)
    if isinstance(value, str):
        return DemoMessageNotesOneOf(value)
    if isinstance(value, dict):
        if "actual_instance" in value:
            return DemoMessageNotesOneOf.model_validate(value)
        note = DemoMessageNotes.from_dict(value)
        return DemoMessageNotesOneOf(note)
    raise ValueError("notes must be a string or an object with a 'comment' field.")


def normalize_message_payload(payload: Any) -> Any:
    if isinstance(payload, DemoMessage):
        return payload
    if isinstance(payload, dict):
        data: Dict[str, Any] = dict(payload)
        if "notes" in data:
            data["notes"] = _coerce_notes_value(data["notes"])
        return data
    return payload


DemoMessagePayload = Annotated[DemoMessage, BeforeValidator(normalize_message_payload)]

_original_model_validate = DemoMessage.model_validate


@classmethod
def _normalized_model_validate(cls, value, *args, **kwargs):
    normalized = normalize_message_payload(value)
    return _original_model_validate.__func__(cls, normalized, *args, **kwargs)


DemoMessage.model_validate = _normalized_model_validate  # type: ignore[assignment]
