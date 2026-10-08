/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE (Mauá - SP)
 * Scripts Oficiais de Alta Conversão & Renderização Dinâmica
 * Padrão Ricardo & Severino
 */

document.addEventListener('DOMContentLoaded', () => {
  // Carrega configurações da loja a partir do banco de dados local
  const configLoja = (typeof EstoqueDB !== 'undefined') ? EstoqueDB.obterConfigLoja() : {
    whatsapp: '5511963336938',
    telefone: '(11) 96333-6938',
    horaInicioSemana: 7,
    horaFimSemana: 20,
    horaInicioDomingo: 7,
    horaFimDomingo: 14
  };

  // 1. Inicializar Botão WhatsApp Inteligente e Status da Loja
  initStoreStatusAndWhatsApp(configLoja);

  // 2. Renderizar Vitrine Dinâmica de Carnes & Rotisserie
  renderShowcaseProducts();

  // 3. Inicializar Calculadora de Churrasco
  initChurrascoCalculator(configLoja.whatsapp);

  // 4. Inicializar Filtros da Vitrine
  initShowcaseFilter();

  // 5. Inicializar FAQ Accordion
  initFaqAccordion();

  // 6. Inicializar Mobile Drawer
  initMobileDrawer();
});

/**
 * Gerenciador de Atendimento WhatsApp em Tempo Real
 */
function initStoreStatusAndWhatsApp(config) {
  const {
    whatsapp = "5511963336938",
    horaInicioSemana = 7,
    horaFimSemana = 20,
    horaInicioDomingo = 7,
    horaFimDomingo = 14
  } = config;

  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  const hora = agora.getHours();
  const minutos = agora.getMinutes();
  const horaDecimal = hora + (minutos / 60);

  let isOnline = false;

  // Verificação de funcionamento (Seg a Sáb: 7h às 20h | Dom: 7h às 14h)
  if (diaSemana >= 1 && diaSemana <= 6 && horaDecimal >= horaInicioSemana && horaDecimal < horaFimSemana) {
    isOnline = true;
  } else if (diaSemana === 0 && horaDecimal >= horaInicioDomingo && horaDecimal < horaFimDomingo) {
    isOnline = true;
  }

  // Elementos do Widget Flutuante
  const waLink = document.getElementById('wa-link');
  const waDot = document.getElementById('wa-status-dot');
  const waText = document.getElementById('wa-status-text');

  // Elementos da Topbar
  const topbarDot = document.getElementById('topbar-status-dot');
  const topbarText = document.getElementById('topbar-status-text');

  if (isOnline) {
    if (waDot) waDot.className = 'wa-status-dot online';
    if (waText) waText.textContent = 'Online Agora';
    if (topbarDot) topbarDot.className = 'status-dot-mini';
    if (topbarText) topbarText.textContent = 'Aberto Agora • Atendimento no Balcão & Delivery';
    
    const msg = encodeURIComponent("Olá! Vim pelo site do Mercado da Carne (Mauá) e gostaria de consultar os cortes e assados disponíveis.");
    if (waLink) waLink.href = `https://wa.me/${whatsapp}?text=${msg}`;
  } else {
    if (waLink) waLink.classList.add('offline-mode');
    if (waDot) waDot.className = 'wa-status-dot offline';
    if (waText) waText.textContent = 'Fora do Expediente';
    if (topbarDot) topbarDot.className = 'status-dot-mini closed';
    if (topbarText) topbarText.textContent = 'Fechado Agora • Deixe sua encomenda pelo WhatsApp para o próximo expediente';

    const msg = encodeURIComponent("Olá! Vi o site do Mercado da Carne fora do horário de atendimento e gostaria de encomendar carnes/assados.");
    if (waLink) waLink.href = `https://wa.me/${whatsapp}?text=${msg}`;
  }
}

/**
 * Renderiza os produtos na Vitrine dinamicamente do EstoqueDB
 */
