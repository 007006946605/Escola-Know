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
    name: "Situações do dia a dia",
    questions: [
      {
        text: "Você encontra um erro estranho em algo que está usando. Você:",
        options: [
          { text: "Tenta reproduzir o erro até entender o padrão.", profile: "tech" },
          { text: "Ignora e continua usando enquanto não atrapalhar muito.", profile: "admin" },
          { text: "Procura alguém para resolver o problema por você.", profile: "health" }
        ]
      },
      {
        text: "Um amigo te chama com um problema pessoal no meio do seu dia. Você:",
        options: [
          { text: "Escuta e tenta entender o contexto completo antes de responder.", profile: "health" },
          { text: "Oferece uma solução prática rápida para ele seguir.", profile: "admin" },
          { text: "Fica curioso com os detalhes e padrões do problema.", profile: "tech" }
        ]
      },
      {
        text: "Você está em um grupo sem liderança definida. Você tende a:",
        options: [
          { text: "Esperar alguém se organizar ou seguir o fluxo.", profile: "health" },
          { text: "Assumir a organização.", profile: "admin" },
          { text: "Observar primeiro como o grupo se comporta.", profile: "tech" }
        ]
      },
      {
        text: "Quando algo dá errado num plano importante, você primeiro:",
        options: [
          { text: "Procura o ponto exato da falha.", profile: "tech" },
          { text: "Tenta estabilizar a situação rapidamente.", profile: "admin" },
          { text: "Foca no impacto que isso teve nas pessoas.", profile: "health" }
        ]
      },
      {
        text: "Em uma tarefa chata mas necessária, você tende a:",
        options: [
          { text: "Encontrar um jeito de automatizar ou otimizar.", profile: "tech" },
          { text: "Fazer rápido para se livrar logo.", profile: "admin" },
          { text: "Pedir ajuda ou dividir com alguém.", profile: "health" }
        ]
      },
      {
        text: "Quando percebe que algo poderia ser feito melhor, você:",
        options: [
          { text: "Investiga como melhorar tecnicamente.", profile: "tech" },
          { text: "Adota uma solução prática e segue em frente.", profile: "admin" },
          { text: "Considera como isso afeta as pessoas envolvidas.", profile: "health" }
        ]
      }
    ]
  },

  {
    name: "Escolhas implícitas",
    questions: [
      {
        text: "Você tem que aprender algo novo sozinho. Você prefere:",
        options: [
          { text: "Explorar até entender como funciona.", profile: "tech" },
          { text: "Seguir instruções passo a passo.", profile: "admin" },
          { text: "Ver alguém fazendo antes de tentar.", profile: "health" }
        ]
      },
      {
        text: "Em um ambiente novo, o que chama mais sua atenção?",
        options: [
          { text: "Como as coisas estão conectadas e funcionando.", profile: "tech" },
          { text: "Como as pessoas estão se organizando.", profile: "admin" },
          { text: "Como as pessoas estão se sentindo ali.", profile: "health" }
        ]
      },
      {
        text: "Você recebe liberdade total para fazer algo útil. Você escolhe:",
        options: [
          { text: "Criar algo funcional que resolva um problema.", profile: "tech" },
          { text: "Melhorar a organização de algo existente.", profile: "admin" },
          { text: "Ajudar diretamente pessoas em dificuldade.", profile: "health" }
        ]
      },
      {
        text: "Quando uma ferramenta não funciona como deveria, você:",
        options: [
          { text: "Tenta entender o comportamento interno dela.", profile: "tech" },
          { text: "Procura uma alternativa mais simples.", profile: "admin" },
          { text: "Pede ajuda ou troca por outra imediatamente.", profile: "health" }
        ]
      },
      {
        text: "Em uma reunião ou trabalho em grupo, você costuma:",
        options: [
          { text: "Analisar o funcionamento das ideias propostas.", profile: "tech" },
          { text: "Organizar decisões e próximos passos.", profile: "admin" },
          { text: "Garantir que todos consigam participar.", profile: "health" }
        ]
      },
      {
        text: "Quando recebe informação nova, você prefere:",
        options: [
          { text: "Entender a lógica por trás dela.", profile: "tech" },
          { text: "Aplicar direto na prática.", profile: "admin" },
          { text: "Ver exemplos antes de confiar.", profile: "health" }
        ]
      }
    ]
  },

  {
    name: "Reação sob pressão",
    questions: [
      {
        text: "Em uma situação caótica, você tende a:",
        options: [
          { text: "Buscar a causa raiz do problema.", profile: "tech" },
          { text: "Tomar controle da organização do ambiente.", profile: "admin" },
          { text: "Ajudar quem parece mais afetado.", profile: "health" }
        ]
      },
      {
        text: "Quando algo é muito confuso, você:",
        options: [
          { text: "Tenta decompor em partes menores.", profile: "tech" },
          { text: "Procura um método já conhecido para resolver.", profile: "admin" },
          { text: "Pede ajuda ou opinião externa.", profile: "health" }
        ]
      },
      {
        text: "Quando há pouco tempo e muita coisa para fazer, você:",
        options: [
          { text: "Prioriza entender o problema principal.", profile: "tech" },
          { text: "Organiza tudo em ordem de execução.", profile: "admin" },
          { text: "Ajuda quem estiver mais perdido primeiro.", profile: "health" }
        ]
      },
      {
        text: "Se alguém depende da sua decisão, você tende a:",
        options: [
          { text: "Analisar todas as variáveis antes de agir.", profile: "tech" },
          { text: "Decidir rápido para evitar atraso.", profile: "admin" },
          { text: "Pensar no impacto humano da escolha.", profile: "health" }
        ]
      },
      {
        text: "Quando tudo dá errado ao mesmo tempo, você:",
        options: [
          { text: "Procura o ponto inicial da falha.", profile: "tech" },
          { text: "Reorganiza o que ainda dá para salvar.", profile: "admin" },
          { text: "Tenta acalmar a situação geral.", profile: "health" }
        ]
      },
      {
        text: "Se ninguém sabe o que fazer, você:",
        options: [
          { text: "Investiga até entender o sistema.", profile: "tech" },
          { text: "Assume e cria uma estrutura básica.", profile: "admin" },
          { text: "Procura alguém mais experiente para guiar.", profile: "health" }
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
    
    // Cria o HTML para a checklist de seções dinamicamente
    let progressHtml = '';
    for (let i = 0; i < 3; i++) {
      const sec = QUIZ_SECTIONS[i];
      let statusIcon = '🔒';
      let bgColor = 'rgba(0, 0, 0, 0.2)';
      let borderColor = 'rgba(255,255,255,0.05)';
      let opacity = '0.5';
      let labelColor = 'var(--text-muted)';
      let titleColor = 'var(--text-secondary)';
      
      if (i < this.currentSectionIdx) {
        statusIcon = '✅';
        bgColor = 'rgba(85, 203, 150, 0.08)';
        borderColor = 'rgba(85, 203, 150, 0.2)';
        opacity = '1';
        labelColor = 'var(--text-muted)';
        titleColor = 'var(--text-primary)';
      } else if (i === this.currentSectionIdx) {
        statusIcon = '🕒';
        bgColor = 'rgba(85, 203, 150, 0.12)';
        borderColor = 'var(--brand-mint)';
        opacity = '1';
        labelColor = 'var(--brand-mint)';
        titleColor = 'var(--brand-mint)';
      }
      
      progressHtml += `
        <div class="quiz-metric" style="min-height: auto; padding: 0.95rem 1.25rem; background: ${bgColor}; border-color: ${borderColor}; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; opacity: ${opacity}; border-radius: 16px;">
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 0.72rem; text-transform: uppercase; color: ${labelColor}; font-weight: 700; letter-spacing: 0.05em;">Fase ${i + 1}</span>
            <strong style="font-size: 0.95rem; margin-top: 0.25rem; color: ${titleColor}; font-family: var(--font-headings); font-weight: 700;">${sec.name}</strong>
          </div>
          <span style="font-size: 1.2rem;">${statusIcon}</span>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="quiz-welcome widget-animate">
        <div class="badge" style="color: var(--brand-mint); border-color: rgba(85,203,150,0.3); background: rgba(85,203,150,0.08); grid-area: badge;">
          SEÇÃO CONCLUÍDA
        </div>
        <h3 style="grid-area: title;">Pronto a Próxima Fase?</h3>
        
        <div style="grid-area: copy; display: flex; flex-direction: column; gap: 0.5rem;">
          <p>Você concluiu a seção anterior com sucesso!</p>
          <p>O sistema agora abrirá a fase:</p>
          <h4 style="font-family: var(--font-headings); font-weight: 700; color: var(--brand-mint); font-size: 1.35rem; margin-top: 0.25rem;">${nextSectionName}</h4>
        </div>
        
        <button class="btn btn-primary" id="btn-next-section" style="grid-area: action;">
          <span>Continuar Teste</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>

        <div class="quiz-welcome-visual" aria-hidden="true" style="grid-area: visual;">
          <div class="quiz-visual-grid" style="display: flex; flex-direction: column; width: 100%; gap: 0.75rem; justify-content: center; height: 100%;">
            <h5 style="font-family: var(--font-headings); font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700; text-align: left; width: 100%;">Progresso do Quiz</h5>
            ${progressHtml}
          </div>
        </div>
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
        icon: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-info); filter: drop-shadow(0 0 10px rgba(0,180,216,0.5))"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        bg: "var(--theme-info)"
      },
      health: {
        title: "Técnico em Enfermagem",
        career: "Profissional de Saúde / Enfermeiro Técnico",
        desc: "Seu coração pulsa por empatia, cuidado ao próximo e atenção à saúde humana. Seu perfil tem total afinidade com o curso Técnico em Enfermagem! Venha aprender procedimentos hospitalares de ponta e faça a diferença na vida das pessoas todos os dias.",
        icon: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-enferm); filter: drop-shadow(0 0 10px rgba(255,77,109,0.5))"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
        bg: "var(--theme-enferm)"
      },
      admin: {
        title: "Técnico em Administração",
        career: "Gestor de Negócios / Empreendedor Técnico",
        desc: "Liderança estratégica, finanças e organização de equipes correm em suas veias! Seu caminho ideal está no curso Técnico em Administração! Domine estratégias de marketing, controle fluxos financeiros e crie os alicerces de empresas de sucesso.",
        icon: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--theme-admin); filter: drop-shadow(0 0 10px rgba(255,183,3,0.5))"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
        bg: "var(--theme-admin)"
      },
      tie: {
        title: "Orientação de Carreira",
        career: "Perfil Híbrido / Multi-talentos",
        desc: "Incrível! Suas respostas revelaram um equilíbrio excepcional entre áreas distintas. Você tem afinidade tanto com a lógica da Tecnologia quanto com a empatia da Saúde ou a visão estratégica da Administração. Recomendamos agendar uma conversa com um de nossos orientadores para te ajudar a escolher o caminho perfeito!",
        icon: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--brand-mint); filter: drop-shadow(0 0 10px rgba(85,203,150,0.5))"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        bg: "var(--brand-mint)"
      }
    };

    const finalResult = resultsMap[dominantProfile];

    // Calcula as porcentagens para a visualização gráfica
    const totalScore = this.scores.tech + this.scores.health + this.scores.admin;
    const techPct = totalScore > 0 ? Math.round((this.scores.tech / totalScore) * 100) : 0;
    const healthPct = totalScore > 0 ? Math.round((this.scores.health / totalScore) * 100) : 0;
    const adminPct = totalScore > 0 ? Math.round((this.scores.admin / totalScore) * 100) : 0;

    // Persist result in localStorage
    SafeStorage.setItem('know_quiz_result', JSON.stringify({
      course: finalResult.title,
      scores: this.scores,
      timestamp: new Date().toISOString()
    }));

    this.container.innerHTML = `
      <div class="quiz-result widget-animate">
        <div class="result-badge" style="grid-area: badge; color: ${finalResult.bg}; border-color: rgba(${dominantProfile === 'tech' ? '0,180,216' : dominantProfile === 'health' ? '255,77,109' : dominantProfile === 'admin' ? '255,183,3' : '85,203,150'}, 0.25); background: rgba(${dominantProfile === 'tech' ? '0,180,216' : dominantProfile === 'health' ? '255,77,109' : dominantProfile === 'admin' ? '255,183,3' : '85,203,150'}, 0.08)">
          ${dominantProfile === 'tie' ? 'MULTIPERFIL REVELADO' : 'CURSO IDEAL RECOMENDADO'}
        </div>
        
        <h3 class="result-course-title" style="grid-area: title;">${finalResult.title}</h3>
        
        <div style="grid-area: copy; display: flex; flex-direction: column; gap: 0.6rem;">
          <p class="result-career-text" style="margin: 0; color: ${finalResult.bg}; font-size: 1.1rem; font-weight: 700; font-family: var(--font-headings);">Indicação: ${finalResult.career}</p>
          <p class="result-description" style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary);">${finalResult.desc}</p>
        </div>
        
        <div class="hero-actions" style="grid-area: action; margin-top: 0.5rem; display: flex; gap: 1rem;">
          <button class="btn btn-primary" id="btn-quiz-enroll">
            <span>${dominantProfile === 'tie' ? 'Agendar Conversa' : 'Iniciar Matrícula'}</span>
          </button>
          <button class="btn btn-secondary" id="btn-quiz-restart">
            <span>Refazer Teste</span>
          </button>
        </div>

        <!-- Painel Visual do resultado: mostra o gráfico de afinidades e o ícone com glow -->
        <div class="quiz-welcome-visual" aria-hidden="true" style="grid-area: visual; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem; padding: 1.75rem;">
          <div style="background: rgba(0, 0, 0, 0.4); width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${finalResult.bg}; box-shadow: 0 0 24px rgba(${dominantProfile === 'tech' ? '0,180,216' : dominantProfile === 'health' ? '255,77,109' : dominantProfile === 'admin' ? '255,183,3' : '85,203,150'}, 0.25); flex-shrink: 0;">
            ${finalResult.icon}
          </div>
          
          <div style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem;">
            <h5 style="font-family: var(--font-headings); font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; text-align: center; margin-bottom: 0.2rem; letter-spacing: 0.05em;">Seu Mapa de Afinidades</h5>
            
            <!-- Barra de Afinidade em Tecnologia -->
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-headings); font-weight: 600; color: var(--text-secondary);">
                <span>Tecnologia & Informática</span>
                <span style="color: var(--theme-info);">${techPct}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;">
                <div style="width: ${techPct}%; height: 100%; background: var(--theme-info); border-radius: 99px; box-shadow: 0 0 8px rgba(0,180,216,0.4);"></div>
              </div>
            </div>
            
            <!-- Barra de Afinidade em Enfermagem -->
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-headings); font-weight: 600; color: var(--text-secondary);">
                <span>Saúde & Enfermagem</span>
                <span style="color: var(--theme-enferm);">${healthPct}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;">
                <div style="width: ${healthPct}%; height: 100%; background: var(--theme-enferm); border-radius: 99px; box-shadow: 0 0 8px rgba(255,77,109,0.4);"></div>
              </div>
            </div>
            
            <!-- Barra de Afinidade em Administração -->
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-headings); font-weight: 600; color: var(--text-secondary);">
                <span>Gestão & Administração</span>
                <span style="color: var(--theme-admin);">${adminPct}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;">
                <div style="width: ${adminPct}%; height: 100%; background: var(--theme-admin); border-radius: 99px; box-shadow: 0 0 8px rgba(255,183,3,0.4);"></div>
              </div>
            </div>
          </div>
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
        selectField.value = dominantProfile === 'tie' ? 'Orientação de Carreira' : finalResult.title;
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
