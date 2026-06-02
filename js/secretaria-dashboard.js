(function () {
  const COURSE_META = {
    'Tecnico em Informatica': { short: 'Informatica', color: '#00b4d8' },
    'Tecnico em Enfermagem': { short: 'Enfermagem', color: '#ff4d6d' },
    'Tecnico em Administracao': { short: 'Administracao', color: '#ffb703' }
  };

  const SOURCE_LABELS = {
    hybrid: 'Form + mock',
    real: 'Somente form',
    mock: 'Mock'
  };

  const STORAGE_KEY = 'know_leads';
  let currentSource = 'hybrid';
  let currentRows = [];

  const mockLeads = [
    ['Ana Martins', 17, 'ana.martins@email.com', 'Tecnico em Informatica', 'Camiseta Exclusiva Colegio KNOW', 'Triagem', 'Evento presencial', -1],
    ['Bruno Araujo', 18, 'bruno.araujo@email.com', 'Tecnico em Enfermagem', 'Nenhum', 'Contato feito', 'Quiz vocacional', -1],
    ['Carla Souza', 16, 'carla.souza@email.com', 'Tecnico em Administracao', 'Desconto de 10% na Primeira Mensalidade', 'Matricula iniciada', 'Raspadinha', -2],
    ['Diego Lima', 19, 'diego.lima@email.com', 'Tecnico em Informatica', 'Ingresso VIP para a Feira Tech KNOW', 'Contato feito', 'Feira tech', -2],
    ['Elisa Rocha', 17, 'elisa.rocha@email.com', 'Tecnico em Enfermagem', 'Caneta e Bloco de Notas Ecologico', 'Triagem', 'Formulario site', -3],
    ['Felipe Gomes', 20, 'felipe.gomes@email.com', 'Tecnico em Administracao', 'Nenhum', 'Documentos', 'Evento presencial', -3],
    ['Gabriela Nunes', 16, 'gabriela.nunes@email.com', 'Tecnico em Informatica', 'Nenhum', 'Matricula iniciada', 'Quiz vocacional', -4],
    ['Henrique Dias', 18, 'henrique.dias@email.com', 'Tecnico em Enfermagem', 'Isencao da Taxa de Matricula', 'Contato feito', 'Raspadinha', -4],
    ['Isabela Prado', 17, 'isabela.prado@email.com', 'Tecnico em Administracao', 'Nenhum', 'Triagem', 'Formulario site', -5],
    ['Joao Ribeiro', 19, 'joao.ribeiro@email.com', 'Tecnico em Informatica', 'Camiseta Exclusiva Colegio KNOW', 'Documentos', 'Feira tech', -5],
    ['Larissa Melo', 18, 'larissa.melo@email.com', 'Tecnico em Enfermagem', 'Nenhum', 'Matricula iniciada', 'Evento presencial', -6],
    ['Mateus Costa', 17, 'mateus.costa@email.com', 'Tecnico em Administracao', 'Caneta e Bloco de Notas Ecologico', 'Contato feito', 'Quiz vocacional', -6],
    ['Natalia Barros', 16, 'natalia.barros@email.com', 'Tecnico em Informatica', 'Nenhum', 'Triagem', 'Formulario site', -7],
    ['Pedro Henrique', 18, 'pedro.henrique@email.com', 'Tecnico em Enfermagem', 'Desconto de 10% na Primeira Mensalidade', 'Documentos', 'Raspadinha', -7],
    ['Rafaela Castro', 19, 'rafaela.castro@email.com', 'Tecnico em Administracao', 'Nenhum', 'Matricula iniciada', 'Evento presencial', -1],
    ['Vinicius Alves', 17, 'vinicius.alves@email.com', 'Tecnico em Informatica', 'Isencao da Taxa de Matricula', 'Contato feito', 'Feira tech', -2]
  ].map((item, index) => ({
    id: `mock_${index}`,
    name: item[0],
    age: item[1],
    email: item[2],
    course: item[3],
    prize: item[4],
    status: item[5],
    source: item[6],
    date: dateByOffset(item[7]),
    isMock: true
  }));

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function dateByOffset(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString('pt-BR');
  }

  function normalizeCourse(course) {
    const normalized = String(course || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/T.?cnico/gi, 'Tecnico')
      .replace(/Inform.?tica/gi, 'Informatica')
      .replace(/Administra..o/gi, 'Administracao')
      .replace('Técnico', 'Tecnico')
      .replace('Informática', 'Informatica')
      .replace('Administração', 'Administracao')
      .trim();

    if (normalized.includes('Enferm')) return 'Tecnico em Enfermagem';
    if (normalized.includes('Admin')) return 'Tecnico em Administracao';
    if (normalized.includes('Info')) return 'Tecnico em Informatica';
    return normalized;
  }

  function normalizeLead(lead, index) {
    const course = normalizeCourse(lead.course);
    return {
      id: lead.id || `real_${index}`,
      name: lead.name || 'Lead sem nome',
      age: Number(lead.age) || 0,
      email: lead.email || '-',
      course: COURSE_META[course] ? course : 'Tecnico em Informatica',
      prize: lead.prize || 'Nenhum',
      date: lead.date || new Date().toLocaleDateString('pt-BR'),
      status: lead.status || inferStatus(index, lead.prize),
      source: lead.source || 'Formulario site',
      isMock: false
    };
  }

  function inferStatus(index, prize) {
    if (prize && prize !== 'Nenhum') return 'Contato feito';
    return ['Triagem', 'Contato feito', 'Documentos', 'Matricula iniciada'][index % 4];
  }

  function loadRealLeads() {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeLead) : [];
    } catch (error) {
      return [];
    }
  }

  function resolveRows() {
    const real = loadRealLeads();
    if (currentSource === 'real') return real;
    if (currentSource === 'mock') return mockLeads;
    return real.length >= 8 ? real : [...real, ...mockLeads];
  }

  function groupBy(rows, field) {
    return rows.reduce((acc, row) => {
      const key = row[field] || '-';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function parsePtDate(value) {
    const parts = String(value || '').split('/');
    if (parts.length !== 3) return new Date();
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }

  function percent(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function updateMetrics(rows) {
    const realCount = loadRealLeads().length;
    const total = rows.length;
    const courseCounts = groupBy(rows, 'course');
    const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];
    const avgAge = total ? Math.round(rows.reduce((sum, row) => sum + row.age, 0) / total) : 0;
    const prizeRate = percent(rows.filter(row => row.prize && row.prize !== 'Nenhum').length, total);

    setText('metric-total', total);
    setText('metric-total-note', `${realCount} vindos do formulario`);
    setText('metric-top-course', topCourse ? COURSE_META[topCourse[0]].short : '-');
    setText('metric-top-course-note', topCourse ? `${topCourse[1]} interessados` : 'Sem dados suficientes');
    setText('metric-age', avgAge ? `${avgAge} anos` : '-');
    setText('metric-prize-rate', `${prizeRate}%`);
    setText('course-total-label', `${total} registros`);
    setText('rail-source-label', SOURCE_LABELS[currentSource]);

    const alert = document.getElementById('data-alert');
    if (alert) alert.classList.toggle('is-hidden', currentSource === 'real' || realCount >= 8);
  }

  function renderCourseBars(rows) {
    const counts = groupBy(rows, 'course');
    const max = Math.max(...Object.values(counts), 1);
    const html = Object.entries(COURSE_META).map(([course, meta]) => {
      const count = counts[course] || 0;
      return `
        <div class="course-row">
          <span class="course-name">${meta.short}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${percent(count, max)}%; --bar-color:${meta.color}"></div>
          </div>
          <strong class="course-count">${count}</strong>
        </div>
      `;
    }).join('');
    setHtml('course-bars', html);
  }

  function renderDonut(rows) {
    const total = rows.length || 1;
    let cursor = 0;
    const counts = groupBy(rows, 'course');
    const segments = Object.entries(COURSE_META).map(([course, meta]) => {
      const amount = counts[course] || 0;
      const start = cursor;
      const end = cursor + (amount / total) * 360;
      cursor = end;
      return `${meta.color} ${start}deg ${end}deg`;
    });

    const donut = document.getElementById('course-donut');
    if (donut) {
      donut.style.background = `conic-gradient(${segments.join(', ')})`;
      donut.setAttribute('data-total', String(rows.length));
    }

    setHtml('donut-legend', Object.entries(COURSE_META).map(([course, meta]) => {
      const count = counts[course] || 0;
      return `
        <div class="legend-item">
          <span style="--legend-color:${meta.color}">${meta.short}</span>
          <strong>${percent(count, rows.length)}%</strong>
        </div>
      `;
    }).join(''));
  }

  function renderPipeline(rows) {
    const order = ['Triagem', 'Contato feito', 'Documentos', 'Matricula iniciada'];
    const counts = groupBy(rows, 'status');
    const max = Math.max(...order.map(status => counts[status] || 0), 1);
    setHtml('pipeline-list', order.map((status, index) => {
      const count = counts[status] || 0;
      return `
        <div class="pipeline-step">
          <span>${index + 1}. ${status}</span>
          <strong>${count}</strong>
          <div class="pipeline-meter">
            <div class="pipeline-fill" style="width:${percent(count, max)}%"></div>
          </div>
        </div>
      `;
    }).join(''));
  }

  function renderTimeline(rows) {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: date.toLocaleDateString('pt-BR'),
        label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count: 0
      };
    });

    rows.forEach(row => {
      const key = parsePtDate(row.date).toLocaleDateString('pt-BR');
      const target = days.find(day => day.key === key);
      if (target) target.count += 1;
    });

    const max = Math.max(...days.map(day => day.count), 1);
    setHtml('timeline-chart', days.map(day => `
      <div class="timeline-row">
        <span>${day.label}</span>
        <strong>${day.count}</strong>
        <div class="timeline-meter">
          <div class="timeline-fill" style="width:${percent(day.count, max)}%"></div>
        </div>
      </div>
    `).join(''));
  }

  function renderTable(rows) {
    const query = document.getElementById('lead-search')?.value.toLowerCase().trim() || '';
    const filter = document.getElementById('lead-course-filter')?.value || 'all';
    const filtered = rows.filter(row => {
      const matchesFilter = filter === 'all' || row.course === filter;
      const haystack = `${row.name} ${row.email} ${row.course}`.toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });

    if (!filtered.length) {
      setHtml('lead-table-body', '<tr><td class="empty-row" colspan="6">Nenhum lead encontrado para os filtros atuais.</td></tr>');
      return;
    }

    setHtml('lead-table-body', filtered.map(row => {
      const meta = COURSE_META[row.course] || COURSE_META['Tecnico em Informatica'];
      return `
        <tr>
          <td><strong>${escapeHtml(row.name)}</strong><br><small>${escapeHtml(row.email)}</small></td>
          <td><span class="course-pill" style="--pill-color:${meta.color}">${meta.short}</span></td>
          <td>${row.age || '-'}</td>
          <td><span class="status-pill">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.source)}${row.isMock ? ' <small>(mock)</small>' : ''}</td>
          <td>${row.prize && row.prize !== 'Nenhum' ? escapeHtml(row.prize) : '-'}</td>
        </tr>
      `;
    }).join(''));
  }

  function render() {
    currentRows = resolveRows();
    updateMetrics(currentRows);
    renderCourseBars(currentRows);
    renderDonut(currentRows);
    renderPipeline(currentRows);
    renderTimeline(currentRows);
    renderTable(currentRows);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  document.querySelectorAll('[data-source]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-source]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      currentSource = button.dataset.source;
      render();
    });
  });

  ['lead-search', 'lead-course-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => renderTable(currentRows));
  });

  render();
})();
