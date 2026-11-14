(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open));
  });

  const countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    const target = new Date('2026-12-02T10:00:00+07:00').getTime();
    const update = () => {
      let left = Math.max(0, target - Date.now());
      const units = { days: 86400000, hours: 3600000, minutes: 60000, seconds: 1000 };
      Object.entries(units).forEach(([key, size]) => {
        const node = countdown.querySelector(`[data-${key}]`);
        if (node) { const value = Math.floor(left / size); node.textContent = String(value).padStart(2, '0'); left %= size; }
      });
    };
    update(); window.setInterval(update, 1000);
  }

  const gallery = [...document.querySelectorAll('[data-gallery] .gallery-item')];
  const lightbox = document.querySelector('[data-lightbox]');
  if (gallery.length && lightbox) {
    const picture = lightbox.querySelector('img'); let active = 0;
    const show = (index) => { active = (index + gallery.length) % gallery.length; picture.src = gallery[active].dataset.full; picture.alt = gallery[active].querySelector('img').alt; lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    const close = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    gallery.forEach((button, index) => button.addEventListener('click', () => show(index)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(active - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(active + 1));
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => { if (!lightbox.classList.contains('open')) return; if (event.key === 'Escape') close(); if (event.key === 'ArrowLeft') show(active - 1); if (event.key === 'ArrowRight') show(active + 1); });
  }

  const guestForm = document.querySelector('[data-guestbook-form]');
  const wishesList = document.querySelector('[data-wishes-list]');
  const wishesKey = 'wedding-guestbook-v1';
  const readWishes = () => { try { return JSON.parse(localStorage.getItem(wishesKey) || '[]'); } catch { return []; } };
  const renderWishes = () => {
    if (!wishesList) return;
    const wishes = readWishes();
    if (!wishes.length) { wishesList.innerHTML = '<p class="empty-state">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới dâu rể nhé!</p>'; return; }
    wishesList.innerHTML = wishes.slice().reverse().map((wish) => `<article class="wish-item"><h3>${escapeHTML(wish.name)}</h3><span>${escapeHTML(wish.relation)} · ${escapeHTML(wish.date)}</span><p>${escapeHTML(wish.message)}</p></article>`).join('');
  };
  if (guestForm) {
    renderWishes();
    guestForm.addEventListener('submit', (event) => {
      event.preventDefault(); const data = new FormData(guestForm);
      const wish = { name: data.get('name').trim(), relation: data.get('relation'), message: data.get('message').trim(), date: new Date().toLocaleDateString('vi-VN') };
      if (!wish.name || !wish.message) return;
      const wishes = readWishes(); wishes.push(wish); localStorage.setItem(wishesKey, JSON.stringify(wishes)); guestForm.reset();
      guestForm.querySelector('[data-form-notice]').textContent = 'Cảm ơn bạn đã gửi lời chúc!'; renderWishes();
    });
  }

  const rsvpForm = document.querySelector('[data-rsvp-form]');
  if (rsvpForm) rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(rsvpForm);
    const response = { name: data.get('name').trim(), phone: data.get('phone').trim(), status: data.get('status'), guests: data.get('guests'), message: data.get('message').trim(), submittedAt: new Date().toISOString() };
    if (!response.name || !response.phone) return;
    const saved = JSON.parse(localStorage.getItem('wedding-rsvp-v1') || '[]'); saved.push(response); localStorage.setItem('wedding-rsvp-v1', JSON.stringify(saved));
    rsvpForm.reset(); rsvpForm.querySelector('[data-form-notice]').textContent = 'Đã lưu xác nhận trên thiết bị này. Cảm ơn bạn!';
  });

  document.querySelectorAll('[data-gift]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-gift]').forEach((tab) => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); });
  }));

  const musicButton = document.querySelector('.music-button');
  if (musicButton) {
    let context; let timer; let note = 0;
    const playNote = () => {
      if (!context || context.state !== 'running') return;
      const frequencies = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
      const oscillator = context.createOscillator(); const gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequencies[note++ % frequencies.length];
      gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + .08); gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.4);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 1.45);
    };
    musicButton.addEventListener('click', async () => {
      const enabled = musicButton.getAttribute('aria-pressed') !== 'true';
      if (enabled) { context ||= new (window.AudioContext || window.webkitAudioContext)(); await context.resume(); musicButton.setAttribute('aria-pressed', 'true'); musicButton.querySelector('span').textContent = 'Tắt nhạc'; playNote(); timer = window.setInterval(playNote, 1600); }
      else { window.clearInterval(timer); if (context) await context.suspend(); musicButton.setAttribute('aria-pressed', 'false'); musicButton.querySelector('span').textContent = 'Bật nhạc'; }
    });
  }

  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
})();
