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
  categorySlug: string;
  title: string;
  intro: string;
  text: string;
  verses: { ref: string; link: string; text: string }[];
  reflection: string;
  application: string;
  relatedStudySlug?: string;
  relatedDevotionalSlug?: string;
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
  {
    slug: "o-poder-do-perdao-segundo-jesus",
    category: "Perdão",
    categorySlug: "perdao",
    title: "O poder do perdão segundo os ensinamentos de Jesus",
    excerpt: "Compreenda por que perdoar não é esquecer passivamente, mas uma decisão libertadora de soltar a dívida.",
    intro:
      "O perdão está no centro do evangelho. Longe de ser fraqueza ou conivência com o erro alheio, perdoar é um ato de coragem espiritual que quebra ciclos de amargura e restaura a comunhão com Deus.",
    verses: [
      { ref: "Mateus 18:21-22", link: "/biblia/mateus/18", text: "Senhor, até quantas vezes pecará meu irmão contra mim, e eu lhe perdoarei? Até sete? Jesus lhe disse: Não te digo que até sete; mas, até setenta vezes sete." },
      { ref: "Colossenses 3:13", link: "/biblia/colossenses/3", text: "Suportando-vos uns aos outros, e perdoando-vos uns aos outros... assim como Cristo vos perdoou, assim fazei vós também." },
      { ref: "Efésios 4:31-32", link: "/biblia/efesios/4", text: "Toda a amargura, e ira, e cólera, e gritaria, e blasfêmia e toda a malícia sejam tiradas dentre vós... sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros." },
    ],
    explanation: [
      "Jesus responde a Pedro com 'setenta vezes sete', uma expressão idiomática que significa perdão ilimitado. Perdoar não é contar pontos, mas adotar uma postura permanente do coração.",
      "Paulo em Colossenses estabelece o critério divino: perdoamos não pelo merecimento de quem nos feriu, mas porque nós mesmos fomos imensamente perdoados por Cristo na cruz.",
      "A falta de perdão é descrita como veneno interior. Em Efésios, o apóstolo mostra que amargura e ira sufocam o Espírito, enquanto o perdão gera cura e paz nas relações.",
    ],
    conclusion:
      "Perdoar não significa concordar com a injustiça ou manter relacionamentos tóxicos sem limites, mas soltar o direito de vingança nas mãos de Deus, permitindo que o próprio coração seja curado.",
    questions: [
      "Existe alguma mágoa antiga que você ainda carrega em silêncio?",
      "Como lembrar do perdão que você recebeu de Deus ajuda a perdoar os outros?",
      "Que atitude concreta você pode tomar hoje para dar início a essa libertação?",
    ],
  },
  {
    slug: "a-armadura-de-deus-efesios-6",
    category: "Vida cristã",
    categorySlug: "vida-crista",
    title: "A armadura de Deus: significado e aplicação prática",
    excerpt: "Como vestir diariamente a armadura espiritual descrita pelo apóstolo Paulo em Efésios 6.",
    intro:
      "Nos versículos finais da carta aos Efésios, Paulo faz uma analogia com os soldados romanos para ensinar como os cristãos podem resistir firmes às pressões espirituais e morais do dia a dia.",
    verses: [
      { ref: "Efésios 6:11", link: "/biblia/efesios/6", text: "Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo." },
      { ref: "Efésios 6:14-15", link: "/biblia/efesios/6", text: "Estai, pois, firmes, tendo cingidos os vossos lombos com a verdade, e vestida a couraça da justiça; e calçados os pés na preparação do evangelho da paz." },
      { ref: "Efésios 6:16-17", link: "/biblia/efesios/6", text: "Tomando sobretudo o escudo da fé, com o qual podereis apagar todos os dardos inflamados do maligno. Tomai também o capacete da salvação, e a espada do Espírito, que é a palavra de Deus." },
    ],
    explanation: [
      "O cinto da verdade e a couraça da justiça representam integridade moral e a certeza de que somos justificados por Deus, não pelos nossos próprios méritos.",
      "O calçado do evangelho da paz traz estabilidade: quem anda em paz com Deus não é facilmente abalado pelas incertezas do caminho.",
      "O escudo da fé e o capacete da salvação protegem as duas áreas mais atacadas: a mente (dúvidas e acusações) e as emoções (medo e desespero).",
      "A espada do Espírito é a única arma ofensiva: o conhecimento vivo da Palavra de Deus, que desmascara as mentiras e nos orienta nas decisões.",
    ],
    conclusion:
      "A armadura de Deus não é um ritual místico, mas um estilo de vida consciente, alimentado pela oração constante e pela vivência diária da verdade bíblica.",
    questions: [
      "Qual peça da armadura espiritual você mais precisa reforçar no seu momento atual?",
      "De que maneira a leitura da Palavra atua como defesa nos seus momentos de tentação?",
    ],
  },
  {
    slug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    category: "Sabedoria",
    categorySlug: "sabedoria",
    title: "Sabedoria bíblica para trabalho, finanças e relacionamentos",
    excerpt: "Conselhos milenares de Provérbios sobre prudência, integridade e convivência no mundo moderno.",
    intro:
      "O livro de Provérbios não é um manual de regras rígidas, mas uma coleção de princípios observados na vida real sobre a diferença entre a tolice e o viver sensato diante de Deus.",
    verses: [
      { ref: "Provérbios 3:5-6", link: "/biblia/proverbios/3", text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
      { ref: "Provérbios 16:3", link: "/biblia/proverbios/16", text: "Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos." },
      { ref: "Provérbios 4:23", link: "/biblia/proverbios/4", text: "Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as fontes da vida." },
    ],
    explanation: [
      "A verdadeira sabedoria começa na humildade: reconhecer que nosso conhecimento é limitado e que Deus enxerga o panorama completo de nossas decisões.",
      "No trabalho e projetos, Provérbios valoriza o planejamento diligente, a honestidade nos negócios e a recusa do ganho fácil ou antiético.",
      "Guardar o coração é vigiar o que permitimos entrar em nossos pensamentos, desejos e conversas, pois deles emanam todas as escolhas cotidianas.",
    ],
    conclusion:
      "Buscar a sabedoria divina transforma nossa rotina: nos poupa de conflitos desnecessários, protege nosso patrimônio moral e nos torna agentes de equilíbrio onde estivermos.",
    questions: [
      "Você costuma orar e buscar conselho antes de tomar decisões financeiras ou profissionais importantes?",
      "O que tem alimentado as fontes do seu coração nas últimas semanas?",
    ],
  },
  {
    slug: "o-fruto-do-espirito-santo",
    category: "Espírito Santo",
    categorySlug: "espirito-santo",
    title: "O fruto do Espírito Santo e o amadurecimento cristão",
    excerpt: "Descubra as nove virtudes geradas pelo Espírito Santo na vida de quem permanece em Cristo.",
    intro:
      "Em Gálatas 5, Paulo contrasta as obras egocêntricas da natureza humana com a transformação interior operada pelo Espírito Santo, descrita no singular como 'o fruto do Espírito'.",
    verses: [
      { ref: "Gálatas 5:22-23", link: "/biblia/galatas/5", text: "Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança. Contra estas coisas não há lei." },
      { ref: "João 15:5", link: "/biblia/joao/15", text: "Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer." },
    ],
    explanation: [
      "Note que o texto fala de 'fruto' no singular: não se trata de escolher uma ou duas virtudes isoladas, mas de uma personalidade equilibrada gerada pela habitação do Espírito.",
      "Amor, alegria e paz tratam da nossa relação íntima com Deus; paciência, amabilidade e bondade afetam nossa convivência social; fidelidade, mansidão e domínio próprio revelam nosso caráter pessoal.",
      "O fruto não é produzido por esforço mecânico da lei, mas pela conexão contínua com a videira que é Jesus Cristo.",
    ],
    conclusion:
      "O crescimento espiritual é gradual, como o desenvolvimento de uma árvore frutífera. A permanência diária na oração e na Palavra garante que o fruto do Espírito floresça em nós.",
    questions: [
      "Qual dessas virtudes tem sido mais desafiadora de manifestar em suas relações atuais?",
      "Como você pode cultivar uma ligação mais íntima com Cristo no seu dia a dia?",
    ],
  },
  {
    slug: "familia-e-casamento-segundo-a-biblia",
    category: "Família",
    categorySlug: "familia",
    title: "Princípios bíblicos para fortalecer o casamento e a família",
    excerpt: "Como cultivar diálogo, honra, respeito e perdão no ambiente familiar à luz da Palavra de Deus.",
    intro:
      "A família é a instituição básica criada por Deus para acolhimento, comunhão e aprendizado mútuo. As Escrituras oferecem orientações valiosas para proteger o lar em tempos de desgaste.",
    verses: [
      { ref: "Josué 24:15", link: "/biblia/josue/24", text: "Porém eu e a minha casa serviremos ao Senhor." },
      { ref: "Efésios 5:33", link: "/biblia/efesios/5", text: "Assim também vós, cada um em particular, ame a sua mulher como a si mesmo, e a mulher reverencie o marido." },
      { ref: "Colossenses 3:20-21", link: "/biblia/colossenses/3", text: "Vós, filhos, obedecei em tudo a vossos pais... Vós, pais, não irriteis a vossos filhos, para que não percam o ânimo." },
    ],
    explanation: [
      "A declaração de Josué enfatiza uma decisão de fé consciente e intencional que lidera pelo exemplo, estabelecendo a presença de Deus no centro da casa.",
      "Em Efésios e Colossenses, o padrão bíblico para o casamento é a doação recíproca e o respeito mútuo, refletindo o próprio amor sacrifical de Cristo pela igreja.",
      "A relação com os filhos exige equilíbrio: instrução sem aspereza e disciplina com afeto, evitando ferir a sensibilidade dos jovens.",
    ],
    conclusion:
      "Um lar sólido não é aquele onde nunca há conflitos, mas aquele onde o perdão é rápido, o diálogo é aberto e a graça de Deus restaura os corações a cada novo amanhecer.",
    questions: [
      "Que conversa sincera ou gesto de carinho você pode ter hoje com alguém da sua família?",
      "De que maneiras você pode tornar seu lar um ambiente mais pacífico e acolhedor?",
    ],
  },
  {
    slug: "como-orar-o-padrao-do-pai-nosso",
    category: "Oração",
    categorySlug: "oracao",
    title: "Como orar com sinceridade: o padrão da Oração do Pai Nosso",
    excerpt: "Aprenda com o modelo deixado por Jesus em Mateus 6 e transforme sua vida devocional.",
    intro:
      "Quando os discípulos pediram a Jesus 'ensina-nos a orar', o Mestre não lhes deu uma fórmula mágica para repetição vazia, mas um guia estruturado de intimidade e alinhamento com Deus.",
    verses: [
      { ref: "Mateus 6:9-10", link: "/biblia/mateus/6", text: "Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome; venha o teu reino, seja feita a tua vontade, assim na terra como no céu." },
      { ref: "Mateus 6:11-13", link: "/biblia/mateus/6", text: "O pão nosso de cada dia nos dá hoje; e perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores; e não nos induzas à tentação; mas livra-nos do mal." },
    ],
    explanation: [
      "A oração começa pela adoração: 'Pai nosso' nos lembra da filiação e da paternidade amorosa de Deus, enquanto 'santificado seja o teu nome' estabelece reverência.",
      "Alinhamento de prioridades: antes de pedir nossas necessidades diárias, pedimos que a vontade de Deus prevaleça sobre nossos desejos particulares.",
      "Dependência diária: o 'pão nosso' ensina a confiar na provisão cotidiana, sem acumular ansiedade desmedida com o amanhã.",
      "Restauração espiritual: o pedido de perdão anda de mãos dadas com a nossa disposição de perdoar os que nos ofenderam, seguido da busca por proteção moral e livramento do mal.",
    ],
    conclusion:
      "Orar como Jesus ensinou é conversar com um Pai que já sabe do que precisamos, aproximando-nos com franqueza, humildade e confiança na Sua infinita bondade.",
    questions: [
      "Suas orações têm começado pela adoração ou diretamente pela lista de pedidos?",
      "Como o modelo do Pai Nosso pode enriquecer o seu momento devocional de amanhã?",
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
  {
    slug: "renovo-nas-tribulacoes",
    title: "Renovo para os cansados",
    verseRef: "Isaías 40:31",
    verseLink: "/biblia/isaias/40",
    verseText: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.",
    reflection:
      "O cansaço físico e mental faz parte da jornada humana. O profeta Isaías lembra que nossa energia biológica se esgota, mas o Deus eterno não se cansa nem se fatiga. Esperar no Senhor significa trocar nossa fraqueza pela força inesgotável Dele.",
    application:
      "Faça uma pausa consciente durante o dia. Respire fundo, feche os olhos e entregue suas tensões a Deus antes de retomar suas atividades.",
    prayer:
      "Deus poderoso, sinto minhas forças minguarem diante das exigências do dia. Renova meu ânimo, sustenta meus passos e dá-me a leveza de quem confia na tua providência. Amém.",
  },
  {
    slug: "a-paz-que-excede-todo-entendimento",
    title: "A paz que guarda a sua mente",
    verseRef: "Filipenses 4:7",
    verseLink: "/biblia/filipenses/4",
    verseText: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
    reflection:
      "A paz que o mundo oferece depende de circunstâncias favoráveis (tudo dar certo, as contas estarem pagas, a saúde estar perfeita). A paz de Deus é diferente: ela opera em meio à tempestade, atuando como uma sentinela que protege o coração e a mente contra o desespero.",
    application:
      "Sempre que um pensamento ansioso tentar dominar sua mente hoje, substitua-o repetindo este versículo em oração.",
    prayer:
      "Senhor Jesus, envolve meus pensamentos com a tua paz que transcende a lógica humana. Que nenhuma tempestade exterior roube a serenidade que vem da tua presença. Amém.",
  },
  {
    slug: "deus-e-nosso-refugio",
    title: "Refúgio seguro em dias incertos",
    verseRef: "Salmos 46:1",
    verseLink: "/biblia/salmos/46",
    verseText: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.",
    reflection:
      "Refúgio é o lugar para onde corremos quando não temos como nos defender sozinhos. O salmista declara que Deus não é um socorro distante ou demorado, mas 'bem presente' — disponível exatamente no instante em que a aflição aperta.",
    application:
      "Compartilhe uma palavra de encorajamento ou este versículo com alguém que esteja passando por um momento de incerteza hoje.",
    prayer:
      "Pai celestial, tu és meu abrigo seguro. Quando o chão parecer tremer, lembra-me de que a minha vida está guardada em tuas mãos poderosas. Amém.",
  },
  {
    slug: "amados-com-amor-eterno",
    title: "O amor que nunca desiste de você",
    verseRef: "Jeremias 31:3",
    verseLink: "/biblia/jeremias/31",
    verseText: "Com amor eterno te amei; por isso com benignidade te atraí.",
    reflection:
      "Muitas vezes medimos o amor de Deus pelo nosso próprio desempenho, sentindo culpa e inadequação. No entanto, Deus declara que Seu amor não é temporário nem condicionado às nossas perfeições: é eterno, constante e paciente.",
    application:
      "Permita-se receber o perdão e o acolhimento de Deus hoje, abandonando pensamentos de condenação e auto-rejeição.",
    prayer:
      "Senhor, obrigado pelo teu amor incondicional que me acolhe e me transforma. Que eu encontre meu verdadeiro valor naquilo que tu dizes sobre mim. Amém.",
  },
  {
    slug: "confianca-no-amanha",
    title: "Entregando o amanhã nas mãos certas",
    verseRef: "Provérbios 3:5-6",
    verseLink: "/biblia/proverbios/3",
    verseText: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
    reflection:
      "O ser humano tem necessidade inata de controlar o futuro, o que gera desgaste e ansiedade. Confiar em Deus não é negligência, mas reconhecer que os caminhos Dele são mais altos e seguros do que as nossas próprias previsões limitadas.",
    application:
      "Escreva um objetivo ou decisão importante e apresente-o a Deus em oração, pedindo sabedoria e alinhamento com a Sua vontade.",
    prayer:
      "Senhor, renuncio à ilusão do controle absoluto sobre o amanhã. Entrego meus projetos, minha família e meu futuro aos teus cuidados perfeitos. Amém.",
  },
];

export const PRAYERS: Prayer[] = [
  {
    slug: "oracao-da-manha",
    category: "Oração da manhã",
    categorySlug: "oracao-da-manha",
    title: "Oração da manhã para começar o dia em paz",
    intro:
      "Iniciar as primeiras horas do dia na presença do Criador consagra os nossos pensamentos, traz clareza para as tomadas de decisão e renova a nossa paciência diante de qualquer imprevisto que surja ao longo da jornada.",
    text:
      "Senhor Deus e Pai celestial, obrigado pelo dom sagrado de mais este dia. Antes de atender às exigências da rotina e aos ruídos do mundo, consagro a ti os meus pensamentos, as palavras da minha boca e as atitudes do meu coração. Dá-me discernimento nas escolhas, prudência no falar e serenidade no agir. Guarda os meus passos onde quer que eu vá e faze-me instrumento do teu amor e da tua paz junto a todos os que cruzarem o meu caminho. Em nome de Jesus, amém.",
    verses: [
      { ref: "Salmos 5:3", link: "/biblia/salmos/5", text: "Pela manhã ouvirás a minha voz, ó Senhor; pela manhã me apresentarei a ti, e vigiarei." },
      { ref: "Lamentações 3:22-23", link: "/biblia/lamentacoes/3", text: "As misericórdias do Senhor são a causa de não sermos consumidos... renovam-se cada manhã; grande é a tua fidelidade." },
    ],
    reflection:
      "Entregar as primícias da manhã a Deus não é mero ritual, mas uma atitude prática de reconhecimento de que nada de duradouro se constrói sem a Sua graça e direção.",
    application:
      "Evite olhar notificações e redes sociais nos primeiros minutos do dia; faça desta oração seu ponto de partida para cultivar calma interior.",
    relatedStudySlug: "como-orar-o-padrao-do-pai-nosso",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    slug: "oracao-da-noite",
    category: "Oração da noite",
    categorySlug: "oracao-da-noite",
    title: "Oração da noite e encerramento do dia",
    intro:
      "Ao entardecer, quando a agitação cessa, é hora de fazer uma pausa reflexiva para expressar gratidão pelas vitórias, perdoar desentendimentos e soltar as pendências nas mãos de quem sustenta o universo.",
    text:
      "Pai eterno, chego ao término de mais um dia com o coração grato por tua provisão e companhia constante. Perdoa as faltas que cometi em pensamentos, palavras ou omissões. Cura qualquer mágoa acumulada e dissipa as preocupações que tentam inquietar minha mente. Entrego em tuas mãos os problemas que não posso resolver agora, confiando que o Senhor trabalha enquanto eu descanso. Renova minhas energias e concede-me uma noite abençoada. Em nome de Jesus, amém.",
    verses: [
      { ref: "Salmos 4:8", link: "/biblia/salmos/4", text: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança." },
      { ref: "Salmos 121:4", link: "/biblia/salmos/121", text: "Eis que não tosquenejará nem dormirá o guarda de Israel." },
    ],
    reflection:
      "Dormir em paz é um ato de fé: significa admitir com humildade que somos limitados e que Deus não cessa de zelar por nós enquanto repousamos.",
    application:
      "Faça um breve balanço do seu dia, perdoe mentalmente quem o aborreceu e desligue aparelhos eletrônicos antes de orar.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "a-paz-que-excede-todo-entendimento",
  },
  {
    slug: "oracao-antes-de-dormir",
    category: "Oração antes de dormir",
    categorySlug: "oracao-antes-de-dormir",
    title: "Oração antes de dormir para acalmar a mente e ter sono tranquilo",
    intro:
      "A insônia e o excesso de pensamentos noturnos muitas vezes decorrem do acúmulo de tensões do cotidiano. Esta oração ajuda a relaxar a mente e repousar na fidelidade protetora de Deus.",
    text:
      "Senhor Jesus, coloco-me sob o teu abrigo protetor neste momento de recolhimento. Desligo minha mente dos ruídos, das cobranças e das ansiedades do dia. Que a tua paz, que excede todo o entendimento humano, monte guarda ao redor do meu coração e dos meus pensamentos. Afasta todo espírito de medo ou perturbação e concede-me um sono reparador e tranquilo. Entrego o meu amanhã aos teus cuidados perfeitos. Amém.",
    verses: [
      { ref: "Provérbios 3:24", link: "/biblia/proverbios/3", text: "Quando te deitares, não temerás; ao contrário, deitar-te-ás, e o teu sono será suave." },
      { ref: "Filipenses 4:7", link: "/biblia/filipenses/4", text: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus." },
    ],
    reflection:
      "A suavidade do sono prometida na Bíblia é consequência de uma consciência alinhada com a sabedoria e guardada pela paz divina.",
    application:
      "Respire lenta e profundamente enquanto recita mentalmente versículos de paz antes de fechar os olhos para o sono.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "a-paz-que-excede-todo-entendimento",
  },
  {
    slug: "oracao-pela-familia",
    category: "Oração pela família",
    categorySlug: "oracao-pela-familia",
    title: "Oração pela família, harmonia e união no lar",
    intro:
      "A família é a base da nossa vida emocional e espiritual. Orar pela casa convida a presença de Deus a sarar feridas de relacionamento, estabelecer diálogo respeitoso e cultivar amor perseverante.",
    text:
      "Deus gracioso e Pai da nossa família, estende tuas mãos protetoras sobre o nosso lar. Onde houver ruídos e desgaste, estabelece diálogo e tolerância; onde houver frieza, reacende o carinho; e onde houver ofensa, derrama a graça do perdão sincero. Protege cada membro da nossa casa de todo perigo visível e invisível. Que o nosso ambiente seja um refúgio de paz, honra mútua e edificação diária para todos nós. Em nome de Jesus, amém.",
    verses: [
      { ref: "Josué 24:15", link: "/biblia/josue/24", text: "Porém eu e a minha casa serviremos ao Senhor." },
      { ref: "Salmos 127:1", link: "/biblia/salmos/127", text: "Se o Senhor não edificar a casa, em vão trabalham os que a edificam." },
    ],
    reflection:
      "Um lar abençoado não é ausente de desentendimentos humanos, mas caracterizado pela velocidade do perdão e pelo compromisso com o bem-estar mútuo.",
    application:
      "Promova um momento de conversa amigável à mesa hoje, valorizando e ouvindo com atenção cada integrante da família.",
    relatedStudySlug: "familia-e-casamento-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    slug: "oracao-pelos-filhos",
    category: "Oração pelos filhos",
    categorySlug: "oracao-pelos-filhos",
    title: "Oração pelos filhos: proteção, sabedoria e futuro",
    intro:
      "Em um mundo repleto de pressões e apelos contraditórios, a oração contínua dos pais e responsáveis atua como um escudo espiritual que cerca os filhos com amor, sabedoria e integridade moral.",
    text:
      "Pai amado, trago diante do teu trono a vida dos meus filhos. Guarda o coração deles das armadilhas da falsidade, do desânimo e das más influências. Concede-lhes clareza moral para discernir o bem do mal, coragem para permanecerem fiéis aos teus princípios e amigos que somem virtudes ao caminho deles. Prospera a mente deles nos estudos e capacita-os para um futuro de propósito, dignidade e serviço ao próximo. Em nome de Jesus, amém.",
    verses: [
      { ref: "Provérbios 22:6", link: "/biblia/proverbios/22", text: "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele." },
      { ref: "Isaías 54:13", link: "/biblia/isaias/54", text: "E todos os teus filhos serão discípulos do Senhor; e a paz de teus filhos será abundante." },
    ],
    reflection:
      "Nosso maior legado aos filhos não é financeiro, mas o testemunho de um caráter íntegro e a cobertura espiritual da intercessão diária.",
    application:
      "Olhe nos olhos dos seus filhos hoje e expresse com clareza o quanto você os ama e acredita no propósito deles.",
    relatedStudySlug: "familia-e-casamento-segundo-a-biblia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    slug: "oracao-por-protecao",
    category: "Oração por proteção",
    categorySlug: "oracao-por-protecao",
    title: "Oração por proteção espiritual e livramento do mal",
    intro:
      "Reconhecer que somos frágeis e que Deus é a nossa muralha inexpugnável renova a nossa segurança e afasta a angústia paralisante gerada pelas ameaças do mundo.",
    text:
      "Senhor Deus Altíssimo, tu és meu esconderijo e minha fortaleza inabalável. Coloco minha vida, minha mente e minha família debaixo da sombra das tuas asas protetoras. Livra-nos dos laços ocultos, dos perigos das ruas, da violência e das intenções maliciosas. Envia teus anjos para nos guardarem em todos os nossos caminhos e reveste nossa alma com a armadura da fé e da verdade. Descansamos sob o teu amparo fiel. Em nome de Jesus, amém.",
    verses: [
      { ref: "Salmos 91:1-2", link: "/biblia/salmos/91", text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei." },
      { ref: "2 Tessalonicenses 3:3", link: "/biblia/2-tessalonicenses/3", text: "Mas fiel é o Senhor, que vos confortará, e guardará do maligno." },
    ],
    reflection:
      "A proteção bíblica não nos isenta de ventos fortes, mas nos ancora em rocha sólida para que não sejamos levados pelas tempestades.",
    application:
      "Quando sentir medo ou apreensão no trajeto diário, repita mentalmente o Salmo 91 com fé convicta na presença de Deus.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "deus-e-nosso-refugio",
  },
  {
    slug: "oracao-por-saude",
    category: "Oração por saúde",
    categorySlug: "oracao-por-saude",
    title: "Oração por saúde física, mental e restauração",
    intro:
      "O cuidado integral com o ser humano abrange corpo, mente e espírito. Esta oração busca o conforto de Deus, a sabedoria para os profissionais de saúde e a serenidade durante processos de recuperação.",
    text:
      "Deus da vida e da restauração, tu conheces cada célula do meu corpo e os recônditos mais íntimos da minha mente. Peço a tua graça sobre a minha saúde física e mental. Alivia as dores, fortalece minha imunidade e renova o meu ânimo diário. Ilumina os médicos e profissionais que cuidam de mim, dando-lhes sabedoria e precisão. Que a tua presença seja bálsamo consolador para a minha alma em cada etapa do tratamento. Em nome de Jesus, amém.",
    verses: [
      { ref: "Jeremias 17:14", link: "/biblia/jeremias/17", text: "Cura-me, Senhor, e sararei; salva-me, e serei salvo; porque tu és o meu louvor." },
      { ref: "3 João 1:2", link: "/biblia/3-joao/1", text: "Amado, desejo que te vá bem em todas as coisas, e que tenhas saúde, assim como bem vai a tua alma." },
    ],
    reflection:
      "A oração pela cura caminha de mãos dadas com o respeito à ciência médica e aos hábitos diários saudáveis, ambos instrumentos sob a providência divina.",
    application:
      "Pratique o autocuidado com disciplina hoje: beba água, alimente-se com equilíbrio e siga rigorosamente as orientações dos profissionais de saúde.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "o-descanso-que-jesus-oferece",
  },
  {
    slug: "oracao-pelo-trabalho",
    category: "Oração pelo trabalho",
    categorySlug: "oracao-pelo-trabalho",
    title: "Oração pelo trabalho, dedicação e provisão",
    intro:
      "O trabalho é uma forma nobre de honrar a Deus com nossos talentos e servir à comunidade. Esta prece consagra a rotina profissional, buscando ética, foco e sustento digno.",
    text:
      "Senhor Deus de provisão, consagro a ti o trabalho das minhas mãos e os esforços da minha mente. Capacita-me para realizar minhas tarefas com integridade, competência e paciência. Guarda-me de fofocas e disputas injustas no ambiente profissional e abre canais de cooperação sincera com meus colegas e superiores. Abençoa o fruto do meu esforço para que supra com dignidade as necessidades da minha casa e me permita abençoar quem precisa. Em nome de Jesus, amém.",
    verses: [
      { ref: "Salmos 90:17", link: "/biblia/salmos/90", text: "E seja sobre nós a formosura do Senhor nosso Deus, e confirma sobre nós a obra das nossas mãos." },
      { ref: "Colossenses 3:23", link: "/biblia/colossenses/3", text: "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens." },
    ],
    reflection:
      "Quando enxergamos nosso trabalho como serviço prestado ao próprio Senhor, até as obrigações mais corriqueiras adquirem dignidade e significado.",
    application:
      "Dedique-se a uma tarefa difícil hoje sem reclamar, encarando seu esforço com excelência e postura construtiva.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    slug: "oracao-por-portas-abertas",
    category: "Oração por portas abertas",
    categorySlug: "oracao-por-portas-abertas",
    title: "Oração por portas abertas e novas oportunidades",
    intro:
      "Quando caminhos parecem bloqueados e o horizonte incerto, orar por direção divina desperta nossa sensibilidade para enxergar novas possibilidades com discernimento e prudência.",
    text:
      "Soberano Senhor, diante de quem nenhuma porta justa permanece fechada, apresento meus anseios e projetos. Tu sabes onde estão as oportunidades certas para o meu crescimento e para a provisão da minha vida. Abre caminhos onde parece haver apenas muros, concede-me simpatia aos olhos das pessoas certas e fecha com firmeza as portas que me levariam a caminhos de tropeço. Concede-me coragem para agir na hora certa com humildade e retidão. Em nome de Jesus, amém.",
    verses: [
      { ref: "Apocalipse 3:8", link: "/biblia/apocalipse/3", text: "Conheço as tuas obras; eis que diante de ti pus uma porta aberta, e ninguém a pode fechar." },
      { ref: "1 Coríntios 16:9", link: "/biblia/1-corintios/16", text: "Porque uma porta grande e eficaz se me abriu; e há muitos adversários." },
    ],
    reflection:
      "Muitas vezes Deus fecha certas portas por amor e livramento, para que estejamos preparados quando a porta do Seu propósito real se abrir.",
    application:
      "Atualize seus dados profissionais ou projetos e envie com confiança aquele currículo ou proposta que você hesitou em apresentar.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
  {
    slug: "oracao-por-sabedoria",
    category: "Oração por sabedoria",
    categorySlug: "oracao-por-sabedoria",
    title: "Oração por sabedoria e discernimento nas decisões",
    intro:
      "Grandes encruzilhadas exigem mais do que raciocínio técnico: requerem a sabedoria que vem do alto, pura, pacífica, moderada e repleta de bons frutos.",
    text:
      "Deus de toda a sabedoria, reconheço a minha limitação e peço a tua luz para as escolhas que tenho diante de mim. Não permitas que eu me precipite pela emoção do momento nem que me paralise pelo medo do amanhã. Ilumina meu entendimento, concede-me clareza para distinguir o que é proveitoso do que é ilusório e cerca-me de bons conselhos. Que as minhas decisões tragam paz duradoura e honrem o teu nome. Em nome de Jesus, amém.",
    verses: [
      { ref: "Tiago 1:5", link: "/biblia/tiago/1", text: "E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada." },
      { ref: "Provérbios 3:5-6", link: "/biblia/proverbios/3", text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
    ],
    reflection:
      "A sabedoria bíblica se manifesta no equilíbrio moral, na justiça das atitudes e na humildade de quem ouve antes de julgar.",
    application:
      "Antes de responder a um e-mail decisivo ou fechar um acordo importante hoje, faça dez segundos de silêncio pedindo discernimento a Deus.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    slug: "oracao-em-momentos-dificeis",
    category: "Oração em momentos difíceis",
    categorySlug: "oracao-em-momentos-dificeis",
    title: "Oração em momentos difíceis para encontrar consolo e sustento",
    intro:
      "A dor e o luto não precisam ser vividos no silêncio da desesperança. Clamar a Deus nas noites escuras da alma é o primeiro passo para encontrar a paz que sustenta o coração.",
    text:
      "Senhor meu refúgio, venho a ti quando o coração pesa e as lágrimas brotam sem aviso. Tu vês as batalhas silenciosas que enfrento e conheces a dor que nem sempre consigo traduzir em palavras. Sustenta-me quando minhas forças fraquejarem. Não permitas que a amargura crie raízes em meu interior. Lembra-me de que nenhuma noite dura para sempre e que o teu socorro é presente e fiel na angústia. Segura minhas mãos e renova a minha esperança. Em nome de Jesus, amém.",
    verses: [
      { ref: "Salmos 34:18", link: "/biblia/salmos/34", text: "Perto está o Senhor dos que têm o coração quebrantado, e salva os contritos de espírito." },
      { ref: "Salmos 46:1", link: "/biblia/salmos/46", text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia." },
    ],
    reflection:
      "A proximidade de Deus se faz mais palpável nos momentos de dor. O choro compartilhado em oração torna-se o solo de uma maturidade espiritual profunda.",
    application:
      "Permita-se chorar diante de Deus sem vergonha, sabendo que Ele acolhe com ternura cada lágrima sincera.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "o-descanso-que-jesus-oferece",
  },
  {
    slug: "oracao-de-agradecimento",
    category: "Oração de agradecimento",
    categorySlug: "oracao-de-agradecimento",
    title: "Oração de agradecimento por todas as bênçãos recebidas",
    intro:
      "A gratidão expande a nossa capacidade de perceber o bem e nos liberta da constante insatisfação consumista, ensinando a reconhecer a mão bondosa de Deus no ordinário da vida.",
    text:
      "Deus bondoso e eterno, hoje não trago pedidos, mas um coração transbordante de gratidão. Obrigado pelo ar que respiro, pelo alimento em minha mesa, pelo teto que me abriga e pela saúde preservada. Agradeço pelas pessoas que me amam e pelas lições que aprendi nas dificuldades superadas. Ensina-me a manter um espírito permanentemente grato, capaz de louvar tanto nas vitórias quanto nos dias de espera. Em nome de Jesus, amém.",
    verses: [
      { ref: "1 Tessalonicenses 5:18", link: "/biblia/1-tessalonicenses/5", text: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." },
      { ref: "Salmos 103:2", link: "/biblia/salmos/103", text: "Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios." },
    ],
    reflection:
      "A gratidão bíblica não depende de condições perfeitas, mas da certeza inabalável de que o Senhor é bom em todo o tempo.",
    application:
      "Envie uma mensagem de sincero agradecimento a alguém que fez a diferença na sua vida e que você não costuma elogiar com frequência.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    slug: "oracao-de-fortalecimento",
    category: "Oração de fortalecimento",
    categorySlug: "oracao-de-fortalecimento",
    title: "Oração de fortalecimento espiritual contra o desânimo",
    intro:
      "O cansaço da batalha moral e as cobranças do dia a dia podem desgastar a nossa determinação. Esta prece busca o refrigério do Espírito Santo para reerguer os braços cansados.",
    text:
      "Senhor Todo-Poderoso, reconheço que as minhas forças humanas têm limites e que frequentemente me sinto esgotado pelas demandas do caminho. Rogo que o teu Santo Espírito derrame novo fôlego sobre minha alma. Reveste-me de ânimo, determinação e firmeza de caráter. Quando o desânimo sussurrar para eu desistir, recorda-me das tuas promessas eternas e da vitória que já nos foi garantida na cruz. Permaneço de pé pela tua força. Em nome de Jesus, amém.",
    verses: [
      { ref: "Isaías 40:29", link: "/biblia/isaias/40", text: "Dá força ao cansado, e multiplica as forças ao que não tem nenhum vigor." },
      { ref: "Efésios 6:10", link: "/biblia/efesios/6", text: "No demais, irmãos meus, fortalecei-vos no Senhor e na força do seu poder." },
    ],
    reflection:
      "A verdadeira fortaleza do cristão não reside na ausência de fraqueza, mas no abandono completo nos braços daquele cujo poder se aperfeiçoa na nossa fragilidade.",
    application:
      "Identifique o ponto exato que tem roubado sua energia e estabeleça limites saudáveis de descanso e oração.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "renovo-nas-tribulacoes",
  },
  {
    slug: "oracao-de-esperanca",
    category: "Oração de esperança",
    categorySlug: "oracao-de-esperanca",
    title: "Oração de esperança para renovar a confiança no futuro",
    intro:
      "A esperança bíblica não é mera expectativa vaga, mas uma âncora firme da alma fincada na imutabilidade do caráter divino e nas Suas promessas de redenção.",
    text:
      "Deus da esperança, que enches os corações de alegria e paz na fé, dissipa as nuvens de pessimismo que obscurecem o meu olhar sobre o futuro. Ajuda-me a lembrar que o Senhor tem o controle de todos os tempos e que a minha história está guardada em tuas mãos. Que a chama da santa esperança aqueça meus passos, inspire minhas metas e me impulsione a semear amor e perseverança todos os dias. Em nome de Jesus, amém.",
    verses: [
      { ref: "Romanos 15:13", link: "/biblia/romanos/15", text: "Ora o Deus de esperança vos encha de todo o gozo e paz em crença, para que abundeis em esperança pela virtude do Espírito Santo." },
      { ref: "Hebreus 6:19", link: "/biblia/hebreus/6", text: "A qual temos como âncora da alma, segura e firme." },
    ],
    reflection:
      "A esperança que brota da fé transforma o presente: ela nos capacita a enfrentar o sofrimento sabendo que ele é passageiro comparado à glória porvir.",
    application:
      "Escreva um versículo de esperança e cole-o em local visível no seu espaço de trabalho ou no espelho do banheiro.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
];

export const getStudy = (slug: string) => STUDIES.find((s) => s.slug === slug);
export const getDevotional = (slug: string) => DEVOTIONALS.find((d) => d.slug === slug);
export const getPrayer = (slug: string) => PRAYERS.find((p) => p.slug === slug);

