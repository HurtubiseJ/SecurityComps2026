#loads master config file and exposes rate_limit config.
import os
import json
from typing import Any, Dict

_config: Dict[str, Any] = {}
_config_path: str = ""


def _get_config_path() -> str:
    global _config_path
    if _config_path:
        return _config_path
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _config_path = os.environ.get("CONFIG_FILE_PATH", os.path.join(base, "MASTER_CONFIG.json"))
    return _config_path


def load() -> None:
    """Load or reload config from file."""
    global _config
    path = _get_config_path()
    try:
        with open(path, "r") as f:
            _config = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        _config = {}


def reload() -> None:
    """Reload config from file (for /proxy/apply)."""
    load()


def get_rate_limit() -> Dict[str, Any]:
    """Return rate_limit section from custom_config with defaults."""
    custom = _config.get("custom_config") or {}
    rl = custom.get("rate_limit") or {}
    return {
        "enabled": rl.get("enabled", False),
        "requests_per_second": rl.get("requests_per_second", 100),
        "burst": rl.get("burst", 50),
        "scope": rl.get("scope", "per_ip"),
        "response_code": rl.get("response_code", 429),
    }


def get_config() -> Dict[str, Any]:
    """Return full config (for status)."""
    return _config.copy()


load()
