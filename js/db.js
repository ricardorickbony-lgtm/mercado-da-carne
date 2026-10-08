/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE (Mauá - SP)
 * Camada de Dados, Catálogo e Configurações da Loja
 * Padrão Oficial Ricardo & Severino
 */

const STORAGE_CARNES_KEY = 'mercado_carne_produtos_v1';
const STORAGE_CONFIG_KEY = 'mercado_carne_config_v1';
const STORAGE_SENHA_KEY = 'mercado_carne_senha_admin';

// 1. Configurações Oficiais da Loja (Extraídas do Google Business Oficial)
const CONFIG_LOJA_PADRAO = {
  nome: 'Mercado da Carne',
  subtitulo: 'Shop Butcher & Rotisserie Gourmet',
  razaoSocial: 'Mercado da Carne SB Ltda',
  cnpj: '40.779.193/0001-45',
  telefone: '(11) 96333-6938',
  whatsapp: '5511963336938',
  endereco: 'Rua Presidente Nereu Ramos, 51',
  bairro: 'Parque São Vicente',
  cidade: 'Mauá - SP',
  cep: '09371-210',
  googleMapsUrl: 'https://maps.app.goo.gl/dMcyRrwKSxvfiZb78',
  horarioSemana: 'Segunda a Sábado: 07:00 às 20:00',
  horarioDomingo: 'Domingos e Feriados: 07:00 às 14:00',
  horaInicioSemana: 7,
  horaFimSemana: 20,
  horaInicioDomingo: 7,
  horaFimDomingo: 14,
  taxaEntregaBairro: 'Consulte frete grátis para Parque São Vicente e região'
};

// 2. Catálogo Oficial de Cortes, Assados de Rotisserie & Churrasco
const PRODUTOS_INICIAIS = [
  // --- CORTES NOBRES DE CHURRASCO ---
  {
    id: 'corte-1',
    nome: 'Picanha Black Angus Reserva',
    categoria: 'angus',
    tipo: 'corte',
    preco: 139.90,
    unidade: 'kg',
    marmoreio: 'Marmoreio 4+',
    tag: 'Mais Vendida',
    descricao: 'Capa de gordura uniforme, maciez incomparável e fibras suculentas. Ideal para bifes de tira na grelha ou assada inteira.',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'corte-2',
    nome: 'Tomahawk Steak Prime Angus',
    categoria: 'parrilla',
    tipo: 'corte',
    preco: 149.00,
    unidade: 'kg',
    marmoreio: 'Osso Longo',
    tag: 'Visual Imponente',
    descricao: 'O rei da grelha: corte da ponta da costela com ancho e osso limpo de até 30cm. Sabor potente e apresentação de cinema.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'corte-3',
    nome: 'Bife de Ancho (Ribeye)',
    categoria: 'parrilla',
    tipo: 'corte',
    preco: 119.90,
    unidade: 'kg',
    marmoreio: 'Marmoreio 5',
    tag: 'Parrilla Clássica',
    descricao: 'Filé de costela com o famoso olho de gordura entremeada que derrete na brasa viva, conferindo maciez extrema.',
    foto: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'corte-4',
    nome: 'Bife de Chorizo Black Angus',
    categoria: 'angus',
    tipo: 'corte',
    preco: 109.90,
    unidade: 'kg',
    marmoreio: 'Marmoreio 4',
    tag: 'Corte Nobre',
    descricao: 'Miolo do contrafilé argentino com faixa externa de gordura dourada e sabor marcante para grelha alta.',
    foto: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'corte-5',
    nome: 'Fraldinha Red Reserva',
    categoria: 'angus',
    tipo: 'corte',
    preco: 89.90,
    unidade: 'kg',
    marmoreio: 'Fibras Longas',
    tag: 'Super Suculenta',
    descricao: 'Corte extremamente irrigado e macio. Excelente para assar inteira na brasa ou fatiada contra o sentido da fibra.',
    foto: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'corte-6',
    nome: 'Prime Rib Dry Aged 35 Dias',
    categoria: 'especiais',
    tipo: 'corte',
    preco: 185.00,
    unidade: 'kg',
    marmoreio: 'Umami Puro',
    tag: 'Maturação a Seco',
    descricao: 'Maturação em câmara fria própria. Sabor concentrado de avelãs e queijo curado, textura de veludo.',
    foto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'corte-7',
    nome: 'Carré de Cordeiro Especial',
    categoria: 'suinos',
    tipo: 'corte',
    preco: 158.00,
    unidade: 'kg',
    marmoreio: 'French Rack',
    tag: 'Seleção Patagônia',
    descricao: 'Costeletas finamente aparadas. Carne tenra com sabor nobre e delicado para grelha ou forno.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    destaque: false,
    disponivel: true
  },

  // --- ROTISSERIE & ASSADOS DE FIM DE SEMANA (DIFERENCIAL FORTE DA LOJA) ---
  {
    id: 'rot-1',
    nome: 'Costela Gaúcha no Bafo (Assada)',
    categoria: 'rotisserie',
    tipo: 'rotisserie',
    preco: 84.90,
    unidade: 'kg',
    marmoreio: 'Desmancha no Osso',
    tag: 'Tradição Domingo',
    descricao: 'Costela bovina selecionada assada lentamente por 8 horas no bafo com tempero especial da casa. Derrete na boca.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'rot-2',
    nome: 'Frango Assado Recheado com Farofa',
    categoria: 'rotisserie',
    tipo: 'rotisserie',
    preco: 49.90,
    unidade: 'unidade',
    marmoreio: 'Pele Crocante',
    tag: 'Clássico da Rotisserie',
    descricao: 'Frango inteiro marinado por 24 horas, recheado com farofa rica de bacon e calabresa. Acompanha batatas douradas.',
    foto: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'rot-3',
    nome: 'Cupim Casqueirado no Bafo',
    categoria: 'rotisserie',
    tipo: 'rotisserie',
    preco: 89.90,
    unidade: 'kg',
    marmoreio: 'Super Macio',
    tag: 'Favorito dos Assadores',
    descricao: 'Cupim assado lentamente no ponto perfeito, casqueirado na hora e servido suculento com molho chimichurri.',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'rot-4',
    nome: 'Lasanha à Bolonhesa da Casa',
    categoria: 'rotisserie',
    tipo: 'rotisserie',
    preco: 48.00,
    unidade: 'kg',
    marmoreio: 'Massa Artesanal',
    tag: 'Padaria & Rotisserie',
    descricao: 'Massa caseira montada em camadas generosas de queijo mussarela, presunto e molho de carne moída de primeira.',
    foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80',
    destaque: false,
    disponivel: true
  }
];

