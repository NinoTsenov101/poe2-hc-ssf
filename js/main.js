/*
============================================================
MAIN.JS — All interactive behaviour lives here
============================================================
HTML = structure, CSS = style, JavaScript = behaviour.
This file was separated from index.html on purpose.
Keeping JS in its own file makes it reusable across
multiple pages and much easier to find and edit.
============================================================
*/


// ── SCROLL-TO-TOP BUTTON ─────────────────────────────────────
// Shows a button in the bottom-right corner after scrolling
// down 300px. Clicking it smoothly scrolls back to the top.
//
// window.scrollY = how many pixels you've scrolled from the top
// classList.toggle('visible', condition) = add the class if
//   condition is true, remove it if false. One neat line
//   instead of an if/else block.
// ─────────────────────────────────────────────────────────────
const scrollTopBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


// ── MOBILE HAMBURGER MENU ─────────────────────────────────────
// The toggle button shows/hides the nav links on mobile.
//
// How it works:
//   1. Find the button and the nav element
//   2. When the button is clicked, toggle "nav-open" on <nav>
//      CSS then expands/collapses the link list via max-height
//   3. Swap the icon between ☰ (open) and ✕ (close)
//   4. Update aria-expanded so screen readers know the state
//   5. When any nav link is clicked, close the menu —
//      otherwise the menu stays open after navigating
// ─────────────────────────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const nav       = document.querySelector('nav');
const hamburgerIcon = document.querySelector('.hamburger-icon');

navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');

    // Swap icon: ☰ when closed, ✕ when open
    hamburgerIcon.textContent = isOpen ? '✕' : '☰';

    // Tell screen readers the current state
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

// Close the menu when any link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburgerIcon.textContent = '☰';
        navToggle.setAttribute('aria-expanded', false);
        navToggle.setAttribute('aria-label', 'Open navigation menu');
    });
});


// ── SMOOTH SCROLLING ─────────────────────────────────────────
// When you click a nav link (e.g. "Guides"), instead of
// jumping instantly to that section, the page glides there.
//
// How it works, line by line:
//   querySelectorAll()     = find ALL matching elements
//   forEach()              = do something for each one
//   addEventListener()     = "when THIS happens, do THAT"
//   e.preventDefault()     = stop the default jump behaviour
//   getAttribute('href')   = read the #section-id from the link
//   scrollIntoView()       = smoothly scroll to that element
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        // Only handle same-page anchor links (e.g. "#guides").
        // Links to other pages (e.g. "../index.html#builds") start
        // with a letter or dot — let the browser handle those normally.
        if (!targetId.startsWith('#')) return;

        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// ── CARD CLICK FEEDBACK ──────────────────────────────────────
// When you click a card, it briefly flashes purple to confirm
// your click was registered. Small details like this make
// a site feel alive and polished.
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.borderColor = 'var(--accent-secondary)';
        setTimeout(() => {
            this.style.borderColor = '';
        }, 300);
    });
});


// ── ACTIVE NAV HIGHLIGHTING ──────────────────────────────────
// As you scroll, the nav link for the visible section lights up.
//
// How it works:
//   1. We collect all <section> elements and all nav <a> links
//   2. We create an IntersectionObserver — a "watcher" that
//      fires whenever a section enters or leaves the screen
//   3. When a section enters: find its matching nav link and
//      add the "active" class (CSS makes it turn gold)
//   4. When we switch sections: remove "active" from all links
//      first, then add it only to the new one
//
// rootMargin: '-40% 0px -50% 0px'
//   This shrinks the "trigger zone". Instead of activating the
//   moment a section's very first pixel appears, it waits until
//   the section is roughly in the middle of the screen.
//   Feels much more natural when scrolling.
// ─────────────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove "active" from every nav link first
            navLinks.forEach(link => link.classList.remove('active'));

            // Find the nav link whose href matches this section's id
            // e.g. section id="guides" matches <a href="#guides">
            const activeLink = document.querySelector(
                `.nav-links a[href="#${entry.target.id}"]`
            );

            // Add "active" to just that one link
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, {
    rootMargin: '-40% 0px -50% 0px'
});

// Tell the observer to watch every section
sections.forEach(section => observer.observe(section));


// ── PAGE TRANSITION (EXIT) ───────────────────────────────────
// When you click a link to a DIFFERENT page, the current page
// fades out before the browser navigates away.
//
// How it works:
//   1. Listen for clicks on any <a> link on the page
//   2. Skip special cases: same-page anchors, external links,
//      new-tab links, ctrl+click / cmd+click
//   3. For same-site page links: add "page-exit" class to body,
//      which triggers the CSS fade-out transition
//   4. After 300ms (matching the CSS duration), navigate
// ─────────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
    // Find the <a> tag that was clicked (even if the click was
    // on something inside the link, like an icon or span)
    const link = e.target.closest('a');
    if (!link) return;                        // wasn't a link click

    const href = link.getAttribute('href');
    if (!href) return;                        // no destination
    if (href.startsWith('#')) return;         // same-page anchor
    if (href.startsWith('http') && !href.includes(location.hostname)) return; // external site
    if (link.target === '_blank') return;     // opens in a new tab
    if (e.metaKey || e.ctrlKey) return;       // ctrl/cmd+click = new tab

    // It's a same-site page navigation — fade out first
    e.preventDefault();
    document.body.classList.add('page-exit');

    // Wait for the CSS transition to finish, then navigate
    setTimeout(() => {
        window.location.href = href;
    }, 280);
});


// ── CONSOLE EASTER EGG ───────────────────────────────────────
// Open DevTools (F12) → Console tab to see this.
// A little gift for fellow developers who peek under the hood.
// ─────────────────────────────────────────────────────────────
console.log('%c⚔️ WRAECLAST HC ⚔️', 'color: #c8a24e; font-size: 20px; font-weight: bold;');
console.log('%cOne life. No trade. No mercy.', 'color: #ff4444; font-size: 14px;');
