/* js/quiz.js - Lógica do Quiz Vocacional: Profissão do Futuro */

/* SafeStorage helper to avoid CORS/Security errors when opened via file:/// protocol */
const SafeStorage = {
  _fallback: {},
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return this._fallback[key] || null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      this._fallback[key] = String(value);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete this._fallback[key];
    }
  }
};
window.SafeStorage = SafeStorage;

// Banco de dados com exatamente 18 perguntas divididas em 3 Seções Oficiais (6 por seção)
const QUIZ_SECTIONS = [
  {
    name: "Seção 1: Perfil & Estilo de Vida",
    questions: [
      {
        text: "Em um projeto em grupo, você costuma ser a pessoa que…",
        options: [
          { text: "Resolve os desafios técnicos e desenvolve as partes difíceis.", profile: "tech" },
          { text: "Apoia quem está com dificuldade e cuida do bem-estar coletivo.", profile: "health" },
          { text: "Coordena as tarefas, define os prazos e mantém a equipe organizada.", profile: "admin" }
        ]
      },
      {
        text: "Nas suas horas de lazer, qual dessas atividades te gera maior engajamento?",
        options: [
          { text: "Desvendar o funcionamento de eletrônicos ou explorar novos softwares.", profile: "tech" },
          { text: "Aprofundar-se em matérias sobre biologia, saúde ou bem-estar humano.", profile: "health" },
          { text: "Planejar pequenas metas pessoais, organizar agendas ou planejar negócios.", profile: "admin" }
        ]
      },
      {
        text: "Diante de um problema inesperado no seu cotidiano, sua primeira reação é...",
        options: [
          { text: "Analisar logicamente as causas para estruturar um método de solução.", profile: "tech" },
          { text: "Prestar apoio emocional e acolher as pessoas afetadas pela situação.", profile: "health" },
          { text: "Tomar as rédeas da situação e liderar um plano de ação estratégico.", profile: "admin" }
        ]
      },
      {
        text: "Qual desses ambientes você considera ideal e inspirador para produzir?",
        options: [
          { text: "Um espaço moderno equipado com dispositivos tecnológicos e dados precisos.", profile: "tech" },
          { text: "Um ambiente comunitário ou de assistência, focado em empatia e acolhimento.", profile: "health" },
          { text: "Um escritório dinâmico de projetos, focado em negociações e metas.", profile: "admin" }
        ]
      },
      {
        text: "Que tipo de conteúdo você acompanha com maior frequência por puro interesse?",
        options: [
          { text: "Novidades sobre inovações de softwares, inteligência artificial e programação.", profile: "tech" },
          { text: "Artigos e documentários sobre novas terapias de saúde, ciência e biologia.", profile: "health" },
          { text: "Podcasts sobre cases de sucesso corporativo, empreendedorismo e liderança.", profile: "admin" }
        ]
      },
      {
        text: "Ao planejar uma viagem ou evento com amigos, você costuma assumir a tarefa de...",
        options: [
          { text: "Configurar os mapas digitais, conferir os dispositivos e gerenciar a conectividade.", profile: "tech" },
          { text: "Organizar o kit de suporte, conferir a alimentação e cuidar da segurança física de todos.", profile: "health" },
          { text: "Elaborar o orçamento geral, cotar preços de passagens e gerenciar o cronograma.", profile: "admin" }
        ]
      }
    ]
  },
  {
    name: "Seção 2: Métodos de Trabalho & Lógica",
    questions: [
      {
        text: "Se você pudesse desenvolver um projeto escolar do zero hoje, você escolheria...",
        options: [
          { text: "Criar um site dinâmico interativo ou automatizar tarefas por meio de código.", profile: "tech" },
          { text: "Organizar uma campanha comunitária de doação de sangue e aferição de saúde física.", profile: "health" },
          { text: "Liderar uma feira de jovens negócios simulando a captação de investidores técnicos.", profile: "admin" }
        ]
      },
      {
        text: "Em uma simulação de gestão de crises sociais futuras, sua prioridade seria...",
        options: [
          { text: "Implementar sistemas algorítmicos robustos e automações de socorro ágeis.", profile: "tech" },
          { text: "Fortalecer as redes de apoio clínico e a assistência de saúde direta às famílias.", profile: "health" },
          { text: "Controlar e alocar orçamentos urgentes visando a eficiência financeira do time.", profile: "admin" }
        ]
      },
      {
        text: "Qual dessas habilidades práticas você gostaria de aperfeiçoar em aulas práticas?",
        options: [
          { text: "Desenvolvimento de programas de computadores, banco de dados e cibersegurança.", profile: "tech" },
          { text: "Procedimentos hospitalares de reanimação, primeiros socorros e biossegurança médica.", profile: "health" },
          { text: "Técnicas de fluxo de caixa, oratória corporativa e estruturação de equipes.", profile: "admin" }
        ]
      },
      {
        text: "O tipo de problema desafiador que mais te motiva a pensar e agir é...",
        options: [
          { text: "Uma falha lógica em um sistema ou um enigma matemático de difícil resolução.", profile: "tech" },
          { text: "Uma pessoa sofrendo com dores físicas ou emocionais precisando de cuidados imediatos.", profile: "health" },
          { text: "Um fluxo ineficiente de vendas ou um time perdendo rendimento financeiro.", profile: "admin" }
        ]
      },
      {
        text: "Ao defender seu ponto de vista em um debate técnico, seus argumentos se baseiam em...",
        options: [
          { text: "Dados estruturados, probabilidades analíticas e estatísticas frias de sistemas.", profile: "tech" },
          { text: "Empatia, dignidade humana, ética social e bem-estar coletivo das partes.", profile: "health" },
          { text: "Viabilidade orçamentária, retorno sobre investimentos e estratégias de eficiência.", profile: "admin" }
        ]
      },
      {
        text: "Seu estilo para compreender e dominar um conceito novo consiste em...",
        options: [
          { text: "Desmontar o problema em frações lógicas, testando a teoria de maneira técnica.", profile: "tech" },
          { text: "Aprender executando a ação prática direta e interagindo diretamente com os elementos.", profile: "health" },
          { text: "Identificar a visão macro primeiro para traçar metas ordenadas de estudo.", profile: "admin" }
        ]
      }
    ]
  },
  {
    name: "Seção 3: Impacto de Carreira & Futuro",
    questions: [
      {
        text: "A longo prazo, seu maior objetivo profissional é ser reconhecido por...",
        options: [
          { text: "Criar sistemas inovadores que facilitem e revolucionem o trabalho das pessoas.", profile: "tech" },
          { text: "Salvar vidas diretamente, promovendo cura, saúde e cuidado humanizado integral.", profile: "health" },
          { text: "Liderar equipes de excelência técnica e expandir o faturamento de negócios de impacto.", profile: "admin" }
        ]
      },
      {
        text: "Se você ganhasse um prêmio de destaque estudantil, gostaria de recebê-lo por...",
        options: [
          { text: "Desenvolver o software ou ferramenta tecnológica mais inovadora e complexa da feira.", profile: "tech" },
          { text: "Executar a ação de acolhimento comunitário de saúde mais marcante e empática do ano.", profile: "health" },
          { text: "Demonstrar a melhor capacidade de oratória, negociação e gestão operacional de equipes.", profile: "admin" }
        ]
      },
      {
        text: "Diante da expansão das ferramentas de Inteligência Artificial no mercado, sua visão é...",
        options: [
          { text: "Quero programar as máquinas e criar os algoritmos de automação que ditarão o amanhã.", profile: "tech" },
          { text: "A empatia humana e a reabilitação clínica jamais serão copiadas ou executadas por IAs.", profile: "health" },
          { text: "A liderança corporativa e a alocação tática de recursos continuarão sendo essenciais.", profile: "admin" }
        ]
      },
      {
        text: "Se fosse voluntário em uma grande missão internacional de resgate, você atuaria...",
        options: [
          { text: "Configurando canais seguros de comunicação via satélite e bancos de dados locais.", profile: "tech" },
          { text: "Prestando assistência hospitalar e cuidados clínicos na linha de frente dos abrigos.", profile: "health" },
          { text: "Coordenando a logística de distribuição de mantimentos, orçamentos e contatos diplomáticos.", profile: "admin" }
        ]
      },
      {
        text: "Qual dessas palestras ministradas por um especialista você assistiria com maior curiosidade?",
        options: [
          { text: "Cibersegurança e o desenvolvimento de novas infraestruturas de programação web.", profile: "tech" },
          { text: "Procedimentos cirúrgicos de alta complexidade e o futuro da biossegurança clínica.", profile: "health" },
          { text: "Técnicas modernas de captação de investimentos de risco, oratória e liderança comercial.", profile: "admin" }
        ]
      },
      {
        text: "Ao finalizar um dia ideal de trabalho, a sensação que você deseja ter é...",
        options: [
          { text: "Ter decifrado problemas complexos de lógica e deixado sistemas robustos operando.", profile: "tech" },
          { text: "Ter trazido alívio real e promovido conforto clínico àqueles sob meus cuidados.", profile: "health" },
          { text: "Ter atingido metas arrojadas de negócios, otimizado recursos e fechado grandes acordos.", profile: "admin" }
        ]
      }
    ]
  }
];

