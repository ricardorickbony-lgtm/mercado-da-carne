/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE
 * Av. São Paulo, 584 - Cidade São Jorge, Santo André - SP
 * Web App Oficial, PWA, Sacola Interativa & WhatsApp Checkout
 * Padrão Ricardo & Severino
 */

// Estado Global do Carrinho de Compras
let carrinho = [];
let tipoPedido = 'retirada'; // 'retirada' ou 'delivery'
let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar PWA Service Worker
  initServiceWorker();

  // 2. Configurações da Loja
  const configLoja = (typeof EstoqueDB !== 'undefined') ? EstoqueDB.obterConfigLoja() : {
    whatsapp: '5511963336938',
    telefone: '(11) 96333-6938',
    horaInicioSemana: 7,
    horaFimSemana: 20,
    horaInicioDomingo: 7,
    horaFimDomingo: 14
  };

  // 3. Recuperar Sacola do LocalStorage
  carregarCarrinhoStorage();

  // 4. Inicializar Componentes
  initStoreStatusAndWhatsApp(configLoja);
  renderShowcaseProducts();
  initCategoryTabs();
  initCartDrawerEvents(configLoja);
  initChurrascoCalculator(configLoja.whatsapp);
  initFaqAccordion();
  initMobileDrawer();
  initPwaInstall();
});

/* ==========================================================================
   1. PWA SERVICE WORKER & INSTALAÇÃO
   ========================================================================== */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch(err => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    });
  }
}

function initPwaInstall() {
  const btnInstall = document.getElementById('btn-install-app');
  const btnInstallDrawer = document.getElementById('btn-install-app-drawer');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // No desktop (>768px), exibe o botão do header se houver espaço
    if (btnInstall && window.innerWidth > 768) {
      btnInstall.style.display = 'inline-flex';
    }
    // No celular, exibe no drawer lateral
    if (btnInstallDrawer) {
      btnInstallDrawer.style.display = 'inline-flex';
    }
  });

  const handleInstallClick = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log('[PWA] Instalação outcome:', outcome);
    deferredInstallPrompt = null;
    if (btnInstall) btnInstall.style.display = 'none';
    if (btnInstallDrawer) btnInstallDrawer.style.display = 'none';
  };

  if (btnInstall) btnInstall.addEventListener('click', handleInstallClick);
  if (btnInstallDrawer) btnInstallDrawer.addEventListener('click', handleInstallClick);
}

/* ==========================================================================
   2. HORÁRIO EM TEMPO REAL & ATENDIMENTO WHATSAPP
   ========================================================================== */
function initStoreStatusAndWhatsApp(config) {
  const {
    whatsapp = "5511963336938",
    horaInicioSemana = 7,
    horaFimSemana = 20,
    horaInicioDomingo = 7,
    horaFimDomingo = 14
  } = config;

  const agora = new Date();
  const diaSemana = agora.getDay();
  const hora = agora.getHours();
  const minutos = agora.getMinutes();
  const horaDecimal = hora + (minutos / 60);

  let isOnline = false;

  // Seg a Sáb: 7h às 20h | Dom: 7h às 14h
  if (diaSemana >= 1 && diaSemana <= 6 && horaDecimal >= horaInicioSemana && horaDecimal < horaFimSemana) {
    isOnline = true;
  } else if (diaSemana === 0 && horaDecimal >= horaInicioDomingo && horaDecimal < horaFimDomingo) {
    isOnline = true;
  }

  const waLink = document.getElementById('wa-link');
  const waDot = document.getElementById('wa-status-dot');
  const waText = document.getElementById('wa-status-text');

  const topbarDot = document.getElementById('topbar-status-dot');
  const topbarText = document.getElementById('topbar-status-text');

  if (isOnline) {
    if (waDot) waDot.className = 'wa-status-dot online';
    if (waText) waText.textContent = 'Online Agora';
    if (topbarDot) topbarDot.className = 'status-dot-mini';
    if (topbarText) topbarText.textContent = 'Aberto Agora • Balcão & Delivery em Santo André';
    
    const msg = encodeURIComponent("Olá! Vim pelo Web App do Mercado da Carne (Santo André) e gostaria de consultar os combos e assados de hoje.");
    if (waLink) waLink.href = `https://wa.me/${whatsapp}?text=${msg}`;
  } else {
    if (waLink) waLink.classList.add('offline-mode');
    if (waDot) waDot.className = 'wa-status-dot offline';
    if (waText) waText.textContent = 'Fora do Expediente';
    if (topbarDot) topbarDot.className = 'status-dot-mini closed';
    if (topbarText) topbarText.textContent = 'Fechado Agora • Deixe sua encomenda pelo WhatsApp para o próximo expediente';

    const msg = encodeURIComponent("Olá! Estou no site do Mercado da Carne fora do horário de atendimento e gostaria de adiantar meu pedido.");
    if (waLink) waLink.href = `https://wa.me/${whatsapp}?text=${msg}`;
  }
}

