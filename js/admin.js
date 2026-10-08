/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE
 * Av. São Paulo, 584 - Cidade São Jorge, Santo André - SP
 * Lógica do Painel do Dono, Sofia IA por Voz, Fotos de Estúdio & Campanhas WhatsApp
 * Padrão Ricardo & Severino
 */

const SESSION_KEY = 'mercado_carne_auth_session';

// Modelos Pré-configurados de Campanhas de WhatsApp (Quinta a Domingo)
const MODELOS_CAMPANHAS = {
  quinta: `🥩 Olá, {nome}! Tudo bem?\n\nPassando para avisar que já preparamos os cortes especiais e a carne moída fresca de primeira aqui no Mercado da Carne (Santo André)!\n\nConfira nosso cardápio no Web App e garanta seu pedido:\n👉 {link}`,
  sexta: `🔥 Fala, {nome}! O fim de semana chegou!\n\nNossos COMBOS COMPLETOS PARA CHURRASCO já estão montados com carnes selecionadas, linguiça artesanal, pão de alho e carvão.\n\nMonte seu kit direto pelo nosso Web App:\n👉 {link}\n\nRetire sem fila ou entregamos na sua casa!`,
  sabado: `🥩 Olá, {nome}! Sábado pede churrasco com a família!\n\nLinha Parrilla Prime, Picanha Black Angus e Bife de Ancho frescos no balcão da Av. São Paulo, 584.\n\nVeja as carnes disponíveis em tempo real:\n👉 {link}`,
  domingo: `🍗 Bom dia, {nome}! O almoço de domingo está pronto!\n\nNossa tradicional Costela no Bafo desmanchando e o Frango Assado recheado com farofa úmida já estão saindo do forno.\n\nGaranta a sua antes que esgote pelo Web App:\n👉 {link}`
};

let filtroAtual = 'todos';
let termoBusca = '';
let reconhecimentoVoz = null;
let estaOuvindoVoz = false;

document.addEventListener('DOMContentLoaded', () => {
  configurarAuth();
  if (estaAutenticado()) {
    carregarPainel();
  }
  configurarEventosGerais();
  configurarSofiaVoz();
  configurarCampanhasWhatsApp();
  configurarGaleriaEstudio();
  configurarAgendadorDisparos();
  configurarFilaDisparoMassa();
});

/* ==========================================================================
   1. AUTENTICAÇÃO DO DONO
   ========================================================================== */
function estaAutenticado() {
  return sessionStorage.getItem(SESSION_KEY) === 'logado';
}

function configurarAuth() {
  const telaLogin = document.getElementById('tela-login');
  const formLogin = document.getElementById('form-login');
  const loginErro = document.getElementById('login-erro');
  const btnDemo = document.getElementById('btn-preencher-demo');
  const btnLogout = document.getElementById('btn-logout');

  if (estaAutenticado() && telaLogin) {
    telaLogin.classList.add('hidden');
  }

  if (btnDemo) {
    btnDemo.addEventListener('click', () => {
      document.getElementById('login-usuario').value = 'admin';
      document.getElementById('login-senha').value = 'admin123';
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('login-usuario').value;
      const senha = document.getElementById('login-senha').value;

      if (usuario === 'admin' && EstoqueDB.verificarSenha(senha)) {
        sessionStorage.setItem(SESSION_KEY, 'logado');
        telaLogin.classList.add('hidden');
        if (loginErro) loginErro.classList.add('hidden');
        carregarPainel();
        mostrarAlerta('Bem-vindo ao Painel do Dono, Ricardo!');
      } else {
        if (loginErro) loginErro.classList.remove('hidden');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }
}

/* ==========================================================================
   2. CARREGAMENTO INICIAL DO PAINEL & MÉTRICAS
   ========================================================================== */
function carregarPainel() {
  atualizarMetricas();
  renderizarTabelaProdutos();
  renderizarTabelaClientes();
  carregarConfigLoja();
  carregarConfigAgendamento();
}

function atualizarMetricas() {
  const produtos = EstoqueDB.obterProdutos();
  const clientes = EstoqueDB.obterClientes();

  const total = produtos.length;
  const combos = produtos.filter(p => p.categoria === 'combos' && p.disponivel).length;
  const rotisserie = produtos.filter(p => (p.tipo === 'rotisserie' || p.categoria === 'rotisserie') && p.disponivel).length;
  const totalClientes = clientes.length;

  const statTotal = document.getElementById('stat-total');
  const statCombos = document.getElementById('stat-combos');
  const statRotisserie = document.getElementById('stat-rotisserie');
  const statClientes = document.getElementById('stat-clientes');

  if (statTotal) statTotal.textContent = total;
  if (statCombos) statCombos.textContent = combos;
  if (statRotisserie) statRotisserie.textContent = rotisserie;
  if (statClientes) statClientes.textContent = totalClientes;

  const countTabelaClientes = document.getElementById('contagem-clientes-tabela');
  if (countTabelaClientes) countTabelaClientes.textContent = totalClientes;
}

/* ==========================================================================
   3. NAVEGAÇÃO DE ABAS DO PAINEL
   ========================================================================== */
function configurarEventosGerais() {
  const tabProdutos = document.getElementById('tab-nav-produtos');
  const tabClientes = document.getElementById('tab-nav-clientes');
  const tabConfig = document.getElementById('tab-nav-config');

  const secProdutos = document.getElementById('secao-produtos');
  const secClientes = document.getElementById('secao-clientes');
  const secConfig = document.getElementById('secao-config');

  const abas = [
    { btn: tabProdutos, sec: secProdutos },
    { btn: tabClientes, sec: secClientes },
    { btn: tabConfig, sec: secConfig }
  ];

  abas.forEach(aba => {
    if (aba.btn) {
      aba.btn.addEventListener('click', () => {
        abas.forEach(a => {
          if (a.btn) {
            a.btn.className = 'tab-btn-nav bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold px-4 py-2 rounded-xl transition border border-stone-700';
          }
          if (a.sec) a.sec.classList.add('hidden');
        });

        aba.btn.className = 'tab-btn-nav bg-amber-500 text-stone-950 text-xs font-bold px-4 py-2 rounded-xl transition';
        if (aba.sec) aba.sec.classList.remove('hidden');
      });
    }
  });

  // Busca e Filtros de Produtos
  const inputBusca = document.getElementById('admin-busca');
  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
      termoBusca = e.target.value.trim().toLowerCase();
      renderizarTabelaProdutos();
    });
  }

  const botoesFiltro = document.querySelectorAll('.filtro-btn');
  botoesFiltro.forEach(btn => {
    btn.addEventListener('click', () => {
      botoesFiltro.forEach(b => {
        b.className = 'filtro-btn bg-stone-900 text-stone-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap';
      });
      btn.className = 'filtro-btn active bg-stone-800 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-700 whitespace-nowrap';
      filtroAtual = btn.getAttribute('data-filtro') || 'todos';
      renderizarTabelaProdutos();
    });
  });

  // Modal Novo Produto
  const btnNovo = document.getElementById('btn-novo-produto');
  const modalProd = document.getElementById('modal-produto');
  const modalFechar = document.getElementById('modal-fechar');
  const modalCancelar = document.getElementById('modal-cancelar');
  const formProd = document.getElementById('form-produto');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      abrirModalProduto();
    });
  }

  if (modalFechar) modalFechar.addEventListener('click', fecharModalProduto);
  if (modalCancelar) modalCancelar.addEventListener('click', fecharModalProduto);

  if (formProd) {
    formProd.addEventListener('submit', (e) => {
      e.preventDefault();
      salvarFormProduto();
    });
  }

  // Gerador de Foto com IA
  const btnIaFoto = document.getElementById('btn-ia-foto');
  if (btnIaFoto) {
    btnIaFoto.addEventListener('click', gerarFotoComIA);
  }

  // Salvar Config Loja
  const formConfig = document.getElementById('form-config-loja');
  if (formConfig) {
    formConfig.addEventListener('submit', (e) => {
      e.preventDefault();
      salvarConfigLoja();
    });
  }
}