class QuizManager {
  constructor() {
    this.currentSectionIdx = 0;
    this.currentQuestionInSecIdx = 0;
    this.scores = { tech: 0, health: 0, admin: 0 };
    this.selectedOption = null;
    this.container = null;
    
    // Bindings
    this.startQuiz = this.startQuiz.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.handleOptionSelect = this.handleOptionSelect.bind(this);
    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderResult = this.renderResult.bind(this);
    this.resetQuiz = this.resetQuiz.bind(this);
  }

  init() {
    this.container = document.getElementById('quiz-app');
    if (!this.container) return;
    this.renderWelcome();
  }

  // Render initial screen
  renderWelcome() {
    this.container.innerHTML = `
      <div class="quiz-welcome widget-animate">
        <div class="badge">TESTE VOCACIONAL</div>
        <h3>Descubra sua Profissão do Futuro</h3>
        <p>Responda a perguntas estruturadas em <strong>3 seções temáticas de 6 perguntas cada</strong>. Nosso sistema avalia suas decisões práticas para revelar o curso ideal no Colégio KNOW.</p>
        <div class="quiz-welcome-visual" aria-hidden="true">
          <div class="quiz-visual-orbit">
            <span></span>
            <span></span>
          </div>
          <div class="quiz-visual-grid">
            <div class="quiz-metric is-primary">
              <span>18</span>
              <strong>perguntas</strong>
            </div>
            <div class="quiz-metric">
              <span>3</span>
              <strong>trilhas</strong>
            </div>
            <div class="quiz-metric">
              <span>1</span>
              <strong>curso ideal</strong>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-start-quiz">
          <span>Iniciar Quiz</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;

    document.getElementById('btn-start-quiz').addEventListener('click', this.startQuiz);
  }

  startQuiz() {
    this.currentSectionIdx = 0;
    this.currentQuestionInSecIdx = 0;
    this.scores = { tech: 0, health: 0, admin: 0 };
    this.selectedOption = null;
    this.renderQuestion();
  }

  renderQuestion() {
    const currentSection = QUIZ_SECTIONS[this.currentSectionIdx];
    const currentQuestion = currentSection.questions[this.currentQuestionInSecIdx];
    this.selectedOption = null;
    
    // Calculate progress relative to 18 questions total
    const overallQuestionNumber = (this.currentSectionIdx * 6) + this.currentQuestionInSecIdx;
    const progressPercent = (overallQuestionNumber / 18) * 100;
    
    this.container.innerHTML = `
      <div class="quiz-card widget-animate">
        <div class="quiz-progress-wrapper">
          <div class="quiz-progress-text">
            <span>${currentSection.name} (Pergunta ${this.currentQuestionInSecIdx + 1} de 6)</span>
            <span>Progresso Geral: ${Math.round(progressPercent)}%</span>
          </div>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        
        <h4 class="quiz-question">${currentQuestion.text}</h4>
        
        <div class="quiz-options">
          ${currentQuestion.options.map((opt, idx) => {
            const letters = ['A', 'B', 'C'];
            return `
              <div class="quiz-option" data-profile="${opt.profile}" data-index="${idx}">
                <div class="option-letter">${letters[idx]}</div>
                <div class="option-text">${opt.text}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Add listeners to option cards
    const optionCards = this.container.querySelectorAll('.quiz-option');
    optionCards.forEach(card => {
      card.addEventListener('click', () => this.handleOptionSelect(card));
    });
  }

  handleOptionSelect(card) {
    // Highlight UI
    const allOptions = this.container.querySelectorAll('.quiz-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    card.classList.add('selected');
    
    this.selectedOption = card.getAttribute('data-profile');
    
    // Proceed to next question automatically with slight delay for wow-factor feedback
    setTimeout(this.nextQuestion, 500);
  }

  nextQuestion() {
    if (!this.selectedOption) return;
    
    // Accumulate scores
    this.scores[this.selectedOption]++;
    
    // Move to next question within the active section
    this.currentQuestionInSecIdx++;
    
    if (this.currentQuestionInSecIdx < 6) {
      // Still in current section
      this.renderQuestion();
    } else {
      // Completed current section, advance section index
      this.currentSectionIdx++;
      this.currentQuestionInSecIdx = 0;
      
      if (this.currentSectionIdx < 3) {
        // Show transitions overlay screen to announce next section!
        this.renderSectionTransition();
      } else {
        // Completely done with all 3 sections!
        this.renderResult();
      }
    }
  }

  renderSectionTransition() {
    const nextSectionName = QUIZ_SECTIONS[this.currentSectionIdx].name;
    
    this.container.innerHTML = `
      <div class="quiz-welcome widget-animate">
        <div class="badge" style="color: var(--brand-mint); border-color: rgba(85,203,150,0.3); background: rgba(85,203,150,0.08)">
          SEÇÃO CONCLUÍDA
        </div>
        <h3>Pronto para a Próxima Fase?</h3>
        <p>Você completou com sucesso as primeiras perguntas do teste vocacional. O sistema agora abrirá a:</p>
        <h4 style="font-family: var(--font-headings); font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem">${nextSectionName}</h4>
        
        <button class="btn btn-primary" id="btn-next-section">
          <span>Continuar Teste</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;

    document.getElementById('btn-next-section').addEventListener('click', () => {
      this.renderQuestion();
    });
  }

  renderResult() {
    // Check for ties among the top scores
    const scoreEntries = [
      { profile: 'tech', score: this.scores.tech },
      { profile: 'health', score: this.scores.health },
      { profile: 'admin', score: this.scores.admin }
    ];
    scoreEntries.sort((a, b) => b.score - a.score);
    
    const isTie = scoreEntries[0].score === scoreEntries[1].score;
    const dominantProfile = isTie ? 'tie' : scoreEntries[0].profile;

    // Profile Details matching the DOCX guidelines
    const resultsMap = {
      tech: {
        title: "Técnico em Informática",
        career: "Desenvolvedor de Software / Analista de TI",
        desc: "Você possui uma mente brilhante voltada para a lógica, resolução de problemas estruturados e inovação tecnológica. Seu perfil casa perfeitamente com o nosso curso Técnico em Informática! Prepare-se para codificar soluções incríveis e liderar a transformação digital.",
        icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-info); filter: drop-shadow(0 0 10px rgba(0,180,216,0.3))"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        bg: "var(--theme-info)"
      },
      health: {
        title: "Técnico em Enfermagem",
        career: "Profissional de Saúde / Enfermeiro Técnico",
        desc: "Seu coração pulsa por empatia, cuidado ao próximo e atenção à saúde humana. Seu perfil tem total afinidade com o curso Técnico em Enfermagem! Venha aprender procedimentos hospitalares de ponta e faça a diferença na vida das pessoas todos os dias.",
        icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-enferm); filter: drop-shadow(0 0 10px rgba(255,77,109,0.3))"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
        bg: "var(--theme-enferm)"
      },
      admin: {
        title: "Técnico em Administração",
        career: "Gestor de Negócios / Empreendedor Técnico",
        desc: "Liderança estratégica, finanças e organização de equipes correm em suas veias! Seu caminho ideal está no curso Técnico em Administração! Domine estratégias de marketing, controle fluxos financeiros e crie os alicerces de empresas de sucesso.",
        icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-admin); filter: drop-shadow(0 0 10px rgba(255,183,3,0.3))"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
        bg: "var(--theme-admin)"
      },
      tie: {
        title: "Orientação de Carreira",
        career: "Perfil Híbrido / Multi-talentos",
        desc: "Incrível! Suas respostas revelaram um equilíbrio excepcional entre áreas distintas. Você tem afinidade tanto com a lógica da Tecnologia quanto com a empatia da Saúde ou a visão estratégica da Administração. Recomendamos agendar uma conversa com um de nossos orientadores para te ajudar a escolher o caminho perfeito!",
        icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--brand-mint); filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        bg: "var(--brand-mint)"
      }
    };

