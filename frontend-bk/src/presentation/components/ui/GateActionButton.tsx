interface GateActionButtonProps {
  label: string
  onClick: () => void
}

export const GateActionButton = ({ label, onClick }: GateActionButtonProps): JSX.Element => (
  <button className="rounded bg-primary px-3 py-2 text-sm text-white" onClick={onClick} type="button">
    {label}
  </button>
)