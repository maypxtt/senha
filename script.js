const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>/?'
};

const ambiguous = '0O1Il';

let history = [];

function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const useUpper = document.getElementById('uppercase').checked;
    const useLower = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    const avoidAmb = document.getElementById('avoid-ambiguous').checked;

    let charset = '';
    if (useUpper) charset += chars.uppercase;
    if (useLower) charset += chars.lowercase;
    if (useNumbers) charset += chars.numbers;
    if (useSymbols) charset += chars.symbols;

    if (!charset) return alert("Escolha pelo menos um tipo de caractere!");

    let password = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
        let idx = randomArray[i] % charset.length;
        let char = charset[idx];
        if (avoidAmb && ambiguous.includes(char)) { i--; continue; }
        password += char;
    }

    // Garantir variedade
    password = ensureTypes(password, useUpper, useLower, useNumbers, useSymbols);
    
    document.getElementById('password').value = password;
    updateStrength(password);
    addToHistory(password);
}

function ensureTypes(pass, u, l, n, s) {
    let arr = pass.split('');
    if (u && !/[A-Z]/.test(pass)) arr[0] = chars.uppercase[Math.floor(Math.random()*26)];
    if (l && !/[a-z]/.test(pass)) arr[1] = chars.lowercase[Math.floor(Math.random()*26)];
    if (n && !/[0-9]/.test(pass)) arr[2] = chars.numbers[Math.floor(Math.random()*10)];
    if (s && !/[^A-Za-z0-9]/.test(pass)) arr[3] = chars.symbols[Math.floor(Math.random()*chars.symbols.length)];
    return arr.join('');
}

function updateStrength(password) {
    let score = (password.length > 15 ? 3 : password.length > 10 ? 2 : 1);
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    fill.style.width = Math.min(score * 20, 100) + '%';

    if (score >= 6) {
        fill.style.background = 'linear-gradient(90deg, #00ff44, #aaff00)';
        text.textContent = 'SENHA PESADA 🔥';
        text.style.color = '#00ff44';
    } else if (score >= 4) {
        fill.style.background = 'linear-gradient(90deg, #ffaa00, #ffff00)';
        text.textContent = 'FORTE';
        text.style.color = '#ffcc00';
    } else {
        fill.style.background = 'linear-gradient(90deg, #ff0000, #ff6600)';
        text.textContent = 'MÉDIA';
        text.style.color = '#ff6666';
    }
}

function addToHistory(password) {
    history.unshift(password);
    if (history.length > 5) history.pop();
    
    const list = document.getElementById('history-list');
    list.innerHTML = history.map(p => `<div class="history-item">${p}</div>`).join('');
}

function createConfetti() {
    for (let i = 0; i < 80; i++) {
        const conf = document.createElement('div');
        conf.textContent = ['🎸','🔥','⚡','🖤'][Math.floor(Math.random()*4)];
        conf.style.position = 'fixed';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-50px';
        conf.style.fontSize = '20px';
        conf.style.zIndex = '1000';
        conf.style.transition = 'all 3s';
        document.body.appendChild(conf);
        
        setTimeout(() => {
            conf.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random()*800}deg)`;
            conf.style.opacity = '0';
        }, 50);
        
        setTimeout(() => conf.remove(), 3500);
    }
}

// Eventos
document.getElementById('generate-btn').addEventListener('click', generatePassword);

document.getElementById('copy-btn').addEventListener('click', () => {
    const pass = document.getElementById('password').value;
    if (!pass) return;
    navigator.clipboard.writeText(pass).then(() => {
        const btn = document.getElementById('copy-btn');
        const original = btn.textContent;
        btn.textContent = '✅ COPIADO!';
        createConfetti();
        setTimeout(() => btn.textContent = original, 1800);
    });
});

document.getElementById('length').addEventListener('input', (e) => {
    document.getElementById('length-value').textContent = e.target.value;
});

window.onload = () => generatePassword();
