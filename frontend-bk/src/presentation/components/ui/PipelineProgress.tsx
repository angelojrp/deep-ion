interface PipelineProgressProps {
  stage: string
}

export const PipelineProgress = ({ stage }: PipelineProgressProps): JSX.Element => (
  <div className="rounded border px-3 py-2 text-sm">Pipeline stage: {stage}</div>
)