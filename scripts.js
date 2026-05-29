const starfieldCanvas = document.getElementById('starfield-canvas');
const starfieldCtx = starfieldCanvas?.getContext('2d');
const starCount = 800;
const stars = [];
let starWidth = window.innerWidth;
let starHeight = window.innerHeight;
let centerX = starWidth / 2;
let centerY = starHeight / 2;
let warpScale = 1;
let warpTarget = 1;
const baseSpeed = 0.0018;
const slowSpeed = 1;
const maxWarpScale = 6;
const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function resizeStarfield() {
  starWidth = window.innerWidth;
  starHeight = window.innerHeight;
  centerX = starWidth / 2;
  centerY = starHeight / 2;
  if (!starfieldCanvas || !starfieldCtx) return;
  starfieldCanvas.width = starWidth * window.devicePixelRatio;
  starfieldCanvas.height = starHeight * window.devicePixelRatio;
  starfieldCanvas.style.width = `${starWidth}px`;
  starfieldCanvas.style.height = `${starHeight}px`;
  starfieldCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function createStar() {
  return {
    x: (Math.random() - 0.5) * starWidth,
    y: (Math.random() - 0.5) * starHeight,
    z: Math.random() * starWidth + 1,
    pz: null,
  };
}

function initializeStars() {
  stars.length = 0;
  for (let i = 0; i < starCount; i += 1) {
    stars.push(createStar());
  }
}

function updateStar(star, speed) {
  star.pz = star.z;
  star.z -= speed;
  if (star.z <= 1) {
    Object.assign(star, createStar(), { z: starWidth, pz: starWidth });
  }
}

function drawStar(star) {
  const sx = centerX + (star.x / star.z) * starWidth;
  const sy = centerY + (star.y / star.z) * starWidth;
  const px = centerX + (star.x / star.pz) * starWidth;
  const py = centerY + (star.y / star.pz) * starWidth;
  const alpha = Math.max(0, Math.min(1, 1 - star.z / starWidth));

  starfieldCtx.strokeStyle = `rgba(120, 245, 255, ${0.12 + alpha * 0.6})`;
  starfieldCtx.lineWidth = Math.max(1, alpha * 2.4);
  starfieldCtx.beginPath();
  starfieldCtx.moveTo(px, py);
  starfieldCtx.lineTo(sx, sy);
  starfieldCtx.stroke();
}

function renderStarfield() {
  if (!starfieldCtx) return;

  starfieldCtx.clearRect(0, 0, starWidth, starHeight);
  starfieldCtx.fillStyle = 'rgba(4, 8, 16, 0.2)';
  starfieldCtx.fillRect(0, 0, starWidth, starHeight);

  warpScale = lerp(warpScale, warpTarget, 0.08);
  warpTarget = lerp(warpTarget, 1, 0.02);
  const speed = baseSpeed * warpScale * starWidth;

  stars.forEach((star) => {
    updateStar(star, speed);
    drawStar(star);
  });

  requestAnimationFrame(renderStarfield);
}

function triggerWarp() {
  warpTarget = Math.min(maxWarpScale, warpTarget + 3);
}

if (starfieldCanvas && starfieldCtx) {
  resizeStarfield();
  initializeStars();
  window.addEventListener('resize', () => {
    resizeStarfield();
    initializeStars();
  });
  window.addEventListener('wheel', () => {
    triggerWarp();
  }, { passive: true });
  window.addEventListener('touchmove', () => {
    triggerWarp();
  }, { passive: true });
  requestAnimationFrame(renderStarfield);
}

const heroThreeContainer = document.getElementById('hero-threejs');
if (heroThreeContainer && window.THREE) {
  const heroScene = new THREE.Scene();
  const heroCamera = new THREE.PerspectiveCamera(45, heroThreeContainer.clientWidth / heroThreeContainer.clientHeight, 0.1, 1000);
  heroCamera.position.set(0, 0, 4.5);

  const heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  heroRenderer.setPixelRatio(window.devicePixelRatio);
  heroRenderer.setSize(heroThreeContainer.clientWidth, heroThreeContainer.clientHeight);
  heroThreeContainer.appendChild(heroRenderer.domElement);

  const heroGeometry = new THREE.IcosahedronGeometry(1, 1);
  const heroMaterial = new THREE.MeshBasicMaterial({ color: 0x38f8ff, wireframe: true });
  const heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
  heroScene.add(heroMesh);

  let mouseOffsetX = 0;
  let mouseOffsetY = 0;
  let baseRotationX = 0;
  let baseRotationY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseOffsetX = (event.clientX / window.innerWidth - 0.5) * 0.4;
    mouseOffsetY = (event.clientY / window.innerHeight - 0.5) * 0.4;
  });

  window.addEventListener('resize', () => {
    heroCamera.aspect = heroThreeContainer.clientWidth / heroThreeContainer.clientHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(heroThreeContainer.clientWidth, heroThreeContainer.clientHeight);
  });

  const renderHeroShape = () => {
    baseRotationX += 0.002;
    baseRotationY += 0.003;

    const targetX = baseRotationX + mouseOffsetY;
    const targetY = baseRotationY + mouseOffsetX;

    heroMesh.rotation.x += (targetX - heroMesh.rotation.x) * 0.06;
    heroMesh.rotation.y += (targetY - heroMesh.rotation.y) * 0.06;

    heroRenderer.render(heroScene, heroCamera);
    requestAnimationFrame(renderHeroShape);
  };

  renderHeroShape();
}

