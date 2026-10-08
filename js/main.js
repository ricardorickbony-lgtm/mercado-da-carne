/**
 * MERCADO DA CARNE — BOUTIQUE DE CARNES NOBRES
 * Scripts e Lógica de Conversão em Tempo Real
 * Padrão Oficial Ricardo & Severino
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Botão WhatsApp Inteligente e Status da Loja
  initStoreStatusAndWhatsApp({
    numero: "5511999999999", // Número configurável
    nomeLoja: "Mercado da Carne",
    diasSemana: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    horaInicio: 8,
    horaFim: 20,
    domingoAbre: true,
    domingoHoraFim: 14
  });

  // 2. Inicializar Calculadora de Churrasco
  initChurrascoCalculator();

  // 3. Inicializar Filtros da Vitrine de Cortes
  initShowcaseFilter();

  // 4. Inicializar FAQ Accordion
  initFaqAccordion();

  // 5. Inicializar Menu Mobile Drawer
  initMobileDrawer();
});

/**
 * Gerenciador de Atendimento WhatsApp em Tempo Real
 */
function initStoreStatusAndWhatsApp(config) {
  const {
    numero = "5511999999999",
    diasSemana = [1, 2, 3, 4, 5, 6],
    horaInicio = 8,
    horaFim = 20,
    domingoAbre = true,
    domingoHoraFim = 14
  } = config;

  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  const hora = agora.getHours();
  const minutos = agora.getMinutes();
  const horaDecimal = hora + (minutos / 60);

  let isOnline = false;

  // Verificação de funcionamento
  if (diasSemana.includes(diaSemana) && horaDecimal >= horaInicio && horaDecimal < horaFim) {
    isOnline = true;
  } else if (domingoAbre && diaSemana === 0 && horaDecimal >= horaInicio && horaDecimal < domingoHoraFim) {
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
    if (topbarText) topbarText.textContent = 'Aberto Agora • Atendimento & Delivery Express';
    
    const msg = encodeURIComponent("Olá! Vim pelo site do Mercado da Carne e gostaria de ver os cortes disponíveis e fazer um pedido.");
    if (waLink) waLink.href = `https://wa.me/${numero}?text=${msg}`;
  } else {
    if (waLink) waLink.classList.add('offline-mode');
    if (waDot) waDot.className = 'wa-status-dot offline';
    if (waText) waText.textContent = 'Fora do Expediente';
    if (topbarDot) topbarDot.className = 'status-dot-mini closed';
    if (topbarText) topbarText.textContent = 'Fechado Agora • Deixe sua encomenda para amanhã';

    const msg = encodeURIComponent("Olá! Estou no site do Mercado da Carne fora do horário comercial e gostaria de deixar um pedido agendado.");
    if (waLink) waLink.href = `https://wa.me/${numero}?text=${msg}`;
  }
}

/**
 * Calculadora Inteligente de Churrasco
 */
function initChurrascoCalculator() {
  let homens = 4;
  let mulheres = 4;
  let criancas = 2;
  let estilo = 'prime'; // 'tradicional' ou 'prime'
  const waNumero = "5511999999999";

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

    // Fator por pessoa (em gramas de carne)
    const fatorHomem = estilo === 'prime' ? 450 : 350;
    const fatorMulher = estilo === 'prime' ? 350 : 250;
    const fatorCrianca = estilo === 'prime' ? 200 : 150;

    const totalCarneGramas = (homens * fatorHomem) + (mulheres * fatorMulher) + (criancas * fatorCrianca);
    const carneKg = (totalCarneGramas / 1000).toFixed(1);

    // Linguiça e aperitivos: ~150g por adulto
    const totalLinguicaGramas = ((homens + mulheres) * 150) + (criancas * 80);
    const linguicaKg = (totalLinguicaGramas / 1000).toFixed(1);

    // Acompanhamentos (Pão de alho e Queijo Coalho)
    const pacotesPaoAlho = Math.max(1, Math.ceil((homens + mulheres + criancas) / 4));

    // Carvão: 1 saco de 4kg para cada 6kg de carne
    const sacosCarvao = Math.max(1, Math.ceil((parseFloat(carneKg) + parseFloat(linguicaKg)) / 5));

    // Bebidas estimadas
    const latasCerveja = (homens * 5) + (mulheres * 3);
    const litrosNaoAlcool = Math.max(2, Math.ceil(((homens + mulheres + criancas) * 0.5)));

    if (resCarne) resCarne.textContent = `${carneKg} kg de Cortes Nobres`;
    if (resLinguica) resLinguica.textContent = `${linguicaKg} kg de Linguiça Artesanal`;
    if (resAcomp) resAcomp.textContent = `${pacotesPaoAlho} pct(s) Pão de Alho & Coalho`;
    if (resCarvao) resCarvao.textContent = `${sacosCarvao} saco(s) Carvão Especial 4kg`;
    if (resBebidas) resBebidas.textContent = `${latasCerveja} Cervejas + ${litrosNaoAlcool}L Não-alcóolicos`;

    // Atualizar Link do Pedido no WhatsApp
    if (btnOrderCalc) {
      const estiloNome = estilo === 'prime' ? 'Linha Prime & Parrilla' : 'Tradicional';
      const textoPedido = `*PEDIDO CALCULADORA DE CHURRASCO — MERCADO DA CARNE*%0A%0A` +
        `👥 *Convidados:* ${homens} homens, ${mulheres} mulheres, ${criancas} crianças%0A` +
        `🔥 *Estilo:* ${estiloNome}%0A%0A` +
        `🥩 *Cortes Nobres:* ${carneKg} kg%0A` +
        `🌭 *Linguiça Artesanal:* ${linguicaKg} kg%0A` +
        `🥖 *Acompanhamentos:* ${pacotesPaoAlho} pct(s) Pão de Alho / Coalho%0A` +
        `🪵 *Carvão:* ${sacosCarvao} saco(s) 4kg%0A` +
        `🍺 *Bebidas sugeridas:* ${latasCerveja} latas / ${litrosNaoAlcool}L refri%0A%0A` +
        `Gostaria de confirmar a disponibilidade e fechar este pedido para entrega/retirada!`;

      btnOrderCalc.href = `https://wa.me/${waNumero}?text=${textoPedido}`;
    }
  }

  // Listeners dos botões
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
  const cutCards = document.querySelectorAll('.cut-card');

  if (!tabBtns.length || !cutCards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

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
      
      // Fecha todos os outros
      faqItems.forEach(i => i.classList.remove('active'));

      // Alterna o atual
      if (!isActive) {
        item.classList.add('active');
      }
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
