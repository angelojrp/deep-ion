from pydantic import BaseModel, ConfigDict


class IssueData(BaseModel):
	model_config = ConfigDict(frozen=True)

	number: int
	title: str
	body: str
	labels: tuple[str, ...]
	author: str
	state: str


class CommentData(BaseModel):
	model_config = ConfigDict(frozen=True)

	id: int
	body: str
	author: str


__all__ = ["IssueData", "CommentData"]