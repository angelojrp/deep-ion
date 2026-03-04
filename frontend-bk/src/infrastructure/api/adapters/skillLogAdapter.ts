import type { SkillLog } from '@domain/models/skillLog'
import { httpGet } from '@infrastructure/http/httpClient'

export const skillLogAdapter = {
  listByAgent: (tenant: string, agentId: string): Promise<SkillLog[]> =>
    httpGet<SkillLog[]>(`/api/tenants/${tenant}/agents/${agentId}/logs`)
}