/* ==========================================================================
   3. VITRINE DINÂMICA DE PRODUTOS & BOTÕES DA SACOLA
   ========================================================================== */
function renderShowcaseProducts(filtro = 'todos') {
  const container = document.getElementById('grid-cortes-dinamico');
  if (!container || typeof EstoqueDB === 'undefined') return;

  let produtos = EstoqueDB.obterProdutos();
  const config = EstoqueDB.obterConfigLoja();
  const waNumero = config.whatsapp || '5511963336938';

  if (filtro !== 'todos') {
    produtos = produtos.filter(p => p.categoria === filtro || (filtro === 'rotisserie' && p.tipo === 'rotisserie'));
  }

  if (produtos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: #FFFFFF; border-radius: 16px; border: 1px dashed var(--border-light);">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🥩</span>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading);">Nenhum item nesta categoria no momento</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">Consulte cortes especiais pelo WhatsApp ou escolha outra aba acima.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = produtos.map(prod => {
    const precoFormatado = EstoqueDB.formatarPreco(prod.preco);
    const badgeTag = prod.tag ? `<span class="cut-badge">${prod.tag}</span>` : '';
    const badgeEsgotado = !prod.disponivel ? `<span style="position:absolute; top:14px; right:14px; background:#EF4444; color:#fff; font-size:0.72rem; font-weight:800; padding:4px 10px; border-radius:6px; z-index:2;">Esgotado</span>` : '';
    const msgPedido = encodeURIComponent(`Olá! Gostaria de pedir "${prod.nome}" (${precoFormatado}/${prod.unidade}) no Mercado da Carne.`);
    const waUrl = `https://wa.me/${waNumero}?text=${msgPedido}`;

    return `
      <div class="cut-card" data-category="${prod.categoria}" style="${!prod.disponivel ? 'opacity:0.75;' : ''}">
        <div class="cut-img-wrapper" style="position:relative;">
          <img src="${prod.foto}" alt="${prod.nome}" class="cut-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'">
          ${badgeTag}
          ${badgeEsgotado}
        </div>
        <div class="cut-body">
          <div class="cut-header">
            <h3 class="cut-name">${prod.nome}</h3>
            ${prod.marmoreio ? `<span class="cut-marbling">${prod.marmoreio}</span>` : ''}
          </div>
          <p class="cut-desc">${prod.descricao || 'Corte selecionado e inspecionado para o mais alto padrão de qualidade.'}</p>
          <div class="cut-price-row">
            <span class="cut-price">${precoFormatado}</span>
            <span class="cut-unit">/${prod.unidade}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
            <button 
              type="button" 
              class="btn btn-primary btn-add-cart" 
              data-id="${prod.id}"
              ${!prod.disponivel ? 'disabled style="background:#94A3B8; cursor:not-allowed;"' : ''}
              style="width:100%; padding:10px 16px; font-size:0.9rem;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span>${prod.disponivel ? '+ Adicionar à Sacola' : 'Item Esgotado'}</span>
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="text-align:center; font-size:0.78rem; color:var(--brand-burgundy); font-weight:700;">
              Pedir só este item no WhatsApp ➔
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Vincular eventos aos novos botões de adicionar à sacola
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      adicionarAoCarrinho(id);
    });
  });
}

function initCategoryTabs() {
  const tabs = document.querySelectorAll('#categoryTabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filtro = tab.getAttribute('data-filter') || 'todos';
      renderShowcaseProducts(filtro);
    });
  });
}

/* ==========================================================================
   4. GERENCIAMENTO DA SACOLA (SHOPPING CART)
   ========================================================================== */
function carregarCarrinhoStorage() {
  try {
    const salvo = localStorage.getItem('mercado_carne_sacola');
    if (salvo) {
      carrinho = JSON.parse(salvo);
    }
  } catch (e) {
    carrinho = [];
  }
  atualizarUI_Carrinho();
}

function salvarCarrinhoStorage() {
  try {
    localStorage.setItem('mercado_carne_sacola', JSON.stringify(carrinho));
  } catch (e) {}
  atualizarUI_Carrinho();
}

function adicionarAoCarrinho(id) {
  if (typeof EstoqueDB === 'undefined') return;
  const produtos = EstoqueDB.obterProdutos();
  const produto = produtos.find(p => p.id === id);

  if (!produto || !produto.disponivel) return;

  const itemExistente = carrinho.find(item => item.id === id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      unidade: produto.unidade,
      foto: produto.foto,
      quantidade: 1
    });
  }

  salvarCarrinhoStorage();
  abrirCartDrawer();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(i => i.id !== id);
  }
  salvarCarrinhoStorage();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvarCarrinhoStorage();
}

function calcularTotalCarrinho() {
  return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarUI_Carrinho() {
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValor = calcularTotalCarrinho();
  const totalFormatado = EstoqueDB ? EstoqueDB.formatarPreco(totalValor) : `R$ ${totalValor.toFixed(2)}`;

  // Atualizar contadores no Header e Mobile
  const headerCount = document.getElementById('cart-header-count');
  if (headerCount) headerCount.textContent = totalItens;

  const drawerToggleCount = document.getElementById('cart-drawer-toggle-count');
  if (drawerToggleCount) drawerToggleCount.textContent = totalItens;

  // Atualizar Barra Flutuante
  const floatingBar = document.getElementById('floating-cart-bar');
  const barCount = document.getElementById('cart-bar-count');
  const barTotal = document.getElementById('cart-bar-total');

  if (barCount) barCount.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;
  if (barTotal) barTotal.textContent = totalFormatado;

  if (floatingBar) {
    if (totalItens > 0) {
      floatingBar.classList.add('active');
      document.body.classList.add('cart-bar-visible');
    } else {
      floatingBar.classList.remove('active');
      document.body.classList.remove('cart-bar-visible');
    }
  }

  // Atualizar Itens do Drawer
  const itemsContainer = document.getElementById('cart-drawer-items');
  const drawerTotal = document.getElementById('cart-drawer-total');

  if (drawerTotal) drawerTotal.textContent = totalFormatado;

  if (itemsContainer) {
    if (carrinho.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
          <span style="font-size:3rem; display:block; margin-bottom:12px;">🥩</span>
          <h4 style="font-weight:800; color:var(--text-heading); font-size:1.1rem;">Sua sacola está vazia</h4>
          <p style="font-size:0.85rem; margin-top:6px;">Escolha um de nossos combos ou carnes nobres acima para começar seu pedido!</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = carrinho.map(item => {
        const itemSubtotal = EstoqueDB ? EstoqueDB.formatarPreco(item.preco * item.quantidade) : `R$ ${(item.preco * item.quantidade).toFixed(2)}`;
        return `
          <div class="cart-item-row">
            <img src="${item.foto}" alt="${item.nome}" style="width:52px; height:52px; border-radius:8px; object-fit:cover; flex-shrink:0;">
            <div class="cart-item-info">
              <span class="cart-item-name">${item.nome}</span>
              <span class="cart-item-price">${itemSubtotal}</span>
            </div>
            <div class="cart-item-controls">
              <button class="btn-qty" onclick="alterarQuantidade('${item.id}', -1)">-</button>
              <span style="font-weight:800; min-width:20px; text-align:center;">${item.quantidade}</span>
              <button class="btn-qty" onclick="alterarQuantidade('${item.id}', 1)">+</button>
              <button onclick="removerDoCarrinho('${item.id}')" style="background:transparent; color:#EF4444; font-size:1rem; cursor:pointer; margin-left:6px;" title="Remover Item">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Global para chamadas onclick em HTML
window.alterarQuantidade = alterarQuantidade;
window.removerDoCarrinho = removerDoCarrinho;

/* ==========================================================================
   5. DRAWER SLIDE-OVER & FINALIZAÇÃO NO WHATSAPP
   ========================================================================== */
function abrirCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function fecharCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initCartDrawerEvents(configLoja) {
  const btnHeader = document.getElementById('btn-open-cart-header');
  const btnBar = document.getElementById('floating-cart-bar');
  const btnDrawerMobile = document.getElementById('btn-drawer-cart');
  const btnClose = document.getElementById('cart-drawer-close');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (btnHeader) btnHeader.addEventListener('click', abrirCartDrawer);
  if (btnBar) btnBar.addEventListener('click', abrirCartDrawer);
  if (btnDrawerMobile) {
    btnDrawerMobile.addEventListener('click', () => {
      const mobileDrawer = document.getElementById('mobileDrawer');
      const mobileBackdrop = document.getElementById('drawerBackdrop');
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (mobileBackdrop) mobileBackdrop.classList.remove('active');
      abrirCartDrawer();
    });
  }

  if (btnClose) btnClose.addEventListener('click', fecharCartDrawer);
  if (backdrop) backdrop.addEventListener('click', fecharCartDrawer);

  // Toggle Retirada vs Delivery
  const btnRetirada = document.getElementById('btn-tipo-retirada');
  const btnEntrega = document.getElementById('btn-tipo-entrega');
  const inputEndereco = document.getElementById('cart-cliente-endereco');

  if (btnRetirada && btnEntrega) {
    btnRetirada.addEventListener('click', () => {
      tipoPedido = 'retirada';
      btnRetirada.style.background = 'var(--brand-burgundy)';
      btnRetirada.style.color = '#FFFFFF';
      btnEntrega.style.background = 'var(--bg-subtle)';
      btnEntrega.style.color = 'var(--text-body)';
      if (inputEndereco) inputEndereco.style.display = 'none';
    });

    btnEntrega.addEventListener('click', () => {
      tipoPedido = 'delivery';
      btnEntrega.style.background = 'var(--brand-burgundy)';
      btnEntrega.style.color = '#FFFFFF';
      btnRetirada.style.background = 'var(--bg-subtle)';
      btnRetirada.style.color = 'var(--text-body)';
      if (inputEndereco) inputEndereco.style.display = 'block';
    });
  }

  // Finalizar no WhatsApp
  const btnFinalizar = document.getElementById('btn-finalizar-whatsapp');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      finalizarPedidoWhatsApp(configLoja);
    });
  }
}

