/* js/scratchcard.js - Lógica da Raspadinha de Marketing Interativa */

const OFFICIAL_PRIZES = [
  { text: "Camiseta Exclusiva Colégio KNOW", icon: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><path d="M20.38 3.46L16 6.14V2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4.14L3.62 3.46a2 2 0 0 0-2.38.38l-1 1a2 2 0 0 0-.38 2.38L3.62 12H8v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8h4.38l3.76-4.78a2 2 0 0 0-.38-2.38l-1-1a2 2 0 0 0-2.38-.38z"></path></svg>' },
  { text: "Caneta e Bloco de Notas Ecológico", icon: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>' },
  { text: "Isenção da Taxa de Matrícula", icon: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="16" y1="8" x2="16" y2="16"></line><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="8" x2="8" y2="16"></line></svg>' },
  { text: "Desconto de 10% na Primeira Mensalidade", icon: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>' },
  { text: "Ingresso VIP para a Feira Tech KNOW", icon: '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(85,203,150,0.3))"><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L13 10 10 7 4.5 16.5z"></path><path d="M13 10l9-9-3 3-5 5 1.5 1.5z"></path></svg>' }
];

class ScratchcardManager {
  constructor() {
    this.wrapper = null;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.scratchedPercentage = 0;
    this.revealed = false;
    this.selectedPrize = null;
    
    // Bindings
    this.initScratchcard = this.initScratchcard.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.scratch = this.scratch.bind(this);
    this.checkScratchPercentage = this.checkScratchPercentage.bind(this);
    this.revealPrize = this.revealPrize.bind(this);
    this.checkCooldown = this.checkCooldown.bind(this);
    this.startCooldownTimer = this.startCooldownTimer.bind(this);
  }

  init() {
    this.wrapper = document.getElementById('scratch-card-app');
    if (!this.wrapper) return;
    
    this.checkCooldown();
  }

  // Anti-cheat verification
  checkCooldown() {
    const lastScratchTime = SafeStorage.getItem('know_last_scratch');
    
    if (lastScratchTime) {
      const timeElapsed = Date.now() - parseInt(lastScratchTime, 10);
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeElapsed < cooldownPeriod) {
        // Locked state
        this.renderLocked(cooldownPeriod - timeElapsed);
        return;
      }
    }
    
    // Unlocked and playable
    this.renderPlayable();
  }

  renderLocked(remainingMs) {
    const legacyLockedMarkup = `
      <div class="scratch-locked widget-animate">
        <div class="locked-icon" style="color: var(--brand-mint)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h3>Tentativa Esgotada!</h3>
        <p>Para garantir a igualdade de prêmios em nosso evento, você só pode raspar uma vez por dia.</p>
        <p class="locked-text">Nova tentativa disponível em:</p>
        <div class="locked-timer" id="scratch-cooldown-clock">24:00:00</div>
        
        <button class="btn btn-secondary" id="btn-scratch-redirect-leads" style="margin-top: 1.5rem;">
          <span>Ir para Matrícula</span>
        </button>
      </div>
    `;

    void legacyLockedMarkup;

    this.wrapper.innerHTML = `
      <div class="scratch-locked widget-animate">
        <div class="scratch-locked-copy">
          <span class="locked-eyebrow">Controle di&aacute;rio</span>
          <h3>Tentativa Esgotada!</h3>
          <p>Para manter a disputa justa no evento, cada visitante pode revelar apenas uma raspadinha por dia.</p>
        </div>

        <div class="scratch-lock-panel">
          <div class="locked-icon" style="color: var(--brand-mint)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <p class="locked-text">Nova tentativa dispon&iacute;vel em</p>
          <div class="locked-timer" id="scratch-cooldown-clock">24:00:00</div>
          <span class="locked-note">Enquanto isso, voc&ecirc; pode seguir para a matr&iacute;cula e garantir seu atendimento.</span>
          <button class="btn btn-primary" id="btn-scratch-redirect-leads">
            <span>Ir para Matr&iacute;cula</span>
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
    // Pick a random prize out of the 5 official options
    this.selectedPrize = OFFICIAL_PRIZES[Math.floor(Math.random() * OFFICIAL_PRIZES.length)];
    this.revealed = false;
    this.scratchedPercentage = 0;

    this.wrapper.innerHTML = `
      <div class="scratch-playable widget-animate" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <div class="scratch-header">
          <h3>Sua Raspadinha da Sorte</h3>
          <p>Clique e raspe a área abaixo com o mouse ou toque para revelar seu brinde especial do Colégio KNOW!</p>
        </div>
        
        <div class="scratch-card-wrapper">
          <div class="scratch-prize-reveal">
            <div class="scratch-prize-icon">${this.selectedPrize.icon}</div>
            <div class="scratch-prize-title">VOCÊ GANHOU!</div>
            <div class="scratch-prize-label">${this.selectedPrize.text}</div>
          </div>
          <canvas class="scratch-canvas" id="scratch-canvas" width="320" height="320"></canvas>
        </div>
        
        <div id="scratch-actions-area" style="opacity: 0; pointer-events: none; transition: opacity var(--transition-normal); margin-top: 0.5rem;">
          <button class="btn btn-primary" id="btn-scratch-redeem">
            <span>Resgatar Brinde</span>
          </button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('scratch-canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.initScratchcard();
  }

  initScratchcard() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw scratchable overlay layer
    // Let's make it look amazing: a deep green to light green high-end gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#146E51'); // Brand Deep
    gradient.addColorStop(0.5, '#204d3e');
    gradient.addColorStop(1, '#111a16'); // Dark Background
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Add fine visual dot-mesh patterns
    ctx.fillStyle = 'rgba(85, 203, 150, 0.15)';
    for (let x = 10; x < w; x += 15) {
      for (let y = 10; y < h; y += 15) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Print the brand symbol/text elegantly in the middle
    ctx.font = '800 24px Outfit, sans-serif';
    ctx.fillStyle = '#55CB96'; // Brand Mint
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(85, 203, 150, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText('KNOW', w / 2, h / 2 - 10);
    
    ctx.shadowBlur = 0; // reset
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.fillStyle = '#C2CBCC';
    ctx.fillText('RASPE AQUI', w / 2, h / 2 + 18);
    
    // Border outlining
    ctx.strokeStyle = 'rgba(85, 203, 150, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Event hooks (Desktop and Mobile touch support)
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    
    this.canvas.addEventListener('touchstart', this.handleMouseDown, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleMouseMove, { passive: false });
    window.addEventListener('touchend', this.handleMouseUp, { passive: false });
  }

  // Coordinates helper mapping canvas position
  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Scale appropriately matching CSS sizing
    return {
      x: ((clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((clientY - rect.top) / rect.height) * this.canvas.height
    };
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.isDrawing = true;
    const coords = this.getCoordinates(e);
    this.scratch(coords.x, coords.y, true);
  }

  handleMouseMove(e) {
    if (!this.isDrawing || this.revealed) return;
    e.preventDefault();
    const coords = this.getCoordinates(e);
    this.scratch(coords.x, coords.y, false);
    this.checkScratchPercentage();
  }

  handleMouseUp() {
    this.isDrawing = false;
    if (!this.revealed) {
      this.checkScratchPercentage();
    }
  }

  scratch(x, y, isStart) {
    const ctx = this.ctx;
    
    // Clears the overlay drawing (destination-out)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    
    // Thick circular brush
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // If not first click, draw connector lines to ensure continuous scratches
    if (!isStart && this.lastCoords) {
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.lastCoords.x, this.lastCoords.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    this.lastCoords = { x, y };
  }

  checkScratchPercentage() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Sample pixels to compute scratch-through density (faster than scanning every single pixel)
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    let clearedCount = 0;
    const totalPixels = pixels.length / 4;
    
    // Scan every 12th pixel for performance
    const step = 12;
    let sampledTotal = 0;
    
    for (let i = 0; i < pixels.length; i += 4 * step) {
      sampledTotal++;
      // Pixel is cleared if alpha channel is 0
      if (pixels[i + 3] === 0) {
        clearedCount++;
      }
    }
    
    this.scratchedPercentage = clearedCount / sampledTotal;
    
    // If 60% or more is cleared, trigger beautiful complete fadeout reveal!
    if (this.scratchedPercentage >= 0.60) {
      this.revealPrize();
    }
  }

  revealPrize() {
    this.revealed = true;
    
    // Cooldown logic: save success scratch time to localStorage
    SafeStorage.setItem('know_last_scratch', Date.now().toString());
    
    // Store won prize for the leads form later
    SafeStorage.setItem('know_scratch_prize', this.selectedPrize.text);

    // Clear canvas completely immediately to show everything beneath
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0,0,0,1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Smooth Canvas fade-out transition
    this.canvas.style.transition = 'opacity var(--transition-slow) ease-out, transform var(--transition-slow) ease-out';
    this.canvas.style.opacity = '0';
    this.canvas.style.transform = 'scale(1.08)';
    
    // Add winning sparkle animation class to card wrapper
    const cardWrapper = this.wrapper.querySelector('.scratch-card-wrapper');
    if (cardWrapper) {
      cardWrapper.classList.add('widget-animate');
      cardWrapper.style.animation = 'sparkleEffect 0.8s ease-in-out infinite alternate';
      
      // Inject CSS animation inline if not present
      if (!document.getElementById('scratch-sparkle-css')) {
        const style = document.createElement('style');
        style.id = 'scratch-sparkle-css';
        style.innerHTML = `
          @keyframes sparkleEffect {
            0% { box-shadow: 0 0 15px rgba(85,203,150,0.4), inset 0 0 15px rgba(85,203,150,0.2); }
            100% { box-shadow: 0 0 35px rgba(85,203,150,0.8), inset 0 0 25px rgba(85,203,150,0.4); border-color: var(--brand-mint); }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    setTimeout(() => {
      this.canvas.style.display = 'none';
      
      // Animate actions area reveal
      const actionsArea = document.getElementById('scratch-actions-area');
      if (actionsArea) {
        actionsArea.style.opacity = '1';
        actionsArea.style.pointerEvents = 'auto';
      }
      
      // Bind prize claim redirection to Lead form
      document.getElementById('btn-scratch-redeem').addEventListener('click', () => {
        const enrollmentSection = document.getElementById('matricula');
        if (enrollmentSection) {
          enrollmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const inputName = document.getElementById('lead-name');
        if (inputName) {
          setTimeout(() => inputName.focus(), 450);
        }
      });
    }, 500);
  }
}

// Attach to window
window.ScratchcardManager = ScratchcardManager;
