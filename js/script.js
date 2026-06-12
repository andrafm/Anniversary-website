document.addEventListener('DOMContentLoaded', function () {
  // Prevent browser from restoring previous scroll position on navigation/refresh
  if ('scrollRestoration' in history) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
  }
  // Ensure we are at the top when the page loads or before unloading
  window.scrollTo(0, 0);
  window.addEventListener('beforeunload', function () { window.scrollTo(0, 0); });
  const loadingScreen = document.querySelector('.loading-screen');
  const startButton = document.querySelector('#start-journey');
  const nextSection = document.querySelector('#gratitude');
  const progressBar = document.querySelector('.progress-bar');
  const backTop = document.querySelector('.back-top');
  const revealItems = document.querySelectorAll('.fade-up');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const letterText = document.querySelector('.letter-body');
  const counterNodes = {
    years: document.querySelector('#count-years'),
    months: document.querySelector('#count-months'),
    days: document.querySelector('#count-days'),
    hours: document.querySelector('#count-hours'),
    minutes: document.querySelector('#count-minutes'),
    seconds: document.querySelector('#count-seconds')
  };
  const relationshipDate = new Date('2025-06-18T07:00:00');
  const finalSurpriseButton = document.querySelector('#btn-final-surprise');
  const popupOverlay = document.querySelector('.popup-overlay');
  const popupClose = document.querySelector('.popup-close');
  const popupNext = document.querySelector('#popup-next');
  const popupTitle = document.querySelector('#popup-title');
  const popupMessage = document.querySelector('#popup-message');
  const popupVideo = document.querySelector('#popup-video');
  const heartsContainer = document.querySelector('.hearts-container');
  const audioPlayer = document.querySelector('#our-song');
  const mainGalleryImage = document.querySelector('#main-gallery-image');
  const memoryGalleryGrid = document.querySelector('.gallery-grid');
  const memoryGalleryCount = Number(memoryGalleryGrid?.dataset.memoryCount || 20);
  const flipCards = document.querySelectorAll('.flip-card');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let cursorHeart = null;
  let audioWasPlayingBeforeVideo = false;

  function createMemoryThumb(index) {
    const button = document.createElement('button');
    button.className = 'gallery-thumb';
    button.type = 'button';
    button.dataset.src = `assets/images/memory/memory${index}.jpg`;
    button.innerHTML = `<img src="assets/images/memory/memory${index}.jpg" alt="Preview foto ${index}" loading="lazy" />`;
    return button;
  }

  function fillMemoryGallery(count) {
    if (!memoryGalleryGrid) return;
    const existingCount = memoryGalleryGrid.querySelectorAll('.gallery-thumb').length;
    for (let index = existingCount + 1; index <= count; index += 1) {
      memoryGalleryGrid.appendChild(createMemoryThumb(index));
    }
  }

  fillMemoryGallery(memoryGalleryCount);

  let galleryThumbs = Array.from(document.querySelectorAll('.gallery-thumb'));

  const ambientState = {
    isMobile: window.matchMedia('(max-width: 768px)').matches,
    sparkleInterval: 320,
    heartInterval: 420,
    bokehInterval: 520,
    maxSparkles: 32,
    maxHearts: 16,
    maxBokeh: 14,
    sparkleSizeRange: [1.8, 4.5],
    bokehSizeRange: [54, 118],
    heartSizeRange: [10, 18]
  };
  let ambientRoot = null;
  let sparkleLayer = null;
  let bokehLayer = null;
  let heartLayer = null;
  let ambientLastSparkle = 0;
  let ambientLastHeart = 0;
  let ambientLastBokeh = 0;

  const typewriterText = [
    'Terima kasih sudah menjadi bagian terindah dalam hidupku.',
    'Tidak semua perjalanan selalu mudah, tetapi aku bersyukur karena kita selalu berusaha bertahan dan tumbuh bersama.',
    'Aku berharap kita bisa terus melangkah, saling mendukung, saling menguatkan, dan mewujudkan mimpi-mimpi yang selama ini kita ceritakan.',
    'Semoga kita bisa menjadi keluarga yang utuh, sakinah, mawaddah, warahmah, dan selalu diberi kebahagiaan dalam setiap langkah yang kita jalani.',
    'Aku mencintaimu ❤️'
  ];

  const popupSteps = [
    'Sebelum lanjut....\nAku ingin mengajakmu mengingat hari yang mengubah hidup kita selamanya.'
  ];
  let popupStep = 0;
  let galleryIndex = 0;
  let galleryTimer = null;

  const galleryImages = galleryThumbs.map((thumb) => thumb.dataset.src).filter(Boolean);

  function setupLoveCursor() {
    if (isTouchDevice) return;
    document.body.classList.add('custom-cursor');
    cursorHeart = document.createElement('span');
    cursorHeart.className = 'cursor-heart';
    document.body.appendChild(cursorHeart);

    document.addEventListener('pointermove', (event) => {
      if (!cursorHeart) return;
      cursorHeart.style.left = `${event.clientX}px`;
      cursorHeart.style.top = `${event.clientY}px`;
      cursorHeart.style.opacity = '1';
    });

    document.addEventListener('pointerleave', () => {
      if (cursorHeart) cursorHeart.style.opacity = '0';
    });

    document.addEventListener('pointerenter', () => {
      if (cursorHeart) cursorHeart.style.opacity = '1';
    });
  }

  function fadeInLoaded() {
    setTimeout(() => {
      if (loadingScreen) loadingScreen.classList.add('hide');
      attemptPlayAudio();
      setTimeout(() => {
        if (loadingScreen && loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 900);
    }, 3000);
  }

  function attemptPlayAudio() {
    if (!audioPlayer) return;
    audioPlayer.volume = 0.68;
    audioPlayer.loop = true;
    audioPlayer.muted = false;
    audioPlayer.play().catch(() => {
      document.body.addEventListener('click', function playOnInteraction() {
        audioPlayer.play().catch(() => {});
        document.body.removeEventListener('click', playOnInteraction);
      });
    });
  }

  function showResumeAudioButton() {
    if (document.getElementById('resume-audio-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'resume-audio-btn';
    btn.className = 'resume-audio';
    btn.type = 'button';
    btn.textContent = 'Lanjutkan Musik';
    btn.addEventListener('click', () => {
      if (!audioPlayer) return;
      audioPlayer.play().then(() => {
        try { btn.remove(); } catch (e) {}
      }).catch(() => {
        // still blocked — keep the button for another click
      });
    });
    document.body.appendChild(btn);
    // auto-remove after 20s if unused
    setTimeout(() => { const el = document.getElementById('resume-audio-btn'); if (el) el.remove(); }, 20000);
  }

  // Ensure background audio reliably loops: if 'ended' fires, restart playback.
  if (audioPlayer) {
    audioPlayer.addEventListener('ended', () => {
      try {
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(() => {});
      } catch (e) {}
    });
  }

  function scrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${value}%`;
    backTop.classList.toggle('show', scrollTop > 400);
  }

  function revealOnScroll(entries) {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('visible');
        el.classList.remove('fade-down');
      } else {
        // element left viewport — decide direction
        if (entry.boundingClientRect.top < 0) {
          // scrolled up past top: animate fade-down
          el.classList.remove('visible');
          el.classList.add('fade-down');
          // clear class after animation to allow re-animation later
          setTimeout(() => el.classList.remove('fade-down'), 700);
        } else {
          // scrolled down past bottom: reset to hidden (will animate back in when visible)
          el.classList.remove('visible');
        }
      }
    });
  }

  function typeWriter(lines, index = 0, position = 0) {
    if (!letterText || index >= lines.length) return;
    const line = lines[index];
    letterText.textContent += line[position];
    if (position < line.length - 1) {
      // slightly faster typing on reveal
      setTimeout(() => typeWriter(lines, index, position + 1), 18);
    } else {
      letterText.textContent += '\n\n';
      // shorter pause between lines for a brisker flow
      setTimeout(() => typeWriter(lines, index + 1, 0), 120);
    }
  }

  function getRelationshipTime() {
    const now = new Date();
    let years = now.getFullYear() - relationshipDate.getFullYear();
    let months = now.getMonth() - relationshipDate.getMonth();
    let days = now.getDate() - relationshipDate.getDate();
    let hours = now.getHours() - relationshipDate.getHours();
    let minutes = now.getMinutes() - relationshipDate.getMinutes();
    let seconds = now.getSeconds() - relationshipDate.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes -= 1;
    }
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
      days -= 1;
    }
    if (days < 0) {
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += previousMonth;
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    return {
      years: Math.max(years, 0),
      months: Math.max(months, 0),
      days: Math.max(days, 0),
      hours: Math.max(hours, 0),
      minutes: Math.max(minutes, 0),
      seconds: Math.max(seconds, 0)
    };
  }

  function updateCounter() {
    const value = getRelationshipTime();
    Object.entries(counterNodes).forEach(([key, node]) => {
      if (node) {
        node.textContent = String(value[key]).padStart(2, '0');
        node.classList.add('pulse');
        setTimeout(() => node.classList.remove('pulse'), 500);
      }
    });
  }

  function showGalleryImage(index) {
    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    const newSrc = galleryImages[galleryIndex];
    if (mainGalleryImage) {
      // Use an overlay slide element to avoid layout jumps when switching
      const slide = document.createElement('img');
      slide.className = 'gallery-slide';
      slide.loading = 'eager';
      slide.alt = mainGalleryImage.alt || 'Gallery image';
      slide.src = newSrc;

      // place on top of viewer
      const viewer = mainGalleryImage.closest('.gallery-viewer') || document.querySelector('.gallery-viewer');
      if (viewer) {
        viewer.appendChild(slide);
      } else {
        // fallback: replace existing image
        mainGalleryImage.src = newSrc;
        return;
      }

      // when loaded, detect orientation and fade in the overlay
      slide.onload = () => {
        try {
          if (slide.naturalWidth && slide.naturalHeight) {
            if (slide.naturalWidth >= slide.naturalHeight) {
              slide.classList.add('landscape');
              slide.classList.remove('portrait');
            } else {
              slide.classList.add('portrait');
              slide.classList.remove('landscape');
            }
          }
        } catch (e) {}

        // trigger crossfade
        requestAnimationFrame(() => {
          slide.style.opacity = '1';
        });

        // after transition, set main image src and remove overlay
        const cleanup = () => {
          try {
            mainGalleryImage.src = newSrc;
            mainGalleryImage.classList.toggle('landscape', slide.classList.contains('landscape'));
            mainGalleryImage.classList.toggle('portrait', slide.classList.contains('portrait'));
          } catch (e) {}
          slide.removeEventListener('transitionend', cleanup);
          if (slide.parentNode) slide.parentNode.removeChild(slide);
        };

        slide.addEventListener('transitionend', cleanup);
        // safety timeout: remove after 1s if transitionend doesn't fire
        setTimeout(cleanup, 1000);
      };

      // ensure starting opacity 0 so fade works
      slide.style.opacity = '0';
    }
    galleryThumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === galleryIndex);
    });
  }

  function startGalleryAutoplay() {
    clearInterval(galleryTimer);
    const isSmall = window.matchMedia('(max-width: 768px)').matches;
    const interval = isSmall ? 2500 : 3000; // mobile faster, desktop 3s per request
    galleryTimer = setInterval(() => showGalleryImage(galleryIndex + 1), interval);
  }

  // add small prev/next buttons for mobile and wire them
  function restartGalleryAutoplay() {
    clearInterval(galleryTimer);
    // small delay before restarting to allow manual navigation
    setTimeout(() => startGalleryAutoplay(), 800);
  }

  function setPopupMessage(text) {
    if (!popupMessage) return;
    popupMessage.innerHTML = text.replace(/\n/g, '<br>');
  }

  function openPopup() {
    popupStep = 0;
    popupTitle.textContent = 'HAPPY ANNIVERSARY ❤️';
    setPopupMessage(popupSteps[popupStep]);
    popupVideo.classList.remove('active');
    popupVideo.pause();
    popupVideo.currentTime = 0;
    popupNext.textContent = 'Tonton Video';
    popupNext.classList.remove('hidden');
    if (popupClose) popupClose.classList.add('hidden');
    if (popupOverlay) {
      popupOverlay.classList.add('visible');
      popupOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  function closePopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove('visible');
    popupOverlay.setAttribute('aria-hidden', 'true');
    if (popupVideo) {
      try { popupVideo.pause(); } catch (e) {}
    }
    if (popupClose) popupClose.classList.add('hidden');

    // resume background audio only if it was playing before the video
    if (audioWasPlayingBeforeVideo && audioPlayer) {
      audioPlayer.play().catch(() => {});
    }
    audioWasPlayingBeforeVideo = false;
  }

  function handlePopupNext() {
    popupStep += 1;
    if (popupStep < popupSteps.length) {
      setPopupMessage(popupSteps[popupStep]);
      if (popupStep === popupSteps.length - 1) {
        popupNext.textContent = 'Tonton Video';
      }
      return;
    }
    popupTitle.textContent = 'Kenangan Kita';
    setPopupMessage('Andra ❤️ Indah');
    popupVideo.classList.add('active');
    if (popupClose) popupClose.classList.remove('hidden');
    popupNext.classList.add('hidden');
  }

  function createFloatingHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.animation = `floatUp ${3 + Math.random() * 2}s ease forwards`;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 5500);
  }

  function launchConfetti() {
    const count = 28;
    for (let i = 0; i < count; i += 1) {
      const confetti = document.createElement('span');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.background = Math.random() > 0.5 ? 'var(--pink)' : 'var(--rose)';
      confetti.style.animationDelay = `${Math.random() * 0.6}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3600);
    }
  }

  function getRandomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function refreshAmbientMode() {
    ambientState.isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (ambientState.isMobile) {
      ambientState.sparkleInterval = 220;
      ambientState.heartInterval = 360;
      ambientState.bokehInterval = 420;
      ambientState.maxSparkles = 28;
      ambientState.maxHearts = 18;
      ambientState.maxBokeh = 12;
      ambientState.sparkleSizeRange = [2.4, 5.0];
      ambientState.bokehSizeRange = [72, 104];
      ambientState.heartSizeRange = [12, 20];
    } else {
      ambientState.sparkleInterval = 320;
      ambientState.heartInterval = 420;
      ambientState.bokehInterval = 520;
      ambientState.maxSparkles = 32;
      ambientState.maxHearts = 16;
      ambientState.maxBokeh = 14;
      ambientState.sparkleSizeRange = [1.8, 4.5];
      ambientState.bokehSizeRange = [54, 118];
      ambientState.heartSizeRange = [10, 18];
    }
  }

  function createAmbientVisuals() {
    ambientRoot = document.createElement('div');
    ambientRoot.className = 'ambient-visuals';
    ambientRoot.innerHTML = `
      <div class="ambient-glow">
        <span class="glow-spot glow-spot-1"></span>
        <span class="glow-spot glow-spot-2"></span>
        <span class="glow-spot glow-spot-3"></span>
      </div>
      <div class="ambient-sparkle-layer"></div>
      <div class="ambient-bokeh-layer"></div>
      <div class="ambient-heart-layer"></div>
    `;
    document.body.appendChild(ambientRoot);
    sparkleLayer = ambientRoot.querySelector('.ambient-sparkle-layer');
    bokehLayer = ambientRoot.querySelector('.ambient-bokeh-layer');
    heartLayer = ambientRoot.querySelector('.ambient-heart-layer');
  }

  function createAmbientElement(className, styles, container, lifetime = 11000) {
    const element = document.createElement('span');
    element.className = className;
    Object.assign(element.style, styles);
    container.appendChild(element);
    element.addEventListener('animationend', () => element.remove());
    setTimeout(() => element.remove(), lifetime);
  }

  function spawnAmbientSparkle() {
    if (!sparkleLayer) return;
    const maxCount = ambientState.maxSparkles;
    if (sparkleLayer.children.length >= maxCount) return;
    const size = getRandomBetween(...ambientState.sparkleSizeRange);
    createAmbientElement('ambient-sparkle', {
      left: `${getRandomBetween(5, 94)}%`,
      top: `${getRandomBetween(10, 78)}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${getRandomBetween(5.5, 8.5)}s`
    }, sparkleLayer, 9000);
  }

  function spawnAmbientBokeh() {
    if (!bokehLayer) return;
    const maxCount = ambientState.maxBokeh;
    if (bokehLayer.children.length >= maxCount) return;
    const size = getRandomBetween(...ambientState.bokehSizeRange);
    createAmbientElement('ambient-bokeh', {
      left: `${getRandomBetween(-10, 88)}%`,
      top: `${getRandomBetween(8, 74)}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${getRandomBetween(11.5, 16.5)}s`
    }, bokehLayer, 14000);
  }

  function spawnAmbientHeart() {
    if (!heartLayer) return;
    const maxCount = ambientState.maxHearts;
    if (heartLayer.children.length >= maxCount) return;
    const size = getRandomBetween(...ambientState.heartSizeRange);
    createAmbientElement('ambient-heart', {
      left: `${getRandomBetween(6, 94)}%`,
      bottom: '-26px',
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${getRandomBetween(8.5, 12.5)}s`,
      opacity: `${getRandomBetween(0.16, 0.32)}`
    }, heartLayer, 12500);
  }

  function ambientFrame(timestamp) {
    if (!ambientLastSparkle) ambientLastSparkle = timestamp;
    if (!ambientLastHeart) ambientLastHeart = timestamp;
    if (!ambientLastBokeh) ambientLastBokeh = timestamp;

    if (timestamp - ambientLastSparkle > ambientState.sparkleInterval) {
      spawnAmbientSparkle();
      ambientLastSparkle = timestamp;
    }

    if (timestamp - ambientLastHeart > ambientState.heartInterval) {
      spawnAmbientHeart();
      ambientLastHeart = timestamp;
    }

    if (timestamp - ambientLastBokeh > ambientState.bokehInterval) {
      spawnAmbientBokeh();
      ambientLastBokeh = timestamp;
    }

    requestAnimationFrame(ambientFrame);
  }

  function initAmbientBackground() {
    refreshAmbientMode();
    createAmbientVisuals();
    requestAnimationFrame(ambientFrame);
  }

  function activateSurprise() {
    attemptPlayAudio();
    openPopup();
    launchConfetti();
    for (let i = 0; i < 12; i += 1) {
      createFloatingHeart(window.innerWidth * Math.random(), window.innerHeight * (0.3 + Math.random() * 0.6));
    }
  }

  if (!isTouchDevice) setupLoveCursor();
  initAmbientBackground();
  window.addEventListener('resize', refreshAmbientMode);
  if (loadingScreen) fadeInLoaded();

  if (startButton && nextSection) {
    startButton.addEventListener('click', () => nextSection.scrollIntoView({ behavior: 'smooth' }));
  }

  window.addEventListener('scroll', scrollProgress);
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const observer = new IntersectionObserver(revealOnScroll, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });
  revealItems.forEach((item) => observer.observe(item));

  const timelineObserver = new IntersectionObserver(revealOnScroll, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });
  timelineItems.forEach((item) => timelineObserver.observe(item));

  flipCards.forEach((card) => {
    const toggleFlip = (e) => {
      e.stopPropagation();
      card.classList.toggle('active');
    };
    card.addEventListener('pointerup', toggleFlip);
    card.addEventListener('click', toggleFlip);

    if (isTouchDevice) {
      const flipObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (!card.classList.contains('active')) card.classList.add('active');
            }, 800);
            setTimeout(() => {
              if (card.classList.contains('active')) card.classList.remove('active');
            }, 3000);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4, rootMargin: '0px 0px -40px 0px' });

      flipObserver.observe(card);
    }
  });

  if (letterText) {
    // Start the typewriter only when the letter panel scrolls into view
    const letterPanel = document.querySelector('.letter-panel') || document.querySelector('#letter');
    if (letterPanel) {
      const letterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeWriter(typewriterText);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -80px 0px' });
      letterObserver.observe(letterPanel);
    } else {
      // fallback: run immediately if panel not found
      typeWriter(typewriterText);
    }
  }

  updateCounter();
  setInterval(updateCounter, 1000);

  if (galleryImages.length) {
    showGalleryImage(0);
    startGalleryAutoplay();
  }

  galleryThumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      showGalleryImage(index);
      startGalleryAutoplay();
    });
  });

  // gallery grid: clicking a thumb changes main image instead of preview
  const galleryGridThumbs = Array.from(document.querySelectorAll('.gallery-grid .gallery-thumb'));
  galleryGridThumbs.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = thumb.dataset.src;
      const index = galleryImages.indexOf(src);
      if (index !== -1) {
        showGalleryImage(index);
        restartGalleryAutoplay();
      }
    });
  });

  if (finalSurpriseButton) finalSurpriseButton.addEventListener('click', activateSurprise);
  if (popupClose) popupClose.addEventListener('click', closePopup);
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (event) => {
      if (event.target === popupOverlay) closePopup();
    });
  }
  if (popupNext) popupNext.addEventListener('click', handlePopupNext);
  if (popupVideo) {
    popupVideo.addEventListener('play', () => {
      // pause background audio when video starts, but remember its previous state
      try {
        if (audioPlayer) {
          audioWasPlayingBeforeVideo = !audioPlayer.paused;
          if (!audioPlayer.paused) audioPlayer.pause();
        }
      } catch (e) {}

      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        try {
          screen.lockOrientation('landscape');
        } catch (error) {}
      }
    });
    popupVideo.addEventListener('ended', closePopup);
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('visible')) {
      closePopup();
    }
  });
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.gallery-slide').forEach((slide) => { slide.style.opacity = ''; });
});
