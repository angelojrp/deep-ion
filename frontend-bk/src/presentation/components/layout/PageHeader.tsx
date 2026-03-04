interface PageHeaderProps {
  title: string
}

export const PageHeader = ({ title }: PageHeaderProps): JSX.Element => <h1 className="mb-4 text-2xl font-bold">{title}</h1>