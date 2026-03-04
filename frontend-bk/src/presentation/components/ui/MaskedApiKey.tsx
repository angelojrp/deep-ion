interface MaskedApiKeyProps {
  value: string
}

export const MaskedApiKey = ({ value }: MaskedApiKeyProps): JSX.Element => (
  <code className="rounded bg-slate-100 px-2 py-1 text-sm">{value}</code>
)