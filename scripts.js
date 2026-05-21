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
const projectModalOpeners = document.querySelectorAll('[data-open-project]');
const projectModalBackButtons = document.querySelectorAll('[data-close-project]');

function openProjectModal() {
  if (!projectModal) return;
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

projectModalOpeners.forEach((button) => {
  button.addEventListener('click', openProjectModal);
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
