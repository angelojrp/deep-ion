from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", extra="ignore")

	ai_provider: str = "copilot"
	ai_provider_api_key: SecretStr = SecretStr("")
	github_token: SecretStr
	log_level: str = "INFO"
	github_repo: str


__all__ = ["Settings"]