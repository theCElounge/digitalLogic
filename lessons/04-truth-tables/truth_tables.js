// ==========================================
// Truth Table Generators
// ==========================================
function showTruthTable(id, inputs, outputs, answerRows) {
    const section = document.getElementById(id);
    if (!section) return; // Safety check

    const form = section.querySelector('.tt-form');
    const checkBtn = section.querySelector('.check-tt-btn');
    const hideBtn = section.querySelector('.hide-steps-btn');
    const feedback = section.querySelector('.feedback');
    
    // Safely find the EXACT "Show Steps" button (ignores simulator buttons)
    const allButtons = Array.from(section.querySelectorAll('button'));
    const showBtn = allButtons.find(btn => btn.textContent.includes('Show Steps') || btn.getAttribute('onclick')?.includes('showTruthTable'));
    
    // Clear previous feedback safely
    if (form) form.innerHTML = '';
    if (feedback) feedback.textContent = '';
    
    // Build the table
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
                      <input type='text' maxlength='1' class='tt-out' data-row='${rIdx}' data-out='${o}' id='${inputId}' aria-label='Output ${outputs[o]} for row ${rIdx+1}'></td>`;
        }
        table += '</tr>';
    });
    table += '</tbody></table>';
    
    // Safely render the table and update button visibility
    if (form) {
        form.innerHTML = table;
        form.style.display = 'block';
    }
    if (checkBtn) checkBtn.style.display = 'inline-block';
    if (hideBtn) hideBtn.style.display = 'inline-block';
    if (showBtn) showBtn.style.display = 'none';
}

function hideTruthTable(id) {
    const section = document.getElementById(id);
    if (!section) return;

    const form = section.querySelector('.tt-form');
    const checkBtn = section.querySelector('.check-tt-btn');
    const hideBtn = section.querySelector('.hide-steps-btn');
    const feedback = section.querySelector('.feedback');
    
    const allButtons = Array.from(section.querySelectorAll('button'));
    const showBtn = allButtons.find(btn => btn.textContent.includes('Show Steps') || btn.getAttribute('onclick')?.includes('showTruthTable'));
    
    if (form) form.style.display = 'none';
    if (checkBtn) checkBtn.style.display = 'none';
    if (hideBtn) hideBtn.style.display = 'none';
    if (showBtn) showBtn.style.display = 'inline-block';
    if (feedback) feedback.textContent = '';
}

// ==========================================
// Answer Checking & Animation Logic
// ==========================================
function triggerFeedback(feedbackElement, isCorrect) {
    if (!feedbackElement) return; // Safety check
    
    feedbackElement.style.animation = 'none';
    void feedbackElement.offsetWidth; // Trigger DOM reflow
    feedbackElement.style.animation = 'fadeUp 0.3s ease-out forwards';
    
    feedbackElement.setAttribute('role', 'status');
    feedbackElement.setAttribute('aria-live', 'polite');
    
    if (isCorrect) {
        feedbackElement.textContent = '✅ All answers are correct!';
        feedbackElement.style.color = 'var(--accent-color)';
    } else {
        feedbackElement.textContent = '❌ Check your answers.';
        feedbackElement.style.color = 'var(--error-color)';
    }
}

function checkTruthTable(event, id, inputs, outputs, answerRows) {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;

    const form = section.querySelector('.tt-form');
    const feedback = section.querySelector('.feedback');
    if (!form) return;

    let correct = true;
    
    answerRows.forEach((row, rIdx) => {
        for (let o = 0; o < outputs.length; o++) {
            const input = form.querySelector(`input.tt-out[data-row='${rIdx}'][data-out='${o}']`);
            if (!input) continue;
            
            input.classList.remove('correct', 'incorrect');
            
            // Convert everything to lowercase string so 'X' matches 'x' and numbers match strings safely
            const expectedAnswer = String(row[inputs.length + o]).toLowerCase();
            const userAnswer = String(input.value).trim().toLowerCase();
            
            if (userAnswer === expectedAnswer) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                correct = false;
            }
        }
    });
    
    triggerFeedback(feedback, correct);
}

// ==========================================
// Interactive Simulator Logic
// ==========================================
const majState = { a: 0, b: 0, c: 0 };
function toggleMajority(input) {
    majState[input] = majState[input] === 0 ? 1 : 0;
    
    const btn = document.getElementById(`maj-in-${input}`);
    if(!btn) return;

    btn.textContent = `Voter ${input.toUpperCase()}: ${majState[input]}`;
    btn.classList.toggle('active', majState[input] === 1);
    btn.setAttribute('aria-pressed', majState[input] === 1);
    
    const totalVotes = majState.a + majState.b + majState.c;
    const isMajority = totalVotes >= 2 ? 1 : 0;
    
    const out = document.getElementById('maj-out');
    if(out) {
        out.textContent = `Result: ${isMajority} ${isMajority ? '(Majority Reached!)' : '(No Majority)'}`;
        out.classList.toggle('active', isMajority === 1);
    }
}