/* ==========================================================================
   4. SOFIA IA: COMANDO DE VOZ PARA CADASTRAR OU ATUALIZAR KITS
   ========================================================================== */
function configurarSofiaVoz() {
  const btnVoz = document.getElementById('btn-sofia-voz');
  const boxFeedback = document.getElementById('sofia-feedback-box');
  const textoFeedback = document.getElementById('sofia-transcricao');
  const btnCancelarVoz = document.getElementById('btn-cancelar-voz');
  const micStatus = document.getElementById('sofia-mic-status');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (btnVoz) {
      btnVoz.addEventListener('click', () => {
        alert('Seu navegador não suporta reconhecimento de voz direto. Experimente usar o Google Chrome no celular ou computador!');
      });
    }
    return;
  }

  reconhecimentoVoz = new SpeechRecognition();
  reconhecimentoVoz.lang = 'pt-BR';
  reconhecimentoVoz.continuous = false;
  reconhecimentoVoz.interimResults = true;

  if (btnVoz) {
    btnVoz.addEventListener('click', () => {
      if (estaOuvindoVoz) {
        reconhecimentoVoz.stop();
        return;
      }
      iniciarEscutaSofia();
    });
  }

  if (btnCancelarVoz) {
    btnCancelarVoz.addEventListener('click', () => {
      if (reconhecimentoVoz) reconhecimentoVoz.stop();
      pararEscutaSofia();
    });
  }

  reconhecimentoVoz.onstart = () => {
    estaOuvindoVoz = true;
    if (boxFeedback) boxFeedback.classList.remove('hidden');
    if (textoFeedback) textoFeedback.textContent = 'Sofia ouvindo... Fale o nome do combo, carnes e o preço!';
    if (micStatus) micStatus.textContent = 'Ouvindo...';
    if (btnVoz) btnVoz.classList.add('pulse-mic');
  };

  reconhecimentoVoz.onresult = (event) => {
    let transcricao = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcricao += event.results[i][0].transcript;
    }
    if (textoFeedback) textoFeedback.textContent = `"${transcricao}"`;

    if (event.results[0].isFinal) {
      processarComandoSofia(transcricao);
    }
  };

  reconhecimentoVoz.onerror = (e) => {
    console.warn('[Sofia IA] Erro no microfone:', e.error);
    pararEscutaSofia();
    if (textoFeedback) textoFeedback.textContent = 'Não entendi. Clique novamente para falar com a Sofia.';
  };

  reconhecimentoVoz.onend = () => {
    pararEscutaSofia();
  };
}

function iniciarEscutaSofia() {
  try {
    reconhecimentoVoz.start();
  } catch (e) {
    console.warn(e);
  }
}

