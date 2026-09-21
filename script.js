/* ============================================================
   🌹  ROMANTIC SURPRISE GIFT — JAVASCRIPT
   ============================================================ */

(() => {
  'use strict';

  // ── Configuration ───────────────────────────────────────────
  const CONFIG = {
    secretWord: 'love',                       // Case-insensitive
    targetDate: new Date('2026-09-24T00:00:00'),  // Countdown target
    welcomeDuration: 3500,                    // ms before dashboard shows
    heartInterval: 2200,                      // ms between floating hearts
    messageRevealDelay: 250,                  // ms between chat message reveals
  };

  const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '🌹', '✨', '💞'];

  // ── DOM Elements ────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const heartsContainer  = $('#hearts-container');
  const landingScreen    = $('#landing-screen');
  const welcomeScreen    = $('#welcome-screen');
  const dashboard        = $('#dashboard');
  const envelope         = $('#envelope');
  const envelopeWrapper  = $('#envelope-wrapper');
  const secretContainer  = $('#secret-container');
  const secretInput      = $('#secret-input');
  const secretBtn        = $('#secret-btn');
  const secretError      = $('#secret-error');
  const giftBox          = $('#gift-box');
  const giftNote         = $('#gift-note');
  const photoModal       = $('#photo-modal');
  const modalOverlay     = $('#modal-overlay');
  const modalClose       = $('#modal-close');

  // ── State ───────────────────────────────────────────────────
  let envelopeTapped = false;
  let giftOpened = false;
  let counterInterval = null;

  // ============================================================
  // 1. FLOATING HEARTS
  // ============================================================
  function createFloatingHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

    // Random properties
    const size = 0.8 + Math.random() * 1.2;
    const left = Math.random() * 100;
    const duration = 5 + Math.random() * 7;
    const delay = Math.random() * 2;

    heart.style.cssText = `
      left: ${left}%;
      font-size: ${size}rem;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    heartsContainer.appendChild(heart);

    // Clean up after animation completes
    setTimeout(() => {
      heart.remove();
    }, (duration + delay) * 1000 + 500);
  }

  // Start hearts loop
  let heartsInterval = setInterval(createFloatingHeart, CONFIG.heartInterval);

  // Create a few hearts immediately
  for (let i = 0; i < 4; i++) {
    setTimeout(createFloatingHeart, i * 400);
  }


  // ============================================================
  // 2. LANDING SCREEN — ENVELOPE INTERACTION
  // ============================================================
  const introPoemContainer = $('#intro-poem-container');
  const introAudio = $('#intro-audio');
  const continueToSecretBtn = $('#continue-to-secret-btn');

  envelopeWrapper.addEventListener('click', () => {
    if (envelopeTapped) return;
    envelopeTapped = true;

    // Open envelope
    envelope.classList.add('open');

    // Show intro poem after envelope animation
    setTimeout(() => {
      introPoemContainer.classList.add('visible');
      if (introAudio) {
        introAudio.volume = 0.8;
        introAudio.play().catch(e => console.log('Audio play prevented:', e));
      }
    }, 800);
  });

  // Continue to secret word
  if (continueToSecretBtn) {
    continueToSecretBtn.addEventListener('click', () => {
      introPoemContainer.classList.remove('visible');
      if (introAudio) {
        introAudio.pause();
      }
      setTimeout(() => {
        secretContainer.classList.add('visible');
        secretInput.focus();
        
        // Subtle pulse on envelope since it's already open
        envelope.style.animation = 'pulse 1.5s ease-in-out infinite';
      }, 500);
    });
  }

  // Secret word validation
  function validateSecret() {
    const value = secretInput.value.trim().toLowerCase();

    if (value === CONFIG.secretWord) {
      // ✅ Correct — proceed to welcome screen
      secretError.classList.remove('visible');
      secretContainer.classList.remove('visible');
      envelope.style.animation = '';

      // show welcome screen
      setTimeout(() => {
        switchScreen(landingScreen, welcomeScreen);
      }, 1400);

      // After welcome → show dashboard
      setTimeout(() => {
        switchScreen(welcomeScreen, dashboard);
        startCounter();
        observeSections();
      }, 1400 + CONFIG.welcomeDuration);

    } else {
      // ❌ Wrong — shake and show error
      secretError.classList.add('visible');
      secretInput.classList.add('shake');
      secretInput.value = '';
      secretInput.focus();

      setTimeout(() => {
        secretInput.classList.remove('shake');
      }, 500);
    }
  }

  secretBtn.addEventListener('click', validateSecret);

  secretInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') validateSecret();
    // Clear error when typing
    secretError.classList.remove('visible');
  });


  // ============================================================
  // 3. SCREEN TRANSITIONS
  // ============================================================
  function switchScreen(from, to) {
    // Fade out current screen
    from.style.animation = 'fadeOut 0.5s ease forwards';

    setTimeout(() => {
      from.classList.remove('active');
      from.style.animation = '';
      to.classList.add('active');
      to.style.animation = 'fadeIn 0.6s ease-out';

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 500);
  }


  // ============================================================
  // 4. COUNTDOWN TIMER
  // ============================================================
  function startCounter() {
    const counterMessage = $('#counter-message');

    function update() {
      const now = new Date();
      const diff = CONFIG.targetDate - now;

      if (diff <= 0) {
        // Date has arrived!
        animateCounterValue('counter-days', 0);
        animateCounterValue('counter-hours', 0);
        animateCounterValue('counter-minutes', 0);
        animateCounterValue('counter-seconds', 0);
        if (counterMessage) {
          counterMessage.textContent = '🎉 Our special day is HERE! 💕';
          counterMessage.style.fontSize = '1.3rem';
        }
        clearInterval(counterInterval);
        // Burst of hearts to celebrate
        for (let i = 0; i < 15; i++) {
          setTimeout(createFloatingHeart, i * 150);
        }
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days    = Math.floor(totalSeconds / 86400);
      const hours   = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      animateCounterValue('counter-days', days);
      animateCounterValue('counter-hours', hours);
      animateCounterValue('counter-minutes', minutes);
      animateCounterValue('counter-seconds', seconds);
    }

    update();
    counterInterval = setInterval(update, 1000);
  }

  function animateCounterValue(id, newValue) {
    const el = document.getElementById(id);
    const formatted = newValue.toLocaleString();

    if (el.textContent !== formatted) {
      el.textContent = formatted;
      // Subtle scale pop on change
      el.style.transform = 'scale(1.1)';
      el.style.transition = 'transform 0.2s ease';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 200);
    }
  }


  // ============================================================
  // 5. SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
  // ============================================================
  function observeSections() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Cards
          if (el.classList.contains('card')) {
            el.classList.add('visible');
          }

          // Timeline items
          if (el.classList.contains('timeline-item')) {
            el.classList.add('visible');
          }



          // Polaroids
          if (el.classList.contains('polaroid')) {
            el.classList.add('visible');
          }

          observer.unobserve(el);
        }
      });
    }, observerOptions);

    // Observe all cards
    $$('.card').forEach((card) => observer.observe(card));

    // Observe timeline items
    $$('.timeline-item').forEach((item) => observer.observe(item));

    // Observe polaroids
    $$('.polaroid').forEach((p) => observer.observe(p));
  }



  // ============================================================
  // 5b. LOVE ROULETTE WHEEL
  // ============================================================
  const WHEEL_ITEMS = [
    { text: 'Movie Night at Home', emoji: '🎬' },
    { text: 'Cook Together', emoji: '👨‍🍳' },
    { text: 'Stargazing Night', emoji: '🌙' },
    { text: 'Write Love Letters', emoji: '💌' },
    { text: 'Sunset Walk Together', emoji: '🌅' },
    { text: 'Dance in the Living Room', emoji: '💃' },
    { text: 'Plan Our Dream Trip', emoji: '✈️' },
    { text: 'Photo Shoot Day', emoji: '📸' },
  ];

  const WHEEL_COLORS = [
    '#f48fb1', '#f06292', '#ec407a', '#e91e63',
    '#f8bbd0', '#f48fb1', '#f06292', '#ec407a',
  ];

  const wheelCanvas = $('#wheel-canvas');
  const spinBtn = $('#spin-btn');
  const wheelResult = $('#wheel-result');
  const resultEmoji = $('#result-emoji');
  const resultText = $('#result-text');
  let currentAngle = 0;
  let isSpinning = false;

  function drawWheel() {
    if (!wheelCanvas) return;
    const ctx = wheelCanvas.getContext('2d');
    const size = wheelCanvas.width;
    const center = size / 2;
    const radius = center - 5;
    const segments = WHEEL_ITEMS.length;
    const arc = (Math.PI * 2) / segments;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < segments; i++) {
      const startAngle = currentAngle + i * arc;
      const endAngle = startAngle + arc;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arc / 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Emoji
      ctx.font = '20px serif';
      ctx.fillText(WHEEL_ITEMS[i].emoji, radius * 0.55, 0);

      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = var_rose || '#e8849e';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '14px serif';
    ctx.fillStyle = '#e91e63';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', center, center);
  }

  const var_rose = '#e8849e';

  function spinWheel() {
    if (isSpinning || !wheelCanvas) return;
    isSpinning = true;
    spinBtn.disabled = true;
    wheelResult.classList.remove('visible');
    wheelCanvas.classList.add('spinning');

    const spinDuration = 4000;
    const totalRotation = Math.PI * 2 * (5 + Math.random() * 5); // 5-10 full rotations
    const startAngle = currentAngle;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentAngle = startAngle + totalRotation * eased;

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine winner
        const segments = WHEEL_ITEMS.length;
        const arc = (Math.PI * 2) / segments;
        const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        // The pointer is at the top (270deg = 3π/2)
        const pointerAngle = (Math.PI * 1.5 - normalizedAngle + Math.PI * 2) % (Math.PI * 2);
        const winnerIndex = Math.floor(pointerAngle / arc) % segments;

        // Show result
        resultEmoji.textContent = WHEEL_ITEMS[winnerIndex].emoji;
        resultText.textContent = WHEEL_ITEMS[winnerIndex].text;
        wheelResult.classList.add('visible');
        wheelCanvas.classList.remove('spinning');

        isSpinning = false;
        spinBtn.disabled = false;

        // Celebration sparkles
        createSparkles(wheelCanvas, 8);
      }
    }

    requestAnimationFrame(animate);
  }

  if (spinBtn) {
    spinBtn.addEventListener('click', spinWheel);
  }

  // Initial draw
  drawWheel();


  // ============================================================
  // 5c. LOVE LETTER INTERACTION
  // ============================================================
  const letterRevealBtn = $('#letter-reveal-btn');
  const letterRevealWrapper = $('#letter-reveal-wrapper');
  const loveLetterContent = $('#love-letter-content');
  const loveAudio = $('#love-audio');
  const loveVideo = $('#hand-kiss-video');

  if (letterRevealBtn) {
    letterRevealBtn.addEventListener('click', () => {
      // Hide button
      letterRevealWrapper.classList.add('hidden');
      
      // Show letter (triggers CSS animations)
      loveLetterContent.classList.add('visible');

      // Play audio
      if (loveAudio) {
        loveAudio.volume = 0.8;
        loveAudio.play().catch(e => console.log('Audio autoplay prevented:', e));
      }
      
      // Ensure video is playing (sometimes browsers pause if out of view)
      if (loveVideo) {
        loveVideo.play().catch(e => console.log('Video play prevented:', e));
      }
    });
  }

  // ============================================================
  // 6. GIFT BOX INTERACTION
  // ============================================================
  giftBox.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;

    // Open the lid
    giftBox.classList.add('open');

    // Create sparkle particles
    createSparkles(giftBox, 12);

    // Show the note after lid animation
    setTimeout(() => {
      giftNote.classList.add('visible');
    }, 800);
  });

  function createSparkles(anchor, count) {
    const rect = anchor.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const colors = ['#f48fb1', '#ec407a', '#ffd54f', '#ff80ab', '#f8bbd0', '#e91e63'];

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle-particle';

      const angle = (Math.PI * 2 * i) / count;
      const distance = 50 + Math.random() * 80;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 30;

      spark.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        background: ${colors[i % colors.length]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation: sparkleFloat ${0.6 + Math.random() * 0.5}s ease-out forwards;
        animation-delay: ${i * 40}ms;
      `;

      document.body.appendChild(spark);

      setTimeout(() => spark.remove(), 1500);
    }
  }

  // ============================================================
  // 7. REASON CARDS FLIP
  // ============================================================
  const reasonCards = $$('.reason-card');
  reasonCards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');

      // Create mini sparkles on first flip
      if (card.classList.contains('flipped') && !card.dataset.revealed) {
        card.dataset.revealed = 'true';
        createSparkles(card, 6);
      }
    });
  });


  // ============================================================
  // 8. ENGAGEMENT PHOTO MODAL
  // ============================================================
  const engagementTimeline = $('#engagement-timeline');

  if (engagementTimeline) {
    engagementTimeline.addEventListener('click', () => {
      openModal();
    });
  }

  function openModal() {
    photoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Animate photos in with stagger
    const photos = $$('.modal-photo');
    photos.forEach((photo, i) => {
      photo.style.opacity = '0';
      photo.style.transform = 'scale(0.8) translateY(20px)';
      setTimeout(() => {
        photo.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        photo.style.opacity = '1';
        photo.style.transform = 'scale(1) translateY(0)';
      }, 100 + i * 80);
    });
  }

  function closeModal() {
    photoModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal.classList.contains('active')) {
      closeModal();
    }
  });

  // ============================================================
  // 8. SHOW MORE MEMORIES TOGGLE
  // ============================================================
  const showMoreBtn = $('#show-more-btn');
  const moreMemoriesGrid = $('#more-memories-grid');

  if (showMoreBtn && moreMemoriesGrid) {
    showMoreBtn.addEventListener('click', () => {
      const isExpanded = moreMemoriesGrid.classList.contains('visible');

      if (isExpanded) {
        moreMemoriesGrid.classList.remove('visible');
        showMoreBtn.classList.remove('expanded');
        showMoreBtn.querySelector('span:first-child').textContent = 'View All Our Photos';
      } else {
        moreMemoriesGrid.classList.add('visible');
        showMoreBtn.classList.add('expanded');
        showMoreBtn.querySelector('span:first-child').textContent = 'Show Less';

        // Animate memory cards in
        const cards = moreMemoriesGrid.querySelectorAll('.memory-card');
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, i * 50);
        });
      }
    });
  }


  // ============================================================
  // 9. ACCESSIBILITY & CLEANUP
  // ============================================================

  // Reduce motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    clearInterval(heartsInterval);
    document.documentElement.style.setProperty('--animation-duration', '0s');
  }

  // Clean up on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(heartsInterval);
    } else {
      heartsInterval = setInterval(createFloatingHeart, CONFIG.heartInterval);
    }
  });

})();
