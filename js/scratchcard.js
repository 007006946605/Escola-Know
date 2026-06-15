/* js/scratchcard.js - Raspadinha de Eventos com grade 3x3 */

const OFFICIAL_PRIZES = [
  {
    text: "Camiseta Exclusiva Colegio KNOW",
    shortLabel: "Camiseta",
    icon: '<svg viewBox="0 0 24 24"><path d="M20.4 3.5 16 6.1V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2.1L3.6 3.5 1.2 6l3.4 5.8H8V20h8v-8.2h3.4L22.8 6z"/></svg>',
  },
  {
    text: "Caneta e Bloco de Notas Ecologico",
    shortLabel: "Kit Notas",
    icon: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  },
  {
    text: "Isencao da Taxa de Matricula",
    shortLabel: "Taxa Free",
    icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8v8M12 8v8M16 8v8"/></svg>',
  },
  {
    text: "Desconto de 10% na Primeira Mensalidade",
    shortLabel: "10% OFF",
    icon: '<svg viewBox="0 0 24 24"><path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  },
  {
    text: "Ingresso VIP para a Feira Tech KNOW",
    shortLabel: "VIP Tech",
    icon: '<svg viewBox="0 0 24 24"><path d="M2 4 5 12h14l3-8-7 4-3-6-3 6-7-4z"/><path d="M5 20h14"/></svg>',
  },
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
    this.wrapper = document.getElementById("scratch-card-app");
    if (!this.wrapper) return;

    this.checkCooldown();
  }

  checkCooldown() {
    const lastScratchTime = SafeStorage.getItem("know_last_scratch");

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
          <span class="locked-note">Enquanto isso, voce pode seguir para o formulário e garantir seu atendimento.</span>
          <button class="btn btn-primary" id="btn-scratch-redirect-leads">
            <span>Ir para o formulário</span>
          </button>
        </div>
      </div>
    `;

    document
      .getElementById("btn-scratch-redirect-leads")
      .addEventListener("click", () => {
        const enrollmentSection = document.getElementById("matricula");
        if (enrollmentSection) {
          enrollmentSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });

    this.startCooldownTimer(remainingMs);
  }

  startCooldownTimer(durationMs) {
    const clock = document.getElementById("scratch-cooldown-clock");
    if (!clock) return;

    let remaining = Math.floor(durationMs / 1000);

    const updateClock = () => {
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.renderPlayable();
        return;
      }

      const hrs = Math.floor(remaining / 3600)
        .toString()
        .padStart(2, "0");
      const mins = Math.floor((remaining % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const secs = (remaining % 60).toString().padStart(2, "0");

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
          <span class="scratch-eyebrow">Ative seu cupom</span>
          <h3>Raspe as casas</h3>
          <p>Revele as casas para encontrar 3 símbolos de prêmio idênticos. Se você os achar, você ganha!</p>
        </div>

        <div class="scratch-card-wrapper" id="scratch-card-wrapper">
          <div class="scratch-grid" aria-label="Cartela de raspadinha com 9 casas">
            ${this.boardCells.map((cell, index) => this.renderScratchCell(cell, index)).join("")}
          </div>
        </div>

        <div class="scratch-result" id="scratch-result" aria-live="polite">
          <span class="scratch-result-kicker">Casas Reveladas</span>
          <strong>Comece a raspar</strong>
          <p>Arraste o cursor sobre as casas para revelar os prêmios escondidos.</p>
        </div>

        <div id="scratch-actions-area" style="opacity: 0; pointer-events: none; transition: opacity var(--transition-normal);">
          <button class="btn btn-primary" id="btn-scratch-redeem">
            <span>Ir para o formulário</span>
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
    // 50% de chance de haver um prêmio nesta rodada
    const hasPrize = Math.random() < 0.5;
    const board = Array(9).fill(null);

    if (!hasPrize) {
    }

    const winningPrize =
      OFFICIAL_PRIZES[Math.floor(Math.random() * OFFICIAL_PRIZES.length)];

    // Posiciona o prêmio vencedor em 3 posições aleatórias distintas
    const indices = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * 9);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }

    indices.forEach((idx) => {
      board[idx] = winningPrize;
    });

    // Preenche as outras 6 casas como vazias (Tente de Novo)
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = {
          text: "Não foi dessa vez!",
          shortLabel: "Tente de Novo",
          icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
          isEmpty: true,
        };
      }
    }

    return board;
  }

  prepareCellCanvases() {
    const canvases = this.wrapper.querySelectorAll(".scratch-cell-canvas");

    canvases.forEach((canvas) => {
      this.paintScratchLayer(canvas);
      canvas.addEventListener("pointerdown", this.handlePointerDown);
      canvas.addEventListener("pointermove", this.handlePointerMove);
    });

    window.addEventListener("pointerup", this.handlePointerUp);
  }

  paintScratchLayer(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#55CB96");
    gradient.addColorStop(0.28, "#1c8b65");
    gradient.addColorStop(0.62, "#146E51");
    gradient.addColorStop(1, "#07110e");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let y = -h; y < h; y += 12) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(7, 17, 14, 0.32)";
    for (let x = 10; x < w; x += 16) {
      for (let y = 10; y < h; y += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = "800 15px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(7, 17, 14, 0.84)";
    ctx.fillText("RASPE", w / 2, h / 2 - 7);

    ctx.font = "700 10px Outfit, sans-serif";
    ctx.fillStyle = "rgba(7, 17, 14, 0.68)";
    ctx.fillText("KNOW", w / 2, h / 2 + 14);

    ctx.strokeStyle = "rgba(255,255,255,0.24)";
    ctx.lineWidth = 5;
    ctx.strokeRect(2.5, 2.5, w - 5, h - 5);
  }

  handlePointerDown(event) {
    if (this.finished) return;

    const cell = event.target.closest(".scratch-cell");
    if (!cell || cell.classList.contains("is-revealed")) return;

    event.preventDefault();
    this.activeCanvas = event.target;
    this.activeContext = this.activeCanvas.getContext("2d", {
      willReadFrequently: true,
    });
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
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  scratch(x, y, isStart) {
    const ctx = this.activeContext;
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    if (!isStart && this.lastCoords) {
      ctx.lineWidth = 48;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
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

    const cell = this.activeCanvas.closest(".scratch-cell");
    if (!cell) return;

    for (let i = 0; i < 4; i++) {
      const particle = document.createElement("span");
      particle.className = "scratch-dust";
      particle.style.left = `${(x / this.activeCanvas.width) * 100}%`;
      particle.style.top = `${(y / this.activeCanvas.height) * 100}%`;
      particle.style.setProperty("--dust-x", `${(Math.random() - 0.5) * 46}px`);
      particle.style.setProperty("--dust-y", `${-12 - Math.random() * 34}px`);
      cell.appendChild(particle);
      setTimeout(() => particle.remove(), 560);
    }
  }

  checkCellProgress() {
    if (
      this.activeCellIndex === null ||
      !this.activeCanvas ||
      !this.activeContext
    )
      return;

    const progress = this.getCanvasClearPercentage(
      this.activeCanvas,
      this.activeContext,
    );
    const cell = this.activeCanvas.closest(".scratch-cell");

    if (cell) {
      cell.style.setProperty(
        "--cell-progress",
        `${Math.min(Math.round(progress * 100), 100)}%`,
      );
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

  checkWinCondition() {
    const revealedPrizes = this.revealedCells.map(
      (index) => this.boardCells[index],
    );
    const prizeCounts = {};

    for (const prize of revealedPrizes) {
      if (prize.isEmpty) continue;
      prizeCounts[prize.text] = (prizeCounts[prize.text] || 0) + 1;
      if (prizeCounts[prize.text] >= 3) {
        return prize; // Ganhou este prêmio!
      }
    }
    return null;
  }

  revealCell(index) {
    if (this.revealedCells.includes(index) || this.finished) return;

    const cell = this.wrapper.querySelector(`[data-cell-index="${index}"]`);
    if (!cell) return;

    const canvas = cell.querySelector(".scratch-cell-canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cell.classList.add("is-revealed");
    canvas.style.opacity = "0";
    canvas.style.transform = "scale(1.05)";

    this.revealedCells.push(index);
    this.updateAttemptText();

    const wonPrize = this.checkWinCondition();
    if (wonPrize) {
      this.finishGame(wonPrize);
    } else if (this.revealedCells.length >= 9) {
      this.finishGame(null);
    }
  }

  updateAttemptText() {
    const result = document.getElementById("scratch-result");
    if (!result) return;

    const revealedLabels = this.revealedCells
      .map((index) => {
        const cell = this.boardCells[index];
        return cell.isEmpty ? "Vazio" : cell.shortLabel;
      })
      .join(" / ");

    result.querySelector(".scratch-result-kicker").textContent = "Casas Reveladas";
    result.querySelector("strong").textContent = "Raspando...";
    result.querySelector("p").textContent =
      revealedLabels ||
      "Arraste sobre uma das casas para revelar o símbolo escondido.";
  }

  finishGame(wonPrize) {
    this.finished = true;
    const didWin = !!wonPrize;
    const result = document.getElementById("scratch-result");
    const actionsArea = document.getElementById("scratch-actions-area");

    SafeStorage.setItem("know_last_scratch", Date.now().toString());

    if (didWin) {
      SafeStorage.setItem("know_scratch_prize", wonPrize.text);
    } else {
      SafeStorage.removeItem("know_scratch_prize");
    }

    this.wrapper
      .querySelector(".scratch-card-wrapper")
      ?.classList.add(didWin ? "scratch-win" : "scratch-loss");

    // Revela todas as outras casas ao finalizar o jogo
    this.boardCells.forEach((cell, idx) => {
      if (!this.revealedCells.includes(idx)) {
        const c = this.wrapper.querySelector(`[data-cell-index="${idx}"]`);
        if (c) {
          c.classList.add("is-revealed");
          const canvas = c.querySelector(".scratch-cell-canvas");
          if (canvas) {
            canvas.style.opacity = "0";
            canvas.style.transform = "scale(1.05)";
          }
        }
      }
    });

    if (result) {
      result.classList.add(didWin ? "is-winning" : "is-empty");
      result.innerHTML = didWin
        ? `
        <span class="scratch-result-kicker">3 iguais encontrados</span>
        <strong>Você ganhou!</strong>
        <p>${wonPrize.text}</p>
      `
        : `
        <span class="scratch-result-kicker">Fim do jogo</span>
        <strong>Não foi dessa vez</strong>
        <p>Esta cartela não continha prêmios. Tente novamente amanhã!</p>
      `;
    }

    if (actionsArea) {
      actionsArea.style.opacity = "1";
      actionsArea.style.pointerEvents = "auto";
    }

    document
      .getElementById("btn-scratch-redeem")
      ?.addEventListener("click", () => {
        const enrollmentSection = document.getElementById("matricula");
        if (enrollmentSection) {
          enrollmentSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        const inputName = document.getElementById("lead-name");
        if (inputName) {
          setTimeout(() => inputName.focus(), 450);
        }
      });
  }
}

window.ScratchcardManager = ScratchcardManager;