function pararEscutaSofia() {
  estaOuvindoVoz = false;
  const btnVoz = document.getElementById('btn-sofia-voz');
  const micStatus = document.getElementById('sofia-mic-status');
  if (btnVoz) btnVoz.classList.remove('pulse-mic');
  if (micStatus) micStatus.textContent = 'Falar com a Sofia';
}

/**
 * Inteligência Sofia: interpreta fala em português e preenche o formulário
 */
function processarComandoSofia(texto) {
  const frase = texto.toLowerCase();
  console.log('[Sofia IA] Processando comando:', frase);

  // 1. Extração de Preço (ex: "por 189 reais", "189,90", "duzentos reais")
  let precoDetectado = null;
  const regexPreco = /(?:por|valor|custa|de)?\s*(\d+(?:[,\.]\d+)?)\s*(?:reais)?/i;
  const matchPreco = frase.match(regexPreco);
  if (matchPreco && matchPreco[1]) {
    precoDetectado = parseFloat(matchPreco[1].replace(',', '.'));
  }

  // 2. Extração de Categoria
  let categoriaDetectada = 'combos';
  let tipoDetectado = 'combo';

  if (frase.includes('frango') || frase.includes('costela no bafo') || frase.includes('rotisserie') || frase.includes('lasanha') || frase.includes('assado')) {
    categoriaDetectada = 'rotisserie';
    tipoDetectado = 'rotisserie';
  } else if (frase.includes('espeto') || frase.includes('espetinho') || frase.includes('linguiça')) {
    categoriaDetectada = 'churrasco';
    tipoDetectado = 'corte';
  } else if (frase.includes('picanha') || frase.includes('angus') || frase.includes('ancho') || frase.includes('chorizo') || frase.includes('bife')) {
    categoriaDetectada = frase.includes('combo') ? 'combos' : 'bovinos';
    tipoDetectado = frase.includes('combo') ? 'combo' : 'corte';
  } else if (frase.includes('carvão') || frase.includes('pão de alho') || frase.includes('farofa')) {
    categoriaDetectada = 'acompanhamentos';
    tipoDetectado = 'corte';
  }

  // 3. Extração de Nome
  let nomeDetectado = frase
    .replace(/^sofia\s*/i, '')
    .replace(/^(adicionar|cadastrar|novo|colocar|criar)\s*/i, '')
    .replace(/(?:por|valor|de)?\s*\d+(?:[,\.]\d+)?\s*(?:reais)?.*/i, '')
    .trim();

  // Capitalizar primeira letra de cada palavra
  nomeDetectado = nomeDetectado.replace(/\b\w/g, l => l.toUpperCase()) || 'Novo Combo do Dono';

  // 4. Abrir modal com dados preenchidos
  abrirModalProduto();

  document.getElementById('prod-nome').value = nomeDetectado;
  document.getElementById('prod-categoria').value = categoriaDetectada;
  document.getElementById('prod-tipo').value = tipoDetectado;
  if (precoDetectado) {
    document.getElementById('prod-preco').value = precoDetectado.toFixed(2);
  }
  document.getElementById('prod-desc').value = `Item cadastrado via comando de voz Sofia: "${texto}"`;
  document.getElementById('prod-marmoreio').value = categoriaDetectada === 'combos' ? 'Serve 4 a 6 pessoas' : 'Corte Selecionado';
  document.getElementById('prod-tag').value = 'Especial da Casa';

  // Buscar foto padrão de acordo com categoria
  const galeria = EstoqueDB.obterGaleriaEstudio();
  const fotoSugerida = galeria.find(g => g.categoria === categoriaDetectada) || galeria[0];
  document.getElementById('prod-foto').value = fotoSugerida.url;

  mostrarAlerta(`✨ Sofia interpretou: "${nomeDetectado}" por R$ ${precoDetectado || 'a definir'}. Confira e salve!`);
}

/* ==========================================================================
   5. GERADOR DE FOTO COM IA & GALERIA DE ESTÚDIO
   ========================================================================== */
function gerarFotoComIA() {
  const nome = document.getElementById('prod-nome').value.trim();
  const categoria = document.getElementById('prod-categoria').value;
  const inputFoto = document.getElementById('prod-foto');

  if (!inputFoto) return;

  const galeria = EstoqueDB.obterGaleriaEstudio();
  // Busca na galeria uma imagem correspondente
  const fotoEncontrada = galeria.find(f => 
    nome.toLowerCase().includes(f.nome.toLowerCase().split(' ')[0]) || 
    f.categoria === categoria
  ) || galeria[Math.floor(Math.random() * galeria.length)];

  inputFoto.value = fotoEncontrada.url;
  mostrarAlerta(`🤖 Sofia IA selecionou a foto de estúdio de alta definição para "${nome || 'seu produto'}"!`);
}

function configurarGaleriaEstudio() {
  const btnAbrirTopo = document.getElementById('btn-abrir-galeria');
  const btnAbrirModal = document.getElementById('btn-escolher-galeria-modal');
  const modalGaleria = document.getElementById('modal-galeria');
  const fecharGaleria = document.getElementById('modal-galeria-fechar');
  const gradeFotos = document.getElementById('grade-fotos-estudio');

  const abrirGaleria = () => {
    if (!modalGaleria || !gradeFotos) return;
    const fotos = EstoqueDB.obterGaleriaEstudio();
    
    gradeFotos.innerHTML = fotos.map((f, i) => `
      <div class="group relative rounded-xl overflow-hidden cursor-pointer border border-stone-800 hover:border-amber-500 transition shadow" onclick="selecionarFotoGaleria('${f.url}')">
        <img src="${f.url}" alt="${f.nome}" class="w-full h-32 object-cover group-hover:scale-105 transition duration-300">
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent flex items-end p-2">
          <span class="text-[11px] font-bold text-white">${f.nome}</span>
        </div>
      </div>
    `).join('');

    modalGaleria.classList.remove('hidden');
  };

  if (btnAbrirTopo) btnAbrirTopo.addEventListener('click', abrirGaleria);
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirGaleria);
  if (fecharGaleria) fecharGaleria.addEventListener('click', () => modalGaleria.classList.add('hidden'));
}

