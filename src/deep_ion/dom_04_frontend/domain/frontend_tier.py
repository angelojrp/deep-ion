"""Frontend tier enumeration — JUNIOR / PLENO / SENIOR."""

from __future__ import annotations

from enum import Enum


class FrontendTier(str, Enum):
    """Seniority level for frontend agent routing."""

    JUNIOR = "JUNIOR"
    PLENO = "PLENO"
    SENIOR = "SENIOR"

    @property
    def max_classification(self) -> str:
        """Return the highest task classification accepted by this tier."""
        mapping: dict[FrontendTier, str] = {
            FrontendTier.JUNIOR: "T0",
            FrontendTier.PLENO: "T1",
            FrontendTier.SENIOR: "T2",
        }
        return mapping[self]

    @property
    def allowed_classifications(self) -> list[str]:
        """Return all task classifications accepted by this tier."""
        mapping: dict[FrontendTier, list[str]] = {
            FrontendTier.JUNIOR: ["T0"],
            FrontendTier.PLENO: ["T0", "T1"],
            FrontendTier.SENIOR: ["T0", "T1", "T2"],
        }
        return mapping[self]
