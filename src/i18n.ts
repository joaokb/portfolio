// Português é a língua principal; inglês vive em /en/ com as mesmas páginas.
import perfil from './data/perfil.json';

export type Lang = 'pt' | 'en';

export const ui = {
  pt: {
    trabalhos: 'Trabalhos',
    sobre: 'Sobre',
    contato: 'Contato',
    pular: 'Pular para o conteúdo',
    trocar: 'EN',
    trocarRotulo: 'Read in English',
    premios: 'Prêmios e shortlists',
    todos: 'Todos os trabalhos',
    proximo: 'Próximo trabalho',
    behance: 'Ver no Behance',
    pdf: 'Ler o trabalho completo em PDF',
    marca: 'Marca',
    ano: 'Ano',
    disciplina: 'Disciplina',
    papel: 'Papel',
    contexto: 'Contexto',
    premio: 'Prêmio',
    imagem: 'imagem',
    de: 'de',
    video: 'Vídeo de',
    experiencia: 'Experiência',
    formacao: 'Formação',
    cursos: 'Cursos',
    habilidades: 'Habilidades principais',
    ferramentas: 'Ferramentas',
    cv: 'Baixar currículo em PDF',
    fotoDe: 'Foto de',
    sobreDe: 'Sobre',
    msgTitulo: 'Mensagem rápida',
    nome: 'Nome',
    email: 'E-mail',
    mensagem: 'Mensagem',
    enviar: 'Enviar',
    enviado: 'Mensagem enviada. Respondo em breve.',
    verTrabalhos: 'Ver trabalhos',
    erroTitulo: 'Página não encontrada',
    erroTexto: 'O endereço mudou ou nunca existiu. Os trabalhos continuam no mesmo lugar.',
    voltar: 'Voltar para a home',
    disponivel: {
      vaga: 'Procurando vaga de diretor de arte pleno, in-house ou remoto.',
      freela: 'Aceitando projetos freelance.',
      ambos: 'Procurando vaga de diretor de arte pleno, in-house ou remoto, e aceitando freelas.',
    },
    faixa: ['Direção de arte', 'Campanhas', 'Key visual', 'Identidade visual', 'Branding', 'Social media', 'Motion', 'Edição de vídeo'],
  },
  en: {
    trabalhos: 'Work',
    sobre: 'About',
    contato: 'Contact',
    pular: 'Skip to content',
    trocar: 'PT',
    trocarRotulo: 'Ler em português',
    premios: 'Awards and shortlists',
    todos: 'All work',
    proximo: 'Next project',
    behance: 'View on Behance',
    pdf: 'Read the full paper (PDF, Portuguese)',
    marca: 'Brand',
    ano: 'Year',
    disciplina: 'Discipline',
    papel: 'Role',
    contexto: 'Context',
    premio: 'Award',
    imagem: 'image',
    de: 'of',
    video: 'Video of',
    experiencia: 'Experience',
    formacao: 'Education',
    cursos: 'Courses',
    habilidades: 'Core skills',
    ferramentas: 'Tools',
    cv: 'Download résumé (PDF)',
    fotoDe: 'Photo of',
    sobreDe: 'About',
    msgTitulo: 'Quick message',
    nome: 'Name',
    email: 'Email',
    mensagem: 'Message',
    enviar: 'Send',
    enviado: 'Message sent. I will get back to you soon.',
    verTrabalhos: 'See work',
    erroTitulo: 'Page not found',
    erroTexto: 'This address moved or never existed. The work is still where it was.',
    voltar: 'Back to home',
    disponivel: {
      vaga: 'Looking for a mid-level art director role, in-house or remote.',
      freela: 'Open to freelance projects.',
      ambos: 'Looking for a mid-level art director role, in-house or remote, and open to freelance.',
    },
    faixa: ['Art direction', 'Campaigns', 'Key visuals', 'Visual identity', 'Branding', 'Social media', 'Motion', 'Video editing'],
  },
} as const;

/** Caminho na língua pedida: '/sobre/' vira '/en/sobre/'. */
export const rota = (lang: Lang, path: string) => (lang === 'en' ? `/en${path}` : path);

/** Língua a partir da URL. */
export const langDe = (url: URL): Lang => (/^\/en(\/|$)/.test(url.pathname) ? 'en' : 'pt');

/** Mesma página na outra língua. */
export const outraRota = (url: URL) => {
  // a 404 é uma página só, servida para qualquer endereço: o botão leva à home da outra língua
  if (/\/404(\.html|\/)?$/.test(url.pathname)) return langDe(url) === 'en' ? '/' : '/en/';
  return langDe(url) === 'en' ? url.pathname.replace(/^\/en/, '') || '/' : `/en${url.pathname}`;
};

/** Textos do perfil: bio, status etc. vêm de perfil.en; termos soltos (funções, cursos) do dicionário. */
export function textoPerfil(lang: Lang) {
  const en = lang === 'en' ? perfil.en : undefined;
  const termos: Record<string, string> = perfil.en.termos;
  return {
    cargo: en?.cargo || perfil.cargo,
    bio: en?.bio || perfil.bio,
    // disponibilidade em perfil.json: "vaga", "freela" ou "ambos"
    status: ui[lang].disponivel[perfil.disponibilidade as 'vaga' | 'freela' | 'ambos'] ?? ui[lang].disponivel.vaga,
    sobre: (en ? en.sobre || en.bio : perfil.sobre || perfil.bio) as string,
    tr: (s: string) => (en ? (termos[s] ?? s) : s),
  };
}