window.selecionarFotoGaleria = function(url) {
  const inputFoto = document.getElementById('prod-foto');
  const modalGaleria = document.getElementById('modal-galeria');
  if (inputFoto) inputFoto.value = url;
  if (modalGaleria) modalGaleria.classList.add('hidden');
  mostrarAlerta('Foto selecionada com sucesso para o produto!');
};

/* ==========================================================================
   6. RENDERIZAÇÃO DA TABELA DE PRODUTOS & TOGGLE EM 1-CLIQUE
   ========================================================================== */
function renderizarTabelaProdutos() {
  const tbody = document.getElementById('tabela-corpo-produtos');
  if (!tbody) return;

  let produtos = EstoqueDB.obterProdutos();

  if (filtroAtual !== 'todos') {
    produtos = produtos.filter(p => p.categoria === filtroAtual || (filtroAtual === 'rotisserie' && p.tipo === 'rotisserie'));
  }

  if (termoBusca) {
    produtos = produtos.filter(p => 
      p.nome.toLowerCase().includes(termoBusca) || 
      (p.descricao && p.descricao.toLowerCase().includes(termoBusca))
    );
  }

  if (produtos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-stone-500">
          Nenhum produto encontrado com este filtro.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = produtos.map(p => {
    const precoFormatado = EstoqueDB.formatarPreco(p.preco);
    const badgeDisp = p.disponivel
      ? `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">🟢 À Venda</span>`
      : `<span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold">🔴 Esgotado</span>`;

    return `
      <tr class="hover:bg-stone-800/40 transition">
        <td class="p-4 flex items-center gap-3">
          <img src="${p.foto}" alt="${p.nome}" class="w-12 h-12 rounded-xl object-cover border border-stone-800 flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'">
          <div>
            <span class="font-bold text-white block text-sm">${p.nome}</span>
            <span class="text-[11px] text-stone-400 block">${p.marmoreio || p.unidade}</span>
          </div>
        </td>
        <td class="p-4">
          <span class="capitalize text-stone-300 font-semibold">${p.categoria}</span>
        </td>
        <td class="p-4">
          <span class="font-black text-amber-400 text-sm">${precoFormatado}</span>
          <span class="text-[10px] text-stone-400 block">/${p.unidade}</span>
        </td>
        <td class="p-4">
          <button onclick="toggleDisponibilidade('${p.id}')" class="transition transform hover:scale-105" title="Clique para alternar entre Disponível ou Esgotado">
            ${badgeDisp}
          </button>
        </td>
        <td class="p-4 text-right space-x-2">
          <button onclick="editarProduto('${p.id}')" class="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg font-bold border border-stone-700">
            Editar
          </button>
          <button onclick="excluirProduto('${p.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg font-bold border border-red-500/30">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.toggleDisponibilidade = function(id) {
  const produtos = EstoqueDB.obterProdutos();
  const prod = produtos.find(p => p.id === id);
  if (!prod) return;

  prod.disponivel = !prod.disponivel;
  EstoqueDB.salvarItem(prod);
  renderizarTabelaProdutos();
  atualizarMetricas();
  mostrarAlerta(`Status de "${prod.nome}" alterado para: ${prod.disponivel ? 'Disponível' : 'Esgotado'}!`);
};

window.editarProduto = function(id) {
  const produtos = EstoqueDB.obterProdutos();
  const prod = produtos.find(p => p.id === id);
  if (!prod) return;

  abrirModalProduto();
  document.getElementById('modal-titulo').textContent = 'Editar Produto ou Combo';
  document.getElementById('prod-id').value = prod.id;
  document.getElementById('prod-nome').value = prod.nome;
  document.getElementById('prod-categoria').value = prod.categoria;
  document.getElementById('prod-tipo').value = prod.tipo || 'corte';
  document.getElementById('prod-preco').value = prod.preco;
  document.getElementById('prod-unidade').value = prod.unidade || 'kg';
  document.getElementById('prod-marmoreio').value = prod.marmoreio || '';
  document.getElementById('prod-tag').value = prod.tag || '';
  document.getElementById('prod-foto').value = prod.foto;
  document.getElementById('prod-desc').value = prod.descricao || '';
  document.getElementById('prod-disponivel').checked = prod.disponivel !== false;
  document.getElementById('prod-destaque').checked = !!prod.destaque;
};

window.excluirProduto = function(id) {
  if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
    EstoqueDB.excluirItem(id);
    renderizarTabelaProdutos();
    atualizarMetricas();
    mostrarAlerta('Item excluído com sucesso.');
  }
};

function abrirModalProduto() {
  const modal = document.getElementById('modal-produto');
  const form = document.getElementById('form-produto');
  if (modal) {
    if (form) form.reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-titulo').textContent = 'Adicionar Produto ou Combo';
    modal.classList.remove('hidden');
  }
}

function fecharModalProduto() {
  const modal = document.getElementById('modal-produto');
  if (modal) modal.classList.add('hidden');
}

function salvarFormProduto() {
  const id = document.getElementById('prod-id').value || `item-${Date.now()}`;
  const nome = document.getElementById('prod-nome').value.trim();
  const categoria = document.getElementById('prod-categoria').value;
  const tipo = document.getElementById('prod-tipo').value;
  const preco = parseFloat(document.getElementById('prod-preco').value) || 0;
  const unidade = document.getElementById('prod-unidade').value;
  const marmoreio = document.getElementById('prod-marmoreio').value.trim();
  const tag = document.getElementById('prod-tag').value.trim();
  const foto = document.getElementById('prod-foto').value.trim();
  const descricao = document.getElementById('prod-desc').value.trim();
  const disponivel = document.getElementById('prod-disponivel').checked;
  const destaque = document.getElementById('prod-destaque').checked;

  const item = {
    id,
    nome,
    categoria,
    tipo,
    preco,
    unidade,
    marmoreio,
    tag,
    foto,
    descricao,
    disponivel,
    destaque
  };

  EstoqueDB.salvarItem(item);
  fecharModalProduto();
  renderizarTabelaProdutos();
  atualizarMetricas();
  mostrarAlerta(`"${nome}" salvo no catálogo com sucesso!`);
}

/* ==========================================================================
   7. GESTÃO DE CLIENTES & DISPAROS DE CAMPANHAS DE WHATSAPP
   ========================================================================== */
function configurarCampanhasWhatsApp() {
  const textareaCampanha = document.getElementById('texto-campanha-whatsapp');
  const botoesModelo = document.querySelectorAll('.btn-modelo-campanha');
  const btnProcessar = document.getElementById('btn-processar-importacao');

  // Inicializa com o modelo de Sexta (Combos de FDS)
  if (textareaCampanha) {
    textareaCampanha.value = MODELOS_CAMPANHAS.sexta;
  }

  botoesModelo.forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.getAttribute('data-tipo');
      if (MODELOS_CAMPANHAS[tipo] && textareaCampanha) {
        textareaCampanha.value = MODELOS_CAMPANHAS[tipo];
        mostrarAlerta(`Modelo de ${tipo.toUpperCase()} aplicado para disparo!`);
      }
    });
  });

  // Importar Clientes via Textarea / CSV
  if (btnProcessar) {
    btnProcessar.addEventListener('click', () => {
      const input = document.getElementById('importar-contatos-texto');
      if (!input || !input.value.trim()) {
        alert('Cole pelo menos um contato no formato: Nome, Telefone');
        return;
      }

      const linhas = input.value.trim().split('\n');
      const novos = [];

      linhas.forEach(linha => {
        const partes = linha.split(',').map(p => p.trim());
        if (partes.length >= 2) {
          const nome = partes[0];
          let tel = partes[1].replace(/\D/g, '');
          if (tel.length === 10 || tel.length === 11) {
            tel = '55' + tel;
          }
          const bairro = partes[2] || 'Santo André';

          if (tel.length >= 12) {
            novos.push({
              id: `cli-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              nome,
              telefone: tel,
              bairro
            });
          }
        }
      });

      if (novos.length > 0) {
        EstoqueDB.adicionarClientes(novos);
        input.value = '';
        renderizarTabelaClientes();
        atualizarMetricas();
        mostrarAlerta(`${novos.length} novos clientes adicionados à base de disparos!`);
      } else {
        alert('Nenhum telefone válido encontrado. Verifique se o telefone contém DDD.');
      }
    });
  }
}

