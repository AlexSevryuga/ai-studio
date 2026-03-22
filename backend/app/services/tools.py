"""Tool definitions for AI orchestrator."""

from typing import Any


def get_character_tools() -> list[dict[str, Any]]:
    """Tools for creating and managing characters."""
    return [
        {
            "type": "function",
            "function": {
                "name": "create_character",
                "description": "Create a new character in the project",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Character name"},
                        "aliases": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Nicknames, titles",
                        },
                        "role": {
                            "type": "string",
                            "enum": ["protagonist", "antagonist", "supporting", "minor"],
                        },
                        "description": {"type": "string", "description": "Brief description"},
                        "appearance": {
                            "type": "string",
                            "description": "Physical appearance description",
                        },
                        "arc": {"type": "string", "description": "Character arc"},
                    },
                    "required": ["name", "role", "description"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_character",
                "description": "Update an existing character",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "character_id": {"type": "string", "description": "Character UUID"},
                        "updates": {
                            "type": "object",
                            "properties": {
                                "aliases": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                                "role": {"type": "string"},
                                "description": {"type": "string"},
                                "appearance": {"type": "string"},
                                "arc": {"type": "string"},
                            },
                        },
                    },
                    "required": ["character_id", "updates"],
                },
            },
        },
    ]


def get_location_tools() -> list[dict[str, Any]]:
    """Tools for creating and managing locations."""
    return [
        {
            "type": "function",
            "function": {
                "name": "create_location",
                "description": "Create a new location in the project",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Location name"},
                        "description": {"type": "string", "description": "Location description"},
                        "visual_description": {
                            "type": "string",
                            "description": "Visual description for video generation",
                        },
                        "int_ext": {
                            "type": "string",
                            "enum": ["INT", "EXT", "INT/EXT"],
                        },
                    },
                    "required": ["name", "description", "int_ext"],
                },
            },
        },
    ]


def get_scene_tools() -> list[dict[str, Any]]:
    """Tools for creating and managing scenes."""
    return [
        {
            "type": "function",
            "function": {
                "name": "create_scene",
                "description": "Create a new scene in the project",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order": {"type": "integer", "description": "Scene order number"},
                        "act": {"type": "integer", "description": "Act number (1, 2, or 3)"},
                        "title": {"type": "string", "description": "Scene title"},
                        "description": {"type": "string", "description": "Scene description"},
                        "int_ext": {
                            "type": "string",
                            "enum": ["INT", "EXT", "INT/EXT"],
                        },
                        "time_of_day": {
                            "type": "string",
                            "enum": ["day", "night", "dawn", "dusk", "evening"],
                        },
                        "location_name": {
                            "type": "string",
                            "description": "Name of existing location",
                        },
                        "dramatic_function": {"type": "string", "description": "Why this scene exists"},
                        "source_chapter": {"type": "string", "description": "Source chapter"},
                    },
                    "required": ["order", "act", "title", "description"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_scene",
                "description": "Update an existing scene",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scene_id": {"type": "string", "description": "Scene UUID"},
                        "updates": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "status": {"type": "string"},
                                "dramatic_function": {"type": "string"},
                            },
                        },
                    },
                    "required": ["scene_id", "updates"],
                },
            },
        },
    ]


def get_clip_tools() -> list[dict[str, Any]]:
    """Tools for creating and managing clips."""
    return [
        {
            "type": "function",
            "function": {
                "name": "create_clip",
                "description": "Create a video clip for a scene",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scene_id": {"type": "string", "description": "Scene UUID"},
                        "order": {"type": "integer", "description": "Clip order within scene"},
                        "prompt": {"type": "string", "description": "Video generation prompt"},
                        "model": {
                            "type": "string",
                            "description": "Video model to use (default: veo-3.1)",
                        },
                        "duration_seconds": {
                            "type": "integer",
                            "description": "Duration in seconds (default: 8)",
                        },
                        "aspect_ratio": {
                            "type": "string",
                            "description": "16:9, 9:16, or 1:1 (default: 16:9)",
                        },
                    },
                    "required": ["scene_id", "order", "prompt"],
                },
            },
        },
    ]


def get_script_tools() -> list[dict[str, Any]]:
    """Tools for creating and managing scripts."""
    return [
        {
            "type": "function",
            "function": {
                "name": "create_script",
                "description": "Create a script version for a scene",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scene_id": {"type": "string", "description": "Scene UUID"},
                        "content": {"type": "string", "description": "Script content"},
                    },
                    "required": ["scene_id", "content"],
                },
            },
        },
    ]


def get_all_tools() -> list[dict[str, Any]]:
    """Get all orchestrator tools."""
    return [
        *get_character_tools(),
        *get_location_tools(),
        *get_scene_tools(),
        *get_clip_tools(),
        *get_script_tools(),
    ]
