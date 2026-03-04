import { http, HttpResponse } from 'msw'
import data from './fixtures/project-kickoff.json'
import type {
  ProjectKickoff,
  VisionDocument,
  ArchitectureDocument,
  ScaffoldResult,
} from '@domain/models/project-kickoff'

// In-memory store for kickoff state
const kickoffStore = new Map<string, ProjectKickoff>(
  data.kickoffs.map((k) => [k.id, k as unknown as ProjectKickoff]),
)

// In-memory store for pending projects
const pendingProjectsStore = [...data.pendingProjects]

export const projectKickoffHandlers = [
  // List pending projects (available for kickoff)
  http.get('/api/projects/pending', () => {
    return HttpResponse.json(pendingProjectsStore)
  }),

  // Create a new pending project (quick registration)
  http.post('/api/projects/pending', async ({ request }) => {
    const body = (await request.json()) as { name: string; slug: string; description: string }
    const newProject = {
      id: `proj-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name,
      slug: body.slug,
      description: body.description,
      status: 'pending' as const,
    }
    pendingProjectsStore.push(newProject)
    return HttpResponse.json(newProject, { status: 201 })
  }),

  // List all active kickoffs
  http.get('/api/project-kickoffs', () => {
    const kickoffs = Array.from(kickoffStore.values())
    return HttpResponse.json(kickoffs)
  }),

  // Get a specific kickoff by project ID
  http.get('/api/project-kickoffs/:projectId', ({ params }) => {
    const found = Array.from(kickoffStore.values()).find(
      (k) => k.projectId === params.projectId,
    )
    if (!found) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(found)
  }),

  // Start kickoff — PO submits initial description
  http.post('/api/project-kickoffs', async ({ request }) => {
    const body = (await request.json()) as { projectId: string; initialDescription: string }
    const kickoffId = `kickoff-${crypto.randomUUID().slice(0, 8)}`
    const project = pendingProjectsStore.find((p) => p.id === body.projectId)

    const newKickoff: ProjectKickoff = {
      id: kickoffId,
      projectId: body.projectId,
      projectName: project?.name ?? 'Projeto',
      currentStep: 'initial_description',
      initialDescription: body.initialDescription,
      visionDocument: null,
      architectureCheck: null,
      architectureDocument: null,
      tasks: [],
      scaffoldResults: [],
      startedBy: 'Maria Santos',
      startedAt: new Date().toISOString(),
      completedAt: null,
    }
    kickoffStore.set(kickoffId, newKickoff)
    return HttpResponse.json(newKickoff, { status: 201 })
  }),

  // Trigger vision document generation (DOM-02)
  http.post('/api/project-kickoffs/:kickoffId/generate-vision', async ({ params }) => {
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff) {
      return new HttpResponse(null, { status: 404 })
    }

    // Simulate agent DOM-02 generating the vision document
    const visionDoc: VisionDocument = {
      id: `vdoc-${crypto.randomUUID().slice(0, 8)}`,
      projectId: kickoff.projectId,
      version: 1,
      status: 'draft',
      sections: [
        {
          id: `vs-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Visão Geral',
          content: `O projeto "${kickoff.projectName}" visa ${kickoff.initialDescription}\n\nEsta solução será desenvolvida pela equipe da ACME Corp, utilizando as melhores práticas de desenvolvimento e os blueprints arquiteturais da plataforma deep-ion.`,
          order: 1,
        },
        {
          id: `vs-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Objetivos de Negócio',
          content: '1. **Automatizar processos** — Reduzir atividades manuais em pelo menos 60%\n2. **Melhorar qualidade** — Implementar controles de qualidade automatizados\n3. **Escalabilidade** — Suportar crescimento de 10x no volume de operações\n4. **Compliance** — Atender requisitos regulatórios vigentes\n5. **Time-to-market** — Entregar MVP em até 3 meses',
          order: 2,
        },
        {
          id: `vs-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Escopo Funcional',
          content: '### Funcionalidades Core\n- Módulo principal de processamento\n- Dashboard de monitoramento em tempo real\n- Gestão de configurações e regras de negócio\n- API de integração com sistemas legados\n\n### Funcionalidades de Suporte\n- Sistema de notificações e alertas\n- Relatórios gerenciais e operacionais\n- Auditoria e log de operações\n- Gestão de permissões e acessos',
          order: 3,
        },
        {
          id: `vs-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Stakeholders',
          content: '| Stakeholder | Papel | Interesse |\n|---|---|---|\n| Diretoria | Sponsor | ROI e conformidade |\n| Gerência Operacional | Usuário-chave | Eficiência operacional |\n| Equipe Técnica | Desenvolvimento | Qualidade e manutenibilidade |\n| Compliance | Regulatório | Conformidade LGPD e regulatória |',
          order: 4,
        },
        {
          id: `vs-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Restrições e Premissas',
          content: '**Restrições:**\n- Conformidade com LGPD\n- Dados sensíveis devem permanecer no Brasil\n- SLA de 99.5% de disponibilidade\n\n**Premissas:**\n- Infraestrutura cloud disponível\n- Equipe técnica alocada\n- Acesso a APIs de integração garantido',
          order: 5,
        },
      ],
      generatedBy: 'DOM-02',
      reviewedBy: null,
      reviewerRole: null,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    kickoff.visionDocument = visionDoc
    kickoff.currentStep = 'vision_review'
    kickoff.tasks.push({
      id: `task-${crypto.randomUUID().slice(0, 8)}`,
      projectId: kickoff.projectId,
      type: 'review_vision',
      title: 'Revisar documento de visão',
      description: `Analisar e refinar o documento de visão gerado pelo agente DOM-02 para ${kickoff.projectName}.`,
      assignedTo: 'Ana Costa',
      assignedRole: 'business-analyst',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      completedAt: null,
    })

    return HttpResponse.json(kickoff)
  }),

  // Review vision document (approve/reject)
  http.post('/api/project-kickoffs/:kickoffId/review-vision', async ({ params, request }) => {
    const body = (await request.json()) as { action: 'approve' | 'reject'; comment?: string }
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff || !kickoff.visionDocument) {
      return new HttpResponse(null, { status: 404 })
    }

    if (body.action === 'approve') {
      kickoff.visionDocument.status = 'approved'
      kickoff.visionDocument.reviewedBy = 'Ana Costa'
      kickoff.visionDocument.reviewerRole = 'business-analyst'
      kickoff.currentStep = 'vision_approved'

      // Mark review task as completed
      const reviewTask = kickoff.tasks.find((t) => t.type === 'review_vision')
      if (reviewTask) {
        reviewTask.status = 'completed'
        reviewTask.completedAt = new Date().toISOString()
      }
    } else {
      kickoff.visionDocument.status = 'rejected'
      if (body.comment) {
        kickoff.visionDocument.comments.push({
          id: `rc-${crypto.randomUUID().slice(0, 8)}`,
          sectionId: null,
          author: 'Ana Costa',
          authorRole: 'business-analyst',
          content: body.comment,
          resolved: false,
          createdAt: new Date().toISOString(),
        })
      }
    }

    kickoff.visionDocument.updatedAt = new Date().toISOString()
    return HttpResponse.json(kickoff)
  }),

  // Update a section of the vision document (BA refining)
  http.patch('/api/project-kickoffs/:kickoffId/vision-sections/:sectionId', async ({ params, request }) => {
    const body = (await request.json()) as { content: string }
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff || !kickoff.visionDocument) {
      return new HttpResponse(null, { status: 404 })
    }

    const section = kickoff.visionDocument.sections.find((s) => s.id === params.sectionId)
    if (!section) {
      return new HttpResponse(null, { status: 404 })
    }

    section.content = body.content
    kickoff.visionDocument.updatedAt = new Date().toISOString()
    return HttpResponse.json(kickoff)
  }),

  // Check architecture (modules & blueprints configured?)
  http.post('/api/project-kickoffs/:kickoffId/check-architecture', async ({ params }) => {
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff) {
      return new HttpResponse(null, { status: 404 })
    }

    // Simulate: kickoff-002 has architecture configured, others don't
    const hasArchitecture = kickoff.id === 'kickoff-002'
    const checkResult = {
      hasModules: hasArchitecture,
      hasBlueprints: hasArchitecture,
      missingItems: hasArchitecture
        ? []
        : ['Módulos do projeto não configurados', 'Blueprints arquiteturais não atribuídos'],
      ready: hasArchitecture,
    }

    kickoff.architectureCheck = checkResult
    kickoff.currentStep = hasArchitecture ? 'architecture_generation' : 'architecture_task'

    if (!hasArchitecture) {
      kickoff.tasks.push({
        id: `task-${crypto.randomUUID().slice(0, 8)}`,
        projectId: kickoff.projectId,
        type: 'configure_modules',
        title: 'Configurar módulos e blueprints',
        description: `O projeto ${kickoff.projectName} não possui módulos e blueprints configurados. O arquiteto deve configurá-los antes de prosseguir.`,
        assignedTo: 'João Oliveira',
        assignedRole: 'architect',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
      })
    }

    return HttpResponse.json(kickoff)
  }),

  // Complete architecture task (architect configured modules)
  http.post('/api/project-kickoffs/:kickoffId/complete-architecture-task', async ({ params }) => {
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff) {
      return new HttpResponse(null, { status: 404 })
    }

    // Update the check result
    kickoff.architectureCheck = {
      hasModules: true,
      hasBlueprints: true,
      missingItems: [],
      ready: true,
    }
    kickoff.currentStep = 'architecture_generation'

    // Mark task as completed
    const configTask = kickoff.tasks.find((t) => t.type === 'configure_modules')
    if (configTask) {
      configTask.status = 'completed'
      configTask.completedAt = new Date().toISOString()
    }

    return HttpResponse.json(kickoff)
  }),

  // Trigger architecture document generation (DOM-03)
  http.post('/api/project-kickoffs/:kickoffId/generate-architecture', async ({ params }) => {
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff) {
      return new HttpResponse(null, { status: 404 })
    }

    const archDoc: ArchitectureDocument = {
      id: `adoc-${crypto.randomUUID().slice(0, 8)}`,
      projectId: kickoff.projectId,
      version: 1,
      status: 'draft',
      sections: [
        {
          id: `as-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Visão Arquitetural',
          content: `Arquitetura do projeto "${kickoff.projectName}" baseada nos blueprints configurados.\n\nA solução adota uma arquitetura modular, separando responsabilidades em camadas bem definidas para facilitar manutenção, testes e evolução independente dos módulos.`,
          order: 1,
        },
        {
          id: `as-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Diagrama de Módulos',
          content: '```\n┌─────────────────┐     ┌──────────────────┐\n│   Frontend Web  │────▶│  Backend API     │\n│   (React SPA)   │     │  (Spring Boot)   │\n└────────┬────────┘     └────────┬─────────┘\n         │                       │\n         └───────────┬───────────┘\n                     │\n              ┌──────┴──────┐\n              │  PostgreSQL │\n              └─────────────┘\n```',
          order: 2,
        },
        {
          id: `as-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Decisões Arquiteturais',
          content: '| ADR | Decisão | Justificativa |\n|-----|---------|---------------|\n| ADR-001 | Separação frontend/backend | Equipes independentes, deploy separado |\n| ADR-002 | API RESTful com OpenAPI | Contrato-first, geração automatizada |\n| ADR-003 | PostgreSQL | ACID compliance, JSON nativo |\n| ADR-004 | Docker + K8s | Portabilidade e escalabilidade |',
          order: 3,
        },
        {
          id: `as-${crypto.randomUUID().slice(0, 6)}`,
          title: 'Padrões e Convenções',
          content: '### Nomenclatura\n- Packages: `com.acme.{module}.{layer}`\n- REST endpoints: `/api/v1/{resource}`\n- Eventos: `{module}.{entity}.{action}`\n\n### Camadas\n1. **Presentation** — Controllers, DTOs\n2. **Application** — Use cases, Services\n3. **Domain** — Entities, Value Objects, Repositories\n4. **Infrastructure** — Persistence, External APIs',
          order: 4,
        },
      ],
      generatedBy: 'DOM-03',
      reviewedBy: null,
      reviewerRole: null,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    kickoff.architectureDocument = archDoc
    kickoff.currentStep = 'architecture_review'
    kickoff.tasks.push({
      id: `task-${crypto.randomUUID().slice(0, 8)}`,
      projectId: kickoff.projectId,
      type: 'review_architecture',
      title: 'Revisar documento de arquitetura',
      description: `Analisar e refinar o documento de arquitetura gerado pelo agente DOM-03 para ${kickoff.projectName}.`,
      assignedTo: 'João Oliveira',
      assignedRole: 'architect',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      completedAt: null,
    })

    return HttpResponse.json(kickoff)
  }),

  // Review architecture document
  http.post('/api/project-kickoffs/:kickoffId/review-architecture', async ({ params, request }) => {
    const body = (await request.json()) as { action: 'approve' | 'reject'; comment?: string }
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff || !kickoff.architectureDocument) {
      return new HttpResponse(null, { status: 404 })
    }

    if (body.action === 'approve') {
      kickoff.architectureDocument.status = 'approved'
      kickoff.architectureDocument.reviewedBy = 'João Oliveira'
      kickoff.architectureDocument.reviewerRole = 'architect'
      kickoff.currentStep = 'architecture_approved'

      const reviewTask = kickoff.tasks.find((t) => t.type === 'review_architecture')
      if (reviewTask) {
        reviewTask.status = 'completed'
        reviewTask.completedAt = new Date().toISOString()
      }
    } else {
      kickoff.architectureDocument.status = 'rejected'
      if (body.comment) {
        kickoff.architectureDocument.comments.push({
          id: `rc-${crypto.randomUUID().slice(0, 8)}`,
          sectionId: null,
          author: 'João Oliveira',
          authorRole: 'architect',
          content: body.comment,
          resolved: false,
          createdAt: new Date().toISOString(),
        })
      }
    }

    kickoff.architectureDocument.updatedAt = new Date().toISOString()
    return HttpResponse.json(kickoff)
  }),

  // Update architecture section
  http.patch('/api/project-kickoffs/:kickoffId/architecture-sections/:sectionId', async ({ params, request }) => {
    const body = (await request.json()) as { content: string }
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff || !kickoff.architectureDocument) {
      return new HttpResponse(null, { status: 404 })
    }

    const section = kickoff.architectureDocument.sections.find((s) => s.id === params.sectionId)
    if (!section) {
      return new HttpResponse(null, { status: 404 })
    }

    section.content = body.content
    kickoff.architectureDocument.updatedAt = new Date().toISOString()
    return HttpResponse.json(kickoff)
  }),

  // Trigger scaffold generation (DOM-03)
  http.post('/api/project-kickoffs/:kickoffId/generate-scaffold', async ({ params }) => {
    const kickoff = Array.from(kickoffStore.values()).find((k) => k.id === params.kickoffId)
    if (!kickoff) {
      return new HttpResponse(null, { status: 404 })
    }

    const scaffoldResults: ScaffoldResult[] = [
      {
        moduleId: 'mod-gen-001',
        moduleName: 'Frontend Web',
        blueprintId: 'frontend-react-spa',
        filesGenerated: 47,
        status: 'success',
        log: [
          '✓ Estrutura de diretórios criada',
          '✓ package.json configurado',
          '✓ TypeScript e Tailwind CSS configurados',
          '✓ Componentes base gerados (AppShell, Layout)',
          '✓ Rotas iniciais configuradas',
          '✓ Configuração de testes (Vitest) gerada',
          '✓ MSW mock setup gerado',
          '✓ i18n configurado (pt-BR, en)',
        ],
      },
      {
        moduleId: 'mod-gen-002',
        moduleName: 'Backend API',
        blueprintId: 'modulith-api-first',
        filesGenerated: 63,
        status: 'success',
        log: [
          '✓ Estrutura Maven/Gradle criada',
          '✓ Spring Boot 3 configurado',
          '✓ Arquitetura hexagonal scaffolded',
          '✓ OpenAPI 3.1 contract gerado',
          '✓ Docker e docker-compose configurados',
          '✓ Flyway migrations iniciais',
          '✓ Testes unitários base gerados',
          '✓ CI/CD pipeline (GitHub Actions) gerado',
        ],
      },
    ]

    kickoff.scaffoldResults = scaffoldResults
    kickoff.currentStep = 'completed'
    kickoff.completedAt = new Date().toISOString()

    return HttpResponse.json(kickoff)
  }),
]
