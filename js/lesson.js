/* ==========================================================================
   Lesson Website Presentation Engine (js/lesson.js)
   Features: Projector Mode, Font Scaling, Topic Stepper, Timer, Interactive Simulators
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const body = document.body;
  const btnProjector = document.getElementById('btnProjector');
  const btnDarkMode = document.getElementById('btnDarkMode');
  const btnFontIncrease = document.getElementById('btnFontIncrease');
  const btnFontDecrease = document.getElementById('btnFontDecrease');
  const btnFullscreen = document.getElementById('btnFullscreen');
  
  const btnPrevSlide = document.getElementById('btnPrevSlide');
  const btnNextSlide = document.getElementById('btnNextSlide');
  const slideIndicator = document.getElementById('slideIndicator');
  const sections = Array.from(document.querySelectorAll('.lecture-section'));
  
  let currentSectionIndex = 0;
  let fontScaleLevels = [16, 18, 20, 22, 24];
  let currentFontScaleIndex = 1; // default ~18px for projector

  // 1. Projector Mode Toggle
  if (btnProjector) {
    btnProjector.addEventListener('click', () => {
      body.classList.toggle('projector-mode');
      const isProjector = body.classList.contains('projector-mode');
      btnProjector.classList.toggle('active', isProjector);
      btnProjector.setAttribute('aria-pressed', isProjector);
      localStorage.setItem('cms_projector_mode', isProjector ? 'true' : 'false');
    });

    // Restore preference
    if (localStorage.getItem('cms_projector_mode') === 'true') {
      body.classList.add('projector-mode');
      btnProjector.classList.add('active');
    }
  }

  // 2. Dark Mode Toggle
  if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      btnDarkMode.classList.toggle('active', isDark);
      btnDarkMode.textContent = isDark ? '☀️ Light' : '🌙 Dim';
      localStorage.setItem('cms_dark_mode', isDark ? 'true' : 'false');
    });

    if (localStorage.getItem('cms_dark_mode') === 'true') {
      body.classList.add('dark-mode');
      btnDarkMode.classList.add('active');
      btnDarkMode.textContent = '☀️ Light';
    }
  }

  // 3. Font Size Controls (+ / -) for classroom readability
  const updateFontSize = () => {
    document.documentElement.style.fontSize = fontScaleLevels[currentFontScaleIndex] + 'px';
  };

  if (btnFontIncrease) {
    btnFontIncrease.addEventListener('click', () => {
      if (currentFontScaleIndex < fontScaleLevels.length - 1) {
        currentFontScaleIndex++;
        updateFontSize();
      }
    });
  }

  if (btnFontDecrease) {
    btnFontDecrease.addEventListener('click', () => {
      if (currentFontScaleIndex > 0) {
        currentFontScaleIndex--;
        updateFontSize();
      }
    });
  }

  // 4. Fullscreen Toggle
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Fullscreen error: ${err.message}`);
        });
        btnFullscreen.textContent = '⤓ Exit Full';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          btnFullscreen.textContent = '⤢ Fullscreen';
        }
      }
    });
  }

  // 5. Topic Stepper (Previous / Next Topic)
  const updateSlideUI = () => {
    if (!sections.length) return;
    if (slideIndicator) {
      slideIndicator.textContent = `Topic ${currentSectionIndex + 1} of ${sections.length}`;
    }
    if (btnPrevSlide) btnPrevSlide.disabled = currentSectionIndex === 0;
    if (btnNextSlide) btnNextSlide.disabled = currentSectionIndex === sections.length - 1;

    // Scroll section into view smoothly
    const targetSection = sections[currentSectionIndex];
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Brief spotlight highlight
      targetSection.style.outline = '3px solid var(--primary)';
      setTimeout(() => {
        targetSection.style.outline = 'none';
      }, 1500);
    }
  };

  if (btnPrevSlide) {
    btnPrevSlide.addEventListener('click', () => {
      if (currentSectionIndex > 0) {
        currentSectionIndex--;
        updateSlideUI();
      }
    });
  }

  if (btnNextSlide) {
    btnNextSlide.addEventListener('click', () => {
      if (currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
        updateSlideUI();
      }
    });
  }

  // Keyboard navigation for lecturer
  window.addEventListener('keydown', (e) => {
    // Avoid hijacking inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
        updateSlideUI();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSectionIndex > 0) {
        currentSectionIndex--;
        updateSlideUI();
      }
    } else if (e.key.toLowerCase() === 'p') {
      if (btnProjector) btnProjector.click();
    }
  });

  // 6. Presentation Timer
  const timerDisplay = document.getElementById('lectureTimer');
  let secondsElapsed = 0;
  let timerInterval = null;

  const startTimer = () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      if (timerDisplay) {
        timerDisplay.textContent = `${hours}:${minutes}:${secs}`;
      }
    }, 1000);
  };

  startTimer();

  // 7. Interactive School Announcement Simulator (Topic IV)
  const simTitle = document.getElementById('simTitle');
  const simCategory = document.getElementById('simCategory');
  const simDate = document.getElementById('simDate');
  const simContent = document.getElementById('simContent');
  const simStatusBadge = document.getElementById('simStatusBadge');
  
  const btnSimSaveDB = document.getElementById('btnSimSaveDB');
  const btnSimPublish = document.getElementById('btnSimPublish');
  const btnSimChangeDeadline = document.getElementById('btnSimChangeDeadline');
  
  const livePreviewTitle = document.getElementById('livePreviewTitle');
  const livePreviewCategory = document.getElementById('livePreviewCategory');
  const livePreviewDate = document.getElementById('livePreviewDate');
  const livePreviewContent = document.getElementById('livePreviewContent');
  const livePreviewContainer = document.getElementById('livePreviewContainer');

  if (btnSimSaveDB && btnSimPublish) {
    btnSimSaveDB.addEventListener('click', () => {
      if (simStatusBadge) {
        simStatusBadge.textContent = '💾 Saved in Database (Status: Draft / Pending Review)';
        simStatusBadge.style.background = '#fef3c7';
        simStatusBadge.style.color = '#92400e';
      }
      alert('Content saved to Database! Notice: It is NOT visible to students yet because it is not published.');
    });

    btnSimPublish.addEventListener('click', () => {
      if (simStatusBadge) {
        simStatusBadge.textContent = '🚀 Published Live (Delivered by CDA to Public)';
        simStatusBadge.style.background = '#dcfce7';
        simStatusBadge.style.color = '#14532d';
      }
      
      // Update Live Public View
      if (livePreviewTitle) livePreviewTitle.textContent = simTitle.value || 'Enrollment Period for Second Semester';
      if (livePreviewCategory) livePreviewCategory.textContent = 'Category: ' + (simCategory.value || 'Admissions');
      if (livePreviewDate) livePreviewDate.textContent = '📅 Published Date: ' + (simDate.value || 'November 15');
      if (livePreviewContent) livePreviewContent.textContent = simContent.value || 'Students are advised to complete their enrollment requirements before the deadline.';
      
      if (livePreviewContainer) {
        livePreviewContainer.style.borderColor = '#16a34a';
        livePreviewContainer.classList.add('pulse-highlight');
        setTimeout(() => livePreviewContainer.classList.remove('pulse-highlight'), 1000);
      }
    });

    if (btnSimChangeDeadline) {
      btnSimChangeDeadline.addEventListener('click', () => {
        if (simDate) simDate.value = 'November 30 (Extended)';
        if (simStatusBadge) {
          simStatusBadge.textContent = '✏️ Deadline updated to Nov 30! Click "Publish Live" to push update.';
          simStatusBadge.style.background = '#dbeafe';
          simStatusBadge.style.color = '#1e3a8a';
        }
      });
    }
  }

  // 8. Learning Objectives Checkboxes
  const objectiveCheckboxes = document.querySelectorAll('.obj-checkbox');
  const objProgressText = document.getElementById('objProgressText');

  const updateObjProgress = () => {
    if (!objectiveCheckboxes.length || !objProgressText) return;
    const checkedCount = Array.from(objectiveCheckboxes).filter(cb => cb.checked).length;
    objProgressText.textContent = `${checkedCount} of ${objectiveCheckboxes.length} Mastered`;
  };

  objectiveCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateObjProgress);
  });
});

