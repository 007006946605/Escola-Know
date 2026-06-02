/* js/app.js - Orquestrador Central, Roteador SPA, Efeitos de Animações de Scroll e Transições */

const bootstrapKNOW = () => {
  // Bootstrap main application managers
  initTheme();
  initSPARouting();
  initSloganTyping();
  initHeroMagneticHover();
  initStorytellingTimeline();
  initCoursesShowcase();
  initFAQAccordion();
  initDashboardShell();
  initDashboardScrollImmersion();
  initLeadCapture();
  initGlobalScrollEffects();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapKNOW);
} else {
  bootstrapKNOW();
}

/* ==========================================================================
   THEME SWITCHER
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Retrieve saved theme or default to premium dark
  const savedTheme = SafeStorage.getItem('know_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    SafeStorage.setItem('know_theme', newTheme);
  });
}

/* ==========================================================================
   SPA ROUTER (NAVEGAÇÃO SUAVE ENTRE SEÇÕES)
   ========================================================================== */
function initSPARouting() {
  const navLinks = document.querySelectorAll('.nav-link, .logo, .footer-links a[href^="#"], .btn[href^="#"]');
  const sections = document.querySelectorAll('section');
  const header = document.querySelector('.header');

  // Smooth scroll tracking
  const navigateToSection = (targetId) => {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const offsetTop = targetElement.offsetTop - 75; // Subtract header height buffer
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });

    // Mobile menu closing helper
    const navMenu = document.getElementById('nav-menu');
    const menuBtn = document.getElementById('menu-btn');
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuBtn.classList.remove('open');
    }
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateToSection(href);
      }
    });
  });

  // Mobile menu triggers toggle
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
  }

  // Active section indicator in navbar using scroll events
  window.addEventListener('scroll', () => {
    // Header background blurring on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSectionId = '#' + section.getAttribute('id');
      }
    });

    // Update nav links classes
    const headerNavLinks = document.querySelectorAll('.nav-link');
    headerNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSectionId) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   SLOGAN TYPING EFFECT IN HERO SECTION
   ========================================================================== */
function initSloganTyping() {
  const typingTarget = document.getElementById('hero-typing-text');
  if (!typingTarget) return;

  const textToType = "Conhecimento que transforma, tecnologia que conecta, futuro que acontece.";
  let idx = 0;
  let isDeleting = false;
  
  const typeEffect = () => {
    const currentText = textToType.substring(0, idx);
    typingTarget.innerHTML = currentText;

    if (!isDeleting && idx < textToType.length) {
      idx++;
      setTimeout(typeEffect, 60); // typing speed
    } else if (isDeleting && idx > 0) {
      idx--;
      setTimeout(typeEffect, 30); // deleting speed
    } else {
      isDeleting = !isDeleting;
      setTimeout(typeEffect, isDeleting ? 2500 : 800); // delay before backspacing or repeating
    }
  };

  setTimeout(typeEffect, 1000); // Initial delay
}

/* ==========================================================================
   HERO MAGNETIC HOVER
   ========================================================================== */
function initHeroMagneticHover() {
  const heroGraphic = document.querySelector('.hero-graphic-shell');
  if (!heroGraphic) return;

  const canAnimatePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canAnimatePointer || reducedMotion) return;

  heroGraphic.addEventListener('pointermove', (event) => {
    const rect = heroGraphic.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    heroGraphic.classList.add('is-magnetized');
    heroGraphic.style.setProperty('--hero-shift-x', `${x * 8}px`);
    heroGraphic.style.setProperty('--hero-shift-y', `${y * 6}px`);
    heroGraphic.style.setProperty('--hero-tilt-x', `${y * -4}deg`);
    heroGraphic.style.setProperty('--hero-tilt-y', `${x * 5}deg`);
    heroGraphic.style.setProperty('--hero-look-x', `${x * 10}px`);
    heroGraphic.style.setProperty('--hero-look-y', `${y * 8}px`);
    heroGraphic.style.setProperty('--hero-core-x', `${x * 2.8}px`);
    heroGraphic.style.setProperty('--hero-core-y', `${y * 2.2}px`);
    heroGraphic.style.setProperty('--hero-logo-x', `${x * 2.2}px`);
    heroGraphic.style.setProperty('--hero-logo-y', `${y * 1.8}px`);
  });

  heroGraphic.addEventListener('pointerleave', () => {
    heroGraphic.classList.remove('is-magnetized');
    heroGraphic.style.setProperty('--hero-shift-x', '0px');
    heroGraphic.style.setProperty('--hero-shift-y', '0px');
    heroGraphic.style.setProperty('--hero-tilt-x', '0deg');
    heroGraphic.style.setProperty('--hero-tilt-y', '0deg');
    heroGraphic.style.setProperty('--hero-look-x', '0px');
    heroGraphic.style.setProperty('--hero-look-y', '0px');
    heroGraphic.style.setProperty('--hero-core-x', '0px');
    heroGraphic.style.setProperty('--hero-core-y', '0px');
    heroGraphic.style.setProperty('--hero-logo-x', '0px');
    heroGraphic.style.setProperty('--hero-logo-y', '0px');
  });
}

