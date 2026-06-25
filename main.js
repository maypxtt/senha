// main.js - Versão corrigida
(function() {
  "use strict";

  // Elementos
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

  // Conjuntos de caracteres
  const LETRAS_MAIUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LETRAS_MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMEROS = '0123456789';
  const SIMBOLOS = '!@#$%*?&+-=';
  const CARACTERES_ESPECIAIS = '()[]{}<>;:,._~|/';

  // Caracteres ambíguos (que podem ser confundidos)
  const AMBIGUOS = '0OIl1|';

  // Estado
  let tamanhoSenha = 12;
  let senhaAtual = '';

  // Atualiza o display do tamanho
  function atualizarTamanhoDisplay() {
    tamanhoTexto.textContent = tamanhoSenha;
  }

  // Ativa/desativa botão gerar com base no tamanho (regra: tamanho >= 6)
  function atualizarBotaoGerar() {
    btnGerar.disabled = tamanhoSenha < 6;
  }

  // Remove caracteres ambíguos de um conjunto
  function removerAmbiguos(conjunto) {
    let resultado = '';
    for (let i = 0; i < conjunto.length; i++) {
      if (!AMBIGUOS.includes(conjunto[i])) {
        resultado += conjunto[i];
      }
    }
    return resultado;
  }

  // Função para pegar um caractere aleatório de um conjunto
  function pegarCaractereAleatorio(conjunto) {
    if (conjunto.length === 0) return '';
    const indice = Math.floor(Math.random() * conjunto.length);
    return conjunto[indice];
  }

  // Gera a senha com base nas opções e tamanho atuais
  function gerarSenha() {
    // Coleta os conjuntos selecionados
    let conjuntos = [];
    let conjuntosNomes = [];

    if (chkMaius.checked) {
      let conjunto = LETRAS_MAIUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) {
        conjuntos.push(conjunto);
        conjuntosNomes.push('maiusculas');
      }
    }

    if (chkMinus.checked) {
      let conjunto = LETRAS_MINUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) {
        conjuntos.push(conjunto);
        conjuntosNomes.push('minusculas');
      }
    }

    if (chkNum.checked) {
      let conjunto = NUMEROS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) {
        conjuntos.push(conjunto);
        conjuntosNomes.push('numeros');
      }
    }

    if (chkSimb.checked) {
      let conjunto = SIMBOLOS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) {
        conjuntos.push(conjunto);
        conjuntosNomes.push('simbolos');
      }
    }

    if (chkEspeciais.checked) {
      let conjunto = CARACTERES_ESPECIAIS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      if (conjunto.length > 0) {
        conjuntos.push(conjunto);
        conjuntosNomes.push('especiais');
      }
    }

    // Se nenhuma opção marcada, usamos maiúsculas como fallback
    if (conjuntos.length === 0) {
      let conjunto = LETRAS_MAIUSCULAS;
      if (chkSemAmbiguos.checked) conjunto = removerAmbiguos(conjunto);
      conjuntos.push(conjunto);
      conjuntosNomes.push('maiusculas');
      chkMaius.checked = true;
    }

    // Cria um alfabeto completo com todos os caracteres
    let alfabetoCompleto = '';
    for (let conjunto of conjuntos) {
      alfabetoCompleto += conjunto;
    }

    // Remove duplicatas do alfabeto completo
    alfabetoCompleto = [...new Set(alfabetoCompleto)].join('');

    // Gera a senha garantindo que cada tipo de caractere apareça pelo menos uma vez
    let senha = '';
    let comprimento = tamanhoSenha;

    // Se o comprimento for menor que o número de conjuntos, ajusta
    if (comprimento < conjuntos.length) {
      comprimento = conjuntos.length;
    }

    // Primeiro, garante que cada conjunto tenha pelo menos um caractere
    for (let i = 0; i < conjuntos.length; i++) {
      let char = pegarCaractereAleatorio(conjuntos[i]);
      senha += char;
    }

    // Preenche o resto da senha com caracteres aleatórios do alfabeto completo
    for (let i = conjuntos.length; i < comprimento; i++) {
      let char = pegarCaractereAleatorio(alfabetoCompleto);
      senha += char;
    }

    // Embaralha a senha para não ficar com os caracteres agrupados
    senha = embaralharString(senha);

    // Se o tamanho da senha for maior que o solicitado, corta
    if (senha.length > tamanhoSenha) {
      senha = senha.substring(0, tamanhoSenha);
    }

    // Se ainda assim a senha estiver menor que o solicitado, completa com caracteres aleatórios
    while (senha.length < tamanhoSenha) {
      senha += pegarCaractereAleatorio(alfabetoCompleto);
    }

    senhaAtual = senha;
    campoSenha.value = senha;

    // Classifica força e entropia
    const tamanhoAlfabeto = alfabetoCompleto.length;
    const entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);
    classificarForca(entropia, tamanhoAlfabeto);
    atualizarEntropiaTexto(entropia);
  }

  // Função para embaralhar uma string (algoritmo Fisher-Yates)
  function embaralharString(str) {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  // Classifica a força e atualiza a barra
  function classificarForca(entropia, tamanhoAlfabeto) {
    forcaBar.classList.remove('fraca', 'media', 'forte');

    let largura = 0;
    let cor = '#ff5e7a';

    if (entropia > 57) {
      largura = 100;
      cor = '#3bdd9b';
      forcaBar.classList.add('forte');
    } else if (entropia > 35 && entropia <= 57) {
      largura = 50;
      cor = '#f5d742';
      forcaBar.classList.add('media');
    } else {
      largura = 25;
      cor = '#ff5e7a';
      forcaBar.classList.add('fraca');
    }

    forcaBar.style.width = largura + '%';
    forcaBar.style.background = cor;
  }

  // Atualiza o texto de entropia com estimativa de dias
  function atualizarEntropiaTexto(entropia) {
    const tentativasPorSegundo = 100e6;
    const segundosPorDia = 60 * 60 * 24;
    const dias = Math.floor(Math.pow(2, entropia) / (tentativasPorSegundo * segundosPorDia));

    let msg = '';
    if (dias < 1) {
      msg = '⏱️ Esta senha pode ser quebrada em menos de 1 dia.';
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

  // Funções de incremento/decremento com validação
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

  // Copiar senha para área de transferência
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

  // Event listeners
  btnInc.addEventListener('click', aumentarTamanho);
  btnDec.addEventListener('click', diminuirTamanho);

  // Checkboxes: regeneram senha ao mudar
  [chkMaius, chkMinus, chkNum, chkSimb, chkEspeciais, chkSemAmbiguos].forEach(chk => {
    chk.addEventListener('change', () => {
      gerarSenha();
    });
  });

  // Botão gerar manual
  btnGerar.addEventListener('click', gerarSenha);

  // Botão copiar
  btnCopiar.addEventListener('click', copiarSenha);

  // Inicialização
  function init() {
    tamanhoSenha = 12;
    atualizarTamanhoDisplay();
    atualizarBotaoGerar();
    chkMaius.checked = true;
    chkMinus.checked = false;
    chkNum.checked = false;
    chkSimb.checked = false;
    chkEspeciais.checked = false;
    chkSemAmbiguos.checked = false;
    gerarSenha();
  }

  init();

  window.gerarSenha = gerarSenha;
})();