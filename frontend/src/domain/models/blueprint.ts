export type BlueprintCategory = 'backend' | 'frontend' | 'batch' | 'fullstack'

export type BlueprintCreationMode = 'manual' | 'assisted'

export type BlueprintVersionStatus = 'active' | 'in-use' | 'superseded'

export interface BlueprintLinkedProject {
  projectId: string
  projectName: string
  version: string
}

export interface BlueprintVersion {
  version: string
  status: BlueprintVersionStatus
  createdAt: string
  notes: string
}

export interface BlueprintHistoryEntry {
  id: string
  date: string
  author: string
  action: string
  detail: string
}

export interface Blueprint {
  id: string
  name: string
  description: string
  category: BlueprintCategory
  creationMode: BlueprintCreationMode
  currentVersion: string
  manualYaml: string
  linkedProjects: BlueprintLinkedProject[]
  versions: BlueprintVersion[]
  history: BlueprintHistoryEntry[]
  updatedAt: string
}

export interface CreateBlueprintPayload {
  name: string
  description: string
  category: BlueprintCategory
  creationMode: BlueprintCreationMode
  manualYaml: string
  assistantContext: string
  cloneSourceId?: string
}

export interface UpdateBlueprintPayload {
  name: string
  description: string
  category: BlueprintCategory
  editMode: BlueprintCreationMode
  manualYaml: string
  assistantContext: string
  publishNewVersion: boolean
}
