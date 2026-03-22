/*
============================================================
LEADERBOARD.JS
============================================================
Fetches HC SSF character data from our local JSON file
and builds the leaderboard table dynamically.

Key concepts:
  fetch()      — how JavaScript talks to external sources
  async/await  — how to wait for data before using it
  JSON         — the data format we're reading
  DOM building — creating HTML elements from data
============================================================
*/

// ── CONFIG ───────────────────────────────────────────────
// Path to our local data file.
// When we eventually find a real JSON API, this is the only
// line that needs to change.
const DATA_URL = '../data/leaderboard.json';

// How many characters to show
const LIMIT = 10;

// The base URL for linking to character profiles on poe.ninja
const LEAGUE_SLUG = 'vaalhcssf';


// ── MAIN FUNCTION ─────────────────────────────────────────
async function fetchLeaderboard() {

    const loadingEl = document.getElementById('lb-loading');
    const errorEl   = document.getElementById('lb-error');
    const tableEl   = document.getElementById('lb-table');
    const rowsEl    = document.getElementById('lb-rows');

    try {
        /*
        fetch() sends a request to the URL and waits for a response.
        It works identically whether the URL points to a local file
        or a remote API — that's the power of this approach.
        */
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(`Could not load data (status ${response.status})`);
        }

        /*
        response.json() reads the response and converts it from
        a JSON string into a real JavaScript object we can work with.
        */
        const data = await response.json();

        const characters = (data.entries || []).slice(0, LIMIT);

        if (characters.length === 0) {
            throw new Error('No characters found in data file.');
        }

        // Show the league name and last updated date
        if (data.league) {
            document.getElementById('lb-league').textContent = data.league;
        }
        if (data.updated) {
            document.getElementById('lb-updated').textContent = `Updated: ${data.updated}`;
        }

        renderRows(characters, rowsEl);

        loadingEl.style.display = 'none';
        tableEl.style.display   = 'block';

    } catch (err) {
        console.error('[Leaderboard] Failed to load:', err);
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'block';
        document.getElementById('lb-error-msg').textContent = err.message;
    }
}


// ── RENDER ROWS ───────────────────────────────────────────
function renderRows(characters, container) {

    container.innerHTML = '';

    characters.forEach((char, index) => {

        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-default';

        const profileUrl = `https://poe.ninja/poe2/builds/${LEAGUE_SLUG}/character/${char.account}/${char.name}`;

        const statusHtml = char.dead
            ? '<span class="status-dead">☠ Fallen</span>'
            : '<span class="status-alive">⚡ Alive</span>';

        const row = document.createElement('div');
        row.className = 'lb-row';

        row.innerHTML = `
            <span class="col-rank">
                <span class="rank-badge ${rankClass}">${rank}</span>
            </span>
            <span class="col-name">
                <a href="${profileUrl}" target="_blank" rel="noopener">${char.name}</a>
            </span>
            <span class="col-class">${char.class}</span>
            <span class="col-level">${char.level}</span>
            <span class="col-status">${statusHtml}</span>
        `;

        container.appendChild(row);
    });
}


// ── KICK IT OFF ───────────────────────────────────────────
fetchLeaderboard();
