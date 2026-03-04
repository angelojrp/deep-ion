import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPendingProjects,
  fetchKickoffs,
  fetchKickoff,
  startKickoff,
  generateVision,
  reviewVision,
  updateVisionSection,
  checkArchitecture,
  completeArchitectureTask,
  generateArchitecture,
  reviewArchitecture,
  updateArchitectureSection,
  generateScaffold,
  createPendingProject,
} from '@infrastructure/api/adapters/projectKickoffApi'
import type { CreatePendingProjectPayload } from '@infrastructure/api/adapters/projectKickoffApi'
import type { ProjectKickoff, StartKickoffPayload, ReviewDocumentPayload } from '@domain/models/project-kickoff'
import type { ProjectSummary } from '@domain/models/project'

const KICKOFF_KEY = ['project-kickoff'] as const
const PENDING_PROJECTS_KEY = ['pending-projects'] as const

export function usePendingProjects() {
  return useQuery<ProjectSummary[]>({
    queryKey: PENDING_PROJECTS_KEY,
    queryFn: fetchPendingProjects,
    staleTime: 30_000,
  })
}

export function useKickoffs() {
  return useQuery<ProjectKickoff[]>({
    queryKey: KICKOFF_KEY,
    queryFn: fetchKickoffs,
    staleTime: 10_000,
  })
}

export function useKickoff(projectId: string | null) {
  return useQuery<ProjectKickoff>({
    queryKey: [...KICKOFF_KEY, projectId],
    queryFn: () => fetchKickoff(projectId!),
    enabled: !!projectId,
    staleTime: 5_000,
  })
}

export function useCreatePendingProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePendingProjectPayload) => createPendingProject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENDING_PROJECTS_KEY })
    },
  })
}

export function useStartKickoff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StartKickoffPayload) => startKickoff(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
      qc.invalidateQueries({ queryKey: PENDING_PROJECTS_KEY })
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
    },
  })
}

export function useGenerateVision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kickoffId: string) => generateVision(kickoffId),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useReviewVision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kickoffId, payload }: { kickoffId: string; payload: ReviewDocumentPayload }) =>
      reviewVision(kickoffId, payload),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useUpdateVisionSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      kickoffId,
      sectionId,
      content,
    }: {
      kickoffId: string
      sectionId: string
      content: string
    }) => updateVisionSection(kickoffId, sectionId, content),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
    },
  })
}

export function useCheckArchitecture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kickoffId: string) => checkArchitecture(kickoffId),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useCompleteArchitectureTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kickoffId: string) => completeArchitectureTask(kickoffId),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useGenerateArchitecture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kickoffId: string) => generateArchitecture(kickoffId),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useReviewArchitecture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kickoffId, payload }: { kickoffId: string; payload: ReviewDocumentPayload }) =>
      reviewArchitecture(kickoffId, payload),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}

export function useUpdateArchitectureSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      kickoffId,
      sectionId,
      content,
    }: {
      kickoffId: string
      sectionId: string
      content: string
    }) => updateArchitectureSection(kickoffId, sectionId, content),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
    },
  })
}

export function useGenerateScaffold() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kickoffId: string) => generateScaffold(kickoffId),
    onSuccess: (data) => {
      qc.setQueryData([...KICKOFF_KEY, data.projectId], data)
      qc.invalidateQueries({ queryKey: KICKOFF_KEY })
    },
  })
}
