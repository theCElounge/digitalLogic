// ==========================================
// Truth Table Generators
// ==========================================
function showTruthTable(id, inputs, outputs, answerRows) {
    const section = document.getElementById(id);
    if (!section) return;
    
    const form = section.querySelector('.tt-form');
    const checkBtn = section.querySelector('.check-tt-btn');
    const hideBtn = section.querySelector('.hide-steps-btn');
    const showBtn = section.querySelector('button:not(.hide-steps-btn):not(.check-tt-btn)');
    const feedback = section.querySelector('.feedback');
    
    form.innerHTML = '';
    feedback.textContent = '';
    
    let table = `<table class='tt-table' role='table'><thead><tr>`;
    inputs.forEach(i => table += `<th scope='col'>${i}</th>`);
    outputs.forEach(o => table += `<th scope='col'>${o}</th>`);
    table += `</tr></thead><tbody>`;
    
    answerRows.forEach((row, rIdx) => {
        table += '<tr>';
        // Inputs
        for (let i = 0; i < inputs.length; i++) {
            table += `<td>${row[i]}</td>`;
        }
        // Outputs (user input)
        for (let o = 0; o < outputs.length; o++) {
            const inputId = `${id}-row${rIdx}-out${o}`;
            table += `<td><label for='${inputId}' class='sr-only'>Output ${outputs[o]} for row ${rIdx+1}</label>
                      <input type='number' min='0' max='1' class='tt-out' data-row='${rIdx}' data-out='${o}' id='${inputId}' aria-label='Output ${outputs[o]} for row ${rIdx+1}'></td>`;
        }
        table += '</tr>';
    });
    table += '</tbody></table>';
    
    form.innerHTML = table;
    form.style.display = 'block';
    checkBtn.style.display = 'inline-block';
    hideBtn.style.display = 'inline-block';
    if (showBtn) showBtn.style.display = 'none';
}

function hideTruthTable(id) {
    const section = document.getElementById(id);
    if (!section) return;
    
    const form = section.querySelector('.tt-form');
    const checkBtn = section.querySelector('.check-tt-btn');
    const hideBtn = section.querySelector('.hide-steps-btn');
    const showBtn = section.querySelector('button:not(.hide-steps-btn):not(.check-tt-btn)');
    const feedback = section.querySelector('.feedback');
    
    form.style.display = 'none';
    checkBtn.style.display = 'none';
    hideBtn.style.display = 'none';
    if (showBtn) showBtn.style.display = 'inline-block';
    feedback.textContent = '';
}

// ==========================================
// Answer Checking & Animation Logic
// ==========================================

// Helper function to trigger smooth animations
function triggerFeedback(feedbackElement, isCorrect, successMsg, failMsg) {
    // Reset animation
    feedbackElement.style.animation = 'none';
    void feedbackElement.offsetWidth; // Trigger reflow
    feedbackElement.style.animation = ''; // Re-apply animation from CSS
    
    feedbackElement.setAttribute('role', 'status');
    feedbackElement.setAttribute('aria-live', 'polite');
    
    if (isCorrect) {
        feedbackElement.textContent = successMsg || '✅ Correct!';
        feedbackElement.style.color = 'var(--accent-color)'; // Uses the green from CSS
    } else {
        feedbackElement.textContent = failMsg || '❌ Try again.';
        feedbackElement.style.color = 'var(--error-color)'; // Uses the rose from CSS
    }
}

function checkTruthTable(event, id, inputs, outputs, answerRows) {
    event.preventDefault();
    const section = document.getElementById(id);
    const form = section.querySelector('.tt-form');
    const feedback = section.querySelector('.feedback');
    let correct = true;
    
    answerRows.forEach((row, rIdx) => {
        for (let o = 0; o < outputs.length; o++) {
            const input = form.querySelector(`input.tt-out[data-row='${rIdx}'][data-out='${o}']`);
            if (!input) continue;
            
            input.classList.remove('correct', 'incorrect');
            if (Number(input.value) === row[inputs.length + o]) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                correct = false;
            }
        }
    });
    
    triggerFeedback(feedback, correct, '✅ All answers are correct!', '❌ Check your answers.');
}

function checkCircuitOutput(event, qnum, correct) {
    event.preventDefault();
    const input = document.getElementById(`circuit${qnum}-output`);
    const feedback = document.getElementById(`circuit${qnum}-feedback`);
    
    const isCorrect = Number(input.value) === correct;
    triggerFeedback(feedback, isCorrect);
}

// ==========================================
// Boolean Expression Evaluator
// ==========================================