const preloader = document.getElementById('preloader');
const preloaderProgress = document.querySelector('.preloader-progress');
const preloaderText = document.getElementById('preloader-text');
const preloaderMessages = ['INITIALIZING...', 'ESTABLISHING LINK...', 'ACCESS GRANTED'];
let preloaderStart = null;
let nextTextIndex = 1;

function animatePreloader(timestamp) {
  if (!preloaderStart) preloaderStart = timestamp;
  const elapsed = timestamp - preloaderStart;
  const progress = Math.min(1, elapsed / 1500);

  if (preloaderProgress) {
    preloaderProgress.style.transform = `scaleX(${progress})`;
  }

  if (elapsed > 700 && nextTextIndex === 1) {
    if (preloaderText) preloaderText.textContent = preloaderMessages[1];
    nextTextIndex = 2;
  }

  if (elapsed > 1200 && nextTextIndex === 2) {
    if (preloaderText) preloaderText.textContent = preloaderMessages[2];
    nextTextIndex = 3;
  }

  if (elapsed < 1800) {
    requestAnimationFrame(animatePreloader);
    return;
  }

  if (preloader) {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.remove();
    }, 700);
  }
}

if (preloader) {
  requestAnimationFrame(animatePreloader);
}

const revealElements = document.querySelectorAll('.reveal');
const observerOptions = {
  threshold: 0.15,
};

function scrambleText(element, duration = 400) {
  if (element.dataset.scrambling === 'true') return;
  const originalText = element.innerText;
  element.dataset.scrambling = 'true';
  const interval = 30;
  let elapsed = 0;
  const scrambleInterval = setInterval(() => {
    elapsed += interval;
    element.innerText = originalText
      .split('')
      .map((char) => {
        if (char === ' ') return ' ';
        return alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
      })
      .join('');

    if (elapsed >= duration) {
      clearInterval(scrambleInterval);
      element.innerText = originalText;
      delete element.dataset.scrambling;
    }
  }, interval);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const target = entry.target;
    target.classList.add('is-visible');

    if (target.matches('.skill-item.reveal')) {
      // Only scramble if the skill item doesn't contain icon elements
      if (!target.querySelector('i[class*="devicon"]') && !target.querySelector('img')) {
        scrambleText(target);
      }
    }

    target.querySelectorAll('.skill-item.reveal').forEach((skill) => {
      // Only scramble if the skill item doesn't contain icon elements
      if (!skill.querySelector('i[class*="devicon"]') && !skill.querySelector('img')) {
        scrambleText(skill);
      }
    });

    observer.unobserve(target);
  });
}, observerOptions);

revealElements.forEach((el, index) => {
  el.style.transitionDelay = `${index * 100}ms`;
  revealObserver.observe(el);
});

const cardScene = document.querySelector('.card-scene');
const cardSurface = document.querySelector('.card-surface');

if (cardScene && cardSurface) {
  cardScene.addEventListener('pointermove', (event) => {
    const bounds = cardScene.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const rotateY = (x / bounds.width) * 18;
    const rotateX = -(y / bounds.height) * 18;
    cardSurface.style.transform = `rotateX(${14 + rotateX}deg) rotateY(${-14 + rotateY}deg) translateZ(42px)`;
  });

  cardScene.addEventListener('pointerleave', () => {
    cardSurface.style.transform = 'rotateX(14deg) rotateY(-14deg) translateZ(35px)';
  });
}

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let ringX = cursorX;
let ringY = cursorY;