/* ==========================================================================
   ABOUT US - STORYTELLING NEON TIMELINE
   ========================================================================== */
function initStorytellingTimeline() {
  const chapters = document.querySelectorAll('.story-chapter');
  const timelineProgress = document.getElementById('storytelling-progress');
  const container = document.getElementById('storytelling-container');

  if (chapters.length === 0 || !timelineProgress || !container) return;

  // 1. Observe chapters entering the screen to light up nodes
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -25% 0px', // triggers when chapter is 25% above the bottom
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  chapters.forEach(chap => observer.observe(chap));

  // 2. Animate vertical timeline neon line on page scrolling
  window.addEventListener('scroll', () => {
    const rect = container.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Relative progress coordinates inside timeline container
    let progressHeight = 0;
    
    if (rect.top < windowH / 2) {
      const totalH = rect.height;
      const scrolledInContainer = (windowH / 2) - rect.top;
      progressHeight = Math.min(Math.max((scrolledInContainer / totalH) * 100, 0), 100);
    }
    
    timelineProgress.style.height = `${progressHeight}%`;
  });
}

/* ==========================================================================
   COURSES SPLIT SHOWCASE (GRID-CARD-FREE)
   ========================================================================== */
function initCoursesShowcase() {
  const navItems = document.querySelectorAll('.courses-nav-item');
  const panes = document.querySelectorAll('.course-pane');

  if (navItems.length === 0 || panes.length === 0) return;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPaneId = item.getAttribute('data-target');
      
      // Update nav highlights
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Update pane displays
      panes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetPaneId) {
          pane.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================================================
   DASHBOARD CENTRAL APPLICATIONS HUB WIDGETS SWITCHER
   ========================================================================== */
function initDashboardShell() {
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const widgetPanes = document.querySelectorAll('.widget-pane');
  const titleKicker = document.getElementById('window-title-kicker');
  const moduleTitle = document.getElementById('window-module-title');
  const windowStatus = document.getElementById('window-status');

  if (sidebarBtns.length === 0 || widgetPanes.length === 0) return;

  // Instances of widget controllers
  let quizInstance = null;
  let scratchcardInstance = null;
  let leadsInstance = null;

  const getLeadsInstance = () => {
    if (!leadsInstance) {
      leadsInstance = window.KNOWLeadsManager || new window.LeadsManager();
      window.KNOWLeadsManager = leadsInstance;
    }
    return leadsInstance;
  };

  const bootstrapWidget = (paneId) => {
    if (paneId === 'quiz-pane') {
      if (!quizInstance) {
        quizInstance = new window.QuizManager();
      }
      quizInstance.init();
    } else if (paneId === 'scratch-pane') {
      if (!scratchcardInstance) {
        scratchcardInstance = new window.ScratchcardManager();
      }
      // If there's an active clock interval running, clear it before re-initializing
      if (scratchcardInstance.timerInterval) {
        clearInterval(scratchcardInstance.timerInterval);
      }
      scratchcardInstance.init();
    } else if (paneId === 'admin-pane') {
      // Secretary Admin uses the same LeadsManager instance
      getLeadsInstance().renderAdminBoard();
    }
  };

  const updateWindowContext = (btn) => {
    if (titleKicker) titleKicker.textContent = btn.dataset.kicker || 'KNOW Hub';
    if (moduleTitle) moduleTitle.textContent = btn.dataset.title || btn.textContent.trim();
    if (windowStatus) windowStatus.textContent = btn.dataset.status || 'Módulo ativo';
  };

  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPaneId = btn.getAttribute('data-target');

      // Update sidebar highlights
      sidebarBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateWindowContext(btn);

      // Toggle visible pane
      widgetPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetPaneId) {
          pane.classList.add('active');
          
          // Dynamically boot script handlers when its window tab is selected
          bootstrapWidget(targetPaneId);
        }
      });
    });
  });

  // Autostart first widget (Quiz) on page load
  const activeSidebarBtn = document.querySelector('.sidebar-btn.active');
  if (activeSidebarBtn) {
    updateWindowContext(activeSidebarBtn);
    bootstrapWidget(activeSidebarBtn.getAttribute('data-target'));
  }
}

/* ==========================================================================
   DASHBOARD SCROLL IMMERSION
   ========================================================================== */
