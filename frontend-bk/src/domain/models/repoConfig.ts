export interface RepoConfig {
  id: string
  owner: string
  name: string
  installationId: number
  defaultBranch: string
  webhookStatus: 'active' | 'inactive' | 'error'
}