// Helper function to turn a string like "x'y+x(y+z)" into evaluatable JavaScript
function evaluateBoolean(expr, varNames, varValues) {
    let str = expr.replace(/\s+/g, '').toLowerCase();
    
    // 1. Standardize explicit AND/OR symbols
    str = str.replace(/[\.\*·]/g, '&').replace(/\+/g, '|');
    
    // 2. Convert NOT suffix (e.g. x' or (x+y)') to prefix (!x or !(x+y))
    while(str.includes("'")) {
        let idx = str.indexOf("'");
        if (idx === 0) { str = str.substring(1); continue; } // Handle stray marks
        
        if (str[idx-1] === ')') {
            // Find the matching opening parenthesis
            let parens = 1;
            let i = idx - 2;
            while(i >= 0 && parens > 0) {
                if (str[i] === ')') parens++;
                if (str[i] === '(') parens--;
                i--;
            }
            let start = i + 1;
            str = str.substring(0, start) + "!" + str.substring(start, idx) + str.substring(idx+1);
        } else {
            // Single variable NOT
            let start = idx - 1;
            str = str.substring(0, start) + "!" + str.substring(start, idx) + str.substring(idx+1);
        }
    }
    
    // 3. Convert alternative NOT (~) to standard JS (!)
    str = str.replace(/~/g, '!');
    
    // 4. Insert implicit ANDs (e.g., xy -> x&y,  x(y+z) -> x&(y|z) )
    str = str.replace(/([a-z\)])(?=[a-z!\(])/g, '$1&');
    
    // 5. Evaluate the expression with real values
    try {
        // Security/Error Check: only allow safe math characters
        if (/[^a-z&\|!\(\)]/.test(str)) return null; 
        
        // Create a dynamic function mapping varNames to varValues
        const func = new Function(...varNames, `return !!(${str});`);
        return func(...varValues);
    } catch(e) {
        return null; // Invalid expression formatting
    }
}

// The new smart checking function
function checkLogicFunction(event, qnum, correct) {
    event.preventDefault();
    const input = document.getElementById(`circuit${qnum}-func`);
    const feedback = document.getElementById(`circuit${qnum}-feedback`);
    
    let user = input.value;
    let answer = correct;
    
    // Extract unique variables (e.g., identifies if they used x,y,z or a,b,c)
    let userVars = Array.from(new Set(user.match(/[a-zA-Z]/g) || [])).map(v => v.toLowerCase()).sort();
    let correctVars = Array.from(new Set(answer.match(/[a-zA-Z]/g) || [])).map(v => v.toLowerCase()).sort();
    
    let mappedUser = user.toLowerCase();
    
    // If student used x,y,z instead of a,b,c, we auto-map them alphabetically so the math still works
    if (userVars.join('') !== correctVars.join('') && userVars.length === correctVars.length) {
        let temp = mappedUser;
        userVars.forEach((v, i) => {
            // Uppercase temporarily to avoid double-replacing
            temp = temp.replace(new RegExp(v, 'g'), correctVars[i].toUpperCase());
        });
        mappedUser = temp.toLowerCase();
    }
    
    // Generate Truth Tables based on number of variables
    let numVars = correctVars.length;
    let numRows = Math.pow(2, numVars); // 3 variables = 8 rows
    
    let isCorrect = true;
    let isValid = true;
    
    // Test the student's function against the correct function for every possible scenario
    for (let i = 0; i < numRows; i++) {
        let varValues = [];
        
        // Generate binary 0s and 1s for the row (e.g., 0-0-0, 0-0-1...)
        for (let v = 0; v < numVars; v++) {
            varValues.push((i >> (numVars - 1 - v)) & 1);
        }
        
        let userResult = evaluateBoolean(mappedUser, correctVars, varValues);
        let correctResult = evaluateBoolean(answer, correctVars, varValues);
        
        // If it returns null, their syntax was fundamentally broken
        if (userResult === null) {
            isValid = false;
            break;
        }
        
        // If even one row of the truth table outputs the wrong value, the whole function is wrong
        if (userResult !== correctResult) {
            isCorrect = false;
            break;
        }
    }
    
    // Trigger feedback (Requires the triggerFeedback function from previous step)
    if (!isValid) {
        triggerFeedback(feedback, false, '', '❌ Invalid format. Check your syntax.');
        return;
    }
    
    triggerFeedback(feedback, isCorrect);
}

// ==========================================
// Interactive Simulator Logic
// ==========================================

// Store the current state of all simulators
const simState = {
    and: { a: 0, b: 0 },
    or:  { a: 0, b: 0 },
    not: { a: 0 }
};

// Function called when a user clicks an input button
// Function called when a user clicks an input button
function toggleSimInput(gate, input) {
    // Toggle the state between 0 and 1
    simState[gate][input] = simState[gate][input] === 0 ? 1 : 0;
    
    // Update the button visually and accessibly
    const btn = document.getElementById(`${gate}-in-${input}`);
    btn.textContent = `Input ${input}: ${simState[gate][input]}`;
    
    if (simState[gate][input] === 1) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true'); // <--- ADDED THIS
    } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false'); // <--- ADDED THIS
    }
    
    // Recalculate the output
    updateSimOutput(gate);
}

// Recalculates and visually updates the output box
function updateSimOutput(gate) {
    let outVal = 0;
    
    // Logic for each gate
    if (gate === 'and') {
        outVal = (simState.and.a === 1 && simState.and.b === 1) ? 1 : 0;
    } else if (gate === 'or') {
        outVal = (simState.or.a === 1 || simState.or.b === 1) ? 1 : 0;
    } else if (gate === 'not') {
        outVal = simState.not.a === 0 ? 1 : 0;
    }
    
    // Update the output visually
    const outEl = document.getElementById(`${gate}-out`);
    outEl.textContent = `Output: ${outVal}`;
    
    if (outVal === 1) {
        outEl.classList.add('active');
    } else {
        outEl.classList.remove('active');
    }
}