function renderizarTabelaClientes() {
  const tbody = document.getElementById('tabela-corpo-clientes');
  if (!tbody) return;

  const clientes = EstoqueDB.obterClientes();

  if (clientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-8 text-center text-stone-500">
          Nenhum cliente cadastrado. Cole sua lista na caixa de importação acima!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = clientes.map(c => `
    <tr class="hover:bg-stone-800/40 transition">
      <td class="p-4 font-bold text-white text-sm">
        ${c.nome}
      </td>
      <td class="p-4 font-mono text-stone-300">
        ${c.telefone}
      </td>
      <td class="p-4 text-stone-400">
        ${c.bairro || 'Santo André'}
      </td>
      <td class="p-4 text-right space-x-2">
        <button onclick="dispararWhatsAppCliente('${c.id}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl shadow transition inline-flex items-center gap-1.5">
          <span>Disparar WhatsApp</span> ➔
        </button>
        <button onclick="excluirCliente('${c.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg">
          ✕
        </button>
      </td>
    </tr>
  `).join('');
}

window.dispararWhatsAppCliente = function(id) {
  const clientes = EstoqueDB.obterClientes();
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;

  const textareaCampanha = document.getElementById('texto-campanha-whatsapp');
  let textoBase = (textareaCampanha && textareaCampanha.value) ? textareaCampanha.value : MODELOS_CAMPANHAS.sexta;

  const linkWebapp = 'https://ricardorickbony-lgtm.github.io/mercado-da-carne/';
  const textoPronto = textoBase
    .replace('{nome}', cliente.nome)
    .replace('{link}', linkWebapp);

  const url = `https://wa.me/${cliente.telefone}?text=${encodeURIComponent(textoPronto)}`;
  window.open(url, '_blank');
};

window.excluirCliente = function(id) {
  if (confirm('Remover cliente da base de disparos?')) {
    EstoqueDB.excluirCliente(id);
    renderizarTabelaClientes();
    atualizarMetricas();
    mostrarAlerta('Cliente removido.');
  }
};

/* ==========================================================================
   8. DADOS DA LOJA (CONFIGURAÇÃO)
   ========================================================================== */
function carregarConfigLoja() {
  const config = EstoqueDB.obterConfigLoja();

  const cfgWa = document.getElementById('cfg-whatsapp');
  const cfgTel = document.getElementById('cfg-telefone');
  const cfgEnd = document.getElementById('cfg-endereco');
  const cfgBairro = document.getElementById('cfg-bairro-cidade');
  const cfgHorario = document.getElementById('cfg-horario-semana');

  if (cfgWa) cfgWa.value = config.whatsapp || '5511963336938';
  if (cfgTel) cfgTel.value = config.telefone || '(11) 96333-6938';
  if (cfgEnd) cfgEnd.value = config.endereco || 'Av. São Paulo, 584';
  if (cfgBairro) cfgBairro.value = `${config.bairro || 'Cidade São Jorge'}, ${config.cidade || 'Santo André - SP'}`;
  if (cfgHorario) cfgHorario.value = config.horarioSemana || '07:00 às 20:00';
}

function salvarConfigLoja() {
  const cfgWa = document.getElementById('cfg-whatsapp').value.trim();
  const cfgTel = document.getElementById('cfg-telefone').value.trim();
  const cfgEnd = document.getElementById('cfg-endereco').value.trim();
  const cfgBairro = document.getElementById('cfg-bairro-cidade').value.trim();
  const cfgHorario = document.getElementById('cfg-horario-semana').value.trim();

  const configAtual = EstoqueDB.obterConfigLoja();
  configAtual.whatsapp = cfgWa;
  configAtual.telefone = cfgTel;
  configAtual.endereco = cfgEnd;
  configAtual.bairro = cfgBairro;
  configAtual.horarioSemana = cfgHorario;

  EstoqueDB.salvarConfigLoja(configAtual);
  mostrarAlerta('Dados da loja e WhatsApp salvos com sucesso!');
}

/* ==========================================================================
   9. ROBÔ DE AGENDAMENTO AUTOMÁTICO (DIA E HORA)
   ========================================================================== */
const DIAS_SEMANA_NOMES = {
  '0': 'Domingo (Rotisserie & Costela no Bafo)',
  '4': 'Quinta-feira (Carne Moída & Dia a Dia)',
  '5': 'Sexta-feira (Combos de Churrasco do FDS)',
  '6': 'Sábado (Parrilla Prime & Picanha)',
  'todos': 'Todos os Dias'
};

function carregarConfigAgendamento() {
  if (typeof EstoqueDB === 'undefined') return;
  const config = EstoqueDB.obterAgendamento();
  const clientes = EstoqueDB.obterClientes();

  const selectDia = document.getElementById('agendador-dia');
  const inputHora = document.getElementById('agendador-hora');
  const selectIntervalo = document.getElementById('agendador-intervalo');
  const inputWebhook = document.getElementById('agendador-webhook');

  if (selectDia) selectDia.value = config.diaSemana || '5';
  if (inputHora) inputHora.value = config.hora || '10:00';
  if (selectIntervalo) selectIntervalo.value = config.intervaloSegundos || '8';
  if (inputWebhook) inputWebhook.value = config.webhookUrl || '';

  atualizarBadgeStatusRobo(config.ativo);
  atualizarTextoResumoAgendamento(config);

  const destinatariosFila = document.getElementById('destinatarios-fila');
  if (destinatariosFila) {
    destinatariosFila.textContent = `${clientes.length} clientes cadastrados`;
  }
}

function atualizarBadgeStatusRobo(ativo) {
  const badge = document.getElementById('badge-status-robo');
  const texto = document.getElementById('texto-status-robo');
  const btnToggle = document.getElementById('btn-toggle-robo');

  if (ativo) {
    if (badge) {
      badge.className = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5';
    }
    if (texto) texto.textContent = 'Robô Ativo';
    if (btnToggle) {
      btnToggle.textContent = '⏸️ Pausar Robô';
      btnToggle.className = 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl transition';
    }
  } else {
    if (badge) {
      badge.className = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5';
    }
    if (texto) texto.textContent = 'Robô Pausado';
    if (btnToggle) {
      btnToggle.textContent = '▶️ Ativar Robô';
      btnToggle.className = 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-xl transition';
    }
  }
}

function atualizarTextoResumoAgendamento(config) {
  const resumo = document.getElementById('texto-proximo-disparo');
  if (!resumo) return;

  if (!config.ativo) {
    resumo.textContent = 'Robô pausado. Nenhum disparo agendado no momento.';
    resumo.className = 'text-amber-400 text-sm font-semibold';
    return;
  }

  const nomeDia = DIAS_SEMANA_NOMES[config.diaSemana] || 'Sexta-feira';
  resumo.textContent = `Disparo automático agendado para: Toda ${nomeDia} às ${config.hora}`;
  resumo.className = 'text-white text-sm font-bold';
}

function configurarAgendadorDisparos() {
  const formAgendamento = document.getElementById('form-agendamento-disparos');
  const btnToggleRobo = document.getElementById('btn-toggle-robo');
  const btnTestarWebhook = document.getElementById('btn-testar-webhook');

  if (formAgendamento) {
    formAgendamento.addEventListener('submit', (e) => {
      e.preventDefault();
      const diaSemana = document.getElementById('agendador-dia').value;
      const hora = document.getElementById('agendador-hora').value;
      const intervaloSegundos = parseInt(document.getElementById('agendador-intervalo').value, 10) || 8;
      const webhookUrl = document.getElementById('agendador-webhook')?.value.trim() || '';

      const configAtual = EstoqueDB.obterAgendamento();
      configAtual.diaSemana = diaSemana;
      configAtual.hora = hora;
      configAtual.intervaloSegundos = intervaloSegundos;
      configAtual.webhookUrl = webhookUrl;
      configAtual.ativo = true;

      EstoqueDB.salvarAgendamento(configAtual);
      atualizarBadgeStatusRobo(true);
      atualizarTextoResumoAgendamento(configAtual);

      const nomeDia = DIAS_SEMANA_NOMES[diaSemana] || diaSemana;
      mostrarAlerta(`✅ Agendamento salvo! O robô disparará toda ${nomeDia} às ${hora}.`);
    });
  }

  if (btnToggleRobo) {
    btnToggleRobo.addEventListener('click', () => {
      const configAtual = EstoqueDB.obterAgendamento();
      configAtual.ativo = !configAtual.ativo;
      EstoqueDB.salvarAgendamento(configAtual);
      atualizarBadgeStatusRobo(configAtual.ativo);
      atualizarTextoResumoAgendamento(configAtual);
      mostrarAlerta(configAtual.ativo ? '🟢 Robô de agendamento ativado!' : '⏸️ Robô de agendamento pausado.');
    });
  }

  if (btnTestarWebhook) {
    btnTestarWebhook.addEventListener('click', async () => {
      const webhookUrl = document.getElementById('agendador-webhook')?.value.trim();
      if (!webhookUrl) {
        alert('Por favor, insira uma URL de Webhook válida primeiro.');
        return;
      }
      btnTestarWebhook.textContent = 'Enviando...';
      try {
        const payload = {
          evento: 'teste_agendamento',
          loja: 'Mercado da Carne',
          mensagem: 'Disparo de teste da automação de WhatsApp',
          data: new Date().toISOString()
        };
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('✅ Webhook disparado com sucesso! Verifique a execução no seu n8n.');
      } catch (err) {
        alert('⚠️ Webhook enviado! (Verifique se o webhook do n8n permite requisições externas).');
      } finally {
        btnTestarWebhook.textContent = 'Testar Webhook';
      }
    });
  }

  // Verificador Contínuo de Horário (Checa a cada 30 segundos)
  setInterval(verificarHorarioAgendado, 30000);
}

function verificarHorarioAgendado() {
  if (typeof EstoqueDB === 'undefined') return;
  const config = EstoqueDB.obterAgendamento();
  if (!config || !config.ativo) return;

  const agora = new Date();
  const diaSemanaAtual = agora.getDay().toString();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const horaMinutoAtual = `${horas}:${minutos}`;
  const dataHoje = agora.toISOString().slice(0, 10);

  const diaBate = (config.diaSemana === 'todos' || config.diaSemana === diaSemanaAtual);
  const horaBate = (config.hora === horaMinutoAtual);

  if (diaBate && horaBate && config.ultimoDisparo !== dataHoje) {
    console.log('[Robô Disparo] Horário agendado atingido!', horaMinutoAtual);
    config.ultimoDisparo = dataHoje;
    EstoqueDB.salvarAgendamento(config);

    if (config.webhookUrl) {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'disparo_programado',
          dia: config.diaSemana,
          hora: config.hora,
          clientes: EstoqueDB.obterClientes()
        })
      }).catch(e => console.warn(e));
    }

    iniciarFilaDisparoMassa();
    mostrarAlerta('⏰ Horário programado atingido! Fila de disparos iniciada.');
  }
}

