/* js/leads.js - Formulario de Captura de Leads */

class LeadsManager {
  constructor() {
    this.form = null;
    this.leadsList = [];
    
    // Bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateField = this.validateField.bind(this);
    this.loadLeads = this.loadLeads.bind(this);
  }

  init() {
    this.form = document.getElementById('leads-capture-form');
    this.loadLeads();
    
    if (this.form) {
      this.setupFormValidation();
      this.form.addEventListener('submit', this.handleSubmit);
    }
  }

  loadLeads() {
    const rawData = SafeStorage.getItem('know_leads');
    this.leadsList = rawData ? JSON.parse(rawData) : [];
  }

  // Real-time visual feedback on field inputs
  setupFormValidation() {
    const inputs = this.form.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
      // Validate on keyup and blur
      ['blur', 'keyup', 'change'].forEach(evtType => {
        input.addEventListener(evtType, () => this.validateField(input));
      });
    });
  }

  validateField(input) {
    const group = input.closest('.form-group');
    const errMessage = group.querySelector('.error-message');
    const val = input.value.trim();
    let isValid = true;
    let message = "";

    // Validation rules
    if (!val) {
      isValid = false;
      message = "Este campo é obrigatório.";
    } else if (input.id === 'lead-email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        isValid = false;
        message = "Por favor, digite um e-mail válido.";
      }
    } else if (input.id === 'lead-age') {
      const ageNum = parseInt(val, 10);
      if (isNaN(ageNum) || ageNum <= 5 || ageNum > 100) {
        isValid = false;
        message = "Por favor, digite uma idade válida.";
      }
    }

    // Apply CSS UI states
    if (isValid) {
      group.classList.remove('error');
      group.classList.add('success');
      if (errMessage) errMessage.style.display = 'none';
    } else {
      group.classList.remove('success');
      group.classList.add('error');
      if (errMessage) {
        errMessage.innerText = message;
        errMessage.style.display = 'block';
      }
    }

    return isValid;
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const inputs = this.form.querySelectorAll('.form-input');
    let formIsValid = true;
    
    inputs.forEach(input => {
      const fieldValid = this.validateField(input);
      if (!fieldValid) formIsValid = false;
    });

    if (!formIsValid) return;

    // Retrieve fields
    const nameVal = document.getElementById('lead-name').value.trim();
    const ageVal = parseInt(document.getElementById('lead-age').value.trim(), 10);
    const emailVal = document.getElementById('lead-email').value.trim();
    const courseVal = document.getElementById('lead-course').value;

    // Check if they won a scratchcard prize and attach it to reward
    const wonPrize = SafeStorage.getItem('know_scratch_prize') || "Nenhum";

    const newLead = {
      id: 'lead_' + Date.now(),
      name: nameVal,
      age: ageVal,
      email: emailVal,
      course: courseVal,
      prize: wonPrize,
      date: new Date().toLocaleDateString('pt-BR')
    };

    // Store in Array and persist in SafeStorage
    this.leadsList.push(newLead);
    SafeStorage.setItem('know_leads', JSON.stringify(this.leadsList));
    
    // Clear coupon once redeemed
    SafeStorage.removeItem('know_scratch_prize');

    this.showSuccessScreen(newLead);
  }

  showSuccessScreen(lead) {
    const parentContainer = this.form.parentElement;
    parentContainer.innerHTML = `
      <div class="lead-success-overlay">
        <div class="success-icon" style="color: var(--brand-mint); display: flex; align-items: center; justify-content: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 class="success-title">Cadastro Concluído!</h3>
        <p class="success-subtitle">Obrigado, <strong>${lead.name}</strong>. Seus dados foram enviados com sucesso para a secretaria acadêmica do Colégio KNOW.</p>
        <p class="success-subtitle" style="font-size: 0.9rem; color: var(--brand-mint); margin-top: -0.5rem">
          Curso Escolhido: ${lead.course} ${lead.prize !== 'Nenhum' ? `<br><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M20 12v10H4V12"></path><path d="M2 7h20v5H2z"></path><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> Brinde Vinculado: ${lead.prize}` : ''}
        </p>
        <button class="btn btn-secondary" id="btn-lead-success-dismiss" style="margin-top: 1rem;">
          <span>Novo Cadastro</span>
        </button>
      </div>
    `;

    document.getElementById('btn-lead-success-dismiss').addEventListener('click', () => {
      // Re-render original blank form shell
      parentContainer.innerHTML = `
        <form class="leads-form" id="leads-capture-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="lead-name">Nome Completo</label>
            <div class="input-wrapper">
              <input class="form-input" id="lead-name" type="text" placeholder="Ex: Lucas Silva" required>
            </div>
            <span class="error-message"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-age">Idade</label>
            <div class="input-wrapper">
              <input class="form-input" id="lead-age" type="number" placeholder="Ex: 17" required>
            </div>
            <span class="error-message"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-email">E-mail para Contato</label>
            <div class="input-wrapper">
              <input class="form-input" id="lead-email" type="email" placeholder="lucas@exemplo.com" required>
            </div>
            <span class="error-message"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="lead-course">Curso de Interesse</label>
            <div class="input-wrapper">
              <select class="form-input" id="lead-course" required>
                <option value="" disabled selected hidden>Selecione um curso...</option>
                <option value="Técnico em Informática">Técnico em Informática</option>
                <option value="Técnico em Enfermagem">Técnico em Enfermagem</option>
                <option value="Técnico em Administração">Técnico em Administração</option>
              </select>
            </div>
            <span class="error-message"></span>
          </div>
          <button class="btn btn-primary" type="submit" style="margin-top: 1rem;">
            <span>Cadastrar Interesse</span>
          </button>
        </form>
      `;
      // Re-initialize manager hooks
      this.init();
    });
  }

}

window.LeadsManager = LeadsManager;
