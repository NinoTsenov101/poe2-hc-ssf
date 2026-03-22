/*
============================================================
RIP-TRACKER.JS — The death tracker logic
============================================================
This file only runs on rip-tracker.html.
It uses localStorage to save deaths in the browser.

localStorage is like a tiny notebook built into every browser.
You can write to it, read from it, and it survives page
refreshes and browser restarts.

It stores everything as text (strings), so we use:
  JSON.stringify()  — convert an array/object → text to save
  JSON.parse()      — convert text → array/object to use
============================================================
*/


// ── CONSTANTS ─────────────────────────────────────────────
// The "key" we use to store data in localStorage.
// Think of it as the label on a drawer.
const STORAGE_KEY = 'wraeclast_rip_tracker';


// ── GRAB HTML ELEMENTS ────────────────────────────────────
// We find the elements we'll interact with once,
// then reuse these variables throughout the file.
const form       = document.getElementById('rip-form');
const ripLog     = document.getElementById('rip-log');
const emptyState = document.getElementById('empty-state');
const clearBtn   = document.getElementById('clear-btn');
const deathCount = document.getElementById('death-count');


// ── LOAD DEATHS FROM LOCALSTORAGE ─────────────────────────
// This runs once when the page loads.
// It reads any previously saved deaths and draws them.
function loadDeaths() {
    // Read from localStorage. If nothing saved yet → use []
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}


// ── SAVE DEATHS TO LOCALSTORAGE ───────────────────────────
function saveDeaths(deaths) {
    // Convert the array to text, then store it
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deaths));
}


// ── UPDATE THE DEATH COUNTER IN THE HERO ──────────────────
function updateCounter(deaths) {
    deathCount.textContent = deaths.length;
}


// ── DRAW ALL DEATH CARDS ON SCREEN ────────────────────────
// This function clears the log area and redraws it from
// the deaths array. Called on page load and after any change.
function renderDeaths(deaths) {
    updateCounter(deaths);

    // Show/hide the "Clear All" button
    clearBtn.style.display = deaths.length > 0 ? 'block' : 'none';

    if (deaths.length === 0) {
        // Show the empty state message, remove all cards
        ripLog.innerHTML = '';
        ripLog.appendChild(emptyState);
        return;
    }

    // Hide the empty state message
    emptyState.remove();

    // Clear previous cards and redraw all from scratch
    ripLog.innerHTML = '';

    // Newest deaths first — reverse() flips the array order
    [...deaths].reverse().forEach((death, index) => {
        // Build the HTML string for one death card
        // Template literals (backticks) let us embed variables
        // with ${variable} syntax — much cleaner than + signs
        const card = document.createElement('div');
        card.className = 'rip-card';
        card.innerHTML = `
            <div class="rip-card-header">
                <span class="rip-char-name">☠ ${death.name}</span>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="rip-date">${death.date}</span>
                    <!--
                    Two separate buttons now:
                    - toggle: collapses/expands the card body
                    - delete: actually removes the entry
                    -->
                    <button class="rip-toggle" title="Collapse / Expand">▼</button>
                    <button
                        class="rip-delete"
                        title="Delete this entry"
                        data-index="${deaths.length - 1 - index}"
                    >🗑</button>
                </div>
            </div>
            <div class="rip-card-body">
                <div class="rip-details">
                    <span class="rip-badge">${death.charClass}</span>
                    <span class="rip-badge level">Level ${death.level}</span>
                    <span class="rip-badge">${death.cause}</span>
                </div>
                ${death.notes
                    ? `<p class="rip-notes">"${death.notes}"</p>`
                    : ''
                }
            </div>
        `;
        ripLog.appendChild(card);
    });
}


// ── HANDLE FORM SUBMISSION ────────────────────────────────
// Fires when the user clicks "Log Death" or presses Enter.
form.addEventListener('submit', (e) => {
    // Stop the form from reloading the page (its default behaviour)
    e.preventDefault();

    // Read the current date in a readable format
    const now   = new Date();
    const date  = now.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // Build a death object from the form values
    const death = {
        name:      document.getElementById('char-name').value.trim(),
        charClass: document.getElementById('char-class').value,
        level:     document.getElementById('char-level').value,
        cause:     document.getElementById('death-cause').value,
        notes:     document.getElementById('death-notes').value.trim(),
        date:      date
    };

    // Load existing deaths, add the new one, save and redraw
    const deaths = loadDeaths();
    deaths.push(death);
    saveDeaths(deaths);
    renderDeaths(deaths);

    // Reset the form back to empty
    form.reset();
});


// ── HANDLE DELETE & CLEAR BUTTONS ────────────────────────
// We listen on the ripLog container instead of each button.
// This is called "event delegation" — one listener handles
// clicks on any button inside the container, even ones
// added later by JavaScript.
ripLog.addEventListener('click', (e) => {

    // ── TOGGLE: collapse/expand the card body ──
    if (e.target.classList.contains('rip-toggle')) {
        const card = e.target.closest('.rip-card');
        const body = card.querySelector('.rip-card-body');
        const isCollapsed = body.classList.toggle('collapsed');

        // Swap the arrow direction to show the state
        e.target.textContent = isCollapsed ? '▶' : '▼';
    }

    // ── DELETE: remove the entry permanently ──
    if (e.target.classList.contains('rip-delete')) {
        const indexToDelete = parseInt(e.target.dataset.index);
        const deaths = loadDeaths();
        deaths.splice(indexToDelete, 1);
        saveDeaths(deaths);
        renderDeaths(deaths);
    }
});

clearBtn.addEventListener('click', () => {
    // Ask the user to confirm — no undo after this!
    if (confirm('Delete ALL deaths? This cannot be undone.')) {
        saveDeaths([]);
        renderDeaths([]);
    }
});


// ── INITIAL RENDER ────────────────────────────────────────
// Run once on page load to show any previously saved deaths
renderDeaths(loadDeaths());
