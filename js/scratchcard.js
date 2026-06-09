/* js/scratchcard.js - Raspadinha de Eventos com grade 3x3 */

const OFFICIAL_PRIZES = [
  {
    text: "Camiseta Exclusiva Colegio KNOW",
    shortLabel: "Camiseta",
    icon: '<svg viewBox="0 0 24 24"><path d="M20.4 3.5 16 6.1V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2.1L3.6 3.5 1.2 6l3.4 5.8H8V20h8v-8.2h3.4L22.8 6z"/></svg>'
  },
  {
    text: "Caneta e Bloco de Notas Ecologico",
    shortLabel: "Kit Notas",
    icon: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
  },
  {
    text: "Isencao da Taxa de Matricula",
    shortLabel: "Taxa Free",
    icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8v8M12 8v8M16 8v8"/></svg>'
  },
  {
    text: "Desconto de 10% na Primeira Mensalidade",
    shortLabel: "10% OFF",
    icon: '<svg viewBox="0 0 24 24"><path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>'
  },
  {
    text: "Ingresso VIP para a Feira Tech KNOW",
    shortLabel: "VIP Tech",
    icon: '<svg viewBox="0 0 24 24"><path d="M4.5 16.5C3 17.8 2 20 2 20s2.3-1 3.5-2.5L13 10l-3-3z"/><path d="m13 10 9-9-3 3-5 5z"/></svg>'
  }
];

class ScratchcardManager {
  constructor() {
    this.wrapper = null;
    this.timerInterval = null;
    this.boardCells = [];
    this.revealedCells = [];
    this.activeCanvas = null;
    this.activeContext = null;
    this.activeCellIndex = null;
    this.isDrawing = false;
    this.lastCoords = null;
    this.finished = false;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.checkCooldown = this.checkCooldown.bind(this);
    this.startCooldownTimer = this.startCooldownTimer.bind(this);
  }

  init() {
    this.wrapper = document.getElementById('scratch-card-app');
    if (!this.wrapper) return;

    this.checkCooldown();
  }

  checkCooldown() {
    const lastScratchTime = SafeStorage.getItem('know_last_scratch');

    if (lastScratchTime) {
      const timeElapsed = Date.now() - parseInt(lastScratchTime, 10);
      const cooldownPeriod = 24 * 60 * 60 * 1000;

      if (timeElapsed < cooldownPeriod) {
        this.renderLocked(cooldownPeriod - timeElapsed);
        return;
      }
    }

    this.renderPlayable();
  }

