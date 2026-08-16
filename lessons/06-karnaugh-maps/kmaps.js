// ==========================================
// Karnaugh Map Lesson Logic
// 1. Interactive 4-variable K-map explorer:
//    click a cell to cycle 0 -> 1 -> X -> 0,
//    and watch the minterm list + canonical
//    (unsimplified) SOP expression update live.
// 2. Self-check quiz (same pattern as the
//    Verilog lessons' accessible quiz checker).
// ==========================================

// Gray-code order used for both the row pair (A,B) and the
// column pair (C,D): index 0->00, 1->01, 2->11, 3->10.
const GRAY = [0, 1, 3, 2];
const VAR_NAMES = ['A', 'B', 'C', 'D'];

// cellState[i] holds the state of minterm i: 0 = off, 1 = on, 2 = don't-care
let cellState = new Array(16).fill(0);

function mintermFor(rowIdx, colIdx) {
    const ab = GRAY[rowIdx]; // 2-bit value: bit1=A, bit0=B
    const cd = GRAY[colIdx]; // 2-bit value: bit1=C, bit0=D
    const A = (ab >> 1) & 1, B = ab & 1;
    const C = (cd >> 1) & 1, D = cd & 1;
    return (A << 3) | (B << 2) | (C << 1) | D;
}

function termForMinterm(m) {
    const bits = [(m >> 3) & 1, (m >> 2) & 1, (m >> 1) & 1, m & 1];
    return bits.map((b, i) => VAR_NAMES[i] + (b ? '' : "'")).join('');
}

function buildExplorer() {
    const table = document.getElementById('kmap-explorer-table');
    if (!table) return;

    // Header row: corner + 4 CD labels
    const colLabels = GRAY.map(v => v.toString(2).padStart(2, '0'));
    let thead = '<tr><th class="kmap-corner">AB \\ CD</th>';
    colLabels.forEach(l => { thead += `<th>${l}</th>`; });
    thead += '</tr>';
    table.querySelector('thead').innerHTML = thead;

    // Body rows
    const rowLabels = GRAY.map(v => v.toString(2).padStart(2, '0'));
    let tbody = '';
    for (let r = 0; r < 4; r++) {
        tbody += `<tr><th>${rowLabels[r]}</th>`;
        for (let c = 0; c < 4; c++) {
            const m = mintermFor(r, c);
            tbody += `<td><button type="button" class="kmap-cell-btn" data-minterm="${m}" aria-label="Minterm ${m}, currently 0">
                <span class="kmap-cell-glyph">&middot;</span><span class="kmap-mnum">m${m}</span>
            </button></td>`;
        }
        tbody += '</tr>';
    }
    table.querySelector('tbody').innerHTML = tbody;

    table.querySelectorAll('.kmap-cell-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = Number(btn.getAttribute('data-minterm'));
            cellState[m] = (cellState[m] + 1) % 3;
            paintCell(btn, cellState[m]);
            updateExplorerOutput();
        });
    });

    updateExplorerOutput();
}

function paintCell(btn, state) {
    const glyph = btn.querySelector('.kmap-cell-glyph');
    btn.classList.remove('state-1', 'state-x');
    if (state === 1) {
        btn.classList.add('state-1');
        glyph.textContent = '1';
        btn.setAttribute('aria-label', `Minterm ${btn.getAttribute('data-minterm')}, currently 1`);
    } else if (state === 2) {
        btn.classList.add('state-x');
        glyph.textContent = 'X';
        btn.setAttribute('aria-label', `Minterm ${btn.getAttribute('data-minterm')}, currently a don't-care`);
    } else {
        glyph.textContent = '\u00B7';
        btn.setAttribute('aria-label', `Minterm ${btn.getAttribute('data-minterm')}, currently 0`);
    }
}

function updateExplorerOutput() {
    const ones = [];
    const dontCares = [];
    for (let m = 0; m < 16; m++) {
        if (cellState[m] === 1) ones.push(m);
        else if (cellState[m] === 2) dontCares.push(m);
    }

    const sumEl = document.getElementById('kmap-explorer-sum');
    const exprEl = document.getElementById('kmap-explorer-expr');
    const announcer = document.getElementById('kmap-explorer-announcer');

    if (sumEl) {
        let text = ones.length ? `F(A,B,C,D) = &Sigma;(${ones.join(', ')})` : 'F(A,B,C,D) = 0';
        if (dontCares.length) text += ` &nbsp;+&nbsp; d(${dontCares.join(', ')})`;
        sumEl.innerHTML = text;
    }
    if (exprEl) {
        exprEl.innerHTML = ones.length
            ? ones.map(termForMinterm).join(' + ')
            : '0';
    }
    if (announcer) {
        announcer.textContent = ones.length
            ? `${ones.length} minterm${ones.length === 1 ? '' : 's'} selected.`
            : 'No minterms selected.';
    }
}

function clearExplorer() {
    cellState = new Array(16).fill(0);
    document.querySelectorAll('#kmap-explorer-table .kmap-cell-btn').forEach(btn => paintCell(btn, 0));
    updateExplorerOutput();
}

// ---------- Self-check quiz ----------
function normalize(s) {
    return s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/['\u2019]/g, "'");
}

function checkQuiz(quiz) {
    const inputs = quiz.querySelectorAll('input[data-answer]');
    let right = 0;
    inputs.forEach(inp => {
        const accepted = inp.getAttribute('data-answer').split('|').map(normalize);
        const ok = accepted.indexOf(normalize(inp.value)) !== -1 && inp.value.trim() !== '';
        inp.classList.remove('correct', 'incorrect');
        inp.classList.add(ok ? 'correct' : 'incorrect');
        if (ok) right++;
    });
    const fb = quiz.querySelector('.feedback');
    if (fb) {
        const all = right === inputs.length;
        fb.classList.remove('correct', 'incorrect');
        fb.classList.add(all ? 'correct' : 'incorrect');
        fb.textContent = all
            ? `\u2705 Correct! ${right} of ${inputs.length}.`
            : `\u274C ${right} of ${inputs.length} correct \u2014 fix the highlighted answers and check again.`;
    }
}

function resetQuiz(quiz) {
    quiz.querySelectorAll('input[data-answer]').forEach(inp => {
        inp.value = '';
        inp.classList.remove('correct', 'incorrect');
    });
    const fb = quiz.querySelector('.feedback');
    if (fb) { fb.textContent = ''; fb.classList.remove('correct', 'incorrect'); }
}

document.addEventListener('DOMContentLoaded', () => {
    buildExplorer();

    const clearBtn = document.getElementById('kmap-explorer-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearExplorer);

    document.querySelectorAll('.quiz').forEach(quiz => {
        const fb = quiz.querySelector('.feedback');
        if (fb) { fb.setAttribute('role', 'status'); fb.setAttribute('aria-live', 'polite'); }
        const check = quiz.querySelector('.check-steps-btn');
        const reset = quiz.querySelector('.hide-steps-btn');
        if (check) check.addEventListener('click', () => checkQuiz(quiz));
        if (reset) reset.addEventListener('click', () => resetQuiz(quiz));
    });
});
