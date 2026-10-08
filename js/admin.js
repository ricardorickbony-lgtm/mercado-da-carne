/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE (Mauá - SP)
 * Lógica do Painel de Gestão (admin.js)
 * Padrão Ricardo & Severino
 */

const SESSION_KEY = 'mercado_carne_auth_session';

document.addEventListener('DOMContentLoaded', () => {
  configurarAuth();
  if (estaAutenticado()) {
    carregarPainel();
  }
  configurarEventosGerais();
});

function estaAutenticado() {
  return sessionStorage.getItem(SESSION_KEY) === 'logado';
}

function configurarAuth() {
  const telaLogin = document.getElementById('tela-login');
  const formLogin = document.getElementById('form-login');
  const loginErro = document.getElementById('login-erro');
  const btnDemo = document.getElementById('btn-preencher-demo');
  const btnLogout = document.getElementById('btn-logout');

  if (estaAutenticado()) {
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
        loginErro.classList.add('hidden');
        carregarPainel();
      } else {
        loginErro.classList.remove('hidden');
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

function carregarPainel() {
  atualizarMetricas();
  renderizarTabelaProdutos();
  carregarConfigLoja();
}

function atualizarMetricas() {
  const produtos = EstoqueDB.obterProdutos();
  const total = produtos.length;
  const ativos = produtos.filter(p => p.disponivel).length;
  const esgotados = produtos.filter(p => !p.disponivel).length;
  const rotisserie = produtos.filter(p => p.tipo === 'rotisserie').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-ativos').textContent = ativos;
  document.getElementById('stat-rotisserie').textContent = rotisserie;
  document.getElementById('stat-esgotados').textContent = esgotados;
}

let filtroAtual = 'todos';
let termoBusca = '';

function renderizarTabelaProdutos() {
  const tbody = document.getElementById('tabela-corpo-produtos');
  if (!tbody) return;

  let produtos = EstoqueDB.obterProdutos();

  if (filtroAtual === 'corte') {
    produtos = produtos.filter(p => p.tipo === 'corte');
  } else if (filtroAtual === 'rotisserie') {
    produtos = produtos.filter(p => p.tipo === 'rotisserie');
  }

  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    produtos = produtos.filter(p => p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo));
  }

  if (produtos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-6 text-center text-slate-500">
          Nenhum produto encontrado. Clique em "Adicionar Novo Corte ou Assado" para cadastrar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = produtos.map(prod => {
    const precoFormatado = EstoqueDB.formatarPreco(prod.preco);
    const badgeStatus = prod.disponivel
      ? `<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">Disponível</span>`
      : `<span class="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">Esgotado</span>`;

    const badgeTipo = prod.tipo === 'rotisserie'
      ? `<span class="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold">🍗 Rotisserie</span>`
      : `<span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">🥩 Açougue</span>`;

    return `
      <tr class="hover:bg-slate-900/40 transition">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <img src="${prod.foto}" alt="${prod.nome}" class="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0">
            <div>
              <div class="font-bold text-white text-xs">${prod.nome}</div>
              <div class="text-[10px] text-slate-400">${prod.tag || ''} • ${prod.marmoreio || ''}</div>
            </div>
          </div>
        </td>
        <td class="p-4">
          <div class="space-y-1">
            ${badgeTipo}
            <div class="text-[10px] text-slate-400 uppercase tracking-wide">${prod.categoria}</div>
          </div>
        </td>
        <td class="p-4">
          <div class="font-bold text-amber-400">${precoFormatado}</div>
          <div class="text-[10px] text-slate-400">por ${prod.unidade}</div>
        </td>
        <td class="p-4">
          <button onclick="alternarDisponibilidade('${prod.id}')" title="Clique para alternar status">
            ${badgeStatus}
          </button>
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="editarProduto('${prod.id}')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border border-slate-700">
              Editar
            </button>
            <button onclick="excluirProduto('${prod.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border border-red-500/30">
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function configurarEventosGerais() {
  // Navegação entre abas Produtos vs Configurações
  const tabProd = document.getElementById('tab-nav-produtos');
  const tabCfg = document.getElementById('tab-nav-config');
  const secProd = document.getElementById('secao-produtos');
  const secCfg = document.getElementById('secao-config');

  if (tabProd && tabCfg) {
    tabProd.addEventListener('click', () => {
      tabProd.className = 'bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition';
      tabCfg.className = 'bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition border border-slate-700';
      secProd.classList.remove('hidden');
      secCfg.classList.add('hidden');
    });

    tabCfg.addEventListener('click', () => {
      tabCfg.className = 'bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition';
      tabProd.className = 'bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition border border-slate-700';
      secCfg.classList.remove('hidden');
      secProd.classList.add('hidden');
    });
  }

  // Filtros de tipo
  const filtroBtns = document.querySelectorAll('.filtro-btn');
  filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filtroBtns.forEach(b => {
        b.className = 'filtro-btn bg-slate-900 text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap';
      });
      btn.className = 'filtro-btn active bg-slate-800 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap';
      filtroAtual = btn.getAttribute('data-filtro');
      renderizarTabelaProdutos();
    });
  });

  // Campo de busca
  const campoBusca = document.getElementById('admin-busca');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      termoBusca = e.target.value;
      renderizarTabelaProdutos();
    });
  }

  // Modal de Produto
  const modalProd = document.getElementById('modal-produto');
  const btnNovoProd = document.getElementById('btn-novo-produto');
  const btnFecharModal = document.getElementById('modal-fechar');
  const btnCancelarModal = document.getElementById('modal-cancelar');
  const formProd = document.getElementById('form-produto');

  if (btnNovoProd) {
    btnNovoProd.addEventListener('click', () => {
      formProd.reset();
      document.getElementById('prod-id').value = '';
      document.getElementById('modal-titulo').textContent = 'Adicionar Novo Corte ou Assado';
      modalProd.classList.remove('hidden');
    });
  }

  function fecharModal() {
    if (modalProd) modalProd.classList.add('hidden');
  }

  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

  // Submissão do Formulário de Produto
  if (formProd) {
    formProd.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value || `item-${Date.now()}`;
      const nome = document.getElementById('prod-nome').value;
      const tipo = document.getElementById('prod-tipo').value;
      const categoria = document.getElementById('prod-categoria').value;
      const preco = parseFloat(document.getElementById('prod-preco').value) || 0;
      const unidade = document.getElementById('prod-unidade').value;
      const marmoreio = document.getElementById('prod-marmoreio').value;
      const tag = document.getElementById('prod-tag').value;
      const foto = document.getElementById('prod-foto').value;
      const descricao = document.getElementById('prod-desc').value;
      const disponivel = document.getElementById('prod-disponivel').checked;
      const destaque = document.getElementById('prod-destaque').checked;

      const itemSalvo = {
        id,
        nome,
        tipo,
        categoria,
        preco,
        unidade,
        marmoreio,
        tag,
        foto,
        descricao,
        disponivel,
        destaque
      };

      EstoqueDB.salvarItem(itemSalvo);
      fecharModal();
      carregarPainel();
      mostrarAlerta(`"${nome}" salvo com sucesso!`);
    });
  }

  // Formulário de Configurações da Loja
  const formCfg = document.getElementById('form-config-loja');
  if (formCfg) {
    formCfg.addEventListener('submit', (e) => {
      e.preventDefault();
      const config = EstoqueDB.obterConfigLoja();

      config.whatsapp = document.getElementById('cfg-whatsapp').value.trim();
      config.telefone = document.getElementById('cfg-telefone').value.trim();
      config.endereco = document.getElementById('cfg-endereco').value.trim();
      config.bairro = document.getElementById('cfg-bairro-cidade').value.trim();
      config.horarioSemana = document.getElementById('cfg-horario-semana').value.trim();

      EstoqueDB.salvarConfigLoja(config);
      mostrarAlerta("Configurações da loja e WhatsApp atualizados!");
    });
  }
}

function carregarConfigLoja() {
  const config = EstoqueDB.obterConfigLoja();
  if (!config) return;

  const w = document.getElementById('cfg-whatsapp');
  const t = document.getElementById('cfg-telefone');
  const e = document.getElementById('cfg-endereco');
  const b = document.getElementById('cfg-bairro-cidade');
  const h = document.getElementById('cfg-horario-semana');

  if (w) w.value = config.whatsapp || '';
  if (t) t.value = config.telefone || '';
  if (e) e.value = config.endereco || '';
  if (b) b.value = `${config.bairro || ''}, ${config.cidade || ''}`;
  if (h) h.value = config.horarioSemana || '';
}

function alternarDisponibilidade(id) {
  const produtos = EstoqueDB.obterProdutos();
  const prod = produtos.find(p => p.id === id);
  if (prod) {
    prod.disponivel = !prod.disponivel;
    EstoqueDB.salvarItem(prod);
    carregarPainel();
    mostrarAlerta(`Status de "${prod.nome}" alterado para ${prod.disponivel ? 'Disponível' : 'Esgotado'}.`);
  }
}

function editarProduto(id) {
  const produtos = EstoqueDB.obterProdutos();
  const prod = produtos.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('prod-id').value = prod.id;
  document.getElementById('prod-nome').value = prod.nome;
  document.getElementById('prod-tipo').value = prod.tipo || 'corte';
  document.getElementById('prod-categoria').value = prod.categoria || 'angus';
  document.getElementById('prod-preco').value = prod.preco;
  document.getElementById('prod-unidade').value = prod.unidade || 'kg';
  document.getElementById('prod-marmoreio').value = prod.marmoreio || '';
  document.getElementById('prod-tag').value = prod.tag || '';
  document.getElementById('prod-foto').value = prod.foto || '';
  document.getElementById('prod-desc').value = prod.descricao || '';
  document.getElementById('prod-disponivel').checked = prod.disponivel;
  document.getElementById('prod-destaque').checked = prod.destaque;

  document.getElementById('modal-titulo').textContent = `Editar: ${prod.nome}`;
  document.getElementById('modal-produto').classList.remove('hidden');
}

function excluirProduto(id) {
  const produtos = EstoqueDB.obterProdutos();
  const prod = produtos.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`Tem certeza que deseja excluir o item "${prod.nome}"?`)) {
    EstoqueDB.excluirItem(id);
    carregarPainel();
    mostrarAlerta(`"${prod.nome}" removido do catálogo.`);
  }
}

function mostrarAlerta(msg) {
  const alerta = document.getElementById('admin-alerta-sucesso');
  const texto = document.getElementById('admin-alerta-texto');
  if (alerta && texto) {
    texto.textContent = msg;
    alerta.classList.remove('hidden');
    setTimeout(() => {
      alerta.classList.add('hidden');
    }, 4000);
  }
}
