// ==========================================
// 8-Bit Binary Explorer Logic
// ==========================================
const bitValues = [1, 2, 4, 8, 16, 32, 64, 128]; // Index 0 is the 1s place
let bits = [0, 0, 0, 0, 0, 0, 0, 0]; 

// Unicode superscripts for 0-7 to make the math look authentic
const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷']; 

function toggleBit(index) {
    // Toggle state
    bits[index] = bits[index] === 0 ? 1 : 0;
    
    // Update Button Visuals & Accessibility
    const btn = document.getElementById(`bit-${index}`);
    btn.innerHTML = `${bits[index]}<br><span>${bitValues[index]}</span>`;
    btn.classList.toggle('active', bits[index] === 1);
    btn.setAttribute('aria-pressed', bits[index] === 1);
    
    // Calculate new decimal sum
    let sum = 0;
    let equationParts = [];
    let powerParts = [];
    
    for (let i = 7; i >= 0; i--) {
        let valueAdded = bits[i] * bitValues[i];
        sum += valueAdded;
        
        // 1. Build the simple numbers equation (e.g., 128 + 0 + 32...)
        equationParts.push(bits[i] === 1 ? `<strong style="color:var(--primary-color)">${valueAdded}</strong>` : `0`);
        
        // 2. Build the powers equation (e.g., 1×2⁷ + 0×2⁶...)
        let powerText = `${bits[i]}&times;2${superscripts[i]}`;
        powerParts.push(bits[i] === 1 ? `<strong style="color:var(--primary-color)">${powerText}</strong>` : powerText);
    }
    
    // Update visual equations
    document.getElementById('bin-powers').innerHTML = powerParts.join(' + ');
    document.getElementById('bin-equation').innerHTML = `${equationParts.join(' + ')} = <br><span class="sim-result">${sum}</span>`;
    
    // Update Screen Reader announcer
    document.getElementById('bin-announcer').textContent = `Decimal value is ${sum}`;
}

// ==========================================
// Hexadecimal Inspector Logic
// ==========================================
let currentHexValue = 0; // 0 to 15

function changeHex(amount) {
    // Increment/Decrement and wrap around (0-15)
    currentHexValue += amount;
    if (currentHexValue < 0) currentHexValue = 15;
    if (currentHexValue > 15) currentHexValue = 0;
    
    // Convert to String representations
    const hexString = currentHexValue.toString(16).toUpperCase();
    const decString = currentHexValue.toString(10);
    const binString = currentHexValue.toString(2).padStart(4, '0'); // Pads to 4 bits (e.g. "0101")
    
    // Update UI
    const display = document.getElementById('hex-display');
    display.textContent = hexString;
    display.setAttribute('aria-label', `Hexadecimal digit ${hexString}`); // Read properly by screen readers
    
    document.getElementById('hex-bin-out').textContent = binString;
    document.getElementById('hex-dec-out').textContent = decString;
}