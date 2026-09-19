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
    category: "Oração pelo trabalho",
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
  {
    slug: "oracao-contra-ansiedade-e-medo",
    category: "Oração contra ansiedade",
    title: "Oração contra a ansiedade e o medo",
    text: "Senhor Deus, quando a mente se agita e o peito aperta com incertezas sobre o amanhã, venho a ti buscar refúgio. Entrego cada preocupação que foge ao meu controle. Desfaz o peso da aflição com a certeza do teu cuidado paternal. Substitui o medo pela tua paz serena e ajuda-me a viver um dia de cada vez, confiando na tua provisão contínua. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-pelos-filhos-e-juventude",
    category: "Oração pelos filhos",
    title: "Oração pelos filhos e novas gerações",
    text: "Pai amoroso, coloco meus filhos e a juventude sob a tua proteção. Guarda o coração deles das armadilhas do mundo, das más influências e do desânimo. Concede-lhes discernimento, amigos leais e amor pela tua verdade. Que cresçam em sabedoria, graça e respeito ao próximo, desenvolvendo um caráter íntegro e propósito de vida alinhado aos teus ensinamentos. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-de-libertacao-e-perdao",
    category: "Oração por perdão",
    title: "Oração por cura interior e perdão",
    text: "Senhor, perdoa meus erros e limpa meu coração de toda mágoa acumulada. Reconheço que guardar ressentimento apenas fere a minha própria alma. Decido hoje, pela tua graça, perdoar aqueles que me ofenderam e soltar qualquer desejo de retaliação. Restaura minhas emoções, cura feridas do passado e faz brotar em mim um espírito manso e acolhedor. Em nome de Jesus, amém.",
  },
  {
    slug: "oracao-por-sabedoria-nas-decisoes",
    category: "Oração por sabedoria",
    title: "Oração por sabedoria e discernimento",
    text: "Deus de infinita sabedoria, coloco diante de ti as escolhas e encruzilhadas que tenho pela frente. Ilumina meu entendimento para que eu não decida no calor da emoção nem na pressa da ansiedade. Dá-me clareza para distinguir o que é lícito do que é conveniente, e coragem para fazer o que é justo e agradável aos teus olhos. Em nome de Jesus, amém.",
  },
];

export const getStudy = (slug: string) => STUDIES.find((s) => s.slug === slug);
export const getDevotional = (slug: string) => DEVOTIONALS.find((d) => d.slug === slug);
