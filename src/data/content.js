// Textos e ofertas (mock). Preços e números são ilustrativos.

export const BRAND = 'Flávio Calábria';
export const WHATSAPP = '5581999990000'; // número de demonstração

export const STATS = [
  { value: 180, suffix: '+', label: 'Reels entregues' },
  { value: 48, suffix: 'h', label: 'Prazo médio de edição' },
  { value: 32, suffix: '', label: 'Marcas atendidas' },
  { value: 4, suffix: '', label: 'Formatos por captação' },
];

export const PLANS = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 'R$ 1.490',
    cadence: '/ mês',
    pitch: 'Para manter o perfil ativo sem você precisar gravar sozinho.',
    forWho: 'Profissional solo ou negócio que posta 1 vez por semana',
    items: ['4 reels editados por mês', '1 captação de até 2h', 'Legendas e capa', '1 rodada de ajuste por vídeo'],
  },
  {
    id: 'presenca',
    name: 'Presença',
    price: 'R$ 2.690',
    cadence: '/ mês',
    pitch: 'Frequência de quem aparece toda semana no feed.',
    forWho: 'Negócio local que quer postar 2 vezes por semana',
    why: 'R$ 336 por reel · roteiro incluso',
    items: ['8 reels editados por mês', '2 captações de até 3h', 'Roteiro dos vídeos', 'Versões 9:16 e 4:5', '2 rodadas de ajuste'],
    featured: true,
  },
  {
    id: 'marca',
    name: 'Marca',
    price: 'R$ 4.200',
    cadence: '/ mês',
    pitch: 'Conteúdo contínuo mais um vídeo de marca por trimestre.',
    forWho: 'Marca com equipe de marketing e campanhas o ano todo',
    items: ['12 reels editados por mês', 'Captação semanal', 'Roteiro e direção', 'Todos os formatos', '1 vídeo horizontal por trimestre'],
  },
];

export const PACKAGES = [
  {
    id: 'lancamento',
    code: 'PKG-01',
    name: 'Lançamento',
    price: 'R$ 3.800',
    duration: '1 dia de gravação',
    delivery: '7 dias úteis',
    formats: '16:9 · 9:16 · 1:1',
    forWho: 'Produto ou serviço novo chegando ao mercado',
    still: 'product',
    deliverables: ['1 vídeo principal 16:9', '6 reels 9:16', '3 cortes 1:1 para anúncio', 'Fotos do vídeo tratadas para capa'],
  },
  {
    id: 'evento',
    code: 'PKG-02',
    name: 'Evento',
    price: 'R$ 5.400',
    duration: 'até 2 dias de evento',
    delivery: 'reels no mesmo dia · filme em 72h',
    formats: '16:9 · 9:16',
    forWho: 'Festas, feiras, shows e eventos corporativos',
    still: 'crowd',
    deliverables: ['Filme-resumo do evento em 16:9', '10 reels no mesmo dia', 'Trilha licenciada', 'Cobertura de palco e bastidores'],
  },
  {
    id: 'institucional',
    code: 'PKG-03',
    name: 'Institucional',
    price: 'R$ 7.900',
    duration: '2 dias de gravação',
    delivery: '10 dias úteis',
    formats: '16:9 · 9:16',
    forWho: 'Empresa que precisa se apresentar a clientes e investidores',
    still: 'arch',
    deliverables: ['Roteiro e entrevistas com a equipe', 'Vídeo de 2–3 min 16:9', '4 cortes verticais', 'Imagens de drone e tratamento de cor'],
  },
];

export const FAQ = [
  {
    q: 'Você só faz reels?',
    short: 'Não. Toda captação também sai em 16:9, 4:5 e 1:1.',
    a: 'Reels são a maior parte do trabalho, mas cada captação também rende versões 16:9, 1:1 e 4:5. Os outros formatos saem da mesma gravação, sem custo de um novo dia de gravação.',
  },
  {
    q: 'Quanto tempo leva para receber os vídeos?',
    short: 'Reels em até 48h. Vídeos maiores em 5 a 10 dias úteis.',
    a: 'Reels ficam prontos em até 48h depois da captação. Vídeos horizontais e institucionais levam de 5 a 10 dias úteis, conforme o tamanho.',
  },
  {
    q: 'Preciso ter roteiro pronto?',
    short: 'Não. Eu escrevo o roteiro e você aprova antes de gravar.',
    a: 'Não. Na primeira conversa entendo o objetivo e chego na gravação com roteiro e lista de planos. Você aprova antes.',
  },
  {
    q: 'Quantas alterações estão incluídas?',
    short: 'De 1 a 2 rodadas por vídeo, conforme o plano.',
    a: 'Cada plano define as rodadas de ajuste por vídeo. Ajustes de texto, corte e trilha entram nessas rodadas; uma nova captação é orçada à parte.',
  },
  {
    q: 'Você atende fora de Recife?',
    short: 'Sim. O deslocamento entra no orçamento.',
    a: 'Sim. Para captações fora da região metropolitana, deslocamento e hospedagem entram no orçamento. A edição é feita de forma remota.',
  },
  {
    q: 'Posso cancelar um plano mensal?',
    short: 'Sim. Os planos não têm fidelidade.',
    a: 'Os planos não têm fidelidade. O cancelamento vale a partir do mês seguinte, e o material já captado é entregue.',
  },
];

export const INTERESTS = ['Plano mensal', 'Pacote de projeto', 'Projeto avulso', 'Ainda não sei'];

// Depoimentos de demonstração. Completam a seção de depoimentos enquanto houver
// menos de 6 projetos com depoimento cadastrado na área do dono. Substitua ou apague.
export const EXTRA_TESTIMONIALS = [
  {
    quote: 'Eu travava na frente da câmera. Ele dirigiu cada fala e no fim parecia uma conversa.',
    author: 'Marina Teles',
    role: 'Nutricionista',
    metric: '+1,8 mil',
    label: 'seguidores em dois meses',
  },
  {
    quote: 'Os vídeos trouxeram cliente novo toda semana. Ninguém mais pergunta onde fica a barbearia.',
    author: 'Bruno Sales',
    role: 'Dono, Barbearia Navalha',
  },
  {
    quote: 'Ele entende o que a gente pode e não pode mostrar. Gravou sem atrapalhar nenhum atendimento.',
    author: 'Paula Rezende',
    role: 'Marketing, Clínica Vértice',
    metric: '+64',
    label: 'agendamentos pelo Instagram',
  },
  {
    quote: 'A coleção vendeu pelo vídeo. O corte acompanha a música do jeito que eu tinha imaginado.',
    author: 'Tiago Moreira',
    role: 'Fundador, Ateliê Brisa',
  },
];
