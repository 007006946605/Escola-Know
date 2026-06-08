(function () {
  /*
   * Dashboard da Secretaria:
   * "Real" usa os leads salvos pelo formulario; "Mock" usa um cenario demonstrativo;
   * "Real + mock" combina os dois para manter os graficos apresentaveis quando a base real ainda esta pequena.
   */
  const LEADS_STORAGE_KEY = 'know_leads';

  const COURSE_PRESENTATION = {
    Informatica: { label: 'Informatica', color: '#00b4d8' },
    Enfermagem: { label: 'Enfermagem', color: '#ff4d6d' },
    Administracao: { label: 'Administracao', color: '#ffb703' },
    'Design Grafico': { label: 'Design Grafico', color: '#8b7cf6' },
    Psicologia: { label: 'Psicologia', color: '#55cb96' }
  };

  const LEAD_STATUS_PRESENTATION = {
    'Contato pendente': { color: '#ffcf32', priority: 1 },
    'Em contato': { color: '#00b4d8', priority: 2 },
    'Aguardando docs': { color: '#9d7cf6', priority: 3 },
    Interessado: { color: '#55cb96', priority: 4 },
    Triagem: { color: '#9aa8a2', priority: 5 },
    Matriculado: { color: '#55cb96', priority: 6 }
  };

  const LEAD_ORIGIN_COLORS = ['#55cb96', '#ffcf32', '#00b4d8', '#ff6078', '#7877e6'];

  const INLINE_SVG_ICONS = {
    filter: '<svg viewBox="0 0 24 24"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    stethoscope: '<svg viewBox="0 0 24 24"><path d="M4 6v5a4 4 0 0 0 8 0V6"/><path d="M8 15v2a5 5 0 0 0 10 0v-3"/><path d="M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24"><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><path d="M3 8h18v13H3z"/><path d="M3 13h18"/></svg>',
    monitor: '<svg viewBox="0 0 24 24"><path d="M3 4h18v13H3z"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>'
  };

  const COURSE_DASHBOARD_CONFIG = [
    {
      key: 'Enfermagem',
      title: 'Enfermagem',
      color: '#ff4d6d',
      icon: 'stethoscope',
      baseInterested: 84,
      baseEnrollments: 28,
      deltaInterested: '+18%',
      deltaEnrollments: '+12%',
      deltaConversion: '+5%',
      workload: '1.600 horas',
      about: 'Formacao completa para atuar na promocao, prevencao, recuperacao e reabilitacao da saude.',
      facts: ['Modalidade: Presencial', 'Carga horaria: 1.600 horas', 'Duracao media: 4 semestres', 'Pre-requisito: Ensino Medio', 'Certificado: Emitido ao final']
    },
    {
      key: 'Administracao',
      title: 'ADM',
      color: '#55cb96',
      icon: 'briefcase',
      baseInterested: 68,
      baseEnrollments: 18,
      deltaInterested: '+10%',
      deltaEnrollments: '+5%',
      deltaConversion: '-2%',
      workload: '1.200 horas',
      about: 'Curso voltado para rotinas administrativas, financeiro, atendimento, planejamento e gestao operacional.',
      facts: ['Modalidade: Presencial', 'Carga horaria: 1.200 horas', 'Duracao media: 3 semestres', 'Pre-requisito: Ensino Medio', 'Certificado: Emitido ao final']
    },
    {
      key: 'Informatica',
      title: 'TI',
      color: '#4d8dff',
      icon: 'monitor',
      baseInterested: 66,
      baseEnrollments: 18,
      deltaInterested: '+8%',
      deltaEnrollments: '+15%',
      deltaConversion: '+1%',
      workload: '1.000 horas',
      about: 'Formacao tecnica para suporte, logica, desenvolvimento, infraestrutura e operacao de sistemas.',
      facts: ['Modalidade: Presencial', 'Carga horaria: 1.000 horas', 'Duracao media: 3 semestres', 'Pre-requisito: Ensino Medio', 'Certificado: Emitido ao final']
    }
  ];

  const DEMO_PIPELINE_STAGES = [
    { key: 'triage', name: 'Triagem', count: 58, percent: 27, color: '#13c98b', icon: 'filter', extra: 54, cards: [['Joao Pedro Lima', 'Enfermagem', 'Entrada: 02/06'], ['Lucas Gabriel Nunes', 'TI', 'Entrada: 02/06'], ['Beatriz Ferreira', 'ADM', 'Entrada: 02/06'], ['Ana Clara Souza', 'Enfermagem', 'Entrada: 01/06']] },
    { key: 'contact', name: 'Contato realizado', count: 52, percent: 24, color: '#10b981', icon: 'phone', extra: 48, cards: [['Maria Eduarda Santos', 'Enfermagem', 'Contato: 04/06'], ['Rafaela Teixeira', 'TI', 'Contato: 04/06'], ['Vinicius Carvalho', 'ADM', 'Contato: 03/06'], ['Pedro Henrique Alves', 'TI', 'Contato: 03/06']] },
    { key: 'interested', name: 'Interessado', count: 46, percent: 21, color: '#7c6df2', icon: 'check', extra: 42, cards: [['Carla Souza', 'Enfermagem', 'Interesse: 04/06'], ['Diego Lima', 'ADM', 'Interesse: 03/06'], ['Juliana Martins', 'TI', 'Interesse: 03/06']] },
    { key: 'docs', name: 'Documentos', count: 34, percent: 16, color: '#ffb703', icon: 'file', extra: 31, cards: [['Bruno Araujo', 'Enfermagem', 'Atualizado: 04/06'], ['Leticia Moreira', 'ADM', 'Atualizado: 04/06'], ['Gabriel Souza', 'TI', 'Atualizado: 03/06']] },
    { key: 'started', name: 'Matricula iniciada', count: 18, percent: 8, color: '#00b4d8', icon: 'file', extra: 15, cards: [['Amanda Oliveira', 'Enfermagem', 'Inicio: 04/06'], ['Felipe Rocha', 'ADM', 'Inicio: 03/06'], ['Gabelei Almeida', 'TI', 'Atualizado: 03/06']] },
    { key: 'done', name: 'Matricula concluida', count: 10, percent: 5, color: '#55cb96', icon: 'check', extra: 7, cards: [['Camila Santos', 'Enfermagem', 'Concluida: 04/06'], ['Matheus Ferreira', 'ADM', 'Concluida: 03/06'], ['Paulo Henrique', 'TI', 'Concluida: 03/06']] }
  ];

  const DEMO_LEADS = [
    {
      id: 'mock_joao',
      name: 'Joao Pedro Lima',
      phone: '(11) 98765-4321',
      email: 'joao.lima@email.com',
      course: 'Informatica',
      origin: 'Instagram',
      status: 'Contato pendente',
      lastContact: 'Hoje, 09:15',
      timeInStage: 1,
      dateText: 'Cadastrado em 02/06/2025 as 09:15',
      note: 'Interessado no periodo noturno. Perguntou sobre bolsas.',
      nextStep: 'Fazer primeiro contato por WhatsApp',
      isMock: true
    },
    {
      id: 'mock_maria',
      name: 'Maria Eduarda Santos',
      phone: '(11) 97654-3210',
      email: 'maria.eduarda@email.com',
      course: 'Enfermagem',
      origin: 'Indicacao',
      status: 'Em contato',
      lastContact: 'Ontem, 16:40',
      timeInStage: 2,
      dateText: 'Cadastrado em 03/06/2025 as 10:20',
      note: 'Familia pediu grade do curso e valores para periodo da noite.',
      nextStep: 'Enviar valores e confirmar disponibilidade',
      isMock: true
    },
    {
      id: 'mock_pedro',
      name: 'Pedro Henrique Alves',
      phone: '(11) 96543-2109',
      email: 'pedro.alves@email.com',
      course: 'Administracao',
      origin: 'Site',
      status: 'Aguardando docs',
      lastContact: '05/06/2025',
      timeInStage: 5,
      dateText: 'Cadastrado em 01/06/2025 as 14:05',
      note: 'Ja recebeu proposta. Falta RG e comprovante de endereco.',
      nextStep: 'Cobrar documentos pendentes',
      isMock: true
    },
    {
      id: 'mock_ana',
      name: 'Ana Clara Souza',
      phone: '(11) 95432-1098',
      email: 'ana.souza@email.com',
      course: 'Informatica',
      origin: 'Feira escolar',
      status: 'Interessado',
      lastContact: '05/06/2025',
      timeInStage: 3,
      dateText: 'Cadastrado em 31/05/2025 as 11:30',
      note: 'Quer visitar laboratorio antes de fechar a matricula.',
      nextStep: 'Agendar visita ao laboratorio',
      isMock: true
    },
    {
      id: 'mock_lucas',
      name: 'Lucas Gabriel Nunes',
      phone: '(11) 94321-0987',
      email: 'lucas.nunes@email.com',
      course: 'Design Grafico',
      origin: 'Instagram',
      status: 'Triagem',
      lastContact: '04/06/2025',
      timeInStage: 1,
      dateText: 'Cadastrado em 04/06/2025 as 08:50',
      note: 'Ainda comparando opcoes de curso tecnico.',
      nextStep: 'Confirmar curso de maior interesse',
      isMock: true
    },
    {
      id: 'mock_rafaela',
      name: 'Rafaela Teixeira',
      phone: '(11) 93210-9876',
      email: 'rafaela.teixeira@email.com',
      course: 'Enfermagem',
      origin: 'Indicacao',
      status: 'Em contato',
      lastContact: '04/06/2025',
      timeInStage: 2,
      dateText: 'Cadastrado em 03/06/2025 as 15:12',
      note: 'Mae pediu retorno no fim da tarde.',
      nextStep: 'Retornar apos 17h',
      isMock: true
    },
    {
      id: 'mock_vinicius',
      name: 'Vinicius Carvalho',
      phone: '(11) 92109-8765',
      email: 'vinicius.carvalho@email.com',
      course: 'Administracao',
      origin: 'Site',
      status: 'Aguardando docs',
      lastContact: '03/06/2025',
      timeInStage: 7,
      dateText: 'Cadastrado em 29/05/2025 as 09:45',
      note: 'Fechou interesse, mas parou no envio dos documentos.',
      nextStep: 'Enviar lembrete com lista de documentos',
      isMock: true
    },
    {
      id: 'mock_beatriz',
      name: 'Beatriz Ferreira',
      phone: '(11) 91098-7654',
      email: 'beatriz.ferreira@email.com',
      course: 'Psicologia',
      origin: 'Instagram',
      status: 'Matriculado',
      lastContact: '02/06/2025',
      timeInStage: 1,
      dateText: 'Cadastrado em 02/06/2025 as 12:10',
      note: 'Matricula concluida na ultima campanha.',
      nextStep: 'Enviar boas-vindas e orientacoes',
      isMock: true
    }
  ];

  let activeLeads = [];
  let filteredLeads = [];
  let selectedLeadId = '';
  let selectedCourseKey = 'Enfermagem';
  let activeDataSource = 'hybrid';

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function loadRealLeads() {
    const raw = storageGet(LEADS_STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeLead).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function normalizeLead(lead, index) {
    if (!lead || typeof lead !== 'object') return null;

    const name = cleanText(lead.name || lead.nome || 'Lead sem nome');
    const course = normalizeCourse(lead.course || lead.curso || '');
    const origin = normalizeOrigin(lead.source || lead.origin || lead.origem || 'Formulario');
    const prize = cleanText(lead.prize || lead.brinde || '');
    const status = normalizeStatus(lead.status, prize, index);

    return {
      id: lead.id || `real_${index}`,
      name,
      phone: cleanText(lead.phone || lead.telefone || '(11) 90000-0000'),
      email: cleanText(lead.email || '-'),
      course,
      origin,
      status,
      lastContact: lead.lastContact || lead.date || lead.createdAt || 'Hoje',
      timeInStage: Number(lead.timeInStage || lead.days || ((index % 6) + 1)),
      dateText: `Cadastrado em ${lead.date || new Date().toLocaleDateString('pt-BR')}`,
      note: prize && prize !== 'Nenhum'
        ? `Ganhou ${prize}. Priorizar contato enquanto o interesse esta quente.`
        : 'Lead vindo do formulario. Confirmar turno, curso e condicao de matricula.',
      nextStep: status === 'Aguardando docs' ? 'Pedir documentos pendentes' : 'Fazer primeiro contato por WhatsApp',
      isMock: false
    };
  }

  function cleanText(value) {
    return String(value || '')
      .replace(/TÃƒÂ©cnico/g, 'Tecnico')
      .replace(/InformÃƒÂ¡tica/g, 'Informatica')
      .replace(/AdministraÃƒÂ§ÃƒÂ£o/g, 'Administracao')
      .replace(/IndicaÃƒÂ§ÃƒÂ£o/g, 'Indicacao')
      .trim();
  }

  function normalizeCourse(value) {
    const text = cleanText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (text.includes('enferm')) return 'Enfermagem';
    if (text.includes('admin')) return 'Administracao';
    if (text.includes('design')) return 'Design Grafico';
    if (text.includes('psico')) return 'Psicologia';
    return 'Informatica';
  }

  function normalizeOrigin(value) {
    const text = cleanText(value).toLowerCase();
    if (text.includes('insta')) return 'Instagram';
    if (text.includes('indic')) return 'Indicacao';
    if (text.includes('site')) return 'Site';
    if (text.includes('feira')) return 'Feira escolar';
    if (text.includes('quiz')) return 'Quiz vocacional';
    if (text.includes('raspad')) return 'Raspadinha';
    return 'Formulario';
  }

  function normalizeStatus(value, prize, index) {
    const text = cleanText(value).toLowerCase();
    if (text.includes('document')) return 'Aguardando docs';
    if (text.includes('matric')) return 'Matriculado';
    if (text.includes('contato feito') || text.includes('em contato')) return 'Em contato';
    if (text.includes('interess')) return 'Interessado';
    if (text.includes('triagem')) return 'Triagem';
    if (prize && prize !== 'Nenhum') return 'Contato pendente';
    return ['Contato pendente', 'Em contato', 'Triagem', 'Aguardando docs'][index % 4];
  }

  function resolveVisibleLeads() {
    const real = loadRealLeads();
    if (activeDataSource === 'real') return real;
    if (activeDataSource === 'mock') return DEMO_LEADS;
    return [...real, ...DEMO_LEADS];
  }

  function switchView(view) {
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === view);
    });

    document.querySelectorAll('[data-view-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.viewPanel === view);
    });
  }

  function render() {
    activeLeads = resolveVisibleLeads();
    if (!activeLeads.some((row) => row.id === selectedLeadId)) selectedLeadId = activeLeads[0]?.id || '';

    renderOverview();
    renderCoursesView();
    renderPipelineView();
    renderLeadKpis();
    renderLeadTable();
    renderDetail(activeLeads.find((row) => row.id === selectedLeadId) || activeLeads[0]);
  }

  function renderOverview() {
    const total = activeLeads.length;
    const contactPending = countByStatus('Contato pendente');
    const docs = countByStatus('Aguardando docs');
    const stalled = activeLeads.filter((row) => row.timeInStage >= 7 && row.status !== 'Matriculado').length;
    const matriculated = countByStatus('Matriculado');
    const conversion = total ? Math.round((matriculated / total) * 100) : 0;

    setText('attention-contact', contactPending);
    setText('attention-docs', docs);
    setText('attention-stalled', stalled);
    setText('attention-tasks', Math.max(3, contactPending + docs));
    setText('conversion-rate', `${conversion}%`);

    renderFunnel();
    renderWorkLeads();
    renderCourseLeader();
    renderWeekBars();
    renderOrigins();
  }

  function renderFunnel() {
    const steps = [
      { name: 'Triagem', icon: 'filter', count: activeLeads.filter((row) => row.status === 'Triagem').length, delta: '+23%' },
      { name: 'Contato', icon: 'phone', count: activeLeads.filter((row) => ['Contato pendente', 'Em contato'].includes(row.status)).length, delta: '+12%' },
      { name: 'Documentos', icon: 'file', count: activeLeads.filter((row) => row.status === 'Aguardando docs').length, delta: '-5%' },
      { name: 'Matricula', icon: 'check', count: activeLeads.filter((row) => ['Interessado', 'Matriculado'].includes(row.status)).length, delta: '+33%' }
    ];
    const total = Math.max(steps.reduce((sum, step) => sum + step.count, 0), 1);

    setHtml('funnel-steps', steps.map((step) => `
      <div class="funnel-step">
        <span class="funnel-step-icon" aria-hidden="true">${INLINE_SVG_ICONS[step.icon]}</span>
        <span>${escapeHtml(step.name)}</span>
        <strong>${step.count}</strong>
        <small>${step.delta} vs semana passada</small>
      </div>
    `).join(''));

    setHtml('funnel-bar', steps.map((step) => `
      <span style="width:${Math.max(8, Math.round((step.count / total) * 100))}%"></span>
    `).join(''));
  }

  function renderWorkLeads() {
    const actionable = [...activeLeads]
      .filter((row) => row.status !== 'Matriculado')
      .sort((a, b) => {
        const priorityA = LEAD_STATUS_PRESENTATION[a.status]?.priority || 9;
        const priorityB = LEAD_STATUS_PRESENTATION[b.status]?.priority || 9;
        return priorityA - priorityB || b.timeInStage - a.timeInStage;
      })
      .slice(0, 5);

    setHtml('work-leads', actionable.map((row) => `
      <div class="work-row">
        <div class="lead-cell">
          <span class="lead-avatar">${initials(row.name)}</span>
          <div>
            <strong>${escapeHtml(row.name)}</strong>
            <small>${escapeHtml(row.email)}</small>
          </div>
        </div>
        ${statusPill(row.status)}
        <span>${row.timeInStage} ${row.timeInStage === 1 ? 'dia' : 'dias'}</span>
        <button class="inline-link" type="button" data-open-lead="${escapeHtml(row.id)}">Ver lead -></button>
      </div>
    `).join(''));
  }

  function renderCourseLeader() {
    const counts = groupCounts(activeLeads, 'course');
    const leader = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const total = activeLeads.length || 1;

    setText('leader-course', leader ? leader[0] : '-');
    setText('leader-count', leader ? `${leader[1]} interessados` : '0 interessados');
    setText('leader-percent', leader ? `${Math.round((leader[1] / total) * 100)}% do total` : '0% do total');
  }

  function renderWeekBars() {
    const values = [3, 5, 6, 4, 2, 1, 1];
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const max = Math.max(...values, 1);
    const weekTotal = activeLeads.length;

    setText('week-total', weekTotal);
    setText('lead-new-week', weekTotal);
    setHtml('week-bars', values.map((value, index) => `
      <span class="week-bar">
        <i style="height:${Math.max(12, Math.round((value / max) * 62))}px"></i>
        ${labels[index]}
      </span>
    `).join(''));
  }

  function renderOrigins() {
    const counts = groupCounts(activeLeads, 'origin');
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = activeLeads.length || 1;
    let cursor = 0;

    const segments = entries.map(([origin, count], index) => {
      const start = cursor;
      const end = cursor + (count / total) * 360;
      cursor = end;
      return `${LEAD_ORIGIN_COLORS[index]} ${start}deg ${end}deg`;
    });

    const donut = document.getElementById('origin-donut');
    if (donut && segments.length) donut.style.background = `conic-gradient(${segments.join(', ')})`;

    setHtml('origin-legend', entries.map(([origin, count], index) => `
      <div class="legend-item">
        <span style="--legend-color:${LEAD_ORIGIN_COLORS[index]}">${escapeHtml(origin)}</span>
        <strong>${Math.round((count / total) * 100)}%</strong>
      </div>
    `).join(''));
  }

  function getCourseStats() {
    const realRows = activeLeads.filter((row) => !row.isMock);

    return COURSE_DASHBOARD_CONFIG.map((course) => {
      const realInterested = realRows.filter((row) => row.course === course.key).length;
      const realEnrollments = realRows.filter((row) => row.course === course.key && row.status === 'Matriculado').length;
      const interested = activeDataSource === 'real'
        ? realInterested
        : course.baseInterested + (activeDataSource === 'hybrid' ? realInterested : 0);
      const enrollments = activeDataSource === 'real'
        ? realEnrollments
        : course.baseEnrollments + (activeDataSource === 'hybrid' ? realEnrollments : 0);
      const conversion = interested ? Math.round((enrollments / interested) * 100) : 0;

      return {
        ...course,
        interested,
        enrollments,
        conversion
      };
    });
  }

  function renderCoursesView() {
    const courseStats = getCourseStats();
    const totalInterested = courseStats.reduce((sum, course) => sum + course.interested, 0);
    const totalEnrollments = courseStats.reduce((sum, course) => sum + course.enrollments, 0);
    const averageConversion = totalInterested ? Math.round((totalEnrollments / totalInterested) * 100) : 0;

    setText('course-total', COURSE_DASHBOARD_CONFIG.length);
    setText('course-interested', totalInterested);
    setText('course-enrollments', totalEnrollments);
    setText('course-conversion', `${averageConversion}%`);

    renderCourseRows(courseStats);
    renderCourseCharts(courseStats, totalInterested);
    renderCourseDetail(courseStats.find((course) => course.key === selectedCourseKey) || courseStats[0]);
  }

  function renderCourseRows(courseStats) {
    const query = (document.getElementById('course-search')?.value || '').toLowerCase().trim();
    const filtered = courseStats.filter((course) => {
      const haystack = `${course.key} ${course.title}`.toLowerCase();
      return !query || haystack.includes(query);
    });

    if (!filtered.length) {
      setHtml('course-rows', '<div class="empty-row">Nenhum curso encontrado.</div>');
      setText('course-table-count', 'Mostrando 0 cursos');
      return;
    }

    setHtml('course-rows', filtered.map((course) => `
      <div class="course-row ${course.key === selectedCourseKey ? 'active' : ''}" data-course-key="${escapeHtml(course.key)}" style="--course-color:${course.color}">
        <div class="course-main-cell">
          <span class="course-icon" aria-hidden="true">${INLINE_SVG_ICONS[course.icon]}</span>
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <span class="status-pill" style="--pill-color:${course.color}">Presencial</span>
            <small>Carga horaria: ${escapeHtml(course.workload)}</small>
          </div>
        </div>
        <div class="course-metric">
          <strong>${course.interested}</strong>
          <small>${course.deltaInterested} vs mes passado</small>
        </div>
        <div class="course-metric">
          <strong>${course.enrollments}</strong>
          <small>${course.deltaEnrollments} vs mes passado</small>
        </div>
        <div class="course-metric">
          <strong>${course.conversion}%</strong>
          <div class="course-rate-bar"><span style="width:${Math.min(100, course.conversion * 2.4)}%"></span></div>
          <small>${course.deltaConversion} vs mes passado</small>
        </div>
        <div class="mini-spark" aria-hidden="true"></div>
        <button class="course-row-more" type="button" aria-label="Mais acoes">...</button>
      </div>
    `).join(''));

    setText('course-table-count', `Mostrando 1 a ${filtered.length} de ${courseStats.length} cursos`);
  }

  function renderCourseCharts(courseStats, totalInterested) {
    const maxInterested = Math.max(...courseStats.map((course) => course.interested), 1);
    const maxEnrollments = Math.max(...courseStats.map((course) => course.enrollments), 1);

    setHtml('course-compare', courseStats.map((course) => `
      <div class="compare-group">
        <span class="compare-bar"><i style="height:${Math.max(18, Math.round((course.interested / maxInterested) * 120))}px; --bar-color:#55cb96"></i>${course.interested}</span>
        <span class="compare-bar"><i style="height:${Math.max(18, Math.round((course.enrollments / maxEnrollments) * 120))}px; --bar-color:#4d8dff"></i>${course.enrollments}</span>
        <span class="compare-bar"><i style="height:${Math.max(18, course.conversion * 3)}px; --bar-color:#ff4d6d"></i>${course.conversion}%</span>
        <span class="compare-label">${escapeHtml(course.title)}</span>
      </div>
    `).join(''));

    let cursor = 0;
    const segments = courseStats.map((course) => {
      const start = cursor;
      const end = cursor + ((course.interested / Math.max(totalInterested, 1)) * 360);
      cursor = end;
      return `${course.color} ${start}deg ${end}deg`;
    });
    const donut = document.getElementById('course-donut');
    if (donut) {
      donut.style.background = `conic-gradient(${segments.join(', ')})`;
      donut.setAttribute('data-total', String(totalInterested));
    }

    setHtml('course-distribution', courseStats.map((course) => `
      <div class="legend-item">
        <span style="--legend-color:${course.color}">${escapeHtml(course.title)}</span>
        <strong>${totalInterested ? Math.round((course.interested / totalInterested) * 1000) / 10 : 0}% (${course.interested})</strong>
      </div>
    `).join(''));
  }

  function renderCourseDetail(course) {
    if (!course) return;

    selectedCourseKey = course.key;
    const detailIcon = document.getElementById('course-detail-icon');
    if (detailIcon) {
      detailIcon.innerHTML = INLINE_SVG_ICONS[course.icon];
      detailIcon.style.setProperty('--course-color', course.color);
    }

    setText('course-detail-name', course.title === 'TI' ? 'Informatica' : course.title);
    setText('course-detail-modality', 'Presencial');
    setText('course-detail-about', course.about);
    setText('course-month-interested', course.interested);
    setText('course-month-enrollments', course.enrollments);
    setText('course-month-conversion', `${course.conversion}%`);

    const modality = document.getElementById('course-detail-modality');
    if (modality) modality.style.setProperty('--pill-color', course.color);

    setHtml('course-detail-facts', course.facts.map((fact) => {
      const parts = fact.split(': ');
      return `
        <div class="course-fact">
          <span>${escapeHtml(parts[0])}</span>
          <strong>${escapeHtml(parts[1] || '')}</strong>
        </div>
      `;
    }).join(''));
  }

  function renderPipelineView() {
    const total = DEMO_PIPELINE_STAGES.reduce((sum, stage) => sum + stage.count, 0);
    const enrollments = DEMO_PIPELINE_STAGES[DEMO_PIPELINE_STAGES.length - 1].count;
    const rate = total ? Math.round((64 / 218) * 100) : 0;

    setText('pipeline-total', 218);
    setText('pipeline-rate', `${rate}%`);
    setText('pipeline-enrollments', 64);
    setText('pipeline-stalled', 23);

    setHtml('pipeline-board', DEMO_PIPELINE_STAGES.map((stage) => `
      <article class="pipeline-column" style="--stage-color:${stage.color}">
        <div class="pipeline-column-head">
          <h3>${escapeHtml(stage.name)}</h3>
          <strong>${stage.count}</strong>
          <small>${stage.percent}% do total</small>
        </div>
        ${stage.cards.map((card) => `
          <div class="pipeline-card">
            <strong>${escapeHtml(card[0])}</strong>
            <span>${escapeHtml(card[1])}</span>
            <small>${escapeHtml(card[2])}</small>
          </div>
        `).join('')}
        <div class="pipeline-extra">+ ${stage.extra} leads</div>
      </article>
    `).join(''));

    setHtml('pipeline-stalled-list', [
      ['Joao Victor Silva', 'ADM', 'Documentos', '12 dias'],
      ['Larissa Oliveira', 'Enfermagem', 'Documentos', '9 dias'],
      ['Gustavo Rocha', 'TI', 'Contato realizado', '8 dias']
    ].map((item) => `
      <div class="stalled-row">
        <strong>${escapeHtml(item[0])}</strong>
        <span class="status-pill" style="--pill-color:#ffb703">${escapeHtml(item[2])}</span>
        <em>${escapeHtml(item[3])}</em>
      </div>
    `).join(''));

    renderPipelineSummary(total);
    renderStageConversions();
  }

  function renderPipelineSummary(total) {
    setHtml('pipeline-summary', `
      <div class="funnel-shape">
        ${DEMO_PIPELINE_STAGES.map((stage, index) => `
          <span style="--stage-color:${stage.color}; width:${Math.max(22, 92 - (index * 11))}px"></span>
        `).join('')}
      </div>
      <div class="funnel-summary-list">
        ${DEMO_PIPELINE_STAGES.map((stage) => `
          <div>
            <span>${escapeHtml(stage.name)}</span>
            <strong>${stage.count} (${Math.round((stage.count / total) * 100)}%)</strong>
          </div>
        `).join('')}
      </div>
    `);
  }

  function renderStageConversions() {
    const conversions = [
      ['Triagem -> Contato', 89.7],
      ['Contato -> Interessado', 88.5],
      ['Interessado -> Documentos', 73.9],
      ['Documentos -> Matricula iniciada', 52.9],
      ['Matricula iniciada -> Concluida', 55.6]
    ];

    setHtml('stage-conversion', conversions.map((item) => `
      <div class="conversion-row">
        <span>${escapeHtml(item[0])}</span>
        <strong>${String(item[1]).replace('.', ',')}%</strong>
        <div class="conversion-meter"><span style="width:${item[1]}%"></span></div>
      </div>
    `).join(''));
  }

  function renderLeadKpis() {
    const total = activeLeads.length;
    const inContact = activeLeads.filter((row) => ['Contato pendente', 'Em contato'].includes(row.status)).length;
    const conversion = total ? Math.round((countByStatus('Matriculado') / total) * 100) : 0;

    setText('lead-total', activeLeads.length);
    setText('lead-in-contact', inContact);
    setText('lead-contact-percent', `${total ? Math.round((inContact / total) * 100) : 0}% do total`);
    setText('lead-conversion', `${conversion}%`);
  }

  function renderLeadTable() {
    const query = (document.getElementById('lead-search')?.value || '').toLowerCase().trim();
    const status = getValue('status-filter');
    const course = getValue('course-filter');
    const origin = getValue('origin-filter');

    filteredLeads = activeLeads.filter((row) => {
      const haystack = `${row.name} ${row.phone} ${row.email} ${row.course}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesStatus = status === 'all' || row.status === status;
      const matchesCourse = course === 'all' || row.course === course;
      const matchesOrigin = origin === 'all' || row.origin === origin;
      return matchesQuery && matchesStatus && matchesCourse && matchesOrigin;
    });

    if (!filteredLeads.length) {
      setHtml('lead-table-body', '<tr><td class="empty-row" colspan="6">Nenhum lead encontrado para os filtros atuais.</td></tr>');
      setText('table-count', 'Mostrando 0 leads');
      return;
    }

    setHtml('lead-table-body', filteredLeads.map((row) => `
      <tr class="${row.id === selectedLeadId ? 'active' : ''}" data-row-id="${escapeHtml(row.id)}">
        <td>
          <div class="lead-cell">
            <span class="lead-avatar">${initials(row.name)}</span>
            <div>
              <strong>${escapeHtml(row.name)}</strong>
              <small>${escapeHtml(row.phone)} - ${escapeHtml(row.email)}</small>
            </div>
          </div>
        </td>
        <td>${coursePill(row.course)}</td>
        <td>${escapeHtml(row.origin)}</td>
        <td>${statusPill(row.status)}</td>
        <td>${escapeHtml(row.lastContact)}</td>
        <td>
          <span class="row-actions">
            <button type="button" aria-label="Mais acoes">...</button>
          </span>
        </td>
      </tr>
    `).join(''));

    setText('table-count', `Mostrando 1 a ${filteredLeads.length} de ${activeLeads.length} leads`);
  }

  function renderDetail(row) {
    if (!row) return;
    const timeText = `${row.timeInStage} ${row.timeInStage === 1 ? 'dia' : 'dias'}`;

    selectedLeadId = row.id;
    setText('detail-avatar', initials(row.name));
    setText('detail-name', row.name);
    setText('detail-status', row.status);
    setText('detail-phone', row.phone);
    setText('detail-email', row.email);
    setText('detail-origin', row.origin);
    setText('detail-date', row.dateText);
    setText('detail-course', row.course);
    setText('detail-stage', row.status);
    setText('detail-time', timeText);
    setText('detail-note', row.note);
    setText('detail-next', row.nextStep);

    const statusElement = document.getElementById('detail-status');
    if (statusElement) statusElement.style.setProperty('--pill-color', LEAD_STATUS_PRESENTATION[row.status]?.color || '#55cb96');

    renderLeadTable();
  }

  function groupCounts(items, field) {
    return items.reduce((acc, item) => {
      const key = item[field] || '-';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function countByStatus(status) {
    return activeLeads.filter((row) => row.status === status).length;
  }

  function coursePill(course) {
    const meta = COURSE_PRESENTATION[course] || { label: course, color: '#55cb96' };
    return `<span class="course-pill" style="--pill-color:${meta.color}">${escapeHtml(meta.label)}</span>`;
  }

  function statusPill(status) {
    const meta = LEAD_STATUS_PRESENTATION[status] || { color: '#55cb96' };
    return `<span class="status-pill" style="--pill-color:${meta.color}">${escapeHtml(status)}</span>`;
  }

  function initials(name) {
    return String(name || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  function getValue(id) {
    return document.getElementById(id)?.value || 'all';
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setHtml(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });

  document.querySelectorAll('[data-source]').forEach((button) => {
    button.addEventListener('click', () => {
      activeDataSource = button.dataset.source || 'hybrid';
      document.querySelectorAll('[data-source]').forEach((item) => {
        item.classList.toggle('active', item.dataset.source === activeDataSource);
      });
      render();
    });
  });

  document.querySelectorAll('[data-jump-leads]').forEach((button) => {
    button.addEventListener('click', () => switchView('leads'));
  });

  document.addEventListener('click', (event) => {
    const courseTarget = event.target.closest('[data-course-key]');
    if (courseTarget) {
      selectedCourseKey = courseTarget.dataset.courseKey || selectedCourseKey;
      renderCoursesView();
      return;
    }

    const target = event.target.closest('[data-open-lead], [data-row-id]');
    if (!target) return;

    const id = target.dataset.openLead || target.dataset.rowId;
    const row = activeLeads.find((item) => item.id === id);
    if (row) {
      switchView('leads');
      renderDetail(row);
    }
  });

  ['course-search', 'course-status-filter', 'course-modality-filter'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('input', () => renderCoursesView());
    if (element) element.addEventListener('change', () => renderCoursesView());
  });

  ['lead-search', 'status-filter', 'course-filter', 'origin-filter'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('input', renderLeadTable);
    if (element) element.addEventListener('change', renderLeadTable);
  });

  document.getElementById('refresh-data')?.addEventListener('click', render);

  render();
  if (window.location.hash === '#leads') switchView('leads');
  if (window.location.hash === '#courses') switchView('courses');
  if (window.location.hash === '#pipeline') switchView('pipeline');
})();