  renderLocked(remainingMs) {
    this.wrapper.innerHTML = `
      <div class="scratch-locked widget-animate">
        <div class="scratch-locked-copy">
          <span class="locked-eyebrow">Controle diario</span>
          <h3>Tentativa Esgotada!</h3>
          <p>Para manter a disputa justa no evento, cada visitante pode jogar apenas uma vez por dia.</p>
        </div>

        <div class="scratch-lock-panel">
          <div class="locked-icon" style="color: var(--brand-mint)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <p class="locked-text">Nova tentativa disponivel em</p>
          <div class="locked-timer" id="scratch-cooldown-clock">24:00:00</div>
          <span class="locked-note">Enquanto isso, voce pode seguir para a matricula e garantir seu atendimento.</span>
          <button class="btn btn-primary" id="btn-scratch-redirect-leads">
            <span>Ir para Matricula</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-scratch-redirect-leads').addEventListener('click', () => {
      const enrollmentSection = document.getElementById('matricula');
      if (enrollmentSection) {
        enrollmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    this.startCooldownTimer(remainingMs);
  }

  startCooldownTimer(durationMs) {
    const clock = document.getElementById('scratch-cooldown-clock');
    if (!clock) return;

    let remaining = Math.floor(durationMs / 1000);

    const updateClock = () => {
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.renderPlayable();
        return;
      }

      const hrs = Math.floor(remaining / 3600).toString().padStart(2, '0');
      const mins = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
      const secs = (remaining % 60).toString().padStart(2, '0');

      clock.innerText = `${hrs}:${mins}:${secs}`;
      remaining--;
    };

    updateClock();
    this.timerInterval = setInterval(updateClock, 1000);
  }

  renderPlayable() {
    this.boardCells = this.createPrizeBoard();
    this.revealedCells = [];
    this.finished = false;
    this.lastCoords = null;

    this.wrapper.innerHTML = `
      <div class="scratch-playable widget-animate">
        <div class="scratch-header">
          <span class="scratch-eyebrow">3 tentativas</span>
          <h3>Raspe 3 casas</h3>
          <p>Escolha bem: se as 3 casas reveladas forem iguais, voce ganha o brinde. Se nao combinar, a tentativa acaba.</p>
        </div>

        <div class="scratch-card-wrapper" id="scratch-card-wrapper">
          <div class="scratch-grid" aria-label="Cartela de raspadinha com 9 casas">
            ${this.boardCells.map((cell, index) => this.renderScratchCell(cell, index)).join('')}
          </div>
        </div>

        <div class="scratch-result" id="scratch-result" aria-live="polite">
          <span class="scratch-result-kicker">Tentativas restantes: 3</span>
          <strong>Raspe uma casa</strong>
          <p>Arraste sobre uma das casas para revelar o simbolo escondido.</p>
        </div>

        <div id="scratch-actions-area" style="opacity: 0; pointer-events: none; transition: opacity var(--transition-normal);">
          <button class="btn btn-primary" id="btn-scratch-redeem">
            <span>Ir para Matricula</span>
          </button>
        </div>
      </div>
    `;

    this.prepareCellCanvases();
  }

  renderScratchCell(cell, index) {
    return `
      <button class="scratch-cell" type="button" data-cell-index="${index}" aria-label="Raspar casa ${index + 1}">
        <span class="scratch-cell-prize">
          <span class="scratch-cell-icon">${cell.icon}</span>
          <strong>${cell.shortLabel}</strong>
        </span>
        <canvas class="scratch-cell-canvas" width="140" height="140"></canvas>
      </button>
    `;
  }

  createPrizeBoard() {
    const winningPrize = OFFICIAL_PRIZES[Math.floor(Math.random() * OFFICIAL_PRIZES.length)];
    const board = [winningPrize, winningPrize, winningPrize];

    while (board.length < 9) {
      const nextPrize = OFFICIAL_PRIZES[Math.floor(Math.random() * OFFICIAL_PRIZES.length)];
      const currentCount = board.filter(item => item.text === nextPrize.text).length;

      if (nextPrize.text !== winningPrize.text && currentCount < 2) {
        board.push(nextPrize);
      }
    }

    return board.sort(() => Math.random() - 0.5);
  }

  prepareCellCanvases() {
    const canvases = this.wrapper.querySelectorAll('.scratch-cell-canvas');

    canvases.forEach((canvas) => {
      this.paintScratchLayer(canvas);
      canvas.addEventListener('pointerdown', this.handlePointerDown);
      canvas.addEventListener('pointermove', this.handlePointerMove);
    });

    window.addEventListener('pointerup', this.handlePointerUp);
  }

  paintScratchLayer(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#55CB96');
    gradient.addColorStop(0.28, '#1c8b65');
    gradient.addColorStop(0.62, '#146E51');
    gradient.addColorStop(1, '#07110e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let y = -h; y < h; y += 12) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(7, 17, 14, 0.32)';
    for (let x = 10; x < w; x += 16) {
      for (let y = 10; y < h; y += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = '800 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(7, 17, 14, 0.84)';
    ctx.fillText('RASPE', w / 2, h / 2 - 7);

    ctx.font = '700 10px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(7, 17, 14, 0.68)';
    ctx.fillText('KNOW', w / 2, h / 2 + 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 5;
    ctx.strokeRect(2.5, 2.5, w - 5, h - 5);
  }

  handlePointerDown(event) {
    if (this.finished) return;

    const cell = event.target.closest('.scratch-cell');
    if (!cell || cell.classList.contains('is-revealed')) return;

    event.preventDefault();
    this.activeCanvas = event.target;
    this.activeContext = this.activeCanvas.getContext('2d', { willReadFrequently: true });
    this.activeCellIndex = Number(cell.dataset.cellIndex);
    this.isDrawing = true;
    this.lastCoords = null;
    this.activeCanvas.setPointerCapture?.(event.pointerId);

    const coords = this.getCoordinates(event, this.activeCanvas);
    this.scratch(coords.x, coords.y, true);
  }

  handlePointerMove(event) {
    if (!this.isDrawing || !this.activeCanvas || this.finished) return;

    event.preventDefault();
    const coords = this.getCoordinates(event, this.activeCanvas);
    this.scratch(coords.x, coords.y, false);
    this.checkCellProgress();
  }

  handlePointerUp() {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.checkCellProgress();
    this.activeCanvas = null;
    this.activeContext = null;
    this.activeCellIndex = null;
    this.lastCoords = null;
  }

  getCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  scratch(x, y, isStart) {
    const ctx = this.activeContext;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    if (!isStart && this.lastCoords) {
      ctx.lineWidth = 48;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.lastCoords.x, this.lastCoords.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    this.lastCoords = { x, y };
    this.emitScratchDust(x, y);
  }

  emitScratchDust(x, y) {
    if (!this.activeCanvas) return;

    const cell = this.activeCanvas.closest('.scratch-cell');
    if (!cell) return;

    for (let i = 0; i < 4; i++) {
      const particle = document.createElement('span');
      particle.className = 'scratch-dust';
      particle.style.left = `${(x / this.activeCanvas.width) * 100}%`;
      particle.style.top = `${(y / this.activeCanvas.height) * 100}%`;
      particle.style.setProperty('--dust-x', `${(Math.random() - 0.5) * 46}px`);
      particle.style.setProperty('--dust-y', `${-12 - Math.random() * 34}px`);
      cell.appendChild(particle);
      setTimeout(() => particle.remove(), 560);
    }
  }

  checkCellProgress() {
    if (this.activeCellIndex === null || !this.activeCanvas || !this.activeContext) return;

    const progress = this.getCanvasClearPercentage(this.activeCanvas, this.activeContext);
    const cell = this.activeCanvas.closest('.scratch-cell');

    if (cell) {
      cell.style.setProperty('--cell-progress', `${Math.min(Math.round(progress * 100), 100)}%`);
    }

    if (progress >= 0.48) {
      this.revealCell(this.activeCellIndex);
    }
  }

  getCanvasClearPercentage(canvas, ctx) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clearPixels = 0;
    let sampledPixels = 0;

    for (let i = 0; i < imageData.length; i += 4 * 8) {
      sampledPixels++;
      if (imageData[i + 3] === 0) {
        clearPixels++;
      }
    }

    return clearPixels / sampledPixels;
  }

  revealCell(index) {
    if (this.revealedCells.includes(index) || this.finished) return;

    const cell = this.wrapper.querySelector(`[data-cell-index="${index}"]`);
    if (!cell) return;

    const canvas = cell.querySelector('.scratch-cell-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cell.classList.add('is-revealed');
    canvas.style.opacity = '0';
    canvas.style.transform = 'scale(1.05)';

    this.revealedCells.push(index);
    this.updateAttemptText();

    if (this.revealedCells.length >= 3) {
      this.finishGame();
    }
  }

  updateAttemptText() {
    const result = document.getElementById('scratch-result');
    if (!result) return;

    const remaining = Math.max(3 - this.revealedCells.length, 0);
    const revealedLabels = this.revealedCells
      .map(index => this.boardCells[index].shortLabel)
      .join(' / ');

    result.querySelector('.scratch-result-kicker').textContent = `Tentativas restantes: ${remaining}`;
    result.querySelector('strong').textContent = remaining > 0 ? 'Continue raspando' : 'Resultado';
    result.querySelector('p').textContent = revealedLabels || 'Arraste sobre uma das casas para revelar o simbolo escondido.';
  }

  finishGame() {
    this.finished = true;

    const selectedCells = this.revealedCells.map(index => this.boardCells[index]);
    const firstPrize = selectedCells[0];
    const didWin = selectedCells.every(cell => cell.text === firstPrize.text);
    const result = document.getElementById('scratch-result');
    const actionsArea = document.getElementById('scratch-actions-area');

    SafeStorage.setItem('know_last_scratch', Date.now().toString());

    if (didWin) {
      SafeStorage.setItem('know_scratch_prize', firstPrize.text);
    } else {
      SafeStorage.removeItem('know_scratch_prize');
    }

    this.wrapper.querySelector('.scratch-card-wrapper')?.classList.add(didWin ? 'scratch-win' : 'scratch-loss');

    if (result) {
      result.classList.add(didWin ? 'is-winning' : 'is-empty');
      result.innerHTML = didWin ? `
        <span class="scratch-result-kicker">3 iguais encontrados</span>
        <strong>GG, você ganhou!</strong>
        <p>${firstPrize.text}</p>
      ` : `
        <span class="scratch-result-kicker">3 tentativas usadas</span>
        <strong>Não foi dessa vez</strong>
        <p>As 3 casas não combinaram. Tente novamente amanhã.</p>
      `;
    }

    if (actionsArea) {
      actionsArea.style.opacity = '1';
      actionsArea.style.pointerEvents = 'auto';
    }

    document.getElementById('btn-scratch-redeem')?.addEventListener('click', () => {
      const enrollmentSection = document.getElementById('matricula');
      if (enrollmentSection) {
        enrollmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const inputName = document.getElementById('lead-name');
      if (inputName) {
        setTimeout(() => inputName.focus(), 450);
      }
    });
  }
}

window.ScratchcardManager = ScratchcardManager;