function initDashboardScrollImmersion() {
  const hubSection = document.getElementById('hub');
  const pinStage = document.querySelector('.dashboard-pin-stage');
  const dashboardWindow = document.getElementById('dashboard-window');
  const hubHeader = hubSection?.querySelector('.hub-header');

  if (!hubSection || !pinStage || !dashboardWindow) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  const updateWindowFrame = () => {
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    if (viewportW < 992) {
      dashboardWindow.style.removeProperty('--dashboard-width');
      dashboardWindow.style.removeProperty('--dashboard-height');
      dashboardWindow.style.removeProperty('--dashboard-radius');
      dashboardWindow.style.removeProperty('--dashboard-shadow-y');
      dashboardWindow.style.removeProperty('--dashboard-shadow-blur');
      dashboardWindow.style.removeProperty('--dashboard-glow-blur');
      dashboardWindow.style.removeProperty('--dashboard-glow-opacity');
      dashboardWindow.style.removeProperty('--dashboard-border-opacity');
      dashboardWindow.classList.remove('is-immersive');
      return;
    }

    const hubTop = hubSection.offsetTop;
    const headerRect = hubHeader?.getBoundingClientRect();
    const headerMarginBottom = hubHeader ? Number.parseFloat(getComputedStyle(hubHeader).marginBottom) || 0 : 0;
    const pinStart = headerRect
      ? headerRect.bottom + window.scrollY + headerMarginBottom
      : hubTop + viewportH * 0.35;
    const pinEnd = hubTop + hubSection.offsetHeight - viewportH;
    const pinTravel = Math.max((pinEnd - pinStart) * 0.88, viewportH * 0.35);
    const rawProgress = clamp((window.scrollY - pinStart) / pinTravel, 0, 1);
    const progress = easeOut(rawProgress);

    const baseWidth = Math.min(1100, viewportW - 32);
    const targetWidth = viewportW;
    const baseHeight = 630;
    const targetHeight = viewportH;
    const width = baseWidth + (targetWidth - baseWidth) * progress;
    const height = baseHeight + (targetHeight - baseHeight) * progress;
    const radius = 24 - 24 * progress;

    dashboardWindow.style.setProperty('--dashboard-progress', progress.toFixed(3));
    dashboardWindow.style.setProperty('--dashboard-width', `${width}px`);
    dashboardWindow.style.setProperty('--dashboard-height', `${Math.max(height, 520)}px`);
    dashboardWindow.style.setProperty('--dashboard-radius', `${Math.max(radius, 0)}px`);
    dashboardWindow.style.setProperty('--dashboard-shadow-y', `${18 + 28 * progress}px`);
    dashboardWindow.style.setProperty('--dashboard-shadow-blur', `${48 + 40 * progress}px`);
    dashboardWindow.style.setProperty('--dashboard-glow-blur', `${18 + 36 * progress}px`);
    dashboardWindow.style.setProperty('--dashboard-glow-opacity', `${0.08 + 0.12 * progress}`);
    dashboardWindow.style.setProperty('--dashboard-border-opacity', `${Math.max(0.22 * (1 - progress), 0).toFixed(3)}`);
    dashboardWindow.classList.toggle('is-immersive', progress > 0.68);
  };

  updateWindowFrame();
  window.addEventListener('scroll', updateWindowFrame, { passive: true });
  window.addEventListener('resize', updateWindowFrame);
}

/* ==========================================================================
   LEAD CAPTURE CTA
   ========================================================================== */
function initLeadCapture() {
  if (!window.LeadsManager) return;

  const manager = window.KNOWLeadsManager || new window.LeadsManager();
  window.KNOWLeadsManager = manager;
  manager.init();
}

/* ==========================================================================
   GLOBAL INTERSECTION SCROLL MICRO-ANIMATIONS
   ========================================================================== */
function initGlobalScrollEffects() {
  // Observe generic elements with .animate-in tag and fade them up on entering screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-visible');
        observer.unobserve(entry.target); // trigger animation only once
      }
    });
  }, {
    threshold: 0.15
  });

  const animTargets = document.querySelectorAll('.animate-in');
  animTargets.forEach(t => observer.observe(t));
}

/* ==========================================================================
   FAQ ACCORDION TRIGGERS
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  const closeFAQItem = (item) => {
    const content = item.querySelector('.faq-content');
    if (!content) return;

    content.style.maxHeight = `${content.scrollHeight}px`;
    requestAnimationFrame(() => {
      item.classList.remove('active');
      content.style.maxHeight = '0px';
    });
  };

  const openFAQItem = (item) => {
    const content = item.querySelector('.faq-content');
    if (!content) return;

    item.classList.add('active');
    requestAnimationFrame(() => {
      content.style.maxHeight = `${content.scrollHeight}px`;
    });
  };

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    const content = item.querySelector('.faq-content');
    if (content) {
      content.style.maxHeight = item.classList.contains('active') ? `${content.scrollHeight}px` : '0px';
    }

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      faqItems.forEach(i => {
        if (i.classList.contains('active')) {
          closeFAQItem(i);
        }
      });
      
      // Open if it was not active
      if (!isActive) {
        openFAQItem(item);
      }
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach(item => {
      if (!item.classList.contains('active')) return;
      const content = item.querySelector('.faq-content');
      if (content) {
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });
}