function animateCursor() {
  ringX += (cursorX - ringX) * 0.18;
  ringY += (cursorY - ringY) * 0.18;

  if (cursorDot) {
    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
  }
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }

  requestAnimationFrame(animateCursor);
}

document.addEventListener('mousemove', (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
});

document.addEventListener('mouseleave', () => {
  if (cursorDot) cursorDot.style.opacity = '0';
  if (cursorRing) cursorRing.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  if (cursorDot) cursorDot.style.opacity = '1';
  if (cursorRing) cursorRing.style.opacity = '1';
});

const interactiveCursorElements = document.querySelectorAll('a, button');
interactiveCursorElements.forEach((element) => {
  element.addEventListener('mouseenter', () => cursorRing?.classList.add('hovered'));
  element.addEventListener('mouseleave', () => cursorRing?.classList.remove('hovered'));
});

const navLinks = document.querySelectorAll('.nav-links a');
const navActiveIndicator = document.querySelector('.nav-active-indicator');
const navContainer = document.querySelector('.nav-links');

function setActiveNav(link) {
  if (!navContainer || !navActiveIndicator || !link) return;

  navLinks.forEach((item) => item.classList.toggle('active', item === link));

  const linkRect = link.getBoundingClientRect();
  const containerRect = navContainer.getBoundingClientRect();
  const offsetX = linkRect.left - containerRect.left;

  navActiveIndicator.style.transform = `translateX(${offsetX}px)`;
  navActiveIndicator.style.width = `${linkRect.width}px`;
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const sectionId = entry.target.id;
    const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
    if (activeLink) {
      setActiveNav(activeLink);
    }
  });
}, {
  threshold: 0.45,
});

['about', 'skills', 'projects', 'contact'].forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

window.addEventListener('resize', () => {
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) setActiveNav(activeLink);
});

window.addEventListener('load', () => {
  const firstLink = document.querySelector('.nav-links a');
  if (firstLink) setActiveNav(firstLink);
});

const projectModal = document.getElementById('project-modal');
const projectModalClose = document.getElementById('project-modal-close');
const projectModalBackButtons = document.querySelectorAll('[data-close-project]');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalSubtitle = document.getElementById('project-modal-subtitle');
const projectModalIntro = document.getElementById('project-modal-intro');
const projectModalDesignTitle = document.getElementById('project-modal-design-title');
const projectModalDesign = document.getElementById('project-modal-design');
const projectModalArchitecture = document.getElementById('project-modal-architecture');
const projectModalDecisions = document.getElementById('project-modal-decisions');
const projectModalTech = document.getElementById('project-modal-tech');
const projectModalPrimary = document.getElementById('project-modal-primary');

