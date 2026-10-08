/**
 * MERCADO DA CARNE — SHOP BUTCHER & ROTISSERIE
 * Av. São Paulo, 584 - Cidade São Jorge, Santo André - SP
 * Camada Central de Dados, Catálogo, Sofia IA & Clientes
 * Padrão Ricardo & Severino
 */

const STORAGE_CARNES_KEY = 'mercado_carne_produtos_v3';
const STORAGE_CONFIG_KEY = 'mercado_carne_config_v3';
const STORAGE_CLIENTES_KEY = 'mercado_carne_clientes_v1';
const STORAGE_SENHA_KEY = 'mercado_carne_senha_admin';

// 1. Galeria Pronta de Estúdio Gastronômico (Fotos de Alta Definição)
const GALERIA_FOTOS_ESTUDIO = [
  {
    nome: "Picanha com Capa Dourada",
    categoria: "bovinos",
    url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Tomahawk Prime com Osso Longo",
    categoria: "combos",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Bife de Ancho / Ribeye na Brasa",
    categoria: "bovinos",
    url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Costela Gaúcha Assada no Bafo",
    categoria: "rotisserie",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Frango Assado Recheado com Farofa",
    categoria: "rotisserie",
    url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Fraldinha Red Suculenta",
    categoria: "bovinos",
    url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Espetinhos Artesanais na Grelha",
    categoria: "churrasco",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Linguiça Artesanal de Pernil",
    categoria: "churrasco",
    url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Lasanha Bolonhesa da Casa",
    categoria: "rotisserie",
    url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Pão de Alho Crocante & Coalho",
    categoria: "acompanhamentos",
    url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Kit Churrasco Completo na Tábua",
    categoria: "combos",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  },
  {
    nome: "Carvão de Eucalipto & Acendedor",
    categoria: "acompanhamentos",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  }
];

// 2. Configurações Oficiais da Loja (Santo André)
const CONFIG_LOJA_PADRAO = {
  nome: 'Mercado da Carne',
  subtitulo: 'Shop Butcher & Rotisserie Gourmet',
  telefone: '(11) 96333-6938',
  whatsapp: '5511963336938',
  endereco: 'Av. São Paulo, 584',
  bairro: 'Cidade São Jorge',
  cidade: 'Santo André - SP',
  cep: '09111-410',
  googleMapsUrl: 'https://maps.google.com/?q=Av.+S%C3%A3o+Paulo,+584+-+Cidade+S%C3%A3o+Jorge,+Santo+Andr%C3%A9+-+SP,+09111-410',
  horarioSemana: 'Segunda a Sábado: 07:00 às 20:00',
  horarioDomingo: 'Domingos e Feriados: 07:00 às 14:00',
  horaInicioSemana: 7,
  horaFimSemana: 20,
  horaInicioDomingo: 7,
  horaFimDomingo: 14,
  taxaEntregaBairro: 'Entregas na Cidade São Jorge, Parque Marajoara e Santo André'
};

