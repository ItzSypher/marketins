// Conteúdo da página de teste: tudo vem da mensagem do Sérgio (06/10) ou do
// que já está no site. Sem foto, logo ou resultado inventado: onde falta
// material, a página mostra o espaço marcado "enviar".

export const pontos = [
  { id: 'grandes', titulo: 'Clientes grandes' },
  { id: 'estrutura', titulo: 'Estrutura física' },
  { id: 'time', titulo: 'Time completo' },
  { id: 'conexoes', titulo: 'Conexões' },
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

export const unidades: { cidade: string; local: string; mapa: string; img?: string; alt?: string }[] = [
  { cidade: 'Nova Iguaçu', local: 'Le Monde Office', mapa: 'Le Monde Office Nova Iguaçu', img: '/unidades/le-monde-nova-iguacu.webp', alt: 'Fachada do Le Monde Office, em Nova Iguaçu' },
  { cidade: 'São João de Meriti', local: 'Unidade São João', mapa: 'Marketins São João de Meriti' },
];

/** Rede do Sérgio: quem o empresário alcança chegando pela Marketins. */
export const conexoes = [
  { nome: 'Le Monde', papel: 'O síndico' },
  { nome: 'Oba Oba', papel: 'O dono' },
  { nome: 'Forneria Original', papel: 'Conexão direta' },
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