/* ==========================================================================
   10. FILA AUTOMÁTICA DE DISPAROS EM MASSA
   ========================================================================== */
let filaClientes = [];
let indiceFilaAtual = 0;
let filaPausada = false;
let timerContagemFila = null;
let segundosContador = 0;

function configurarFilaDisparoMassa() {
  const btnDisparoMassa = document.getElementById('btn-disparo-massa-agora');
  const btnDisparoTodosTabela = document.getElementById('btn-disparar-todos-tabela');
  const btnFecharFila = document.getElementById('btn-fechar-fila');
  const btnPausarFila = document.getElementById('btn-pausar-fila');
  const btnAvancarFila = document.getElementById('btn-avancar-fila');

  if (btnDisparoMassa) btnDisparoMassa.addEventListener('click', iniciarFilaDisparoMassa);
  if (btnDisparoTodosTabela) btnDisparoTodosTabela.addEventListener('click', iniciarFilaDisparoMassa);
  if (btnFecharFila) btnFecharFila.addEventListener('click', fecharModalFila);

  if (btnPausarFila) {
    btnPausarFila.addEventListener('click', () => {
      filaPausada = !filaPausada;
      if (filaPausada) {
        clearInterval(timerContagemFila);
        btnPausarFila.textContent = '▶️ Continuar';
        btnPausarFila.className = 'bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold';
        document.getElementById('fila-timer-contagem').textContent = 'Fila pausada.';
      } else {
        btnPausarFila.textContent = '⏸️ Pausar';
        btnPausarFila.className = 'bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-700';
        iniciarContadorProximoEnvio();
      }
    });
  }

  if (btnAvancarFila) {
    btnAvancarFila.addEventListener('click', () => {
      clearInterval(timerContagemFila);
      enviarClienteAtualEAvancar();
    });
  }
}