// 3. Catálogo Inicial de Produtos & Combos
const PRODUTOS_INICIAIS = [
  // --- COMBOS DE CHURRASCO ---
  {
    id: 'combo-1',
    nome: 'Combo Resenha dos Amigos (Serve 6 a 8)',
    categoria: 'combos',
    tipo: 'combo',
    preco: 289.00,
    unidade: 'combo',
    marmoreio: 'Combo Completo',
    tag: 'Mais Vendido',
    descricao: '1kg Bife de Chorizo Angus + 1kg Fraldinha Red + 700g Linguiça Especial + 1 Pão de Alho + 1 Sal de Parrilla.',
    foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'combo-2',
    nome: 'Combo Mestre Churrasqueiro Prime',
    categoria: 'combos',
    tipo: 'combo',
    preco: 499.00,
    unidade: 'combo',
    marmoreio: 'Linha Angus',
    tag: 'Destaque VIP',
    descricao: '1 Peça Picanha Angus (~1.2kg) + 1 Tomahawk Prime (~1.1kg) + 1kg Ancho + 800g Linguiça Coalho + 2 Pães de Alho + Carvão 4kg.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    destaque: true,
    disponivel: true
  },

  // --- ROTISSERIE DE FIM DE SEMANA ---
  {
    id: 'rot-1',
    nome: 'Costela Gaúcha no Bafo (Assada 8h)',
    categoria: 'rotisserie',
    tipo: 'rotisserie',
    preco: 84.90,
    unidade: 'kg',
    marmoreio: 'Desmancha no Garfo',
    tag: 'Tradição Domingo',
    descricao: 'Costela bovina selecionada assada lentamente por 8 horas no bafo com tempero especial da casa.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
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
    descricao: 'Frango inteiro marinado por 24h, recheado com farofa de bacon e calabresa. Acompanha batatas douradas.',
    foto: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
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
    tag: 'Assados Nobres',
    descricao: 'Cupim assado no ponto perfeito, casqueirado na hora e servido com molho chimichurri artesanal.',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
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
    tag: 'Rotisserie',
    descricao: 'Massa caseira montada em camadas generosas de mussarela, presunto e molho de carne moída de primeira.',
    foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },

  // --- CORTES BOVINOS NOBRES ---
  {
    id: 'bov-1',
    nome: 'Picanha Black Angus Reserva',
    categoria: 'bovinos',
    tipo: 'corte',
    preco: 139.90,
    unidade: 'kg',
    marmoreio: 'Marmoreio 4+',
    tag: 'Mais Vendida',
    descricao: 'Capa de gordura uniforme, maciez incomparável e fibras suculentas para grelha alta.',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'bov-2',
    nome: 'Tomahawk Steak Angus Prime',
    categoria: 'bovinos',
    tipo: 'corte',
    preco: 149.00,
    unidade: 'kg',
    marmoreio: 'Osso Longo',
    tag: 'Visual Imponente',
    descricao: 'O rei da grelha: ponta da costela com ancho e osso limpo de até 30cm. Sabor potente e maciez.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    destaque: true,
    disponivel: true
  },
  {
    id: 'bov-3',
    nome: 'Bife de Ancho (Ribeye)',
    categoria: 'bovinos',
    tipo: 'corte',
    preco: 119.90,
    unidade: 'kg',
    marmoreio: 'Marmoreio 5',
    tag: 'Parrilla Clássica',
    descricao: 'Filé de costela com o famoso olho de gordura entremeada que derrete na brasa viva.',
    foto: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'bov-4',
    nome: 'Fraldinha Red Reserva',
    categoria: 'bovinos',
    tipo: 'corte',
    preco: 89.90,
    unidade: 'kg',
    marmoreio: 'Fibras Longas',
    tag: 'Super Suculenta',
    descricao: 'Corte extremamente irrigado e macio. Excelente para assar inteira na brasa.',
    foto: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },

  // --- CHURRASCO & LINGUIÇAS ---
  {
    id: 'chu-1',
    nome: 'Linguiça de Pernil com Queijo Coalho',
    categoria: 'churrasco',
    tipo: 'corte',
    preco: 46.90,
    unidade: 'kg',
    marmoreio: 'Receita Artesanal',
    tag: 'Campeã de Vendas',
    descricao: 'Feita artesanalmente com pernil suíno selecionado e cubos generosos de queijo coalho.',
    foto: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'chu-2',
    nome: 'Espetinhos Variados Prontos (Bandeja 10 un)',
    categoria: 'churrasco',
    tipo: 'corte',
    preco: 58.00,
    unidade: 'bandeja',
    marmoreio: 'Praticidade Total',
    tag: 'Fácil Preparo',
    descricao: '10 espetinhos temperados prontos para grelha: carne bovina, frango com bacon e queijo coalho.',
    foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },

  // --- ACOMPANHAMENTOS & EMPÓRIO ---
  {
    id: 'acomp-1',
    nome: 'Pão de Alho Especial Cremoso',
    categoria: 'acompanhamentos',
    tipo: 'corte',
    preco: 18.90,
    unidade: 'pacote',
    marmoreio: 'Crocante & Macio',
    tag: 'Acompanhamento',
    descricao: 'Pacote com pães de alho recheados com creme de queijo e ervas finas.',
    foto: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  },
  {
    id: 'acomp-2',
    nome: 'Carvão de Eucalipto Selecionado 4kg',
    categoria: 'acompanhamentos',
    tipo: 'corte',
    preco: 24.00,
    unidade: 'saco',
    marmoreio: 'Brasa Duradoura',
    tag: 'Sem Fumaça',
    descricao: 'Pedaços grandes de carvão de reflorestamento. Rápido acendimento e calor constante.',
    foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    destaque: false,
    disponivel: true
  }
];

