const defaults = { name: 'Abner Flores', headline: 'Ideas are better when they become real.', intro: 'Welcome to my corner of the web — a place for the things I’m building, learning, and exploring next.', focus: 'Building useful things for the web' };
const form = document.querySelector('#site-form');
const status = document.querySelector('#save-status');
const stored = JSON.parse(localStorage.getItem('aboutme-site-settings') || 'null');
const settings = stored || defaults;
Object.entries(settings).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
form.addEventListener('submit', (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); localStorage.setItem('aboutme-site-settings', JSON.stringify(data)); status.textContent = 'Saved just now'; setTimeout(() => { status.textContent = 'Saved locally'; }, 2200); });
document.querySelector('#reset-form').addEventListener('click', () => { Object.entries(defaults).forEach(([key, value]) => { form.elements[key].value = value; }); localStorage.removeItem('aboutme-site-settings'); status.textContent = 'Defaults restored'; });
document.querySelector('[data-year]').textContent = new Date().getFullYear();
