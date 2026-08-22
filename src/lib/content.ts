export interface Study {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  intro: string;
  verses: { ref: string; link: string; text: string }[];
  explanation: string[];
  conclusion: string;
  questions: string[];
}

export interface Devotional {
  slug: string;
  title: string;
  verseRef: string;
  verseLink: string;
  verseText: string;
  reflection: string;
  application: string;
  prayer: string;
}

export interface Prayer {
  slug: string;
  category: string;
  title: string;
  text: string;
}

export const STUDY_CATEGORIES = [
  { slug: "fe", name: "Fé" },
  { slug: "amor", name: "Amor" },
  { slug: "familia", name: "Família" },
  { slug: "oracao", name: "Oração" },
  { slug: "perdao", name: "Perdão" },
  { slug: "esperanca", name: "Esperança" },
  { slug: "ansiedade", name: "Ansiedade" },
  { slug: "sabedoria", name: "Sabedoria" },
  { slug: "jesus", name: "Jesus" },
  { slug: "espirito-santo", name: "Espírito Santo" },
  { slug: "salvacao", name: "Salvação" },
  { slug: "vida-crista", name: "Vida cristã" },
];

export const STUDIES: Study[] = [
  {
    slug: "o-que-e-fe-segundo-a-biblia",
    category: "Fé",
    categorySlug: "fe",
    title: "O que é fé segundo a Bíblia?",
    excerpt: "Um estudo simples e prático sobre o significado bíblico da fé e como ela se manifesta na vida diária.",
    intro:
      "A palavra fé aparece centenas de vezes nas Escrituras, mas nem sempre com o sentido que damos a ela hoje. Na Bíblia, fé é muito mais do que otimismo: é confiança concreta em Deus e na sua palavra, que se expressa em atitudes.",
    verses: [
      { ref: "Hebreus 11:1", link: "/biblia/hebreus/11", text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não vêem." },
      { ref: "Romanos 10:17", link: "/biblia/romanos/10", text: "De sorte que a fé vem pelo ouvir, e o ouvir pela palavra de Deus." },
      { ref: "Tiago 2:17", link: "/biblia/tiago/2", text: "Assim também a fé, se não tiver as obras, é morta em si mesma." },
    ],
    explanation: [
      "Hebreus 11:1 apresenta a fé como fundamento e prova. Ou seja, ela sustenta a esperança e dá substância ao que ainda não vemos. Não é um salto no escuro, mas confiança apoiada no caráter de Deus.",
      "Romanos 10:17 mostra a origem da fé: ela nasce do contato com a Palavra. Por isso, a leitura bíblica regular não é apenas um hábito religioso, é o solo onde a fé cresce.",
      "Tiago complementa o quadro: uma fé genuína produz frutos visíveis. Ela transforma decisões, relacionamentos e prioridades.",
    ],
    conclusion:
      "Fé bíblica é confiar em Deus a ponto de agir de acordo com o que Ele diz. Ela se alimenta da Palavra, se fortalece na oração e se comprova na prática.",
    questions: [
      "Em que área da sua vida você tem dificuldade de confiar em Deus?",
      "Quanto tempo você tem dedicado à leitura das Escrituras?",
      "Que atitude concreta demonstraria fé em sua situação atual?",
    ],
  },
  {
    slug: "versiculos-para-momentos-dificeis",
    category: "Esperança",
    categorySlug: "esperanca",
    title: "Versículos para momentos difíceis",
    excerpt: "Passagens bíblicas que consolam e fortalecem quando a vida pesa, com breve explicação de cada uma.",
    intro:
      "Todos passam por temporadas difíceis. A Bíblia não ignora a dor: ela fala dela com honestidade e aponta para o Deus que sustenta.",
    verses: [
      { ref: "Salmos 34:18", link: "/biblia/salmos/34", text: "Perto está o Senhor dos que têm o coração quebrantado, e salva os contritos de espírito." },
      { ref: "Isaías 41:10", link: "/biblia/isaias/41", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus." },
      { ref: "Mateus 11:28", link: "/biblia/mateus/11", text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." },
    ],
    explanation: [
      "O Salmo 34 lembra que a proximidade de Deus é maior justamente quando o coração está quebrantado. A dor não afasta Deus, ela é o lugar onde Ele se aproxima.",
      "Isaías 41:10 foi escrito a um povo em exílio. O fundamento da coragem não é a mudança das circunstâncias, mas a presença de Deus.",
      "O convite de Jesus em Mateus 11 é pessoal e concreto: levar o cansaço a Ele, em oração, sem disfarces.",
    ],
    conclusion:
      "Nos momentos difíceis, a Escritura não promete ausência de sofrimento, mas presença constante. Guarde esses versículos e volte a eles quando precisar.",
    questions: [
      "Qual desses versículos fala mais diretamente ao seu momento?",
      "A quem você pode oferecer consolo hoje?",
      "O que impede você de levar seu cansaço a Deus?",
    ],
  },
  {
    slug: "como-vencer-a-ansiedade-com-a-palavra",
    category: "Ansiedade",
    categorySlug: "ansiedade",
    title: "Como lidar com a ansiedade à luz da Bíblia",
    excerpt: "O que as Escrituras ensinam sobre preocupação, cuidado de Deus e paz interior.",
    intro:
      "A ansiedade é uma experiência humana comum, e a Bíblia fala dela com compaixão. Este estudo não substitui acompanhamento profissional quando necessário, mas oferece orientação espiritual.",
    verses: [
      { ref: "Filipenses 4:6-7", link: "/biblia/filipenses/4", text: "Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus." },
      { ref: "1 Pedro 5:7", link: "/biblia/1-pedro/5", text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós." },
      { ref: "Mateus 6:34", link: "/biblia/mateus/6", text: "Não vos inquieteis, pois, pelo dia de amanhã." },
    ],
    explanation: [
      "Paulo não manda simplesmente 'não se preocupe'. Ele indica um caminho: transformar a preocupação em oração concreta, com gratidão.",
      "Pedro usa a imagem de lançar um peso. Reconhecer que não somos autossuficientes é um alívio, não uma derrota.",
      "Jesus aponta para o presente: a graça de Deus é dada dia a dia, não em estoque para o futuro imaginado.",
    ],
    conclusion:
      "A paz bíblica não é a ausência de problemas, mas a presença de Deus guardando o coração. Busque ajuda quando precisar e mantenha a oração como hábito diário.",
    questions: [
      "Quais preocupações você ainda não transformou em oração?",
      "Que hábitos alimentam sua ansiedade?",
      "Com quem você pode compartilhar o que está sentindo?",
    ],
  },
  {
    slug: "como-comecar-a-ler-a-biblia",
    category: "Vida cristã",
    categorySlug: "vida-crista",
    title: "Como começar a ler a Bíblia?",
    excerpt: "Um roteiro prático para quem quer começar a leitura bíblica e manter o hábito.",
    intro:
      "Muita gente desiste de ler a Bíblia por começar em Levítico. Com um roteiro simples, a leitura se torna prazerosa e compreensível.",
    verses: [
      { ref: "Salmos 119:105", link: "/biblia/salmos/119", text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." },
      { ref: "Josué 1:8", link: "/biblia/josue/1", text: "Não se aparte da tua boca o livro desta lei; antes medita nele dia e noite." },
    ],
    explanation: [
      "Comece por um Evangelho, preferencialmente Marcos ou João. Eles apresentam Jesus de forma direta.",
      "Depois leia Atos, para entender o nascimento da Igreja, e em seguida uma carta curta como Filipenses.",
      "Reserve um horário fixo, mesmo que sejam 10 minutos. Constância vale mais que volume.",
      "Anote dúvidas e versículos marcantes. Use os favoritos e as anotações do leitor para registrar sua caminhada.",
    ],
    conclusion:
      "Ler a Bíblia é um caminho, não uma prova. Comece pequeno, seja constante e permita que a leitura vire conversa com Deus.",
    questions: [
      "Qual horário do seu dia pode ser reservado para a leitura?",
      "Por qual livro você vai começar?",
      "Como você vai registrar o que aprender?",
    ],
  },
  {
    slug: "o-que-significa-joao-3-16",
    category: "Jesus",
    categorySlug: "jesus",
    title: "O que significa João 3:16?",
    excerpt: "Uma leitura cuidadosa do versículo mais conhecido da Bíblia, com seu contexto.",
    intro:
      "João 3:16 costuma ser citado isoladamente, mas ganha profundidade quando lido dentro da conversa de Jesus com Nicodemos.",
    verses: [
      { ref: "João 3:16", link: "/biblia/joao/3", text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." },
      { ref: "João 3:17", link: "/biblia/joao/3", text: "Porque Deus enviou o seu Filho ao mundo, não para que julgasse o mundo, mas para que o mundo fosse salvo por ele." },
    ],
    explanation: [
      "O contexto é noturno: Nicodemos, mestre em Israel, procura Jesus para entender o novo nascimento.",
      "'De tal maneira' descreve o modo do amor de Deus, e não apenas a intensidade: Ele amou dando.",
      "'Todo aquele que nele crê' amplia o alcance: a promessa não é restrita a um povo, mas oferecida a todos.",
      "O versículo 17 esclarece a intenção: o envio do Filho tem propósito salvador.",
    ],
    conclusion:
      "João 3:16 resume o evangelho: amor de Deus, entrega do Filho, fé como resposta e vida eterna como dom.",
    questions: [
      "O que muda ao ler João 3:16 dentro do capítulo inteiro?",
      "Como você explicaria esse versículo a alguém que nunca leu a Bíblia?",
    ],
  },
  {
    slug: "salmo-23-significado-e-reflexao",
    category: "Esperança",
    categorySlug: "esperanca",
    title: "Salmo 23: significado e reflexão",
    excerpt: "Verso a verso, o que o salmo do Bom Pastor ensina sobre cuidado, provisão e confiança.",
    intro:
      "O Salmo 23 é provavelmente o texto mais amado do Antigo Testamento. Escrito por Davi, ele usa a imagem do pastor para descrever o cuidado de Deus.",
    verses: [
      { ref: "Salmos 23:1", link: "/biblia/salmos/23", text: "O Senhor é o meu pastor; nada me faltará." },
      { ref: "Salmos 23:4", link: "/biblia/salmos/23", text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo." },
    ],
    explanation: [
      "Davi conhecia por experiência o trabalho do pastor: proteger, guiar, alimentar e buscar o que se perde.",
      "'Nada me faltará' não é promessa de riqueza, mas de suficiência sob o cuidado de Deus.",
      "O vale não é evitado, é atravessado. A confiança vem da companhia: 'tu estás comigo'.",
    ],
    conclusion:
      "O Salmo 23 convida à confiança serena. Deus não promete estradas sem vales, mas garante que caminha conosco por eles.",
    questions: [
      "Qual 'vale' você está atravessando agora?",
      "Onde você tem buscado segurança fora de Deus?",
    ],
  },
];

export const DEVOTIONALS: Devotional[] = [
  {
    slug: "comece-o-dia-com-gratidao",
    title: "Comece o dia com gratidão",
    verseRef: "Salmos 118:24",
    verseLink: "/biblia/salmos/118",
    verseText: "Este é o dia que fez o Senhor; regozijemo-nos, e alegremo-nos nele.",
    reflection:
      "A gratidão muda a lente pela qual enxergamos o dia. Antes de listar problemas, o salmista reconhece a origem do dia: ele foi feito por Deus. Isso não elimina as dificuldades, mas coloca cada uma delas dentro de um contexto maior.",
    application:
      "Antes de pegar o celular, escreva três motivos de gratidão. Repita esse exercício por sete dias e observe a diferença na sua disposição.",
    prayer:
      "Senhor, obrigado por mais um dia. Ensina-me a reconhecer as tuas bênçãos, mesmo nas coisas simples, e a viver hoje com alegria e propósito. Amém.",
  },
  {
    slug: "quando-a-resposta-demora",
    title: "Quando a resposta demora",
    verseRef: "Salmos 27:14",
    verseLink: "/biblia/salmos/27",
    verseText: "Espera no Senhor, anima-te, e ele fortalecerá o teu coração; espera, pois, no Senhor.",
    reflection:
      "Esperar é uma das partes mais difíceis da fé. O salmista repete o chamado duas vezes, como quem sabe que precisamos ouvir de novo. A espera bíblica é ativa: envolve confiança, oração e continuar fazendo o que é certo.",
    application:
      "Identifique uma oração que ainda não foi respondida. Em vez de desistir, escreva-a e continue apresentando a Deus por 30 dias.",
    prayer:
      "Pai, fortalece meu coração enquanto espero. Ajuda-me a confiar no teu tempo e a não desanimar. Amém.",
  },
  {
    slug: "o-descanso-que-jesus-oferece",
    title: "O descanso que Jesus oferece",
    verseRef: "Mateus 11:28",
    verseLink: "/biblia/mateus/11",
    verseText: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    reflection:
      "Jesus não convida os fortes, mas os cansados. O descanso que Ele oferece não é ausência de trabalho, e sim alívio interior de quem não precisa mais provar valor.",
    application:
      "Reserve 15 minutos hoje sem telas, apenas para orar e entregar a Deus aquilo que está pesando.",
    prayer:
      "Jesus, venho a ti com meu cansaço. Dá-me o teu descanso e ensina-me a caminhar contigo. Amém.",
  },
];

export const PRAYERS: Prayer[] = [
  {
    slug: "oracao-da-manha",
    category: "Oração da manhã",
    title: "Oração da manhã",
    text: "Senhor, obrigado por este novo dia. Antes que eu comece minhas tarefas, entrego a ti meus pensamentos, minhas palavras e minhas decisões. Guia meus passos, dá-me sabedoria nas escolhas e paciência nas dificuldades. Que eu seja instrumento de paz onde eu estiver. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-da-noite",
    category: "Oração da noite",
    title: "Oração da noite",
    text: "Pai, agradeço por tudo o que vivi hoje. Perdoa minhas falhas, cura o que ficou ferido e aquieta o meu coração. Entrego a ti as preocupações que eu não consigo resolver. Concede-me um sono tranquilo e renova minhas forças para amanhã. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-pela-familia",
    category: "Oração pela família",
    title: "Oração pela família",
    text: "Senhor, abençoa minha família. Que haja amor onde há desgaste, diálogo onde há silêncio e perdão onde há mágoa. Protege cada um dos meus, sustenta nossa casa e ensina-nos a cuidar uns dos outros com paciência. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-por-protecao",
    category: "Oração por proteção",
    title: "Oração por proteção",
    text: "Deus, tu és meu refúgio e minha fortaleza. Guarda-me em meus caminhos, livra-me do mal e dá-me discernimento diante do perigo. Que eu descanse na certeza do teu cuidado, sem medo. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-por-saude",
    category: "Oração por saúde",
    title: "Oração por saúde",
    text: "Senhor, tu conheces meu corpo e minha alma. Peço saúde, restauração e ânimo. Abençoa os profissionais que cuidam de mim e dá-me paciência durante o tratamento. Que a tua paz sustente meu coração em cada etapa. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-pelo-trabalho",
    category: "Oração por trabalho",
    title: "Oração pelo trabalho",
    text: "Pai, entrego a ti minha vida profissional. Abre portas de oportunidade, dá-me dedicação e integridade no que faço e provisão para as minhas necessidades. Ajuda-me a trabalhar com excelência e a confiar em ti nos períodos de espera. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-por-paz",
    category: "Oração por paz",
    title: "Oração por paz",
    text: "Senhor, acalma o que está agitado dentro de mim. Onde há ansiedade, traz serenidade; onde há conflito, traz reconciliação. Que a tua paz guarde meu coração e minha mente. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-de-agradecimento",
    category: "Oração de agradecimento",
    title: "Oração de agradecimento",
    text: "Deus, obrigado pela vida, pelas pessoas que me cercam e pelas bênçãos que muitas vezes passam despercebidas. Ensina-me a viver em gratidão, reconhecendo tua bondade em cada detalhe. Em nome de Jesus, amém.",
  },
];

export const getStudy = (slug: string) => STUDIES.find((s) => s.slug === slug);
export const getDevotional = (slug: string) => DEVOTIONALS.find((d) => d.slug === slug);