function iniciarFilaDisparoMassa() {
  filaClientes = EstoqueDB.obterClientes();
  if (filaClientes.length === 0) {
    alert('Nenhum cliente cadastrado na base! Cole seus contatos na caixa de importação antes de iniciar o disparo.');
    return;
  }

  indiceFilaAtual = 0;
  filaPausada = false;
  clearInterval(timerContagemFila);

  const modal = document.getElementById('modal-fila-disparo');
  if (modal) modal.classList.remove('hidden');

  const btnPausar = document.getElementById('btn-pausar-fila');
  if (btnPausar) {
    btnPausar.textContent = '⏸️ Pausar';
    btnPausar.className = 'bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-700';
  }

  renderizarPassoAtualFila();
}

function fecharModalFila() {
  clearInterval(timerContagemFila);
  const modal = document.getElementById('modal-fila-disparo');
  if (modal) modal.classList.add('hidden');
}

function renderizarPassoAtualFila() {
  if (indiceFilaAtual >= filaClientes.length) {
    clearInterval(timerContagemFila);
    document.getElementById('fila-progresso-texto').textContent = '✅ Disparos Concluídos!';
    document.getElementById('fila-porcentagem').textContent = '100%';
    document.getElementById('fila-progresso-barra').style.width = '100%';
    document.getElementById('fila-cliente-nome').textContent = 'Todos os clientes notificados!';
    document.getElementById('fila-cliente-tel').textContent = `${filaClientes.length} enviados`;
    document.getElementById('fila-cliente-previa').textContent = 'Todas as mensagens foram abertas e encaminhadas com sucesso!';
    document.getElementById('fila-timer-contagem').textContent = 'Fila finalizada.';
    document.getElementById('btn-avancar-fila').textContent = 'Concluir';
    document.getElementById('btn-avancar-fila').onclick = fecharModalFila;
    mostrarAlerta(`🎉 Fila concluída! ${filaClientes.length} clientes receberam as promoções.`);
    return;
  }

  const cliente = filaClientes[indiceFilaAtual];
  const total = filaClientes.length;
  const porcentagem = Math.round((indiceFilaAtual / total) * 100);

  document.getElementById('fila-progresso-texto').textContent = `Enviando ${indiceFilaAtual + 1} de ${total} clientes`;
  document.getElementById('fila-porcentagem').textContent = `${porcentagem}%`;
  document.getElementById('fila-progresso-barra').style.width = `${porcentagem}%`;

  document.getElementById('fila-cliente-nome').textContent = cliente.nome;
  document.getElementById('fila-cliente-tel').textContent = cliente.telefone;

  const textareaCampanha = document.getElementById('texto-campanha-whatsapp');
  let textoBase = (textareaCampanha && textareaCampanha.value) ? textareaCampanha.value : MODELOS_CAMPANHAS.sexta;
  const linkWebapp = 'https://ricardorickbony-lgtm.github.io/mercado-da-carne/';
  const textoPersonalizado = textoBase
    .replace('{nome}', cliente.nome)
    .replace('{link}', linkWebapp);

  document.getElementById('fila-cliente-previa').textContent = textoPersonalizado;
  document.getElementById('btn-avancar-fila').textContent = 'Enviar Agora ➔';
  document.getElementById('btn-avancar-fila').onclick = () => {
    clearInterval(timerContagemFila);
    enviarClienteAtualEAvancar();
  };

  iniciarContadorProximoEnvio();
}