function renderShowcaseProducts() {
  const container = document.getElementById('grid-cortes-dinamico');
  if (!container || typeof EstoqueDB === 'undefined') return;

  const produtos = EstoqueDB.obterProdutos();
  const config = EstoqueDB.obterConfigLoja();
  const waNumero = config.whatsapp || '5511963336938';

  container.innerHTML = produtos.map(prod => {
    const precoFormatado = EstoqueDB.formatarPreco(prod.preco);
    const msgPedido = encodeURIComponent(`Olá! Gostaria de pedir o corte/item "${prod.nome}" no valor de ${precoFormatado}/${prod.unidade}.`);
    const waUrl = `https://wa.me/${waNumero}?text=${msgPedido}`;
    const badgeEsgotado = !prod.disponivel ? `<span style="position:absolute; top:14px; right:14px; background:#EF4444; color:#fff; font-size:0.7rem; font-weight:700; padding:3px 8px; border-radius:4px;">Esgotado</span>` : '';

    return `
      <div class="cut-card" data-category="${prod.categoria}" style="${!prod.disponivel ? 'opacity:0.75;' : ''}">
        <div class="cut-img-wrapper">
          <img src="${prod.foto}" alt="${prod.nome}" class="cut-img" loading="lazy">
          <span class="cut-tag">${prod.tag || 'Seleção da Loja'}</span>
          <span class="cut-marbling">${prod.marmoreio || 'Alta Qualidade'}</span>
          ${badgeEsgotado}
        </div>
        <div class="cut-content">
          <h3 class="cut-title">${prod.nome}</h3>
          <p class="cut-desc">${prod.descricao}</p>
          <div class="cut-footer">
            <div class="cut-price-box">
              <span class="cut-price-label">${prod.tipo === 'rotisserie' ? 'Valor' : 'Preço Médio'}</span>
              <span class="cut-price">${precoFormatado} <small style="font-size:0.75rem; color:var(--text-muted)">/${prod.unidade}</small></span>
            </div>
            ${prod.disponivel ? `
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-order">
                <span>Pedir</span> ➔
              </a>
            ` : `
              <span style="font-size:0.78rem; color:#EF4444; font-weight:700;">Indisponível hoje</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Calculadora Inteligente de Churrasco
 */
function initChurrascoCalculator(waNumero = "5511963336938") {
  let homens = 4;
  let mulheres = 4;
  let criancas = 2;
  let estilo = 'prime';

  const btnMenMinus = document.getElementById('calc-men-minus');
  const btnMenPlus = document.getElementById('calc-men-plus');
  const valMen = document.getElementById('calc-men-val');

  const btnWomenMinus = document.getElementById('calc-women-minus');
  const btnWomenPlus = document.getElementById('calc-women-plus');
  const valWomen = document.getElementById('calc-women-val');

  const btnKidsMinus = document.getElementById('calc-kids-minus');
  const btnKidsPlus = document.getElementById('calc-kids-plus');
  const valKids = document.getElementById('calc-kids-val');

  const styleTrad = document.getElementById('style-trad');
  const stylePrime = document.getElementById('style-prime');

  const resCarne = document.getElementById('res-carne');
  const resLinguica = document.getElementById('res-linguica');
  const resAcomp = document.getElementById('res-acomp');
  const resCarvao = document.getElementById('res-carvao');
  const resBebidas = document.getElementById('res-bebidas');
  const btnOrderCalc = document.getElementById('btn-order-calc');

  function updateValues() {
    if (valMen) valMen.textContent = homens;
    if (valWomen) valWomen.textContent = mulheres;
    if (valKids) valKids.textContent = criancas;

    const fatorHomem = estilo === 'prime' ? 450 : 350;
    const fatorMulher = estilo === 'prime' ? 350 : 250;
    const fatorCrianca = estilo === 'prime' ? 200 : 150;

    const totalCarneGramas = (homens * fatorHomem) + (mulheres * fatorMulher) + (criancas * fatorCrianca);
    const carneKg = (totalCarneGramas / 1000).toFixed(1);

    const totalLinguicaGramas = ((homens + mulheres) * 150) + (criancas * 80);
    const linguicaKg = (totalLinguicaGramas / 1000).toFixed(1);

    const pacotesPaoAlho = Math.max(1, Math.ceil((homens + mulheres + criancas) / 4));
    const sacosCarvao = Math.max(1, Math.ceil((parseFloat(carneKg) + parseFloat(linguicaKg)) / 5));

    const latasCerveja = (homens * 5) + (mulheres * 3);
    const litrosNaoAlcool = Math.max(2, Math.ceil(((homens + mulheres + criancas) * 0.5)));

    if (resCarne) resCarne.textContent = `${carneKg} kg de Cortes Selecionados`;
    if (resLinguica) resLinguica.textContent = `${linguicaKg} kg de Linguiça Artesanal`;
    if (resAcomp) resAcomp.textContent = `${pacotesPaoAlho} pct(s) Pão de Alho & Coalho`;
    if (resCarvao) resCarvao.textContent = `${sacosCarvao} saco(s) Carvão Especial 4kg`;
    if (resBebidas) resBebidas.textContent = `${latasCerveja} Cervejas + ${litrosNaoAlcool}L Bebidas`;

    if (btnOrderCalc) {
      const estiloNome = estilo === 'prime' ? 'Parrilla Prime & Especiais' : 'Tradicional';
      const textoPedido = `*PEDIDO CALCULADORA DE CHURRASCO — MERCADO DA CARNE MAUÁ*%0A%0A` +
        `📍 *Retirada / Delivery:* Parque São Vicente, Mauá - SP%0A` +
        `👥 *Convidados:* ${homens} homens, ${mulheres} mulheres, ${criancas} crianças%0A` +
        `🔥 *Estilo:* ${estiloNome}%0A%0A` +
        `🥩 *Cortes Bovinos:* ${carneKg} kg%0A` +
        `🌭 *Linguiça:* ${linguicaKg} kg%0A` +
        `🥖 *Pão de Alho/Coalho:* ${pacotesPaoAlho} pct(s)%0A` +
        `🪵 *Carvão:* ${sacosCarvao} saco(s) 4kg%0A` +
        `🍺 *Bebidas recomendadas:* ${latasCerveja} cervejas / ${litrosNaoAlcool}L refri%0A%0A` +
        `Olá! Gostaria de consultar os valores e fechar este pedido com vocês!`;

      btnOrderCalc.href = `https://wa.me/${waNumero}?text=${textoPedido}`;
    }
  }

  if (btnMenMinus) btnMenMinus.addEventListener('click', () => { if (homens > 0) homens--; updateValues(); });
  if (btnMenPlus) btnMenPlus.addEventListener('click', () => { homens++; updateValues(); });

  if (btnWomenMinus) btnWomenMinus.addEventListener('click', () => { if (mulheres > 0) mulheres--; updateValues(); });
  if (btnWomenPlus) btnWomenPlus.addEventListener('click', () => { mulheres++; updateValues(); });

  if (btnKidsMinus) btnKidsMinus.addEventListener('click', () => { if (criancas > 0) criancas--; updateValues(); });
  if (btnKidsPlus) btnKidsPlus.addEventListener('click', () => { criancas++; updateValues(); });

  if (styleTrad && stylePrime) {
    styleTrad.addEventListener('click', () => {
      estilo = 'tradicional';
      styleTrad.classList.add('active');
      stylePrime.classList.remove('active');
      updateValues();
    });

    stylePrime.addEventListener('click', () => {
      estilo = 'prime';
      stylePrime.classList.add('active');
      styleTrad.classList.remove('active');
      updateValues();
    });
  }

  updateValues();
}

/**
 * Filtro da Vitrine de Cortes
 */
function initShowcaseFilter() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');
      const cutCards = document.querySelectorAll('.cut-card');

      cutCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'todos' || cardCategory === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

/**
 * FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/**
 * Mobile Drawer Menu
 */
function initMobileDrawer() {
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-nav a');

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}
