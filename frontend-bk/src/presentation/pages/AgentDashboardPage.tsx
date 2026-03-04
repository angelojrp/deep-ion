import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import { useSkillLogs } from '@application/hooks/useSkillLogs'

export const AgentDashboardPage = (): JSX.Element => {
  const { tenant = '', agentId = '' } = useParams()
  const { data } = useSkillLogs(tenant, agentId)

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Agent DOM-{agentId}</h2>
      {data?.map((log) => (
        <article className="mb-3 rounded border p-3" key={log.id}>
          <h3 className="mb-2 font-semibold">{log.title}</h3>
          <ReactMarkdown>{DOMPurify.sanitize(log.markdown)}</ReactMarkdown>
        </article>
      ))}
    </section>
  )
}