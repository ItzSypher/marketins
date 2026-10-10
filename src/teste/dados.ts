// Conteúdo da página de teste: tudo vem da mensagem do Sérgio (06/10) ou do
// que já está no site. Sem foto, logo ou resultado inventado: onde falta
// material, a página mostra o espaço marcado "enviar".

export const pontos = [
  { id: 'grandes', titulo: 'Clientes grandes' },
  { id: 'estrutura', titulo: 'Estrutura física' },
  { id: 'time', titulo: 'Time completo' },
];

/** Prova social: os clientes grandes, na ordem do Sérgio. */
export const grandes: { nome: string; segmento?: string; logo?: string }[] = [
  { nome: 'Marcelo Manhães', segmento: 'Assessoria previdenciária', logo: '/logos/marcelo-manhaes.svg' },
  { nome: 'Pelo Zero', segmento: 'Depilação' },
  { nome: 'Locagora', segmento: 'Locação de veículos' },
  { nome: 'Mozi' },
];

/** Clientes em vários segmentos (Sérgio: "e mais uns 20..."). */
export const clientes = [
  'Solze', 'Núcleo Idea', 'BNI Baixada', 'Cidoca', 'Pro Obras', '3J Service', 'Dra. Rosana',
  'Nova Iguaçu Materiais Elétricos', 'Our Control', 'Porto Fênix', 'Gabi Automóveis', 'Bela Automóveis',
  'Lual Empresarial', 'Ótica By Econômica', 'Larte Móveis', 'JR Uniformes', 'Owl Mobilidade',
];

export const segmentos = [
  'Previdenciário', 'Estética', 'Locação', 'Materiais elétricos', 'Construção',
  'Saúde', 'Automóveis', 'Contabilidade', 'Ótica', 'Móveis', 'Bem-estar', 'Networking',
];

export const unidades: { cidade: string; local: string; mapa: string; rota: string; img?: string; alt?: string }[] = [
  // mapa = nome do lugar como o Google conhece (vem dos links que o cliente mandou); rota = link do cliente
  { cidade: 'Nova Iguaçu', local: 'Le Monde Office', mapa: 'Marketins - Sala de Reunião, Nova Iguaçu - RJ', rota: 'https://share.google/Z4vO9Ba6gi9ZY8Z9p', img: '/unidades/le-monde-nova-iguacu.webp', alt: 'Fachada do Le Monde Office, em Nova Iguaçu' },
  { cidade: 'São João de Meriti', local: 'Sede da Marketins', mapa: 'Marketins - Agencia de Marketing, São João de Meriti - RJ', rota: 'https://share.google/ODIZBc0PZoSxEfMUI', img: '/unidades/sao-joao-de-meriti.webp', alt: 'Recepção da Marketins em São João de Meriti, com o tapete do logo' },
];

// Artes que a Marketins criou para clientes (grupo do Figma, nó 5029:5571).
// w/h = tamanho do arquivo; o CSS usa a proporção para encaixar em "cover".
// foco = posição vertical do recorte (padrão: center).
export const trabalhos: { src: string; alt: string; w: number; h: number; foco?: string }[] = [
  { src: '/trabalhos/01.webp', alt: 'Arte para a Mozi: caixa de salgados', w: 960, h: 1200 },
  { src: '/trabalhos/02.webp', alt: 'Arte para o BNI: "Existe uma reunião que empresários estratégicos não ignoram"', w: 960, h: 1200 },
  { src: '/trabalhos/03.webp', alt: 'Arte para a Locafácil: frota para empresas', w: 960, h: 1200 },
  { src: '/trabalhos/04.webp', alt: 'Post da Marketins: "Quem é a Marketins?"', w: 960, h: 1200 },
  { src: '/trabalhos/05.webp', alt: 'Arte para a 3J Service: serviço terceirizado', w: 960, h: 1200 },
  { src: '/trabalhos/06.webp', alt: 'Arte para o BNI Baixada RJ: "Por que o BNI se reúne toda semana?"', w: 960, h: 1200 },
  { src: '/trabalhos/07.webp', alt: 'Arte para a Locafácil: "Tem uma semana corrida pela frente e está sem carro?"', w: 960, h: 1200 },
  { src: '/trabalhos/08.webp', alt: 'Post da Marketins: "Onde estamos?" com as unidades', w: 960, h: 1200 },
  { src: '/trabalhos/09.webp', alt: 'Arte para o BNI: "Se até no futebol, ninguém ganha sozinho"', w: 960, h: 1280 },
  { src: '/trabalhos/10.webp', alt: 'Arte para o BNI: "As melhores oportunidades começam quando alguém lembra do seu nome"', w: 960, h: 1202 },
];

// Time final (fotos do grupo "EQUIPE MARKETINS" do Figma). Lucas ainda sem texto.
export const equipeFinal: { nome: string; foto: string; texto?: string }[] = [
  { nome: 'Sérgio', foto: '/time3/sergio.webp', texto: 'Gestor de tráfego há 15 anos, mercadólogo e fundador da Agência Marketins.' },
  { nome: 'Julyane', foto: '/time3/julyane.webp', texto: 'Formada em gestão de marketing e pós-graduanda em ciência de dados e IA.' },
  { nome: 'Gabriella', foto: '/time3/gabriella.webp', texto: 'Formada em UX/UI Design e desenvolvedora front-end de sites e aplicativos.' },
  { nome: 'Henrique', foto: '/time3/henrique.webp', texto: 'Atuava na comunicação social da Força Aérea Brasileira.' },
  { nome: 'Elaine', foto: '/time3/elaine.webp', texto: 'Cursando publicidade e propaganda. Tem um curta-metragem premiado.' },
  { nome: 'Lucas', foto: '/time3/lucas.webp' },
];

// Rodapé (dados enviados pelo cliente)
export const empresa = {
  nome: 'Marketins Soluções de Marketing',
  marca: 'Agência Marketins',
  cnpj: '38.264.829/0001-74',
  cidade: 'São João de Meriti, RJ',
  whatsapp: '(21) 99237-2689',
  email: 'marketing@gemartins.com.br',
  instagram: 'https://www.instagram.com/marketins.mkt/',
  reels: 'https://www.instagram.com/marketins.mkt/reels/',
};

// Evento Marketins Conecta (posts do cliente). Horário de início ainda não informado.
export const eventoConecta = {
  nome: 'Marketins Conecta',
  inicio: '2026-10-16T00:00:00-03:00',
  data: '16 de outubro',
  chamada: 'O maior evento de influenciadores da Baixada está chegando.',
  apoio: ['Mozi', 'Gomes & Vieira', 'Núcleo IDEA'],
  imagens: ['/conecta/salve-a-data.webp', '/conecta/time-conecta.webp'],
};
