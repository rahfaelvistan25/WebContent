/* ==========================================================================
   Student Assessment Engine (js/assessment.js)
   Features:
   - Hint toggle on every question (hints only, NO answers shown)
   - Real-time progress bar (X / 25 questions completed)
   - LocalStorage auto-save for phones & computers
   - Print / Save as PDF generator
   - Submission completeness validation
   - Passcode-protected Teacher Answer Key drawer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  const studentNameInput = document.getElementById('studentName');
  const studentIdInput = document.getElementById('studentId');
  const examDateInput = document.getElementById('examDate');
  
  const btnSaveProgress = document.getElementById('btnSaveProgress');
  const btnPrintExam = document.getElementById('btnPrintExam');
  const btnSubmitExam = document.getElementById('btnSubmitExam');
  const btnClearExam = document.getElementById('btnClearExam');
  
  const submitModal = document.getElementById('submitModal');
  const modalSummaryText = document.getElementById('modalSummaryText');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnConfirmSubmit = document.getElementById('btnConfirmSubmit');

  // Teacher Key Elements
  const btnTeacherUnlock = document.getElementById('btnTeacherUnlock');
  const teacherKeyContent = document.getElementById('teacherKeyContent');

  // Set default date if empty
  if (examDateInput && !examDateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    examDateInput.value = today;
  }

  // 1. Hint Toggle Functionality (Clickable for every question)
  const hintButtons = document.querySelectorAll('.hint-toggle-btn');
  hintButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-hint-target');
      const drawer = document.getElementById(targetId);
      if (drawer) {
        const isOpen = drawer.classList.contains('open');
        drawer.classList.toggle('open', !isOpen);
        btn.textContent = isOpen ? '💡 Need a Hint?' : '🙈 Hide Hint';
        btn.setAttribute('aria-expanded', !isOpen);
      }
    });
  });

  // 2. Track Question Completion & Update Progress
  const calculateProgress = () => {
    let answeredCount = 0;
    const totalQuestions = 25; // 15 MC + 5 ID + 5 Short Answer

    // Part A: 15 Multiple Choice
    for (let i = 1; i <= 15; i++) {
      const selected = document.querySelector(`input[name="mc_${i}"]:checked`);
      const card = document.getElementById(`q_card_mc_${i}`);
      if (selected) {
        answeredCount++;
        if (card) card.classList.add('answered');
      } else {
        if (card) card.classList.remove('answered');
      }
    }

    // Part B: 5 Identification
    for (let i = 1; i <= 5; i++) {
      const input = document.getElementById(`id_${i}`);
      const card = document.getElementById(`q_card_id_${i}`);
      if (input && input.value.trim().length > 0) {
        answeredCount++;
        if (card) card.classList.add('answered');
      } else {
        if (card) card.classList.remove('answered');
      }
    }

    // Part C: 5 Short Answer
    for (let i = 1; i <= 5; i++) {
      const textarea = document.getElementById(`sa_${i}`);
      const card = document.getElementById(`q_card_sa_${i}`);
      if (textarea && textarea.value.trim().length > 5) {
        answeredCount++;
        if (card) card.classList.add('answered');
      } else {
        if (card) card.classList.remove('answered');
      }
    }

    const percentage = Math.round((answeredCount / totalQuestions) * 100);
    if (progressText) {
      progressText.textContent = `Completed: ${answeredCount} / ${totalQuestions} Questions (${percentage}%)`;
    }
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    return { answeredCount, totalQuestions, percentage };
  };

  // Listen for changes across the form
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Highlight selected label styling
      const name = radio.getAttribute('name');
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.option-label')?.classList.toggle('selected', r.checked);
      });
      calculateProgress();
      autoSaveToStorage();
    });
  });

  document.querySelectorAll('.text-answer-input').forEach(input => {
    input.addEventListener('input', () => {
      calculateProgress();
      autoSaveToStorage();
    });
  });

  if (studentNameInput) studentNameInput.addEventListener('input', autoSaveToStorage);
  if (studentIdInput) studentIdInput.addEventListener('input', autoSaveToStorage);
  if (examDateInput) examDateInput.addEventListener('input', autoSaveToStorage);

  // 3. LocalStorage Auto-Save & Restore
  function autoSaveToStorage() {
    const data = {
      studentName: studentNameInput ? studentNameInput.value : '',
      studentId: studentIdInput ? studentIdInput.value : '',
      examDate: examDateInput ? examDateInput.value : '',
      mc: {},
      id: {},
      sa: {}
    };

    // Save MC
    for (let i = 1; i <= 15; i++) {
      const selected = document.querySelector(`input[name="mc_${i}"]:checked`);
      if (selected) data.mc[`mc_${i}`] = selected.value;
    }

    // Save ID
    for (let i = 1; i <= 5; i++) {
      const inp = document.getElementById(`id_${i}`);
      if (inp) data.id[`id_${i}`] = inp.value;
    }

    // Save SA
    for (let i = 1; i <= 5; i++) {
      const txt = document.getElementById(`sa_${i}`);
      if (txt) data.sa[`sa_${i}`] = txt.value;
    }

    try {
      localStorage.setItem('cms_assessment_draft', JSON.stringify(data));
    } catch (err) {
      console.warn('Storage save error:', err);
    }
  }

  function restoreFromStorage() {
    try {
      const saved = localStorage.getItem('cms_assessment_draft');
      if (!saved) return;
      const data = JSON.parse(saved);

      if (studentNameInput && data.studentName) studentNameInput.value = data.studentName;
      if (studentIdInput && data.studentId) studentIdInput.value = data.studentId;
      if (examDateInput && data.examDate) examDateInput.value = data.examDate;

      // Restore MC
      if (data.mc) {
        Object.keys(data.mc).forEach(key => {
          const radio = document.querySelector(`input[name="${key}"][value="${data.mc[key]}"]`);
          if (radio) {
            radio.checked = true;
            radio.closest('.option-label')?.classList.add('selected');
          }
        });
      }

      // Restore ID
      if (data.id) {
        Object.keys(data.id).forEach(key => {
          const inp = document.getElementById(key);
          if (inp) inp.value = data.id[key];
        });
      }

      // Restore SA
      if (data.sa) {
        Object.keys(data.sa).forEach(key => {
          const txt = document.getElementById(key);
          if (txt) txt.value = data.sa[key];
        });
      }

      calculateProgress();
    } catch (err) {
      console.warn('Storage restore error:', err);
    }
  }

  // Restore on load
  restoreFromStorage();

  // 4. Manual Save Button
  if (btnSaveProgress) {
    btnSaveProgress.addEventListener('click', () => {
      autoSaveToStorage();
      alert('✓ Progress saved to your device! You can safely refresh or return to this page anytime.');
    });
  }

  // 5. Print / Save as PDF Button
  if (btnPrintExam) {
    btnPrintExam.addEventListener('click', () => {
      window.print();
    });
  }

  // 6. Submit Validation Dialog
  if (btnSubmitExam) {
    btnSubmitExam.addEventListener('click', () => {
      const { answeredCount, totalQuestions, percentage } = calculateProgress();
      const sName = studentNameInput ? studentNameInput.value.trim() : '';

      if (!sName) {
        alert('⚠️ Please enter your Full Name at the top of the assessment before submitting.');
        studentNameInput?.focus();
        return;
      }

      const unansweredCount = totalQuestions - answeredCount;
      if (modalSummaryText) {
        modalSummaryText.innerHTML = `
          <strong>Student:</strong> ${escapeHtml(sName)}<br>
          <strong>Total Answered:</strong> ${answeredCount} of ${totalQuestions} (${percentage}%)<br>
          ${unansweredCount > 0 
            ? `<span style="color: #d97706;">⚠️ You have <strong>${unansweredCount}</strong> unanswered questions remaining.</span>` 
            : `<span style="color: #16a34a;">🎉 Excellent! All 25 questions have been answered.</span>`}
        `;
      }

      if (submitModal) submitModal.classList.add('open');
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (submitModal) submitModal.classList.remove('open');
    });
  }

  if (btnConfirmSubmit) {
    btnConfirmSubmit.addEventListener('click', () => {
      if (submitModal) submitModal.classList.remove('open');
      alert('✅ Assessment submitted successfully! Please print your copy or export to PDF to hand in to your professor.');
      window.print();
    });
  }

  // 7. Clear Form Button
  if (btnClearExam) {
    btnClearExam.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all your answers? This cannot be undone.')) {
        localStorage.removeItem('cms_assessment_draft');
        location.reload();
      }
    });
  }

  // 8. Protected Teacher Answer Key Drawer
  if (btnTeacherUnlock) {
    btnTeacherUnlock.addEventListener('click', () => {
      const pin = prompt('Enter Teacher Access Passcode (Default: 1234):');
      if (pin === '1234' || pin === 'cms2026' || pin === 'admin') {
        if (teacherKeyContent) {
          teacherKeyContent.classList.add('open');
          teacherKeyContent.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (pin !== null) {
        alert('❌ Incorrect passcode. The Answer Key is reserved for instructors only.');
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

