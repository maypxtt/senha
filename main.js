// main.js - CORRIGIDO: agora as minúsculas aparecem!
(function() {
  "use strict";

  const campoSenha = document.getElementById('campo-senha');
  const tamanhoTexto = document.getElementById('tamanho-texto');
  const btnInc = document.getElementById('btn-inc');
  const btnDec = document.getElementById('btn-dec');
  const btnGerar = document.getElementById('btn-gerar');
  const btnCopiar = document.getElementById('btn-copiar');

  const chkMaius = document.getElementById('chk-maius');
  const chkMinus = document.getElementById('chk-minus');
  const chkNum = document.getElementById('chk-num');
  const chkSimb = document.getElementById('chk-simb');
  const chkEspeciais = document.getElementById('chk-especiais');
  const chkSemAmbiguos = document.getElementById('chk-sem-ambiguos');
  const forcaBar = document.getElementById('forca-bar');
  const entropiaTexto = document.getElementById('entropia-texto');

  const LETRAS_MAIUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LETRAS_MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMEROS = '0123456789';
  const SIMBOLOS = '!@#$%*?&+-=';
  const CARACTERES_ESPECIAIS = '()[]{}<>;:,._~|/';
  const AMBIGUOS = '0OIl1|';

  let tamanhoSenha = 12;
  let senhaAtual = '';

  function atualizarTamanhoDisplay() {
    tamanhoTexto.textContent = tamanhoSenha;
  }

  function atualizarBotaoGerar() {
    btnGerar.disabled = tamanhoSenha < 6;
  }

  function removerAmbiguos(conjunto) {
    let resultado = '';
    for (let i = 0; i < conjunto.length; i++) {
      if (!AMBIGUOS.includes(conjunto[i])) {
        resultado += conjunto[i];
      }
    }
    return resultado;
  }

  function pegarCaractereAleatorio(conjunto) {
    if (conjunto.length === 0) return '';
    const indice = Math.floor(Math.random() * conjunto.length);
    return conjunto[indice];
  }

  function embaralharString(str) {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  function gerarSenha() {
    let conjuntos = [];

    if (chkMaius.checked) {
      let conjunto = LETRAS_MAIUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) conjuntos.push(conjunto);
    }

    if (chkMinus.checked) {
      let conjunto = LETRAS_MINUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) conjuntos.push(conjunto);
    }

    if (chkNum.checked) {
      let conjunto = NUMEROS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) conjuntos.push(conjunto);
    }

    if (chkSimb.checked) {
      let conjunto = SIMBOLOS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) conjuntos.push(conjunto);
    }

    if (chkEspeciais.checked) {
      let conjunto = CARACTERES_ESPECIAIS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) conjuntos.push(conjunto);
    }

    if (conjuntos.length === 0) {
      let conjunto = LETRAS_MAIUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      conjuntos.push(conjunto);
      chkMaius.checked = true;
    }

    let alfabetoCompleto = '';
    for (let conjunto of conjuntos) {
      alfabetoCompleto += conjunto;
    }
    alfabetoCompleto = [...new Set(alfabetoCompleto)].join('');

    let senha = '';
    let comprimento = tamanhoSenha;

    if (comprimento < conjuntos.length) {
      comprimento = conjuntos.length;
    }

    // GARANTE que CADA conjunto tenha pelo menos UM caractere
    for (let i = 0; i < conjuntos.length; i++) {
      let char = pegarCaractereAleatorio(conjuntos[i]);
      senha += char;
    }

    // Preenche o resto com caracteres aleatórios do alfabeto completo
    for (let i = conjuntos.length; i < comprimento; i++) {
      let char = pegarCaractereAleatorio(alfabetoCompleto);
      senha += char;
    }

    // Embaralha para não ficar com os caracteres agrupados
    senha = embaralharString(senha);

    // Ajusta o tamanho final
    if (senha.length > tamanhoSenha) {
      senha = senha.substring(0, tamanhoSenha);
    }

    while (senha.length < tamanhoSenha) {
      senha += pegarCaractereAleatorio(alfabetoCompleto);
    }

    senhaAtual = senha;
    campoSenha.value = senha;

    const tamanhoAlfabeto = alfabetoCompleto.length;
    const entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);
    classificarForca(entropia, tamanhoAlfabeto);
    atualizarEntropiaTexto(entropia);
  }

  function classificarForca(entropia, tamanhoAlfabeto) {
    forcaBar.classList.remove('fraca', 'media', 'forte');

    let largura = 0;
    let cor = '#cc0000';

    if (entropia > 57) {
      largura = 100;
      cor = '#00b894';
      forcaBar.classList.add('forte');
    } else if (entropia > 35 && entropia <= 57) {
      largura = 50;
      cor = '#ffd700';
      forcaBar.classList.add('media');
    } else {
      largura = 25;
      cor = '#cc0000';
      forcaBar.classList.add('fraca');
    }

    forcaBar.style.width = largura + '%';
    forcaBar.style.background = cor;
  }

  function atualizarEntropiaTexto(entropia) {
    const tentativasPorSegundo = 100e6;
    const segundosPorDia = 60 * 60 * 24;
    const dias = Math.floor(Math.pow(2, entropia) / (tentativasPorSegundo * segundosPorDia));

    let msg = '';
    if (dias < 1) {
      msg = '⏱️ Essa senha é "moleque" demais! Pode ser quebrada em menos de 1 dia.';
    } else if (dias < 30) {
      msg = `⏳ Um computador pode levar ${dias} dias para descobrir essa senha.`;
    } else if (dias < 365) {
      const meses = Math.floor(dias / 30);
      msg = `📅 Um computador pode levar cerca de ${meses} meses para descobrir essa senha.`;
    } else if (dias < 36500) {
      const anos = Math.floor(dias / 365);
      msg = `📆 Um computador pode levar cerca de ${anos} anos para descobrir essa senha.`;
    } else {
      msg = `🌌 Um computador pode levar mais de ${Math.floor(dias/365)} anos para descobrir essa senha.`;
    }
    entropiaTexto.textContent = msg;
  }

  function aumentarTamanho() {
    if (tamanhoSenha < 20) {
      tamanhoSenha++;
      atualizarTamanhoDisplay();
      atualizarBotaoGerar();
      gerarSenha();
    }
  }

  function diminuirTamanho() {
    if (tamanhoSenha > 1) {
      tamanhoSenha--;
      atualizarTamanhoDisplay();
      atualizarBotaoGerar();
      gerarSenha();
    }
  }

  function copiarSenha() {
    if (!senhaAtual) return;
    navigator.clipboard.writeText(senhaAtual).then(() => {
      btnCopiar.textContent = '✅';
      setTimeout(() => { btnCopiar.textContent = '📋'; }, 1500);
    }).catch(() => {
      campoSenha.select();
      document.execCommand('copy');
      btnCopiar.textContent = '✅';
      setTimeout(() => { btnCopiar.textContent = '📋'; }, 1500);
    });
  }

  btnInc.addEventListener('click', aumentarTamanho);
  btnDec.addEventListener('click', diminuirTamanho);

  [chkMaius, chkMinus, chkNum, chkSimb, chkEspeciais, chkSemAmbiguos].forEach(chk => {
    chk.addEventListener('change', () => {
      gerarSenha();
    });
  });

  btnGerar.addEventListener('click', gerarSenha);
  btnCopiar.addEventListener('click', copiarSenha);

  function init() {
    tamanhoSenha = 12;
    atualizarTamanhoDisplay();
    atualizarBotaoGerar();
    chkMaius.checked = true;
    chkMinus.checked = true; // <--- CORRIGIDO: minúsculas marcadas por padrão
    chkNum.checked = false;
    chkSimb.checked = false;
    chkEspeciais.checked = false;
    chkSemAmbiguos.checked = false;
    gerarSenha();
  }

  init();

  window.gerarSenha = gerarSenha;
})();