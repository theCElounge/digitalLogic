// Utility functions for binary addition, 1's complement, 2's complement, subtraction, etc.

function padLeft(str, len, char = '0') {
    str = String(str);
    while (str.length < len) str = char + str;
    return str;
}

// --- Binary Addition (Unsigned & Signed) ---
function showAddSteps(a, b, cardId, signed = false) {
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const checkBtn = card.querySelector('.check-steps-btn');
    const feedback = card.querySelector('.feedback');
    // Add Hide Steps button
    let hideBtn = card.querySelector('.hide-steps-btn');
    if (!hideBtn) {
        hideBtn = document.createElement('button');
        hideBtn.textContent = 'Hide Steps';
        hideBtn.className = 'hide-steps-btn';
        hideBtn.onclick = function() { hideSteps(cardId); };
        hideBtn.style.marginLeft = '1rem';
        card.insertBefore(hideBtn, form);
    }
    hideBtn.style.display = 'inline-block';
    // Hide Show Steps button
    let showBtn = card.querySelector('button:not(.hide-steps-btn):not(.check-steps-btn)');
    if (showBtn) showBtn.style.display = 'none';
    form.innerHTML = '';
    feedback.textContent = '';
    let maxLen = Math.max(a.length, b.length);
    let aPad = padLeft(a, maxLen);
    let bPad = padLeft(b, maxLen);
    let carry = Array(maxLen + 1).fill(0);
    // Horizontal layout: Carry row, A row, B row, Sum row
    form.innerHTML += '<div class="add-horizontal-row"><span>Carry In:</span>' + Array(maxLen).fill(0).map((_,i) => `<input type='number' class='carry-in' data-idx='${i}' placeholder='C${i}'>`).join('') + '</div>';
    form.innerHTML += '<div class="add-horizontal-row"><span>A:</span>' + aPad.split('').map((bit,i) => `<input type='number' class='a-bit' data-idx='${i}' value='${bit}' readonly>`).join('') + '</div>';
    form.innerHTML += '<div class="add-horizontal-row"><span>B:</span>' + bPad.split('').map((bit,i) => `<input type='number' class='b-bit' data-idx='${i}' value='${bit}' readonly>`).join('') + '</div>';
    form.innerHTML += '<div class="add-horizontal-row"><span>Sum:</span>' + Array(maxLen).fill(0).map((_,i) => `<input type='number' class='sum-bit' data-idx='${i}' placeholder='S${i}'>`).join('') + '</div>';
    form.style.display = 'block';
    checkBtn.style.display = 'inline-block';
}

function hideSteps(cardId) {
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const checkBtn = card.querySelector('.check-steps-btn');
    const feedback = card.querySelector('.feedback');
    let hideBtn = card.querySelector('.hide-steps-btn');
    let showBtn = card.querySelector('button:not(.hide-steps-btn):not(.check-steps-btn)');
    form.style.display = 'none';
    checkBtn.style.display = 'none';
    feedback.textContent = '';
    if (hideBtn) hideBtn.style.display = 'none';
    if (showBtn) showBtn.style.display = 'inline-block';
}

function checkAddSteps(event, a, b, cardId, signed = false) {
    event.preventDefault();
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const feedback = card.querySelector('.feedback');
    let maxLen = Math.max(a.length, b.length);
    let aPad = padLeft(a, maxLen);
    let bPad = padLeft(b, maxLen);
    let carry = Array(maxLen + 1).fill(0);
    let correct = true;
    // Calculate correct carries and sums
    for (let i = maxLen - 1; i >= 0; i--) {
        let ai = Number(aPad[i]);
        let bi = Number(bPad[i]);
        let cIn = carry[i + 1];
        let sum = ai + bi + cIn;
        let sumBit = sum % 2;
        let cOut = Math.floor(sum / 2);
        carry[i] = cOut;
        // Check user input
        let cInInput = form.querySelector(`.carry-in[data-idx='${i}']`);
        let sumInput = form.querySelector(`.sum-bit[data-idx='${i}']`);
        cInInput.style.background = '';
        sumInput.style.background = '';
        if (Number(cInInput.value) !== cIn) {
            cInInput.style.background = '#fee2e2';
            correct = false;
        }
        if (Number(sumInput.value) !== sumBit) {
            sumInput.style.background = '#fee2e2';
            correct = false;
        }
    }
    if (correct) {
        feedback.textContent = '✅ All answers are correct!';
        feedback.style.color = '#10b981';
    } else {
        feedback.textContent = '❌ Check your answers.';
        feedback.style.color = '#ef4444';
    }
}