    const finalResult = resultsMap[dominantProfile];

    // Persist result in localStorage
    SafeStorage.setItem('know_quiz_result', JSON.stringify({
      course: finalResult.title,
      scores: this.scores,
      timestamp: new Date().toISOString()
    }));

    this.container.innerHTML = `
      <div class="quiz-result widget-animate">
        <div class="result-badge" style="color: ${finalResult.bg}; border-color: rgba(${dominantProfile === 'tech' ? '0,180,216' : dominantProfile === 'health' ? '255,77,109' : dominantProfile === 'admin' ? '255,183,3' : '85,203,150'}, 0.25); background: rgba(${dominantProfile === 'tech' ? '0,180,216' : dominantProfile === 'health' ? '255,77,109' : dominantProfile === 'admin' ? '255,183,3' : '85,203,150'}, 0.08)">
          ${dominantProfile === 'tie' ? 'MULTIPERFIL REVELADO' : 'CURSO IDEAL RECOMENDADO'}
        </div>
        <div class="scratch-prize-icon" style="margin-bottom: 0.5rem;">${finalResult.icon}</div>
        <h3 class="result-course-title">${finalResult.title}</h3>
        <p class="result-career-text">Indicação: ${finalResult.career}</p>
        <p class="result-description">${finalResult.desc}</p>
        
        <div class="hero-actions" style="margin-top: 1.5rem;">
          <button class="btn btn-primary" id="btn-quiz-enroll">
            <span>${dominantProfile === 'tie' ? 'Agendar Conversa' : 'Iniciar Matrícula'}</span>
          </button>
          <button class="btn btn-secondary" id="btn-quiz-restart">
            <span>Refazer Teste</span>
          </button>
        </div>
      </div>
    `;

    // Bind action callbacks
    document.getElementById('btn-quiz-restart').addEventListener('click', this.resetQuiz);
    
    // Redirect logic to final enrollment CTA and set selected option
    document.getElementById('btn-quiz-enroll').addEventListener('click', () => {
      const enrollmentSection = document.getElementById('matricula');
      if (enrollmentSection) {
        enrollmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const selectField = document.getElementById('lead-course');
      if (selectField) {
        selectField.value = finalResult.title;
        selectField.dispatchEvent(new Event('change'));
      }
    });
  }

  resetQuiz() {
    this.renderWelcome();
  }
}

// Attach to window for dynamic bootstrap
window.QuizManager = QuizManager;
