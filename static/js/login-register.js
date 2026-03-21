let currentStep = 0; // 0 = login, 1-3 = register steps

function goTo(step) {
  const container = document.getElementById('container');
  const body = document.body;
  const form = document.querySelector('.form-box'); // select form for logo

  let translateY = 0;

  if (step === 0) {
    translateY = 0; // login
    showStep(1);    // reset register
    form.classList.remove('slide-up'); // move logo back down
  } else if (step >= 1 && step <= 3) {
    translateY = -100; // slide container up
    form.classList.add('slide-up');    // move logo up with form
  }

  // Slide container
  container.style.transition = 'transform 0.6s ease';
  container.style.transform = `translateY(${translateY}vh)`;

  // Move background so bottom aligns with top of form (60vh)
  body.style.transition = 'background-position 0.6s ease';
  body.style.backgroundPosition = step === 0 ? 'center bottom' : 'center calc(100% - 60vh)';

  // Show correct register step
  if (step > 0) showStep(step);

  currentStep = step;
}

function goBackTo(step) {
  goTo(0);
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
  const el = document.getElementById('step' + step);
  if (el) el.style.display = 'block';
}