// --- 1's Complement ---
function showOnesCompSteps(bin, cardId) {
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const checkBtn = card.querySelector('.check-steps-btn');
    const feedback = card.querySelector('.feedback');
    // Add Hide Steps button
    let hideBtn = card.querySelector('.hide-steps-btn');
    if (!hideBtn) {
        hideBtn = document.createElement('button');
        hideBtn.textContent = 'Hide Steps';
        hideBtn.className = 'hide-steps-btn';
        hideBtn.onclick = function() { hideSteps(cardId); };
        hideBtn.style.marginLeft = '1rem';
        card.insertBefore(hideBtn, form);
    }
    hideBtn.style.display = 'inline-block';
    // Hide Show Steps button
    let showBtn = card.querySelector('button:not(.hide-steps-btn):not(.check-steps-btn)');
    if (showBtn) showBtn.style.display = 'none';
    form.innerHTML = '';
    feedback.textContent = '';
    for (let i = 0; i < bin.length; i++) {
        form.innerHTML += `
        <div class="calc-box">
            <div class="input-group">
                <span>Bit ${i}</span>
                <input type="number" class="orig-bit" data-idx="${i}" value="${bin[i]}" readonly>
            </div>
            <div class="input-group">
                <span>1's Complement</span>
                <input type="number" class="ones-bit" data-idx="${i}" placeholder="Complement">
            </div>
        </div>
        `;
    }
    form.style.display = 'block';
    checkBtn.style.display = 'inline-block';
}

function checkOnesCompSteps(event, bin, cardId) {
    event.preventDefault();
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const feedback = card.querySelector('.feedback');
    let correct = true;
    for (let i = 0; i < bin.length; i++) {
        let orig = Number(bin[i]);
        let expected = orig === 0 ? 1 : 0;
        let input = form.querySelector(`.ones-bit[data-idx='${i}']`);
        input.style.background = '';
        if (Number(input.value) !== expected) {
            input.style.background = '#fee2e2';
            correct = false;
        }
    }
    if (correct) {
        feedback.textContent = '✅ All answers are correct!';
        feedback.style.color = '#10b981';
    } else {
        feedback.textContent = '❌ Check your answers.';
        feedback.style.color = '#ef4444';
    }
}

// --- 2's Complement ---
function showTwosCompSteps(bin, cardId) {
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const checkBtn = card.querySelector('.check-steps-btn');
    const feedback = card.querySelector('.feedback');
    // Add Hide Steps button
    let hideBtn = card.querySelector('.hide-steps-btn');
    if (!hideBtn) {
        hideBtn = document.createElement('button');
        hideBtn.textContent = 'Hide Steps';
        hideBtn.className = 'hide-steps-btn';
        hideBtn.onclick = function() { hideSteps(cardId); };
        hideBtn.style.marginLeft = '1rem';
        card.insertBefore(hideBtn, form);
    }
    hideBtn.style.display = 'inline-block';
    // Hide Show Steps button
    let showBtn = card.querySelector('button:not(.hide-steps-btn):not(.check-steps-btn)');
    if (showBtn) showBtn.style.display = 'none';
    form.innerHTML = '';
    feedback.textContent = '';
    // Step 1: 1's complement
    for (let i = 0; i < bin.length; i++) {
        form.innerHTML += `
        <div class="calc-box">
            <div class="input-group">
                <span>Bit ${i}</span>
                <input type="number" class="orig-bit" data-idx="${i}" value="${bin[i]}" readonly>
            </div>
            <div class="input-group">
                <span>1's Complement</span>
                <input type="number" class="ones-bit" data-idx="${i}" placeholder="Complement">
            </div>
        </div>
        `;
    }
    // Step 2: Add 1
    form.innerHTML += `<div class="calc-box"><div class="input-group"><span>Add 1</span><input type="number" class="add-one" value="1" readonly></div></div>`;
    // Step 3: Final 2's complement
    form.innerHTML += `<div class="calc-box"><div class="input-group"><span>2's Complement Result</span><input type="text" class="twos-result" placeholder="Result"></div></div>`;
    form.style.display = 'block';
    checkBtn.style.display = 'inline-block';
}

