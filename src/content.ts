// Tudo que é fato sobre a Marketins mora aqui. Números confirmados pelo
// cliente; nada de depoimento ou resultado inventado.

/** WhatsApp da Marketins, formato internacional só com dígitos. */
export const WHATSAPP = '5521992372689';
export const INSTAGRAM = 'https://www.instagram.com/marketins.mkt/';

const MENSAGEM = 'Olá! Vim pelo site da Marketins e gostaria de me aliar ao maior time de marketing da Baixada.';

/** Link do WhatsApp com a origem no fim da mensagem, para a Marketins saber
 *  que o contato veio do site e de qual botão (ex.: "[site · topo]"). */
export function linkContato(origem: string) {
  const texto = `${MENSAGEM} [site · ${origem}]`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

export const numeros = [
  { valor: '+10M', rotulo: 'investidos em tráfego' },
  { valor: '+100', rotulo: 'clientes atendidos' },
  { valor: '+10', rotulo: 'anos de experiência' },
  { valor: '50M', rotulo: 'de visualizações orgânicas' },
];

export const servicos = [
  {
    nome: 'Social media',
    texto: 'Planejamos o mês, criamos os posts, escrevemos as legendas e cuidamos do perfil. Todo mês você recebe as métricas e o que vamos mudar.',
    itens: ['Calendário editorial', 'Design, legenda e vídeo', 'Relatório mensal'],
  },
  {
    nome: 'Design',
    texto: 'Peça de feed, identidade, cardápio, fachada. O que sua marca precisar, no mesmo padrão em todo lugar onde ela aparece.',
    itens: ['Posts e campanhas', 'Identidade visual', 'Materiais impressos'],
  },
  {
    nome: 'Audiovisual',
    texto: 'Roteiro, direção, gravação e edição com equipe e equipamento próprios. A gente vai até a sua empresa e grava lá.',
    itens: ['Roteiro e direção', 'Diárias de vídeo maker', 'Edição para cada rede'],
  },
  {
    nome: 'Tráfego pago',
    texto: 'Campanhas no Meta e no Google com acompanhamento diário. Cada real do orçamento tem destino e aparece no relatório.',
    itens: ['Meta Ads e Google Ads', 'Otimização diária', 'Relatório de investimento'],
  },
];

// Cases do Figma (frame "CASES CLIENTES"), na mesma ordem. Nome e serviços já
// vêm aplicados na arte; o nome também vai no alt.
export const cases = [
  ['marcelo-manhaes', 'Aposentadoria Marcelo Manhães'], ['gabi-e-bela', 'Gabi e Bela Automóveis'],
  ['otica-by-economica', 'Ótica By Econômica'], ['larte-moveis', 'Larte Móveis'],
  ['morais-contabilidade', 'Morais Contabilidade'], ['jr-uniformes', 'JR Uniformes'],
  ['j-azevedo', 'J Azevedo Automóveis'], ['owl-mobilidade', 'Owl Mobilidade Elétrica'],
  ['porto-fenix', 'Porto Fênix'], ['locagora-baixada', 'Locagora Baixada'],
  ['lual-empresarial', 'Lual Empresarial'], ['conect-car', 'Conect Car'],
  ['eden-contabilidade', 'Eden Contabilidade'], ['martins-automacao', 'Martins Automação'],
  ['paroquia-sao-joao-batista', 'Paróquia São João Batista'], ['jk-lajes', 'JK Lajes'],
  ['exclusive-locker', 'Exclusive Locker'], ['pdv-legal', 'PDV Legal'],
  ['pro-obras', 'Pró Obras'], ['studio-holismo', 'Studio Holismo'],
  ['martins-certificacao', 'Martins Certificação'],
].map(([slug, nome]) => ({ nome, img: `/cases/${slug}.webp` }));

// Fotos do Figma (frames "JULYANE 1" etc.); a de destaque é o Sergio.
export const sergio = { nome: 'Sergio Martins', cargo: 'CEO', foto: '/time/sergio.webp' };
export const time = [
  { nome: 'Julyane', foto: '/time/julyane.webp' },
  { nome: 'Gabriella', foto: '/time/gabriella.webp' },
  { nome: 'Elaine', foto: '/time/elaine.webp' },
  { nome: 'Henrique', foto: '/time/henrique.webp' },
  { nome: 'Rafael', foto: '/time/rafael.webp' },
  { nome: 'Lucas', foto: '/time/lucas.webp' },
];

export const depoimentos = [
  { texto: 'Uma cliente amou o nosso Instagram. Parabéns, pessoal!', nome: 'Fabiana Almeida', empresa: 'Estação do Mármore' },
];

export const conecta = {
  nome: 'Marketins Conecta',
  data: '2026 · data em breve',
  chamada: 'O maior encontro de influenciadores da Baixada está chegando.',
  link: 'https://www.instagram.com/p/Dd4W2yxCqc8/',
  parceiros: ['Mezi', 'Núcleo IDEA'],
};