function finalizarPedidoWhatsApp(configLoja) {
  if (carrinho.length === 0) {
    alert('Sua sacola está vazia! Escolha cortes ou combos antes de finalizar.');
    return;
  }

  const nomeInput = document.getElementById('cart-cliente-nome');
  const enderecoInput = document.getElementById('cart-cliente-endereco');
  const obsInput = document.getElementById('cart-cliente-obs');

  const nome = (nomeInput && nomeInput.value.trim()) ? nomeInput.value.trim() : 'Cliente';
  const endereco = (enderecoInput && enderecoInput.value.trim()) ? enderecoInput.value.trim() : '';
  const obs = (obsInput && obsInput.value.trim()) ? obsInput.value.trim() : '';

  if (tipoPedido === 'delivery' && !endereco) {
    alert('Por favor, informe seu endereço para entrega em Santo André.');
    if (enderecoInput) enderecoInput.focus();
    return;
  }

  const waNumero = configLoja.whatsapp || '5511963336938';
  const totalValor = calcularTotalCarrinho();
  const totalFormatado = EstoqueDB ? EstoqueDB.formatarPreco(totalValor) : `R$ ${totalValor.toFixed(2)}`;

  // Construção da Mensagem Elegante de WhatsApp
  let texto = `🥩 *NOVO PEDIDO — MERCADO DA CARNE*\n`;
  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `👤 *Cliente:* ${nome}\n`;
  texto += `🛵 *Modalidade:* ${tipoPedido === 'delivery' ? 'Entrega em Domicílio (Delivery)' : 'Retirada no Balcão da Loja'}\n`;
  
  if (tipoPedido === 'delivery') {
    texto += `📍 *Endereço:* ${endereco}\n`;
  } else {
    texto += `📍 *Retirada:* Av. São Paulo, 584 - Cidade São Jorge\n`;
  }

  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `🛒 *ITENS DO PEDIDO:*\n`;

  carrinho.forEach(item => {
    const subtotal = EstoqueDB ? EstoqueDB.formatarPreco(item.preco * item.quantidade) : `R$ ${(item.preco * item.quantidade).toFixed(2)}`;
    texto += `• ${item.quantidade}x ${item.nome} (${subtotal})\n`;
  });

  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `💰 *TOTAL DO PEDIDO:* ${totalFormatado}\n`;
  
  if (obs) {
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `💬 *Observações:* ${obs}\n`;
  }

  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `_Pedido gerado pelo Web App Oficial do Mercado da Carne_`;

  const linkWa = `https://wa.me/${waNumero}?text=${encodeURIComponent(texto)}`;
  window.open(linkWa, '_blank');
}