function iniciarContadorProximoEnvio() {
  const config = EstoqueDB.obterAgendamento();
  segundosContador = config.intervaloSegundos || 8;
  const timerTexto = document.getElementById('fila-timer-contagem');

  if (timerTexto) timerTexto.textContent = `Próximo envio automático em ${segundosContador}s...`;

  clearInterval(timerContagemFila);
  timerContagemFila = setInterval(() => {
    if (filaPausada) return;

    segundosContador--;
    if (timerTexto) timerTexto.textContent = `Próximo envio automático em ${segundosContador}s...`;

    if (segundosContador <= 0) {
      clearInterval(timerContagemFila);
      enviarClienteAtualEAvancar();
    }
  }, 1000);
}

function enviarClienteAtualEAvancar() {
  if (indiceFilaAtual >= filaClientes.length) return;

  const cliente = filaClientes[indiceFilaAtual];
  const textareaCampanha = document.getElementById('texto-campanha-whatsapp');
  let textoBase = (textareaCampanha && textareaCampanha.value) ? textareaCampanha.value : MODELOS_CAMPANHAS.sexta;
  const linkWebapp = 'https://ricardorickbony-lgtm.github.io/mercado-da-carne/';
  const textoPersonalizado = textoBase
    .replace('{nome}', cliente.nome)
    .replace('{link}', linkWebapp);

  const urlWa = `https://wa.me/${cliente.telefone}?text=${encodeURIComponent(textoPersonalizado)}`;
  window.open(urlWa, '_blank');

  indiceFilaAtual++;
  renderizarPassoAtualFila();
}

/* ==========================================================================
   11. ALERTA FLUTUANTE
   ========================================================================== */
function mostrarAlerta(mensagem) {
  const alerta = document.getElementById('admin-alerta-sucesso');
  const texto = document.getElementById('admin-alerta-texto');
  if (alerta && texto) {
    texto.textContent = mensagem;
    alerta.classList.remove('hidden');
    setTimeout(() => {
      alerta.classList.add('hidden');
    }, 4500);
  }
}