function checkTwosCompSteps(event, bin, cardId) {
    event.preventDefault();
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const feedback = card.querySelector('.feedback');
    let ones = '';
    for (let i = 0; i < bin.length; i++) {
        let orig = Number(bin[i]);
        let expected = orig === 0 ? 1 : 0;
        let input = form.querySelector(`.ones-bit[data-idx='${i}']`);
        input.style.background = '';
        if (Number(input.value) !== expected) {
            input.style.background = '#fee2e2';
            feedback.textContent = '❌ Check your 1\'s complement.';
            feedback.style.color = '#ef4444';
            return;
        }
        ones += expected;
    }
    // Add 1
    let twos = (parseInt(ones, 2) + 1).toString(2);
    twos = padLeft(twos, bin.length);
    let resultInput = form.querySelector('.twos-result');
    resultInput.style.background = '';
    if (resultInput.value.replace(/\s/g, '') !== twos) {
        resultInput.style.background = '#fee2e2';
        feedback.textContent = '❌ Check your 2\'s complement result.';
        feedback.style.color = '#ef4444';
        return;
    }
    feedback.textContent = '✅ All answers are correct!';
    feedback.style.color = '#10b981';
}

// --- Binary Subtraction (Unsigned & Signed) ---
function showSubSteps(a, b, cardId, signed = false) {
    // For simplicity, show 2's complement addition steps
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const checkBtn = card.querySelector('.check-steps-btn');
    const feedback = card.querySelector('.feedback');
    // Add Hide Steps button
    let hideBtn = card.querySelector('.hide-steps-btn');
    if (!hideBtn) {
        hideBtn = document.createElement('button');
        hideBtn.textContent = 'Hide Steps';
        hideBtn.className = 'hide-steps-btn';
        hideBtn.onclick = function() { hideSteps(cardId); };
        hideBtn.style.marginLeft = '1rem';
        card.insertBefore(hideBtn, form);
    }
    hideBtn.style.display = 'inline-block';
    // Hide Show Steps button
    let showBtn = card.querySelector('button:not(.hide-steps-btn):not(.check-steps-btn)');
    if (showBtn) showBtn.style.display = 'none';
    form.innerHTML = '';
    feedback.textContent = '';
    // Step 1: 2's complement of subtrahend
    form.innerHTML += `<div class="calc-box"><div class="input-group"><span>Subtrahend (${b}) 2's Complement</span><input type="text" class="twos-sub" placeholder="2's Complement"></div></div>`;
    // Step 2: Add to minuend
    form.innerHTML += `<div class="calc-box"><div class="input-group"><span>Minuend (${a}) + 2's Comp</span><input type="text" class="sum-sub" placeholder="Sum"></div></div>`;
    // Step 3: Final answer
    form.innerHTML += `<div class="calc-box"><div class="input-group"><span>Final Answer</span><input type="text" class="final-sub" placeholder="Result"></div></div>`;
    form.style.display = 'block';
    checkBtn.style.display = 'inline-block';
}

function checkSubSteps(event, a, b, cardId, signed = false) {
    event.preventDefault();
    const card = document.getElementById(cardId);
    const form = card.querySelector('.steps-form');
    const feedback = card.querySelector('.feedback');
    // Step 1: 2's complement of subtrahend
    let ones = '';
    for (let i = 0; i < b.length; i++) {
        let orig = Number(b[i]);
        let expected = orig === 0 ? 1 : 0;
        ones += expected;
    }
    let twos = (parseInt(ones, 2) + 1).toString(2);
    twos = padLeft(twos, b.length);
    let twosInput = form.querySelector('.twos-sub');
    twosInput.style.background = '';
    if (twosInput.value.replace(/\s/g, '') !== twos) {
        twosInput.style.background = '#fee2e2';
        feedback.textContent = '❌ Check your 2\'s complement.';
        feedback.style.color = '#ef4444';
        return;
    }
    // Step 2: Add to minuend
    let sum = (parseInt(a, 2) + parseInt(twos, 2)).toString(2);
    sum = padLeft(sum, Math.max(a.length, b.length));
    let sumInput = form.querySelector('.sum-sub');
    sumInput.style.background = '';
    if (sumInput.value.replace(/\s/g, '') !== sum) {
        sumInput.style.background = '#fee2e2';
        feedback.textContent = '❌ Check your sum.';
        feedback.style.color = '#ef4444';
        return;
    }
    // Step 3: Final answer (lowest bits, same length as minuend)
    let final = sum.slice(-a.length);
    let finalInput = form.querySelector('.final-sub');
    finalInput.style.background = '';
    if (finalInput.value.replace(/\s/g, '') !== final) {
        finalInput.style.background = '#fee2e2';
        feedback.textContent = '❌ Check your final answer.';
        feedback.style.color = '#ef4444';
        return;
    }
    feedback.textContent = '✅ All answers are correct!';
    feedback.style.color = '#10b981';
}