/* ==========================================================================
   6. CALCULADORA DE CHURRASCO
   ========================================================================== */
function initChurrascoCalculator(waNumero = '5511963336938') {
  let homens = 4;
  let mulheres = 4;
  let criancas = 2;
  let isPrime = true;

  const menVal = document.getElementById('calc-men-val');
  const womenVal = document.getElementById('calc-women-val');
  const kidsVal = document.getElementById('calc-kids-val');

  const styleTrad = document.getElementById('style-trad');
  const stylePrime = document.getElementById('style-prime');

  const resCarne = document.getElementById('res-carne');
  const resLinguica = document.getElementById('res-linguica');
  const resAcomp = document.getElementById('res-acomp');
  const resCarvao = document.getElementById('res-carvao');
  const resBebidas = document.getElementById('res-bebidas');
  const btnOrder = document.getElementById('btn-order-calc');

  function atualizarCalculo() {
    if (menVal) menVal.textContent = homens;
    if (womenVal) womenVal.textContent = mulheres;
    if (kidsVal) kidsVal.textContent = criancas;

    const fatorPrime = isPrime ? 1.2 : 1.0;
    const pesoCarne = ((homens * 0.45) + (mulheres * 0.3) + (criancas * 0.15)) * fatorPrime;
    const pesoLinguica = ((homens * 0.15) + (mulheres * 0.1) + (criancas * 0.08)) * fatorPrime;
    const totalPessoas = homens + mulheres + criancas;
    const pacotesPao = Math.ceil(totalPessoas / 4);
    const sacosCarvao = Math.max(1, Math.ceil(pesoCarne / 5));
    const totalAdultos = homens + mulheres;
    const cervejas = totalAdultos * 4;
    const refriLitros = Math.ceil(totalPessoas * 0.4);

    if (resCarne) resCarne.textContent = `${pesoCarne.toFixed(1)} kg`;
    if (resLinguica) resLinguica.textContent = `${pesoLinguica.toFixed(1)} kg`;
    if (resAcomp) resAcomp.textContent = `${pacotesPao} pct(s)`;
    if (resCarvao) resCarvao.textContent = `${sacosCarvao} saco(s) 4kg`;
    if (resBebidas) resBebidas.textContent = `${cervejas} cerv. + ${refriLitros}L refri`;

    if (btnOrder) {
      const msg = encodeURIComponent(
        `Olá! Calculei meu churrasco pelo Web App do Mercado da Carne (Santo André):\n\n` +
        `• Pessoas: ${homens} Homens, ${mulheres} Mulheres, ${criancas} Crianças\n` +
        `• Estilo: ${isPrime ? 'Parrilla Prime 🔥' : 'Tradicional'}\n` +
        `• Carnes Sugeridas: ${pesoCarne.toFixed(1)} kg\n` +
        `• Linguiça: ${pesoLinguica.toFixed(1)} kg\n` +
        `• Pão de Alho / Acompanhamentos: ${pacotesPao} pct(s)\n` +
        `• Carvão: ${sacosCarvao} saco(s)\n\n` +
        `Gostaria de montar esse pedido com os cortes disponíveis!`
      );
      btnOrder.href = `https://wa.me/${waNumero}?text=${msg}`;
    }
  }

  // Listeners
  document.getElementById('calc-men-minus')?.addEventListener('click', () => { if (homens > 0) homens--; atualizarCalculo(); });
  document.getElementById('calc-men-plus')?.addEventListener('click', () => { homens++; atualizarCalculo(); });

  document.getElementById('calc-women-minus')?.addEventListener('click', () => { if (mulheres > 0) mulheres--; atualizarCalculo(); });
  document.getElementById('calc-women-plus')?.addEventListener('click', () => { mulheres++; atualizarCalculo(); });

  document.getElementById('calc-kids-minus')?.addEventListener('click', () => { if (criancas > 0) criancas--; atualizarCalculo(); });
  document.getElementById('calc-kids-plus')?.addEventListener('click', () => { criancas++; atualizarCalculo(); });

  if (styleTrad && stylePrime) {
    styleTrad.addEventListener('click', () => {
      isPrime = false;
      styleTrad.classList.add('active');
      stylePrime.classList.remove('active');
      atualizarCalculo();
    });

    stylePrime.addEventListener('click', () => {
      isPrime = true;
      stylePrime.classList.add('active');
      styleTrad.classList.remove('active');
      atualizarCalculo();
    });
  }

  atualizarCalculo();
}

/* ==========================================================================
   7. INTERAÇÕES GERAIS (FAQ & MOBILE MENU)
   ========================================================================= */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

function initMobileDrawer() {
  const toggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const close = document.getElementById('drawerClose');

  if (toggle && drawer && backdrop) {
    toggle.addEventListener('click', () => {
      drawer.style.display = 'flex';
      backdrop.style.display = 'block';
      requestAnimationFrame(() => {
        drawer.classList.add('active');
        backdrop.classList.add('active');
      });
    });

    const fechar = () => {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (!drawer.classList.contains('active')) {
          drawer.style.display = 'none';
          backdrop.style.display = 'none';
        }
      }, 300);
    };

    if (close) close.addEventListener('click', fechar);
    backdrop.addEventListener('click', fechar);

    drawer.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', fechar);
    });
  }
}