const projectDetails = {
  empathai: {
    title: 'EmpathAI',
    subtitle: 'Privacy-First Multimodal Affective Computing Interface',
    intro: 'Mental health support is inaccessible, and traditional AI chatbots are blind. EmpathAI implements a Hybrid AI Architecture, an Edge AI approach where all facial detection happens locally within the browser to guarantee zero biometric video data is ever sent to a server.',
    designTitle: 'The Design Intent',
    design: 'The goal was to make conversational AI emotionally aware without compromising privacy. The interface reads local facial-expression signals, converts them into lightweight emotional context, and uses that context to shape more supportive responses.',
    architecture: 'The application uses a decoupled Client-Server architecture. The Edge Layer runs SSD MobileNet V1 locally to extract emotional tags. A lightweight JSON payload is sent via a FastAPI asynchronous endpoint. The Logic Layer performs Context-Aware Prompt Engineering using Google Gemini Pro, adapting the AI persona to the user emotional state.',
    decisions: [
      'Browser-based Edge computing via Face-API.js for absolute biometric privacy.',
      'High-performance asynchronous FastAPI backend.',
      'Context-Aware Prompt Engineering mapping 7 distinct emotional states in real time.',
    ],
    techLabel: 'EmpathAI technology stack',
    tech: [
      { icon: 'devicon-python-plain colored', label: 'Python' },
      { icon: 'devicon-fastapi-plain colored', label: 'FastAPI' },
      { icon: 'devicon-javascript-plain colored', label: 'JavaScript' },
      { symbol: 'API', label: 'Face API' },
      { symbol: 'AI', label: 'Gemini' },
    ],
    actionLabel: 'Access GitHub Repo',
    actionUrl: 'https://github.com/Sudarsan-K2/Sales-Demand-Forecasting.git',
  },
  'forecast-inventory': {
    title: 'Sales Demand Forecasting and Decision Support System',
    subtitle: 'AI-Powered Sales Forecasting and Inventory Optimization Platform',
    intro: 'A decision support system built with FastAPI, Facebook Prophet, and LangGraph. It combines time-series forecasting, natural language querying, RAG-based supply chain intelligence, and inventory optimization into one operational dashboard.',
    designTitle: 'Decision System Goal',
    design: 'The platform helps teams forecast demand, understand business risks, and make inventory decisions from both structured sales data and internal supply chain documents. It turns historical sales, promotions, oil prices, weather risk, and natural-language questions into practical planning signals.',
    architecture: 'The React frontend connects to FastAPI endpoints for forecasting, inventory, chat, and retraining. Prophet JSON models power sales predictions with promotion and oil-price regressors. PostgreSQL stores historical sales, ChromaDB supports semantic document retrieval, and a LangGraph multi-agent ReAct assistant routes analysis through Analyst, Executive, and Risk agents with Text-to-SQL.',
    decisions: [
      'Prophet forecasting models use promotion and oil-price regressors for stronger demand estimates.',
      'Inventory logic includes EOQ, safety stock, and stockout probability for decision-ready recommendations.',
      'LangGraph coordinates Analyst, Executive, and Risk agents for natural-language analytics and Text-to-SQL.',
      'RAG adds semantic search across internal supply chain documents through ChromaDB.',
      'Live oil-price and weather-risk integrations support market-aware forecasting.',
    ],
    techLabel: 'Sales forecasting and inventory technology stack',
    tech: [
      { icon: 'devicon-react-original colored', label: 'React' },
      { icon: 'devicon-fastapi-plain colored', label: 'FastAPI' },
      { icon: 'devicon-python-plain colored', label: 'Prophet' },
      { icon: 'devicon-postgresql-plain colored', label: 'PostgreSQL' },
      { symbol: 'LG', label: 'LangGraph' },
      { symbol: 'RAG', label: 'ChromaDB' },
      { symbol: 'SQL', label: 'Text-to-SQL' },
      { symbol: 'API', label: 'Open-Meteo' },
    ],
    actionLabel: 'Access GitHub Repo',
    actionUrl: 'https://github.com/Sudarsan-K2/Sales-Demand-Forecasting.git',
  },
  safellm: {
    title: 'SafeLLM: Local AI Security Proxy',
    subtitle: 'A local proxy middleware designed to sanitize prompts and files before cloud LLM inference.',
    intro: 'SafeLLM is a local proxy middleware interface designed to protect sensitive data before it leaves the local network. Users can type queries or upload source code files, while the Python backend securely strips credentials, email records, phone numbers, and payment patterns before forwarding the sanitized text payload to the Gemini API.',
    designTitle: 'Security Intent',
    design: 'The system addresses the privacy and data compliance risks of accidentally leaking internal secrets, passwords, or PII into public AI models. It acts as a local sanitization control point where prompts and files are parsed in memory, audited, and scrubbed into safe compliance masks before cloud transit.',
    architecture: 'A custom Tailwind CSS dashboard client communicates with a FastAPI local proxy through protected API routes using JWT bearer tokens. The backend validates token authenticity, processes file-based text uploads entirely within local memory buffers, blocks dangerous binary formats, applies real-time regular-expression sanitizers, persists user session logs in SQLite, and forwards only sanitized content to the Gemini API.',
    decisions: [
      'Migrated session management to a server-side SQLite relational database for reliable history tracking.',
      'Implemented cryptographic JWT bearer token authentication across protected API endpoints.',
      'Integrated bcrypt salting and hashing to completely eliminate plaintext password storage.',
      'Enforced strict per-user data isolation via user-scoped backend database queries.',
      'Built regex-driven filters to dynamically redact sensitive patterns like emails and passwords.',
      'Implemented a file gateway sandbox that blocks executable extensions (.exe, .bat) before processing text.',
    ],
    techLabel: 'SafeLLM technology stack',
    tech: [
      { icon: 'devicon-python-plain colored', label: 'Python' },
      { icon: 'devicon-fastapi-plain colored', label: 'FastAPI' },
      { icon: 'devicon-sqlite-plain colored', label: 'SQLite' },
      { symbol: 'JWT', label: 'Auth' },
      { symbol: 'BC', label: 'bcrypt' },
      { symbol: 'AI', label: 'Gemini 2.5' },
      { symbol: 'PII', label: 'Sanitizers' },
      { symbol: 'SEC', label: 'Proxy' },
    ],
    actionLabel: 'Access GitHub Repo',
    actionUrl: 'https://github.com/Sudarsan-K2/SafeLLM-Gateway.git',
  },
};

