"""Domain layer — pure business logic for DOM-04 Frontend agents."""

from deep_ion.dom_04_frontend.domain.code_generation_result import CodeGenerationResult
from deep_ion.dom_04_frontend.domain.frontend_task import FrontendTask
from deep_ion.dom_04_frontend.domain.frontend_tier import FrontendTier
from deep_ion.dom_04_frontend.domain.model_budget_policy import ModelBudgetPolicy
from deep_ion.dom_04_frontend.domain.output_policy import OutputPolicy
from deep_ion.dom_04_frontend.domain.task_classifier import TaskClassifier
from deep_ion.dom_04_frontend.domain.ux_analysis_result import UxAnalysisResult
from deep_ion.dom_04_frontend.domain.ux_component_result import UxComponentResult
from deep_ion.dom_04_frontend.domain.ux_policy import validate_wcag_compliance
from deep_ion.dom_04_frontend.domain.ux_prototype_result import UxPrototypeResult

__all__: list[str] = [
    "CodeGenerationResult",
    "FrontendTask",
    "FrontendTier",
    "ModelBudgetPolicy",
    "OutputPolicy",
    "TaskClassifier",
    "UxAnalysisResult",
    "UxComponentResult",
    "UxPrototypeResult",
    "validate_wcag_compliance",
]
