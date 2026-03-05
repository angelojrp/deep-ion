from collections.abc import Callable
from typing import ParamSpec, TypeVar

import structlog
from tenacity import RetryCallState, retry, retry_if_exception, stop_after_attempt, wait_random_exponential

ParamT = ParamSpec("ParamT")
ReturnT = TypeVar("ReturnT")


class _RetryLogger:
    def __init__(self, operation: str) -> None:
        self._operation = operation
        self._logger = structlog.get_logger(__name__)

    def __call__(self, state: RetryCallState) -> None:
        error = state.outcome.exception() if state.outcome is not None else None
        status_code: int | None = None
        if error is not None:
            raw_status_code = getattr(error, "status_code", None)
            if isinstance(raw_status_code, int):
                status_code = raw_status_code
            else:
                response = getattr(error, "response", None)
                response_status_code = getattr(response, "status_code", None)
                if isinstance(response_status_code, int):
                    status_code = response_status_code
        self._logger.warning(
            "provider_retry",
            operation=self._operation,
            attempt=state.attempt_number,
            status_code=status_code,
            error=str(error) if error is not None else "unknown",
        )


def _should_retry_provider_error(error: BaseException) -> bool:
    status_code = getattr(error, "status_code", None)
    if isinstance(status_code, int):
        return status_code == 429 or status_code >= 500

    response = getattr(error, "response", None)
    response_status_code = getattr(response, "status_code", None)
    if isinstance(response_status_code, int):
        return response_status_code == 429 or response_status_code >= 500

    return False


def with_provider_retry(operation: str) -> Callable[[Callable[ParamT, ReturnT]], Callable[ParamT, ReturnT]]:
    return retry(
        retry=retry_if_exception(_should_retry_provider_error),
        wait=wait_random_exponential(multiplier=1, max=8),
        stop=stop_after_attempt(3),
        before_sleep=_RetryLogger(operation),
        reraise=True,
    )


__all__ = ["with_provider_retry"]
