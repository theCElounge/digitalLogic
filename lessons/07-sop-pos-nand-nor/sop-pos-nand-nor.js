// ==========================================
// SOP/POS Minimization & NAND/NOR Lesson Logic
// 1. Interactive 3-variable explorer: click a cell to
//    toggle 0/1 and watch the canonical SOP (built from
//    the 1s) and canonical POS (built from the 0s) update
//    live, side by side.
// 2. Self-check quiz (same accessible pattern used across
//    the course: inputs carry data-answer, Check marks
//    correct/incorrect, Reset clears).
// ==========================================

const VAR_NAMES = ['A', 'B', 'C'];
const BC_GRAY = [0, 1, 3, 2]; // column order 00,01,11,10 -> bits (B,C)

// cellState[i] = 0 or 1 for minterm i (3-variable map, 8 cells)
let cellState = new Array(8).fill(0);

function mintermFor(rowA, colIdx) {
    const bc = BC_GRAY[colIdx];
    const B = (bc >> 1) & 1, C = bc & 1;
    return (rowA << 2) | (B << 1) | C;
}

function sopTerm(m) {
    const bits = [(m >> 2) & 1, (m >> 1) & 1, m & 1];
    return bits.map((b, i) => VAR_NAMES[i] + (b ? '' : "'")).join('');
}

function posTerm(m) {
    const bits = [(m >> 2) & 1, (m >> 1) & 1, m & 1];
    const literals = bits.map((b, i) => VAR_NAMES[i] + (b ? "'" : ''));
    return '(' + literals.join(' + ') + ')';
}

function buildExplorer() {
    const table = document.getElementById('sop-pos-table');
    if (!table) return;

    const colLabels = BC_GRAY.map(v => v.toString(2).padStart(2, '0'));
    let thead = '<tr><th class="kmap-corner">A \\ BC</th>';
    colLabels.forEach(l => { thead += `<th>${l}</th>`; });
    thead += '</tr>';
    table.querySelector('thead').innerHTML = thead;

    let tbody = '';
    for (let a = 0; a <= 1; a++) {
        tbody += `<tr><th>${a}</th>`;
        for (let c = 0; c < 4; c++) {
            const m = mintermFor(a, c);
            tbody += `<td><button type="button" class="kmap-cell-btn" data-minterm="${m}" aria-label="Minterm ${m}, currently 0">
                <span class="kmap-cell-glyph">0</span><span class="kmap-mnum">m${m}</span>
            </button></td>`;
        }
        tbody += '</tr>';
    }
    table.querySelector('tbody').innerHTML = tbody;

    table.querySelectorAll('.kmap-cell-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = Number(btn.getAttribute('data-minterm'));
            cellState[m] = cellState[m] === 1 ? 0 : 1;
            paintCell(btn, cellState[m]);
            updateOutput();
        });
    });

    updateOutput();
}

function paintCell(btn, state) {
    const glyph = btn.querySelector('.kmap-cell-glyph');
    btn.classList.remove('state-1');
    if (state === 1) {
        btn.classList.add('state-1');
        glyph.textContent = '1';
    } else {
        glyph.textContent = '0';
    }
    btn.setAttribute('aria-label', `Minterm ${btn.getAttribute('data-minterm')}, currently ${state}`);
}

function updateOutput() {
    const ones = [];
    const zeros = [];
    for (let m = 0; m < 8; m++) {
        (cellState[m] === 1 ? ones : zeros).push(m);
    }

    const sopSum = document.getElementById('sop-sum');
    const sopExpr = document.getElementById('sop-expr');
    const posSum = document.getElementById('pos-sum');
    const posExpr = document.getElementById('pos-expr');
    const announcer = document.getElementById('sop-pos-announcer');

    if (sopSum) sopSum.innerHTML = ones.length ? `F = &Sigma;(${ones.join(', ')})` : 'F = 0';
    if (sopExpr) sopExpr.innerHTML = ones.length ? ones.map(sopTerm).join(' + ') : '0';

    if (posSum) posSum.innerHTML = zeros.length ? `F = &Pi;(${zeros.join(', ')})` : 'F = 1';
    if (posExpr) posExpr.innerHTML = zeros.length ? zeros.map(posTerm).join(' ') : '1';

    if (announcer) {
        announcer.textContent = `${ones.length} minterms and ${zeros.length} maxterms selected.`;
    }
}

function clearExplorer() {
    cellState = new Array(8).fill(0);
    document.querySelectorAll('#sop-pos-table .kmap-cell-btn').forEach(btn => paintCell(btn, 0));
    updateOutput();
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

    const clearBtn = document.getElementById('sop-pos-clear');
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