function renderProjectTech(techItems) {
  if (!projectModalTech) return;

  projectModalTech.innerHTML = techItems.map((item) => {
    if (item.icon) {
      return `<div class="project-tech-icon"><i class="${item.icon}" aria-hidden="true"></i><span>${item.label}</span></div>`;
    }

    return `<div class="project-tech-icon"><span class="project-tech-symbol">${item.symbol}</span><span>${item.label}</span></div>`;
  }).join('');
}

function setProjectModalContent(projectId) {
  const details = projectDetails[projectId] || projectDetails.empathai;

  if (projectModalTitle) projectModalTitle.textContent = details.title;
  if (projectModalSubtitle) projectModalSubtitle.textContent = details.subtitle;
  if (projectModalIntro) projectModalIntro.textContent = details.intro;
  if (projectModalDesignTitle) projectModalDesignTitle.textContent = details.designTitle;
  if (projectModalDesign) projectModalDesign.textContent = details.design;
  if (projectModalArchitecture) projectModalArchitecture.textContent = details.architecture;
  if (projectModalDecisions) {
    projectModalDecisions.innerHTML = details.decisions.map((decision) => `<li>${decision}</li>`).join('');
  }
  if (projectModalTech) {
    projectModalTech.setAttribute('aria-label', details.techLabel);
    renderProjectTech(details.tech);
  }
  if (projectModalPrimary) {
    projectModalPrimary.textContent = details.actionLabel;
    projectModalPrimary.setAttribute('href', details.actionUrl);
    projectModalPrimary.setAttribute('target', '_blank');
    projectModalPrimary.setAttribute('rel', 'noopener noreferrer');
  }
}

function openProjectModal(event) {
  if (!projectModal) return;
  const projectId = event?.currentTarget?.dataset.openProject || 'empathai';
  setProjectModalContent(projectId);
  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  projectModalClose?.focus();
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open-project]');
  if (!opener) return;
  openProjectModal({ currentTarget: opener });
});

projectModalClose?.addEventListener('click', closeProjectModal);

projectModalBackButtons.forEach((button) => {
  button.addEventListener('click', () => {
    closeProjectModal();
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  });
});

projectModal?.addEventListener('click', (event) => {
  if (event.target === projectModal) {
    closeProjectModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectModal?.classList.contains('is-open')) {
    closeProjectModal();
  }
});

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('.form-button');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16.5a9 9 0 0 0 15.26-5.26M21 3v5h-5"/></svg>';
    
    fetch(contactForm.action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: contactForm.email.value,
        message: contactForm.message.value
      })
    })
    .then(response => {
      if (response.ok) {
        contactForm.reset();
        submitBtn.innerHTML = '<span>✓ Message Sent!</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
        submitBtn.style.borderColor = '#10b981';
        submitBtn.style.color = '#10b981';
        submitBtn.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.4)';
        
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.borderColor = '';
          submitBtn.style.color = '';
          submitBtn.style.boxShadow = '';
        }, 3500);
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(error => {
      submitBtn.innerHTML = '<span>✗ Error</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      submitBtn.style.borderColor = '#ef4444';
      submitBtn.style.color = '#ef4444';
      submitBtn.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.4)';
      submitBtn.disabled = false;
      
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.borderColor = '';
        submitBtn.style.color = '';
        submitBtn.style.boxShadow = '';
      }, 3500);
    });
  });
}

const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
formInputs.forEach((input) => {
  input.addEventListener('mousemove', (e) => {
    const rect = input.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const intensity = Math.max(0, 1 - distance / maxDistance);
    
    input.style.boxShadow = `
      inset 0 0 0 2px transparent,
      0 0 ${20 + intensity * 15}px rgba(94, 234, 212, ${0.3 + intensity * 0.4}),
      0 0 ${40 + intensity * 25}px rgba(56, 189, 248, ${0.15 + intensity * 0.25})
    `;
  });
  
  input.addEventListener('mouseleave', () => {
    input.style.boxShadow = '';
  });
  
  input.addEventListener('mouseenter', () => {
    input.style.animation = 'borderTravel 3s linear infinite';
  });
});

requestAnimationFrame(animateCursor);
