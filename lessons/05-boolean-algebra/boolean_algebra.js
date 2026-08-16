// ==========================================
// Solution Toggler
// ==========================================
function toggleSolution(id) {
    const el = document.getElementById(id);
    const btn = document.querySelector(`button[aria-controls='${id}']`);
    
    if (el.style.display === 'none') {
        el.style.display = 'block';
        el.style.animation = 'fadeUp 0.3s ease-out forwards';
        if (btn) btn.setAttribute('aria-expanded', 'true');
    } else {
        el.style.display = 'none';
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

// ==========================================
// Truth Table Checker
// ==========================================
function checkTruthTable(event) {
    if (event) event.preventDefault();
    
    // The correct answers for z = a'b' + a'b + c
    const answers = [1, 1, 1, 1, 0, 1, 0, 1];
    let correct = true;
    
    for (let i = 0; i < 8; i++) {
        const input = document.querySelector(`input[data-row='${i}']`);
        if (!input) continue;
        
        input.classList.remove('correct', 'incorrect');
        
        // Blank input check
        if (input.value === '') {
            input.classList.add('incorrect');
            correct = false;
            continue;
        }

        if (Number(input.value) === answers[i]) {
            input.classList.add('correct');
        } else {
            input.classList.add('incorrect');
            correct = false;
        }
    }
    
    // Animation and Feedback
    const feedback = document.getElementById('tt-feedback');
    feedback.style.animation = 'none';
    void feedback.offsetWidth; // Reflow
    feedback.style.animation = 'fadeUp 0.3s ease-out forwards';
    
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    
    if (correct) {
        feedback.textContent = '✅ Outstanding! All answers are correct.';
        feedback.style.color = 'var(--accent-color)';
    } else {
        feedback.textContent = '❌ Some answers are incorrect. Check the red boxes and try again.';
        feedback.style.color = 'var(--error-color)';
    }
}

// ==========================================
// Interactive Boolean Lab (z = a'b' + a'b + c)
// ==========================================
const vars = { a: 0, b: 0, c: 0 };

function toggleVar(vName) {
    // Toggle state
    vars[vName] = vars[vName] === 0 ? 1 : 0;
    
    // Update Button
    const btn = document.getElementById(`var-${vName}`);
    btn.innerHTML = `${vars[vName]}<br><span>Var ${vName}</span>`;
    btn.classList.toggle('active', vars[vName] === 1);
    btn.setAttribute('aria-pressed', vars[vName] === 1);
    
    evaluateEquation();
}

function evaluateEquation() {
    const a = vars.a;
    const b = vars.b;
    const c = vars.c;
    
    // 1. NOTs
    const notA = a === 0 ? 1 : 0;
    const notB = b === 0 ? 1 : 0;
    
    // 2. ANDs
    const term1 = notA & notB; // a'b'
    const term2 = notA & b;    // a'b
    
    // 3. ORs
    const result = term1 | term2 | c;
    
    // Format UI Output
    document.getElementById('step-sub').innerHTML = `(${a})'(${b})' + (${a})'(${b}) + ${c}`;
    document.getElementById('step-not').innerHTML = `(${notA})(${notB}) + (${notA})(${b}) + ${c}`;
    document.getElementById('step-and').innerHTML = `${term1} + ${term2} + ${c}`;
    document.getElementById('step-res').innerHTML = `${result}`;
}

// Run initial evaluation on page load
window.onload = evaluateEquation;