// 4. Clientes Pré-carregados para Testes de Disparos
const CLIENTES_INICIAIS = [
  { id: 'cli-1', nome: 'Carlos Alberto', telefone: '5511999990001', bairro: 'Cidade São Jorge', tags: ['Churrasco', 'Sexta'] },
  { id: 'cli-2', nome: 'Mariana Lima', telefone: '5511999990002', bairro: 'Parque Marajoara', tags: ['Rotisserie', 'Domingo'] },
  { id: 'cli-3', nome: 'Felipe Ramos', telefone: '5511999990003', bairro: 'Vila Homero Thon', tags: ['Parrilla Prime'] }
];

// 5. API do Banco Local & Sincronização
const EstoqueDB = {
  init() {
    if (!localStorage.getItem(STORAGE_CARNES_KEY)) {
      localStorage.setItem(STORAGE_CARNES_KEY, JSON.stringify(PRODUTOS_INICIAIS));
    }
    if (!localStorage.getItem(STORAGE_CONFIG_KEY)) {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(CONFIG_LOJA_PADRAO));
    }
    if (!localStorage.getItem(STORAGE_CLIENTES_KEY)) {
      localStorage.setItem(STORAGE_CLIENTES_KEY, JSON.stringify(CLIENTES_INICIAIS));
    }
    if (!localStorage.getItem(STORAGE_SENHA_KEY)) {
      localStorage.setItem(STORAGE_SENHA_KEY, 'admin123');
    }
  },

  // Produtos
  obterProdutos() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CARNES_KEY)) || PRODUTOS_INICIAIS;
    } catch (e) {
      return PRODUTOS_INICIAIS;
    }
  },

  salvarProdutos(produtos) {
    localStorage.setItem(STORAGE_CARNES_KEY, JSON.stringify(produtos));
  },

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

  excluirItem(id) {
    let produtos = this.obterProdutos();
    produtos = produtos.filter(p => p.id !== id);
    this.salvarProdutos(produtos);
  },

  // Clientes
  obterClientes() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CLIENTES_KEY)) || CLIENTES_INICIAIS;
    } catch (e) {
      return CLIENTES_INICIAIS;
    }
  },

  adicionarClientes(novosClientes) {
    const atuais = this.obterClientes();
    const mapaTelefones = new Set(atuais.map(c => c.telefone));

    novosClientes.forEach(cli => {
      if (!mapaTelefones.has(cli.telefone)) {
        atuais.push(cli);
        mapaTelefones.add(cli.telefone);
      }
    });

    localStorage.setItem(STORAGE_CLIENTES_KEY, JSON.stringify(atuais));
    return atuais;
  },

  excluirCliente(id) {
    let clientes = this.obterClientes();
    clientes = clientes.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_CLIENTES_KEY, JSON.stringify(clientes));
  },

  // Galeria de Fotos de Estúdio
  obterGaleriaEstudio() {
    return GALERIA_FOTOS_ESTUDIO;
  },

  // Configurações
  obterConfigLoja() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY)) || CONFIG_LOJA_PADRAO;
    } catch (e) {
      return CONFIG_LOJA_PADRAO;
    }
  },

  salvarConfigLoja(config) {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  },

  // Senha
  verificarSenha(senha) {
    this.init();
    const salva = localStorage.getItem(STORAGE_SENHA_KEY) || 'admin123';
    return senha === salva;
  },

  alterarSenha(novaSenha) {
    localStorage.setItem(STORAGE_SENHA_KEY, novaSenha);
  },

  formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
};

EstoqueDB.init();
