const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle?.addEventListener('click', () => { const open = siteNav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => { siteNav?.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); }));
const current = document.body.dataset.page;
if (current && current !== 'admin') document.querySelectorAll('.site-nav a').forEach((link) => { const href = link.getAttribute('href'); if ((current === 'home' && href === 'index.html') || (current === 'media' && href === 'media.html') || (current === 'future' && href === 'future.html') || (current === 'topic' && href === 'web-development.html')) link.classList.add('active'); });
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
