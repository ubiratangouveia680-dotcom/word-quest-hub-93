import { BibleMaterial } from './studies-types';

export const INITIAL_MATERIALS: BibleMaterial[] = [
  // ==========================================
  // ESTUDOS BÍBLICOS APROFUNDADOS
  // ==========================================
  {
    id: 'mat-001',
    slug: 'o-que-e-fe-segundo-a-biblia',
    type: 'estudo',
    title: 'O que é fé segundo a Bíblia?',
    category: 'Fé',
    categorySlug: 'fe',
    audience: 'geral',
    level: 'basico',
    bibleBook: 'Hebreus',
    author: 'Equipe Bíblia Online',
    excerpt: 'Um estudo bíblico claro e prático sobre a natureza da fé genuína, sua origem e como ela se manifesta nas decisões do cotidiano.',
    mainVerse: 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não vêem.',
    mainVerseRef: 'Hebreus 11:1',
    objectives: [
      'Compreender a definição bíblica de fé para além do mero pensamento positivo.',
      'Identificar como a fé se origina e se alimenta por meio da Palavra de Deus.',
      'Reconhecer que a verdadeira fé produz ações e frutos práticos.'
    ],
    content: `A palavra fé aparece repetidamente nas Escrituras como o pilar do relacionamento entre o ser humano e Deus. No entanto, o conceito bíblico é frequentemente confundido com otimismo ingênuo, autoconfiança ou mero assentimento intelectual.

Na perspectiva bíblica, a fé é uma convicção fundamentada no caráter imutável de Deus. Ela não depende do que os olhos físicos veem, mas da fidelidade Daquele que fez as promessas. Quando Abraão creu, sua fé não consistiu em negar as dificuldades biológicas de sua velhice, mas em reconhecer que Deus tinha poder suficiente para cumprir o que havia prometido.

Além disso, o apóstolo Paulo nos ensina em Romanos que a fé não surge de técnicas de autoajuda ou meditação vazia; ela nasce do contato constante com o Evangelho: "a fé vem pelo ouvir, e o ouvir pela palavra de Deus". Quanto mais nos expomos às Escrituras, mais nossa mente é renovada e alinhada à vontade divina.`,
    topics: [
      {
        title: '1. O Fundamento e a Evidência (Hebreus 11:1)',
        content: 'O autor de Hebreus utiliza duas expressões marcantes: "firme fundamento" (substância) e "prova" (evidência). A fé bíblica dá peso real às promessas futuras e ancora a alma diante das tempestades presentes.',
        verseRef: 'Hebreus 11:1'
      },
      {
        title: '2. A Fonte da Fé: A Palavra de Deus (Romanos 10:17)',
        content: 'Nossa fé cresce na medida em que nos alimentamos da verdade bíblica. A leitura diária, a meditação e o ensino bíblico funcionam como oxigênio para a vida espiritual.',
        verseRef: 'Romanos 10:17'
      },
      {
        title: '3. A Fé que Opera em Obras (Tiago 2:14-17)',
        content: 'Tiago não contradiz Paulo; ele esclarece que a fé verdadeira nunca fica apenas no campo teórico. Uma árvore viva produz frutos, e uma fé autêntica se traduz em amor ao próximo, perdão e integridade.',
        verseRef: 'Tiago 2:17'
      }
    ],
    questions: [
      'Em quais áreas da sua vida você tem encontrado maior dificuldade para confiar plenamente em Deus?',
      'Qual tem sido a frequência e a profundidade do seu contato diário com a Palavra de Deus?',
      'Que atitude concreta você pode tomar hoje como demonstração prática de fé?'
    ],
    practicalApplication: 'Dedique ao menos 15 minutos hoje para ler as Escrituras com o coração aberto. Identifique uma preocupação que tem tirado sua paz e entregue-a conscientemente a Deus em oração, escolhendo confiar nas promessas Dele.',
    conclusion: 'A fé bíblica não é ausência de dúvidas ou tempestades, mas a decisão firme de confiar na soberania de Deus mesmo quando o caminho parece incerto. Ela nos conecta à graça e transforma nossa maneira de viver.',
    referenceVerses: [
      { ref: 'Hebreus 11:1', link: '/biblia/hebreus/11', text: 'Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não vêem.' },
      { ref: 'Romanos 10:17', link: '/biblia/romanos/10', text: 'De sorte que a fé vem pelo ouvir, e o ouvir pela palavra de Deus.' },
      { ref: 'Tiago 2:17', link: '/biblia/tiago/2', text: 'Assim também a fé, se não tiver as obras, é morta em si mesma.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-002',
    slug: 'a-armadura-de-deus-efesios-6',
    type: 'estudo',
    title: 'A Armadura de Deus: Firmeza Espiritual no Cotidiano',
    category: 'Vida Cristã',
    categorySlug: 'vida-crista',
    audience: 'geral',
    level: 'intermediario',
    bibleBook: 'Efésios',
    author: 'Equipe Bíblia Online',
    excerpt: 'Uma análise profunda de Efésios 6:10-18, desvendando cada peça da armadura espiritual e sua aplicação prática para vencer as batalhas diárias.',
    mainVerse: 'Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.',
    mainVerseRef: 'Efésios 6:11',
    objectives: [
      'Entender a natureza espiritual das batalhas que enfrentamos na mente e nas atitudes.',
      'Conhecer o significado e o valor de cada peça da armadura descrita por Paulo.',
      'Aprender a manter a vigilância e a oração contínua como escudo diário.'
    ],
    content: `Ao escrever aos cristãos de Éfeso a partir de sua prisão, o apóstolo Paulo observava de perto os soldados romanos com seus cinturões, couraças, escudos e capacetes. Inspirado pelo Espírito Santo, Paulo viu naquela indumentária militar uma poderosa analogia para a vida cristã.

A vida com Cristo não é um passeio sem desafios; é uma jornada onde forças espirituais opostas tentam desanimar, enganar e afastar o crente do propósito de Deus. No entanto, a instrução apostólica não é de pânico ou desespero, mas de confiança e firmeza: "Fortalecei-vos no Senhor e na força do seu poder".

A vitória não é conquistada pela nossa força carnal, mas pela provisão que o próprio Deus já nos entregou através de Jesus Cristo.`,
    topics: [
      {
        title: 'O Cinto da Verdade e a Couraça da Justiça',
        content: 'O cinturão mantinha todas as peças unidas. A verdade protege o cristão das mentiras do engano cultural. A couraça guarda o coração, lembrando-nos de que nossa justiça vem de Cristo, e não de méritos próprios.'
      },
      {
        title: 'Os Calçados da Prontidão e o Escudo da Fé',
        content: 'Os pés calçados com a prontidão do Evangelho trazem estabilidade para avançar e proclamar a paz. O escudo da fé apaga os dardos inflamados da dúvida, do medo e da acusação.'
      },
      {
        title: 'O Capacete da Salvação e a Espada do Espírito',
        content: 'O capacete protege a mente contra pensamentos de derrota e condenação. A espada do Espírito é a própria Palavra de Deus — a única arma de ataque citada, exatamente como Jesus usou contra as tentações no deserto.'
      }
    ],
    questions: [
      'Qual peça da armadura você sente que tem negligenciado em sua rotina espiritual?',
      'Como você tem reagido aos "dardos inflamados" do desânimo e da culpa?',
      'De que maneira você utiliza a Palavra de Deus quando se depara com uma tentação?'
    ],
    practicalApplication: 'Inicie a manhã orando especificamente pelas áreas da sua mente e do seu coração, declarando as verdades do Evangelho sobre suas inseguranças.',
    conclusion: 'Estar revestido da armadura de Deus significa viver diariamente na dependência da graça de Cristo, com a mente blindada pela verdade e os pés firmes na comunhão com o Pai.',
    referenceVerses: [
      { ref: 'Efésios 6:10-11', link: '/biblia/efesios/6', text: 'No demais, irmãos meus, fortalecei-vos no Senhor e na força do seu poder. Revesti-vos de toda a armadura de Deus.' },
      { ref: '2 Coríntios 10:4', link: '/biblia/2-corintios/10', text: 'Porque as armas da nossa milícia não são carnais, mas sim poderosas em Deus para destruição das fortalezas.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-003',
    slug: 'ansiedade-e-paz-segredo-de-filipenses-4',
    type: 'estudo',
    title: 'Ansiedade e Paz: O Segredo Bíblico de Filipenses 4',
    category: 'Oração',
    categorySlug: 'oracao',
    audience: 'geral',
    level: 'basico',
    bibleBook: 'Filipenses',
    author: 'Equipe Bíblia Online',
    excerpt: 'Como vencer a ansiedade cotidiana através da oração com ações de graças e desfrutar da paz que excede todo o entendimento humano.',
    mainVerse: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças.',
    mainVerseRef: 'Filipenses 4:6',
    objectives: [
      'Reconhecer os gatilhos emocionais e espirituais da ansiedade moderna.',
      'Praticar o tripé oração, súplica e ações de graças.',
      'Experimentar a guarda da paz de Deus sobre a mente e o coração.'
    ],
    content: `Vivemos em uma época caracterizada pelo excesso de estímulos, cobranças e incertezas quanto ao amanhã. No entanto, há quase dois mil anos, o apóstolo Paulo escreveu de uma cela romana palavras que continuam sendo o antídoto mais eficaz para o coração aflito.

A recomendação bíblica não é fingir que os problemas não existem, nem adotar uma postura de passividade. Paulo nos convida a uma substituição ativa: em vez de ruminar a inquietação em silêncio ou desespero, devemos transformar as preocupações em motivos de oração e gratidão.

A consequência prometida não é necessariamente a resolução imediata do problema exterior, mas algo ainda maior: a paz de Deus, que guarda (como uma sentinela militar) nossas mentes e afetos em Cristo Jesus.`,
    topics: [
      {
        title: 'A Ordem Clara: Não Andeis Ansiosos',
        content: 'Paulo não está minimizando o sofrimento, mas apontando que a ansiedade corrói a fé e nos coloca no papel de tentarmos controlar o que pertence unicamente a Deus.'
      },
      {
        title: 'O Meio de Entrega: Súplica com Gratidão',
        content: 'A oração que vence a ansiedade não é cheia de murmuração, mas acompanhada de "ações de graças". Lembrar-se do que Deus já fez no passado renova a certeza de que Ele cuidará do futuro.'
      },
      {
        title: 'A Sentinela Celestial: A Paz de Deus',
        content: 'O termo grego usado para "guardará" refere-se a uma guarnição militar protegendo uma cidade. A paz de Deus posta-se como guarda nos portões da mente para impedir a invasão do desespero.'
      }
    ],
    questions: [
      'Quais pensamentos têm roubado sua tranquilidade nas últimas semanas?',
      'Quando você ora, gasta mais tempo enumerando queixas ou agradecendo pelo cuidado divino?',
      'Como cultivar o hábito de orar imediatamente assim que uma preocupação surge?'
    ],
    practicalApplication: 'Faça uma lista de 5 bênçãos recentes pelas quais você é grato. Em seguida, anote suas maiores preocupações atuais e transforme cada uma delas em uma oração confiante.',
    conclusion: 'A paz bíblica não é o silêncio do cemitério nem a ausência de conflitos, mas a presença reconfortante de Deus no meio da tempestade.',
    referenceVerses: [
      { ref: 'Filipenses 4:6-7', link: '/biblia/filipenses/4', text: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.' },
      { ref: '1 Pedro 5:7', link: '/biblia/1-pedro/5', text: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-004',
    slug: 'a-familia-segundo-os-planos-de-deus',
    type: 'estudo',
    title: 'A Família Segundo os Planos de Deus: Aliança e Graça',
    category: 'Família',
    categorySlug: 'familia',
    audience: 'familia',
    level: 'basico',
    bibleBook: 'Josué',
    author: 'Equipe Bíblia Online',
    excerpt: 'Princípios bíblicos essenciais para edificar um lar fundamentado no amor sacrificial, no perdão recíproco e na transmissão da fé entre gerações.',
    mainVerse: 'Porém eu e a minha casa serviremos ao Senhor.',
    mainVerseRef: 'Josué 24:15',
    objectives: [
      'Compreender a instituição da família como projeto de Deus e reflexo de Sua aliança.',
      'Identificar atitudes que fortalecem o casamento e o diálogo entre pais e filhos.',
      'Estabelecer um compromisso familiar de serviço e adoração ao Senhor.'
    ],
    content: `A família foi a primeira instituição criada por Deus na história humana. Antes do governo civil ou de qualquer estrutura social organizada, Deus uniu o homem e a mulher em uma aliança de fidelidade e companheirismo mútuo.

Hoje, os lares enfrentam pressões sem precedentes: excesso de trabalho, isolamento digital dentro da própria casa e a relativização dos valores morais. Diante desse cenário, o testemunho de Josué ressoa com força redobrada: "Eu e a minha casa serviremos ao Senhor". Servir a Deus em família não significa ausência de atritos ou defeitos, mas a escolha consciente de fazer da Palavra a bússola que orienta as decisões domésticas.`,
    topics: [
      {
        title: 'O Casamento como Aliança Sacrificial',
        content: 'Em Efésios 5, o casamento é comparado à união entre Cristo e a Igreja. O amor conjugal bíblico não se baseia em atração passageira, mas no compromisso diário de doar-se pelo bem do outro com honra e respeito mútuo.'
      },
      {
        title: 'A Educação dos Filhos e a Transmissão da Fé',
        content: 'Deuteronômio 6 instrui os pais a ensinarem os preceitos divinos com naturalidade: ao sentar-se em casa, ao andar pelo caminho, ao deitar-se e ao levantar-se. O exemplo arrasta mais que discursos formais.'
      },
      {
        title: 'O Perdão como Cimento do Lar',
        content: 'Lares saudáveis não são formados por pessoas perfeitas, mas por pessoas que aprenderam a pedir perdão depressa e a liberar graça uns aos outros, impedindo que a amargura crie raízes.'
      }
    ],
    questions: [
      'Como está o tempo de qualidade e conversa sincera entre os membros da sua casa?',
      'Seus filhos ou familiares conseguem enxergar em suas atitudes o amor de Cristo?',
      'Existe alguma mágoa não resolvida na sua família que precisa ser tratada hoje?'
    ],
    practicalApplication: 'Organize nesta semana uma refeição familiar sem telas ou celulares, compartilhando um momento de oração e conversa sincera sobre a bondade de Deus.',
    conclusion: 'Quando Cristo é o centro da família, o lar torna-se um porto seguro de acolhimento e uma tocha de esperança que ilumina o mundo ao redor.',
    referenceVerses: [
      { ref: 'Josué 24:15', link: '/biblia/josue/24', text: 'Porém eu e a minha casa serviremos ao Senhor.' },
      { ref: 'Salmos 127:1', link: '/biblia/salmos/127', text: 'Se o Senhor não edificar a casa, em vão trabalham os que a edificam.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-04T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-005',
    slug: 'identidade-e-proposito-para-jovens-cristaos',
    type: 'estudo',
    title: 'Identidade e Propósito: Chamados para Fazer a Diferença',
    category: 'Jovens',
    categorySlug: 'jovens',
    audience: 'jovens',
    level: 'basico',
    bibleBook: '1 Timóteo',
    author: 'Equipe Bíblia Online',
    excerpt: 'Um estudo vibrante e desafiador para jovens que desejam descobrir sua verdadeira identidade em Cristo e viver com propósito sem ceder à pressão do mundo.',
    mainVerse: 'Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis, na palavra, no trato, no amor, no espírito, na fé, na pureza.',
    mainVerseRef: '1 Timóteo 4:12',
    objectives: [
      'Ancorar a autoestima e a identidade na verdade do amor e da redenção de Deus.',
      'Superar a armadilha da comparação nas redes sociais.',
      'Assumir uma postura de liderança e testemunho ético no ambiente de estudos e trabalho.'
    ],
    content: `A juventude é um período de grandes decisões: carreira, amizades, relacionamentos e visão de mundo. Em uma cultura marcada pela busca frenética por aprovação virtual e pelo medo de ficar de fora, muitos jovens acabam fragmentando sua identidade para se encaixar nos padrões da maioria.

No entanto, o conselho do experiente apóstolo Paulo ao jovem líder Timóteo permanece incrivelmente atual. Paulo não diz para Timóteo esperar a velhice chegar para ser relevante. Pelo contrário: "Ninguém despreze a tua mocidade; sê o exemplo!".

A juventude não é uma sala de espera para a vida espiritual; é um campo fértil onde Deus deseja levantar vozes corajosas que vivam com integridade e paixão pelo Evangelho.`,
    topics: [
      {
        title: 'Você Não É o que os Outros Dizem: Filho Amado',
        content: 'Antes de qualquer conquista acadêmica ou popularidade social, sua identidade fundamental foi definida na Cruz. Você foi comprado por alto preço e pertence ao Deus Altíssimo.'
      },
      {
        title: 'Exemplo em Cinco Áreas Vitais',
        content: 'Paulo lista onde o jovem deve ser modelo: na palavra (o que fala e digita), no trato (como trata as pessoas), no amor (ações voluntárias de bondade), na fé (confiança firme) e na pureza (guarda do coração e do corpo).'
      },
      {
        title: 'Influenciar em Vez de Apenas Ser Influenciado',
        content: 'Como Daniel na Babilônia, é possível viver no mundo sem se conformar com seus valores corrompidos. A coragem de dizer "não" aos modismos destrutivos é a marca de quem encontrou um propósito eterno.'
      }
    ],
    questions: [
      'Você já se sentiu pressionado a agir contra sua consciência para ser aceito por um grupo?',
      'De que forma o tempo gasto em redes sociais tem afetado sua paz mental e sua vida devocional?',
      'O que significa para você, hoje, ser exemplo de pureza e amor?'
    ],
    practicalApplication: 'Escolha uma pessoa ao seu redor (um colega de classe ou amigo que esteja passando por dificuldades) e demonstre ativamente o amor de Cristo através de uma palavra de encorajamento ou apoio prático.',
    conclusion: 'Quando um jovem descobre que seu valor vem de Deus e não das aparências, ele se torna imparável na propagação do Reino de Deus.',
    referenceVerses: [
      { ref: '1 Timóteo 4:12', link: '/biblia/1-timoteo/4', text: 'Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis.' },
      { ref: 'Eclesiastes 12:1', link: '/biblia/eclesiastes/12', text: 'Lembra-te também do teu Criador nos dias da tua mocidade.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },

  // ==========================================
  // ESCOLA DOMINICAL (EBD) - LIÇÕES ESTRUTURADAS
  // ==========================================
  {
    id: 'mat-006',
    slug: 'ebd-fruto-do-espirito-amor',
    type: 'escola-dominical',
    title: 'Lição 1: O Fruto do Espírito — O Amor que Tudo Suporta',
    category: 'Escola Dominical',
    categorySlug: 'escola-dominical',
    audience: 'adultos',
    level: 'intermediario',
    bibleBook: 'Gálatas',
    series: 'O Fruto do Espírito na Vida Prática',
    lessonNumber: 1,
    author: 'Coordenação de EBD — Bíblia Online',
    excerpt: 'Lição completa de Escola Dominical explorando a primeira manifestação do Fruto do Espírito: o amor sacrificial (ágape) como alicerce de todas as virtudes cristãs.',
    mainVerse: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança. Contra estas coisas não há lei.',
    mainVerseRef: 'Gálatas 5:22-23',
    objectives: [
      'Distinguir o amor bíblico (ágape) das paixões e sentimentos efêmeros do mundo.',
      'Compreender que o amor não é esforço humano autônomo, mas fruto gerado pelo Espírito Santo.',
      'Identificar atitudes práticas para exercitar o perdão e o cuidado fraternal na igreja e na sociedade.'
    ],
    content: `BEM-VINDO À ESCOLA DOMINICAL

INTRODUÇÃO DA LIÇÃO:
Ao abordar o contraste entre as obras da carne e o Fruto do Espírito em Gálatas 5, o apóstolo Paulo emprega intencionalmente o termo no singular: "o fruto do Espírito". Isso nos ensina que as virtudes listadas não são frutos isolados que podemos colher separadamente, mas facetas de um mesmo caráter transformado pela habitação de Deus.

E encabeçando essa lista sublime está o Amor (ágape). Não se trata de uma afeição circunstancial que só ama quem nos agrada, mas do amor que Deus demonstrou ao entregar Seu próprio Filho enquanto ainda éramos pecadores (Romanos 5:8).

Nesta lição, analisaremos como esse amor divino opera em nós e quebra os preconceitos, o egoísmo e o individualismo que frequentemente ameaçam a comunhão cristã.`,
    topics: [
      {
        title: 'I. A Natureza do Amor Ágape',
        content: 'Na língua grega original, existiam termos como "eros" (amor romântico) e "phileo" (amor de amigos). Paulo escolhe "ágape", que denota um amor incondicional, voluntário e guiado pela decisão de buscar o mais alto bem do outro, independentemente do merecimento.'
      },
      {
        title: 'II. O Amor como Raiz do Fruto',
        content: 'Muitos teólogos observam que as oito virtudes seguintes são manifestações do próprio amor: a alegria é o amor cantando; a paz é o amor descansando; a paciência é o amor tolerando; a bondade é o amor agindo em benefício do próximo.'
      },
      {
        title: 'III. Como o Amor se Desenvolve em Nós',
        content: 'Ninguém pode produzir esse amor por determinação moralista. Como os ramos ligados à videira (João 15), nós só frutificamos quando permanecemos intimamente conectados a Cristo através da oração, da Palavra e da submissão diária ao Espírito.'
      }
    ],
    questions: [
      'Por que é tão desafiador amar aqueles que discordam de nós ou que nos ofendem?',
      'Em que aspectos práticos o amor cristão se diferencia da filantropia secular?',
      'Como a nossa igreja local pode se tornar um referencial mais visível de amor comunitário?'
    ],
    practicalApplication: 'Nesta semana, procure uma pessoa com quem você teve algum atrito ou distanciamento e ofereça um gesto genuíno de reconciliação, sem esperar nada em troca.',
    conclusion: 'O amor é o distintivo dos verdadeiros discípulos de Jesus: "Nisto todos conhecerão que sois meus discípulos, se vos amardes uns aos outros" (João 13:35). Sem amor, qualquer eloqüência teológica torna-se mero ruído.',
    referenceVerses: [
      { ref: 'Gálatas 5:22-23', link: '/biblia/galatas/5', text: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.' },
      { ref: '1 Coríntios 13:4-7', link: '/biblia/1-corintios/13', text: 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.' },
      { ref: 'João 13:35', link: '/biblia/joao/13', text: 'Nisto todos conhecerão que sois meus discípulos, se vos amardes uns aos outros.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-06T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-007',
    slug: 'ebd-fruto-do-espirito-alegria-e-paz',
    type: 'escola-dominical',
    title: 'Lição 2: O Fruto do Espírito — Alegria e Paz em Meio às Provações',
    category: 'Escola Dominical',
    categorySlug: 'escola-dominical',
    audience: 'adultos',
    level: 'intermediario',
    bibleBook: 'Filipenses',
    series: 'O Fruto do Espírito na Vida Prática',
    lessonNumber: 2,
    author: 'Coordenação de EBD — Bíblia Online',
    excerpt: 'Segunda lição da série sobre o Fruto do Espírito, focada em como desfrutar da alegria perene e da paz imperturbável providenciadas pelo Espírito Santo.',
    mainVerse: 'Regozijai-vos sempre no Senhor; outra vez digo, regozijai-vos.',
    mainVerseRef: 'Filipenses 4:4',
    objectives: [
      'Entender que a alegria cristã não depende das circunstâncias temporais favoráveis.',
      'Aprender a manter a paz interior diante de perseguições e perdas.',
      'Identificar práticas bíblicas para cultivar um espírito alegre e agradecido.'
    ],
    content: `BEM-VINDO À ESCOLA DOMINICAL

INTRODUÇÃO DA LIÇÃO:
O mundo associa alegria a sucesso financeiro, festas e momentos em que tudo dá certo. Mas o que acontece quando a saúde falha, o emprego é perdido ou um ente querido parte? O ser humano sem Deus mergulha no desespero.

A alegria cristã ("chara"), no entanto, tem sua raiz fincada na soberania e no amor eterno de Deus. Paulo escreveu a carta da alegria (Filipenses) enquanto estava acorrentado em uma masmorra. Isso prova que a alegria do Espírito Santo é sobrenatural: ela floresce mesmo no inverno do sofrimento.

Nesta lição, estudaremos a união inseparável entre a verdadeira alegria e a paz que guarda nossos corações.`,
    topics: [
      {
        title: 'I. Alegria no Senhor vs. Felicidade Circunstancial',
        content: 'Felicidade depende do que acontece (acontecimentos). A alegria bíblica depende de Quem nunca muda (o Senhor). Habacuque ilustrou isso perfeitamente: ainda que a figueira não floresça, ele se alegraria no Deus da sua salvação.'
      },
      {
        title: 'II. A Paz com Deus e a Paz de Deus',
        content: 'Primeiro recebemos a paz com Deus mediante a justificação pela fé (Romanos 5:1). Cessada a inimizade do pecado, passamos a experimentar a paz de Deus no dia a dia, mesmo sob provações.'
      },
      {
        title: 'III. Inimigos da Paz e da Alegria',
        content: 'A murmuração constante, a comparação com os outros e a falta de perdão são ervas daninhas que sufocam a alegria do Espírito no coração do crente.'
      }
    ],
    questions: [
      'Você já presenciou alguém louvando a Deus em meio a uma dor extrema? O que isso revelou sobre a fé dessa pessoa?',
      'Como a prática da gratidão diária influencia a nossa saúde física e espiritual?',
      'O que fazer quando sentimos que perdemos a alegria do primeiro amor?'
    ],
    practicalApplication: 'Escreva em um caderno três motivos de gratidão hoje, mesmo que enfrente desafios difíceis, e compartilhe com sua família na hora da refeição.',
    conclusion: 'A alegria do Senhor é a nossa força (Neemias 8:10). Quando o Espírito Santo governa nossa vida, somos revestidos de uma serenidade que o mundo não consegue conceder nem retirar.',
    referenceVerses: [
      { ref: 'Filipenses 4:4-7', link: '/biblia/filipenses/4', text: 'Regozijai-vos sempre no Senhor; outra vez digo, regozijai-vos.' },
      { ref: 'Habacuque 3:17-18', link: '/biblia/habacuque/3', text: 'Todavia eu me alegrarei no Senhor; exultarei no Deus da minha salvação.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-008',
    slug: 'ebd-infantil-davi-e-o-gigante',
    type: 'escola-dominical',
    title: 'Lição Infantil: Davi e o Gigante — Coragem que Vem de Deus',
    category: 'Estudos Infantis',
    categorySlug: 'infantil',
    audience: 'infantil',
    level: 'basico',
    bibleBook: '1 Samuel',
    series: 'Heróis da Fé para Crianças',
    lessonNumber: 1,
    author: 'Departamento Infantil — Bíblia Online',
    excerpt: 'Uma lição interativa e dinâmica para crianças, ensinando que não precisamos ter medo de problemas gigantes quando confiamos no Deus Todo-Poderoso.',
    mainVerse: 'Tu vens a mim com espada, e com lança, e com escudo; porém eu venho a ti em nome do Senhor dos Exércitos.',
    mainVerseRef: '1 Samuel 17:45',
    objectives: [
      'Ensinar às crianças que Deus está sempre conosco quando sentimos medo.',
      'Mostrar que Deus não olha apenas a força física ou tamanho, mas o coração.',
      'Incentivar a oração nos momentos em que surgem dificuldades na escola ou em casa.'
    ],
    content: `PARA OS PROFESSORES E PAIS:
Crianças frequentemente enfrentam medos: medo do escuro, medo de tirar notas baixas, medo de valentões ou da timidez. Esta história bíblica clássica de 1 Samuel 17 é uma ferramenta maravilhosa para ensinar que a nossa força não vem do tamanho do nosso corpo, mas do tamanho do nosso Deus!

HISTÓRIA DA LIÇÃO:
Há muitos anos, o povo de Israel estava diante de um grande problema. Um soldado inimigo chamado Golias, que tinha quase três metros de altura e vestia uma armadura pesadíssima de bronze, gritava todo dia zombando do povo e de Deus.

Todos os soldados experientes tremiam de medo e se escondiam. Até que chegou ao acampamento um jovem pastorzinho de ovelhas chamado Davi, que trazia comida para seus irmãos.

Davi ouviu as provocações de Golias e não aceitou que zombassem do Deus Vivo. O rei Saul tentou colocar sua pesada armadura em Davi, mas o menino nem conseguia andar com ela. Davi preferiu pegar apenas seu cajado, sua atiradeira e 5 pedrinhas lisas do riacho.

Diante do gigante furioso, Davi declarou com fé: "Você vem contra mim com espada e lança, mas eu vou contra você em nome do Senhor dos Exércitos!". Com uma única pedrada certeira, Davi derrubou o gigante e Deus deu uma grande vitória a Israel!`,
    topics: [
      {
        title: '1. O que nos dá medo?',
        content: 'Assim como Golias parecia invencível, às vezes temos problemas que parecem enormes. Mas para Deus, nada é grande demais!'
      },
      {
        title: '2. Cinco Pedrinhas e Muita Fé',
        content: 'Davi não precisou de armas caras; ele usou o que sabia fazer com humildade e colocou toda a sua confiança no Senhor.'
      },
      {
        title: '3. Deus Vence por Nós',
        content: 'A vitória não foi da esperteza de Davi, mas do poder de Deus que honrou a coragem do Seu jovem servo.'
      }
    ],
    questions: [
      'Você já sentiu muito medo de alguma coisa? O que você fez para se sentir melhor?',
      'Por que Davi não ficou com medo de Golias mesmo sendo muito menor que ele?',
      'O que você pode dizer para si mesmo quando tiver medo de um "problema gigante"?'
    ],
    practicalApplication: 'Atividade lúdica: desenhe em uma folha uma pedrinha e escreva dentro dela: "DEUS É COMIGO". Guarde no estojo escolar para lembrar que Jesus está com você todos os dias!',
    conclusion: 'Não importa quão grande seja o gigante ou o problema na sua vida: quando você anda com Jesus, você é mais que vencedor!',
    referenceVerses: [
      { ref: '1 Samuel 17:45', link: '/biblia/1-samuel/17', text: 'Porém eu venho a ti em nome do Senhor dos Exércitos, o Deus dos exércitos de Israel, a quem tens afrontado.' },
      { ref: 'Salmos 56:3', link: '/biblia/salmos/56', text: 'Em qualquer tempo em que eu temer, confiarei em ti.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-08T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },

  // ==========================================
  // APOSTILAS COMPLETAS (LEITURA E IMPRESSÃO)
  // ==========================================
  {
    id: 'mat-009',
    slug: 'apostila-fundamentos-da-fe-crista',
    type: 'apostila',
    title: 'Apostila Completa: Fundamentos da Fé Cristã',
    category: 'Cursos Bíblicos',
    categorySlug: 'cursos-biblicos',
    audience: 'geral',
    level: 'basico',
    author: 'Instituto Bíblico Palavra Viva & Bíblia Online',
    coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Manual doutrinário e prático para novos crentes e discipulado, abordando a autoridade da Bíblia, a pessoa de Jesus, salvação pela graça, batismo, oração e vida na igreja.',
    mainVerse: 'Edificados sobre o fundamento dos apóstolos e dos profetas, de que Jesus Cristo é a principal pedra da esquina.',
    mainVerseRef: 'Efésios 2:20',
    objectives: [
      'Firmar os novos crentes nas doutrinas fundamentais do Cristianismo bíblico.',
      'Capacitar líderes e discipuladores com material estruturado para classes de boas-vindas.',
      'Oferecer roteiro seguro para estudos bíblicos em pequenos grupos ou lares.'
    ],
    content: `# APOSTILA: FUNDAMENTOS DA FÉ CRISTÃ
**Material Didático e de Discipulado | Bíblia Online**

---

### APRESENTAÇÃO
Esta apostila foi elaborada com o objetivo de oferecer uma caminhada clara, segura e profundamente bíblica através dos pilares da fé cristã. Jesus ensinou na parábola dos dois construtores (Mateus 7:24-27) que a diferença entre a casa que resistiu à tempestade e a que desabou estava na profundidade dos seus alicerces.

---

### CAPÍTULO 1: A BÍBLIA — A PALAVRA INSPIRADA DE DEUS
A Bíblia não é apenas um livro de sabedoria humana; é a revelação inspirada por Deus através de homens capacitados pelo Espírito Santo (2 Pedro 1:21). Composta por 66 livros (39 no Antigo Testamento e 27 no Novo Testamento), ela possui perfeita harmonia e aponta incondicionalmente para Cristo.

- **Inerrância e Suficiência:** Tudo o que o ser humano necessita para sua salvação e para uma vida agradável a Deus está contido nas Sagradas Escrituras (2 Timóteo 3:16-17).
- **Como estudar a Bíblia:** Leitura com oração, compreensão do contexto histórico e aplicação prática imediata.

---

### CAPÍTULO 2: DEUS PAI, FILHO E ESPÍRITO SANTO
O Cristianismo crê em um único Deus eterno que subsiste em três Pessoas distintas, da mesma substância e iguais em poder e glória:
1. **O Pai:** Criador e sustentador de todas as coisas visíveis e invisíveis.
2. **O Filho (Jesus Cristo):** Verdadeiro Deus e verdadeiro homem, que viveu sem pecado, morreu na cruz pelos nossos pecados e ressuscitou corporalmente ao terceiro dia.
3. **O Espírito Santo:** O Consolador prometido que convence o mundo do pecado, regenera o coração humano e habita em todo aquele que crê.

---

### CAPÍTULO 3: A SALVAÇÃO PELA GRAÇA MEDIANTE A FÉ
Nenhum ser humano pode salvar a si mesmo por boas obras ou rituais religiosos. O apóstolo Paulo é categórico em Efésios 2:8-9: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus. Não vem das obras, para que ninguém se glorie".
- **Arrependimento:** Reconhecer a condição de pecador e mudar de rumo.
- **Justificação:** Deus declara o pecador justo diante do tribunal divino com base no sacrifício vicário de Cristo.
- **Santificação:** O processo diário e progressivo de se tornar mais semelhante a Jesus.

---

### CAPÍTULO 4: AS ORDENANÇAS E A VIDA NA IGREJA
A vida cristã não foi feita para o isolamento. Os crentes são chamados a fazer parte da família da fé:
- **O Batismo nas Águas:** Testemunho público de morte para a velha vida de pecado e ressurreição para uma nova vida em Cristo.
- **A Ceia do Senhor:** Memorial solene do corpo e sangue de Cristo entregues por nós, e renovação da esperança de Sua volta.
- **A Comunhão e os Dons:** Servir uns aos outros com alegria, utilizando os talentos que o Espírito Santo distribui a cada um.`,
    topics: [
      {
        title: 'Módulo I: As Escrituras Sagradas',
        content: 'Origem, confiabilidade histórica, canonicidade e autoridade das Escrituras.'
      },
      {
        title: 'Módulo II: Teologia Própria e a Trindade',
        content: 'Os atributos divinos (onisciência, onipresença, amor, santidade e justiça) e o mistério da Trindade.'
      },
      {
        title: 'Módulo III: Cristologia e Soteriologia',
        content: 'A encarnação, a redenção consumada na cruz e a segurança da vida eterna.'
      },
      {
        title: 'Módulo IV: Eclesiologia e Vida Prática',
        content: 'O propósito da Igreja, vida comunitária, mordomia cristã e a Grande Comissão.'
      }
    ],
    tableOfContents: [
      { id: 'apresentacao', title: 'Apresentação e Objetivos', page: 1 },
      { id: 'cap-1', title: 'Capítulo 1: A Bíblia — A Palavra de Deus', page: 2 },
      { id: 'cap-2', title: 'Capítulo 2: A Trindade Divina', page: 5 },
      { id: 'cap-3', title: 'Capítulo 3: Salvação pela Graça e Fé', page: 8 },
      { id: 'cap-4', title: 'Capítulo 4: Batismo, Ceia e a Igreja', page: 12 },
      { id: 'anexo', title: 'Perguntas de Fixação e Compromisso Pessoal', page: 15 }
    ],
    questions: [
      'Por que a salvação tem que ser pela graça e não por merecimento?',
      'Qual é o papel do Espírito Santo no cotidiano do cristão?',
      'O que muda na vida de alguém após dar o testemunho público no batismo?'
    ],
    practicalApplication: 'Conclua a leitura desta apostila preenchendo as perguntas de fixação e agendando uma conversa com seu pastor ou discipulador para tirar dúvidas e firmar seus próximos passos na fé.',
    conclusion: 'Estar alicerçado nos fundamentos bíblicos protege o cristão dos ventos de falsas doutrinas e enche a caminhada de maturidade, esperança e frutos para a eternidade.',
    referenceVerses: [
      { ref: 'Efésios 2:8-9', link: '/biblia/efesios/2', text: 'Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.' },
      { ref: '2 Timóteo 3:16-17', link: '/biblia/2-timoteo/3', text: 'Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redargüir, para corrigir, para instruir em justiça.' },
      { ref: 'Mateus 28:19-20', link: '/biblia/mateus/28', text: 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.' }
    ],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-010',
    slug: 'manual-pratico-hermeneutica-biblica',
    type: 'apostila',
    title: 'Manual Prático de Hermenêutica: Como Ler e Entender a Bíblia',
    category: 'Sabedoria',
    categorySlug: 'sabedoria',
    audience: 'adultos',
    level: 'avancado',
    author: 'Equipe Bíblia Online',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Guia acessível e metodológico de interpretação bíblica, ensinando as regras de ouro para extrair o sentido original do texto e evitar erros comuns.',
    mainVerse: 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.',
    mainVerseRef: '2 Timóteo 2:15',
    objectives: [
      'Capacitar o leitor a interpretar textos bíblicos respeitando o contexto histórico e literário.',
      'Aprender a diferença fundamental entre exegese (extrair) e eisegese (injetar ideias próprias).',
      'Aplicar princípios seguros para leitura de narrativas, cartas, poesia e profecias.'
    ],
    content: `# MANUAL PRÁTICO DE HERMENÊUTICA BÍBLICA
**Como Extrair a Verdade das Escrituras com Fidelidade e Clareza**

---

### INTRODUÇÃO: O QUE É HERMENÊUTICA?
A palavra *hermenêutica* deriva do grego *hermeneuein*, que significa interpretar ou explicar. Na prática cristã, é a ciência e a arte que estabelece princípios e métodos para compreender o sentido original que o autor bíblico pretendeu comunicar aos seus primeiros ouvintes, trazendo depois essa verdade eterna para o nosso tempo.

---

### REGRA DE OURO 1: O TEXTO NUNCA PODE SIGNIFICAR O QUE NUNCA SIGNIFICOU
Antes de perguntar: *"O que este versículo significa para mim hoje?"*, o intérprete bíblico diligente deve primeiro perguntar: *"O que o autor inspirado estava dizendo à comunidade original da época?"*.
Pular essa etapa é a porta de entrada para alegorias fantasiosas e heresias.

---

### REGRA DE OURO 2: CONTEXTO, CONTEXTO E CONTEXTO
Um texto arrancado do seu contexto serve de pretexto para qualquer absurdo.
- **Contexto Imediato:** Os versículos imediatamente anteriores e posteriores.
- **Contexto do Livro:** Qual era o propósito geral de Paulo ao escrever aos Coríntios? Por que Jeremias estava chorando?
- **Contexto Canônico:** Como toda a Bíblia trata aquele assunto? A Escritura interpreta a própria Escritura (*Scriptura Scripturae interpres*).

---

### REGRA DE OURO 3: RESPEITAR O GÊNERO LITERÁRIO
A Bíblia é uma biblioteca rica em estilos literários diversos:
1. **Narrativas Históricas (ex: Samuel, Reis, Atos):** Descrevem o que aconteceu, nem sempre o que deveria ter acontecido (descritivo vs. prescritivo).
2. **Epístolas (ex: Romanos, Gálatas):** Instruções doutrinárias diretas em formato de cartas pessoais ou pastorais.
3. **Poesia e Sabedoria (ex: Salmos, Provérbios):** Uso de figuras de linguagem, paralelismos hebraicos e conselhos gerais de sabedoria, não promessas automáticas de prosperidade.
4. **Profecias e Literatura Apocalíptica (ex: Daniel, Apocalipse):** Ricas em simbolismos cósmicos, cores, números e animais metafóricos.

---

### PASSO A PASSO PARA O SEU ESTUDO PESSOAL
1. **Observação:** O que o texto diz textualmente? Quem são as personagens? Onde se passa a cena? Quais palavras se repetem?
2. **Interpretação:** O que o autor quis dizer aos primeiros destinatários? Qual problema estava sendo corrigido?
3. **Correlação:** Onde mais na Bíblia esse princípio se confirma?
4. **Aplicação:** Como esse princípio imutável transforma minha conduta pessoal, familiar e cidadã hoje?`,
    topics: [
      {
        title: 'Módulo 1: Princípios Básicos de Leitura',
        content: 'Vocabulário, figuras de linguagem e o perigo da eisegese.'
      },
      {
        title: 'Módulo 2: A Chave dos Gêneros Literários',
        content: 'Como ler narrativas, cartas paulinas, salmos e profecias sem distorções.'
      },
      {
        title: 'Módulo 3: Ferramentas Úteis',
        content: 'Uso de concordâncias, dicionários bíblicos e versões comparadas da Bíblia.'
      }
    ],
    tableOfContents: [
      { id: 'intro', title: 'Introdução à Hermenêutica', page: 1 },
      { id: 'regras', title: 'As Três Regras Fundamentais', page: 3 },
      { id: 'generos', title: 'Guia Prático dos Gêneros Literários', page: 6 },
      { id: 'erros', title: 'Os Sete Erros Mais Comuns na Interpretação', page: 10 },
      { id: 'roteiro', title: 'Roteiro Prático de Exegese para Pregadores', page: 14 }
    ],
    questions: [
      'Qual o perigo de pegar um versículo isolado sem ler o capítulo inteiro?',
      'Qual a diferença entre um texto bíblico descritivo e um texto prescritivo?',
      'Como a frase "a Escritura interpreta a Escritura" nos livra de interpretações distorcidas?'
    ],
    practicalApplication: 'Pegue hoje um versículo conhecido (ex: Jeremias 29:11 ou Filipenses 4:13) e leia os 10 versículos anteriores e posteriores. Descubra a que circunstância histórica ele estava se referindo originalmente.',
    conclusion: 'Manejar bem a Palavra da verdade não é privilégio exclusivo de acadêmicos, mas dever de todo filho de Deus que ama o Criador de todo o coração e com todo o entendimento.',
    referenceVerses: [
      { ref: '2 Timóteo 2:15', link: '/biblia/2-timoteo/2', text: 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.' },
      { ref: 'Salmos 119:105', link: '/biblia/salmos/119', text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.' }
    ],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-011',
    slug: 'parabolas-de-jesus-o-filho-prodigo',
    type: 'estudo',
    title: 'A Parábola do Filho Pródigo e o Coração do Pai',
    category: 'Parábolas',
    categorySlug: 'parabolas',
    audience: 'geral',
    level: 'basico',
    bibleBook: 'Lucas',
    author: 'Equipe Bíblia Online',
    excerpt: 'Um estudo tocante sobre Lucas 15, revelando a extensão infinita da graça de Deus que restaura tanto o pecador distante quanto o religioso endurecido.',
    mainVerse: 'Porque este meu filho estava morto, e reviveu; tinha-se perdido, e foi achado. E começaram a alegrar-se.',
    mainVerseRef: 'Lucas 15:24',
    objectives: [
      'Descobrir o propósito histórico pelo qual Jesus contou a parábola aos fariseus e publicanos.',
      'Compreender o papel do filho mais moço e do filho mais velho.',
      'Reconhecer a graça acolhedora de Deus como nosso Pai amoroso.'
    ],
    content: `Lucas 15 apresenta o clímax do ensino de Jesus sobre o valor dos perdidos. Diante dos murmúrios dos líderes religiosos que criticavam o fato de Jesus receber pecadores e comer com eles, o Mestre responde com três parábolas interligadas: a ovelha perdida, a dracma perdida e os dois filhos perdidos.

Frequentemente chamada de "A Parábola do Filho Pródigo", esta passagem é, na realidade, a revelação do coração extraordinário do Pai. O filho mais jovem pede a herança antes da hora — um gesto cultural que equivalia a desejar a morte do pai. Ele vai para uma terra distante e esbanja tudo o que possui.

No fundo do poço, disputando a comida dos porcos, ele "cai em si" e planeja pedir para ser recebido apenas como um diarista. Mas o que ele encontra ao retornar não é reprovação, mas um pai correndo ao seu encontro, beijando-o e restaurando-lhe a dignidade de filho.`,
    topics: [
      {
        title: 'A Queda e a Ilusão da Terra Distante',
        content: 'O pecado sempre promete liberdade, mas entrega servidão e miséria. Longe do Pai, o homem perde sua dignidade e descobre o vazio da vida sem Deus.'
      },
      {
        title: 'A Corrida do Pai da Graça',
        content: 'Na cultura oriental da época, um patriarca respeitável nunca corria em público. Mas o amor do Pai atropela a pompa para abraçar o filho maltrapilho antes mesmo de ouvir seu discurso preparado.'
      },
      {
        title: 'O Perigo do Filho Mais Velho',
        content: 'O irmão que ficou em casa servia ao pai por obrigação legalista, sem jamais ter entendido o amor do pai. Jesus aponta esse espelho aos religiosos de todas as gerações: é possível estar dentro da casa e ter o coração a mil quilômetros de distância.'
      }
    ],
    questions: [
      'Em quais momentos você já se identificou com o filho pródigo? E com o filho mais velho?',
      'O que o impediu de voltar para Deus com mais rapidez em momentos de falha?',
      'Como reagimos quando alguém que vivia longe de Deus se converte e recebe as bênçãos da graça?'
    ],
    practicalApplication: 'Se você se sente longe de Deus ou indigno por causa de erros passados, volte-se a Ele hoje mesmo em oração sincera. O Pai já está de braços abertos esperando por você.',
    conclusion: 'A mensagem central do Evangelho é o amor escandalosamente gracioso de Deus: Ele não nos trata segundo os nossos pecados, mas nos restitui com vestes de salvação e celebra a nossa volta.',
    referenceVerses: [
      { ref: 'Lucas 15:20-24', link: '/biblia/lucas/15', text: 'E, levantando-se, foi para seu pai; e, quando ainda estava longe, viu-o seu pai, e se moveu de íntima compaixão e, correndo, lançou-se-lhe ao pescoço e o beijou.' },
      { ref: 'Salmos 103:13', link: '/biblia/salmos/103', text: 'Assim como um pai se compadece de seus filhos, assim o Senhor se compadece daqueles que o temem.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  },
  {
    id: 'mat-012',
    slug: 'lideranca-servidora-modelo-neemias',
    type: 'estudo',
    title: 'Liderança Servidora: Lições Práticas do Livro de Neemias',
    category: 'Liderança',
    categorySlug: 'lideranca',
    audience: 'geral',
    level: 'intermediario',
    bibleBook: 'Neemias',
    author: 'Equipe Bíblia Online',
    excerpt: 'Como liderar equipes, famílias e ministérios com oração, planejamento estratégico e resiliência diante da oposição.',
    mainVerse: 'O Deus dos céus é o que nos fará prosperar; e nós, seus servos, nos levantaremos e edificaremos.',
    mainVerseRef: 'Neemias 2:20',
    objectives: [
      'Analisar a conexão entre profunda vida de oração e excelência no planejamento de projetos.',
      'Aprender a motivar pessoas em momentos de desânimo coletivo.',
      'Superar críticas destrutivas e armadilhas de oposição mantendo o foco na obra de Deus.'
    ],
    content: `Neemias ocupava uma posição privilegiada na corte persa como copeiro do rei Artaxerxes. Contudo, ao receber notícias de que os muros de Jerusalém estavam destruídos e seus concidadãos em grande humilhação, seu coração foi profundamente quebrantado.

A resposta de Neemias diante da crise é uma das maiores lições de liderança de toda a literatura universal:
1. Ele não correu para tomar decisões impulsivas; jejuou e orou intensamente confessando os pecados do povo.
2. Pediu permissão ao rei no momento oportuno com planos detalhados de prazos e materiais.
3. Chegou a Jerusalém, inspecionou as ruínas em silêncio à noite antes de fazer qualquer discurso.
4. Convocou o povo dizendo: "Vinde, e reedifiquemos o muro de Jerusalém, e não sejamos mais um opróbrio".

Em apenas 52 dias, contra todas as expectativas e diante de conspirações externas, os muros foram totalmente reconstruídos para a glória de Deus.`,
    topics: [
      {
        title: '1. A Oração como Primeiro Passo',
        content: 'Neemias orou durante quatro meses antes de falar com o rei. O líder bíblico sabe que antes de falar com os homens sobre Deus, precisa falar com Deus sobre os homens.'
      },
      {
        title: '2. Envolvimento e Delegação',
        content: 'O capítulo 3 de Neemias descreve famílias inteiras trabalhando lado a lado, cada uma reconstruindo a parte do muro em frente à sua própria casa. Ele valorizou o senso de pertencimento de cada colaborador.'
      },
      {
        title: '3. A Espada e a Colher de Pedreiro',
        content: 'Diante das ameaças dos inimigos, Neemias organizou o trabalho de forma que com uma mão trabalhavam na obra e com a outra seguravam a arma (Neemias 4:17). Vigilância e trabalho andam de mãos dadas.'
      }
    ],
    questions: [
      'Como você equilibra sua dependência de Deus em oração com o planejamento prático de suas tarefas?',
      'Como você tem lidado com críticas e desânimo quando tenta realizar algo construtivo?',
      'De que maneira você pode incentivar as pessoas que trabalham ou convivem com você?'
    ],
    practicalApplication: 'Identifique um projeto ou problema pendente na sua casa, trabalho ou igreja. Reserve tempo hoje para orar especificamente por ele e elabore um plano de ação em pequenos passos realizáveis.',
    conclusion: 'A verdadeira liderança não busca glória pessoal ou dominação sobre os outros; ela serve com integridade, inspira com o exemplo e aponta sempre para o Deus que tudo sustenta.',
    referenceVerses: [
      { ref: 'Neemias 2:17-18', link: '/biblia/neemias/2', text: 'Vinde, e reedifiquemos o muro de Jerusalém... E declarou-lhes como a mão do meu Deus me fora favorável.' },
      { ref: 'Marcos 10:45', link: '/biblia/marcos/10', text: 'Pois o Filho do homem também não veio para ser servido, mas para servir e dar a sua vida em resgate de muitos.' }
    ],
    tableOfContents: [],
    isDownloadable: true,
    status: 'published',
    createdAt: '2026-09-12T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z'
  }
];

export const STUDY_THEMES = [
  { slug: 'todos', name: 'Todos os Conteúdos' },
  { slug: 'fe', name: 'Fé' },
  { slug: 'vida-crista', name: 'Vida Cristã' },
  { slug: 'oracao', name: 'Oração' },
  { slug: 'familia', name: 'Família' },
  { slug: 'jovens', name: 'Jovens' },
  { slug: 'infantil', name: 'Infantil' },
  { slug: 'escola-dominical', name: 'Escola Dominical' },
  { slug: 'cursos-biblicos', name: 'Cursos & Apostilas' },
  { slug: 'parabolas', name: 'Parábolas' },
  { slug: 'lideranca', name: 'Liderança' },
  { slug: 'sabedoria', name: 'Sabedoria' }
];