// 3. API do Banco de Dados Local (EstoqueDB)
const EstoqueDB = {
  // Inicialização
  init() {
    if (!localStorage.getItem(STORAGE_CARNES_KEY)) {
      localStorage.setItem(STORAGE_CARNES_KEY, JSON.stringify(PRODUTOS_INICIAIS));
    }
    if (!localStorage.getItem(STORAGE_CONFIG_KEY)) {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(CONFIG_LOJA_PADRAO));
    }
    if (!localStorage.getItem(STORAGE_SENHA_KEY)) {
      localStorage.setItem(STORAGE_SENHA_KEY, 'admin123');
    }
  },

  // Obter Lista de Produtos
  obterProdutos() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CARNES_KEY)) || PRODUTOS_INICIAIS;
    } catch (e) {
      return PRODUTOS_INICIAIS;
    }
  },

  // Salvar Lista de Produtos
  salvarProdutos(produtos) {
    localStorage.setItem(STORAGE_CARNES_KEY, JSON.stringify(produtos));
  },

  // Adicionar ou Atualizar Produto
  salvarItem(item) {
    const produtos = this.obterProdutos();
    const index = produtos.findIndex(p => p.id === item.id);
    if (index >= 0) {
      produtos[index] = item;
    } else {
      produtos.unshift(item);
    }
    this.salvarProdutos(produtos);
    return item;
  },

  // Excluir Produto
  excluirItem(id) {
    let produtos = this.obterProdutos();
    produtos = produtos.filter(p => p.id !== id);
    this.salvarProdutos(produtos);
  },

  // Obter Configurações da Loja
  obterConfigLoja() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY)) || CONFIG_LOJA_PADRAO;
    } catch (e) {
      return CONFIG_LOJA_PADRAO;
    }
  },

  // Salvar Configurações da Loja
  salvarConfigLoja(config) {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  },

  // Autenticação do Admin
  verificarSenha(senha) {
    this.init();
    const salva = localStorage.getItem(STORAGE_SENHA_KEY) || 'admin123';
    return senha === salva;
  },

  alterarSenha(novaSenha) {
    localStorage.setItem(STORAGE_SENHA_KEY, novaSenha);
  },

  // Formatação de Preço
  formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
};

// Executa inicialização
EstoqueDB.init();
