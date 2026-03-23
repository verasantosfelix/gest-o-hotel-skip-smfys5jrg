migrate(
  (app) => {
    const profilesData = [
      // Operacionais
      {
        slug: 'frontdesk_operacional',
        name: 'Atendente de Front Desk / Receção',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'fnb_atendente',
        name: 'Atendente de Restaurante & Bar (inclui operações de Eventos)',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'housekeeping_atendente',
        name: 'Atendente de Housekeeping',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'lavandaria_operacional',
        name: 'Operador de Lavandaria',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'spa_operador',
        name: 'Terapeuta / Operador de SPA & Wellness',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'manutencao_operador',
        name: 'Técnico de Manutenção',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'seguranca_operador',
        name: 'Segurança Operacional',
        role_level: 'Atendente',
        category: 'Operacionais',
      },
      {
        slug: 'rececao_noite',
        name: 'Night Auditor Operacional',
        role_level: 'Atendente',
        category: 'Operacionais',
      },

      // Managers
      {
        slug: 'frontdesk_manager',
        name: 'Supervisor / Chefe de Receção',
        role_level: 'Responsavel_Equipa',
        category: 'Managers',
      },
      {
        slug: 'fnb_manager',
        name: 'Responsável / Gerente de F&B (inclui gestão de Eventos)',
        role_level: 'Gerente_Area',
        category: 'Managers',
      },
      {
        slug: 'housekeeping_manager',
        name: 'Governanta Geral / Supervisor de Housekeeping',
        role_level: 'Gerente_Area',
        category: 'Managers',
      },
      {
        slug: 'lavandaria_manager',
        name: 'Coordenador de Lavandaria',
        role_level: 'Responsavel_Equipa',
        category: 'Managers',
      },
      {
        slug: 'spa_manager',
        name: 'Supervisor / Manager de SPA & Wellness',
        role_level: 'Gerente_Area',
        category: 'Managers',
      },
      {
        slug: 'manutencao_manager',
        name: 'Supervisor de Manutenção',
        role_level: 'Responsavel_Equipa',
        category: 'Managers',
      },
      {
        slug: 'seguranca_manager',
        name: 'Supervisor de Segurança',
        role_level: 'Responsavel_Equipa',
        category: 'Managers',
      },

      // Administrativos
      {
        slug: 'administrativo_financeiro',
        name: 'Administrativo Financeiro',
        role_level: 'Administrativo',
        category: 'Administrativos',
      },
      {
        slug: 'administrativo_backoffice',
        name: 'Administrativo Geral / Backoffice',
        role_level: 'Administrativo_Geral',
        category: 'Administrativos',
      },
      {
        slug: 'marketing_crm',
        name: 'Marketing & CRM',
        role_level: 'Administrativo',
        category: 'Administrativos',
      },
      {
        slug: 'reservas_central',
        name: 'Agente de Reservas / Central de Reservas',
        role_level: 'Administrativo',
        category: 'Administrativos',
      },
      {
        slug: 'rh_administrativo',
        name: 'Recursos Humanos Administrativo',
        role_level: 'Administrativo',
        category: 'Administrativos',
      },
      {
        slug: 'ti_suporte',
        name: 'Técnico de TI / Suporte Interno',
        role_level: 'Administrativo',
        category: 'Administrativos',
      },

      // Direção
      {
        slug: 'diretor_geral',
        name: 'Diretor Geral / Gerência Geral',
        role_level: 'Gerente_Geral',
        category: 'Direção',
      },
      {
        slug: 'diretor_operations',
        name: 'Diretor de Operações',
        role_level: 'Director_Geral',
        category: 'Direção',
      },
      {
        slug: 'diretor_financeiro',
        name: 'Diretor Financeiro / CFO',
        role_level: 'Director_Geral',
        category: 'Direção',
      },
      {
        slug: 'diretor_comercial_marketing',
        name: 'Diretor Comercial & Marketing',
        role_level: 'Director_Geral',
        category: 'Direção',
      },
      {
        slug: 'diretor_rh',
        name: 'Diretor de Recursos Humanos',
        role_level: 'Director_Geral',
        category: 'Direção',
      },
      {
        slug: 'board_viewer',
        name: 'Conselho / Administrador Estratégico (apenas dashboards)',
        role_level: 'Director_Geral',
        category: 'Direção',
      },

      // Especiais
      {
        slug: 'auditoria_interna',
        name: 'Auditoria Interna',
        role_level: 'Administrativo',
        category: 'Especiais',
      },
      {
        slug: 'contabilidade_externa',
        name: 'Contabilidade Externa',
        role_level: 'Administrativo',
        category: 'Especiais',
      },
      {
        slug: 'gestor_estrategico',
        name: 'Consultor / Gestor Estratégico (somente leitura avançada)',
        role_level: 'Director_Geral',
        category: 'Especiais',
      },
      {
        slug: 'compliance_seg_avancada',
        name: 'Compliance / Segurança Avançada',
        role_level: 'Administrativo_Geral',
        category: 'Especiais',
      },
      {
        slug: 'parceiro_externo',
        name: 'Acesso de Parceiros Externos Controlados',
        role_level: 'Atendente',
        category: 'Especiais',
      },
    ]

    const collection = app.findCollectionByNameOrId('profiles')

    for (const p of profilesData) {
      try {
        const existing = app.findFirstRecordByData('profiles', 'slug', p.slug)
        if (existing) {
          existing.set('name', p.name)
          existing.set('role_level', p.role_level)
          existing.set('category', p.category)
          app.save(existing)
        }
      } catch (e) {
        const record = new Record(collection)
        record.set('slug', p.slug)
        record.set('name', p.name)
        record.set('role_level', p.role_level)
        record.set('category', p.category)
        if (
          p.role_level === 'Gerente_Geral' ||
          p.role_level === 'Director_Geral' ||
          p.role_level === 'Administrativo_Geral'
        ) {
          record.set('allowed_actions', ['*'])
        } else {
          record.set('allowed_actions', [])
        }
        app.save(record)
      }
    }
  },
  (app) => {
    // Left empty since un-seeding might orphan existing relations
  },
)
