export interface TopicVerse {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleTopic {
  slug: string;
  name: string;
  description: string;
  reflection: string;
  application: string;
  verses: TopicVerse[];
}

const topic = (
  slug: string,
  name: string,
  description: string,
  reflection: string,
  application: string,
  verses: TopicVerse[],
): BibleTopic => ({ slug, name, description, reflection, application, verses });

export const BIBLE_TOPICS: BibleTopic[] = [
  topic("amor", "Amor", "O amor bíblico nasce em Deus e se torna visível no cuidado, na verdade e na entrega.", "Amar é mais que sentir: é escolher servir, perdoar e permanecer fiel.", "Demonstre amor hoje com escuta, ajuda ou reconciliação.", [
    { ref: "1 Coríntios 13:4", book: "1-corintios", chapter: 13, verse: 4, text: "O amor é sofredor, é benigno; o amor não é invejoso." },
    { ref: "1 João 4:19", book: "1-joao", chapter: 4, verse: 19, text: "Nós o amamos a ele porque ele nos amou primeiro." },
  ]),
  topic("fe", "Fé", "Fé é confiar no caráter de Deus e responder à sua Palavra com perseverança.", "A fé caminha com Deus mesmo quando ainda não vê todo o caminho.", "Transforme uma preocupação em oração e dê um passo coerente com sua confiança.", [
    { ref: "Hebreus 11:1", book: "hebreus", chapter: 11, verse: 1, text: "A fé é o firme fundamento das coisas que se esperam." },
    { ref: "Romanos 10:17", book: "romanos", chapter: 10, verse: 17, text: "A fé é pelo ouvir, e o ouvir pela palavra de Deus." },
  ]),
  topic("esperanca", "Esperança", "A esperança cristã se apoia nas promessas de Deus durante a espera.", "Esperança não nega a dor; lembra que ela não possui a palavra final.", "Escreva uma promessa bíblica e releia-a quando o desânimo aparecer.", [
    { ref: "Romanos 15:13", book: "romanos", chapter: 15, verse: 13, text: "O Deus de esperança vos encha de todo o gozo e paz em crença." },
    { ref: "Salmos 42:11", book: "salmos", chapter: 42, verse: 11, text: "Espera em Deus, pois ainda o louvarei." },
  ]),
  topic("protecao", "Proteção", "O cuidado de Deus oferece refúgio, direção e coragem sem alimentar imprudência.", "Confiar em Deus também inclui agir com sabedoria e reconhecer limites.", "Ore pelo seu caminho e tome uma medida prudente de cuidado.", [
    { ref: "Salmos 91:1", book: "salmos", chapter: 91, verse: 1, text: "Aquele que habita no esconderijo do Altíssimo descansará." },
    { ref: "Salmos 121:7", book: "salmos", chapter: 121, verse: 7, text: "O Senhor te guardará de todo o mal." },
  ]),
  topic("forca", "Força", "A força que vem de Deus sustenta pessoas cansadas e as ajuda a continuar.", "A força começa quando admitimos que precisamos de auxílio.", "Divida uma carga com alguém confiável e concentre-se no próximo passo.", [
    { ref: "Filipenses 4:13", book: "filipenses", chapter: 4, verse: 13, text: "Posso todas as coisas naquele que me fortalece." },
    { ref: "Isaías 40:31", book: "isaias", chapter: 40, verse: 31, text: "Os que esperam no Senhor renovarão as forças." },
  ]),
  topic("coragem", "Coragem", "Coragem bíblica é avançar com responsabilidade porque Deus está presente.", "Coragem não é ausência de temor, mas recusar que o medo seja o único conselheiro.", "Prepare o primeiro passo de uma conversa ou decisão que você vem adiando.", [
    { ref: "Josué 1:9", book: "josue", chapter: 1, verse: 9, text: "Esforça-te, e tem bom ânimo; não temas." },
    { ref: "Salmos 27:1", book: "salmos", chapter: 27, verse: 1, text: "O Senhor é a minha luz e a minha salvação; a quem temerei?" },
  ]),
  topic("sabedoria", "Sabedoria", "Sabedoria é decidir de modo justo, prudente e alinhado ao temor do Senhor.", "Informação diz o que pode ser feito; sabedoria considera o que deve ser feito.", "Ore, reúna os fatos e procure conselho maduro antes de decidir.", [
    { ref: "Tiago 1:5", book: "tiago", chapter: 1, verse: 5, text: "Se algum de vós tem falta de sabedoria, peça-a a Deus." },
    { ref: "Provérbios 3:5", book: "proverbios", chapter: 3, verse: 5, text: "Confia no Senhor de todo o teu coração." },
  ]),
  topic("momentos-dificeis", "Momentos difíceis", "Passagens para atravessar perdas, incertezas e dias de cansaço.", "A Escritura permite lamentar e voltar os olhos para a presença fiel de Deus.", "Compartilhe o que sente e procure apoio pastoral ou profissional quando necessário.", [
    { ref: "Salmos 34:18", book: "salmos", chapter: 34, verse: 18, text: "Perto está o Senhor dos que têm o coração quebrantado." },
    { ref: "Mateus 11:28", book: "mateus", chapter: 11, verse: 28, text: "Vinde a mim, todos os que estais cansados e oprimidos." },
  ]),
  topic("familia", "Família", "A Bíblia orienta famílias a cultivar presença, respeito, serviço e reconciliação.", "Uma família saudável aprende a reparar feridas com verdade e graça.", "Crie um momento sem telas para ouvir alguém da sua família.", [
    { ref: "Josué 24:15", book: "josue", chapter: 24, verse: 15, text: "Eu e a minha casa serviremos ao Senhor." },
    { ref: "Colossenses 3:13", book: "colossenses", chapter: 3, verse: 13, text: "Suportando-vos e perdoando-vos uns aos outros." },
  ]),
  topic("oracao", "Oração", "Orar é apresentar a vida a Deus com sinceridade, gratidão, pedido e escuta.", "A oração não exige palavras sofisticadas, mas verdade no coração.", "Separe cinco minutos para agradecer, confessar, pedir e permanecer em silêncio.", [
    { ref: "Filipenses 4:6", book: "filipenses", chapter: 4, verse: 6, text: "As vossas petições sejam conhecidas diante de Deus pela oração." },
    { ref: "1 Tessalonicenses 5:17", book: "1-tessalonicenses", chapter: 5, verse: 17, text: "Orai sem cessar." },
  ]),
  topic("perdao", "Perdão", "O perdão recebe a graça de Deus e interrompe ciclos de vingança sem negar justiça.", "Perdoar não chama o mal de bem nem exige reconciliação sem segurança.", "Ore por liberdade da amargura e mantenha limites saudáveis.", [
    { ref: "Efésios 4:32", book: "efesios", chapter: 4, verse: 32, text: "Perdoando-vos uns aos outros, como Deus vos perdoou em Cristo." },
    { ref: "Mateus 6:14", book: "mateus", chapter: 6, verse: 14, text: "Se perdoardes aos homens, também vosso Pai vos perdoará." },
  ]),
  topic("gratidao", "Gratidão", "Gratidão reconhece a bondade de Deus nas grandes dádivas e no cotidiano.", "A gratidão não silencia a dor; impede que ela apague toda a graça presente.", "Registre três motivos específicos de gratidão e agradeça a alguém.", [
    { ref: "1 Tessalonicenses 5:18", book: "1-tessalonicenses", chapter: 5, verse: 18, text: "Em tudo dai graças." },
    { ref: "Salmos 100:4", book: "salmos", chapter: 100, verse: 4, text: "Entrai pelas portas dele com gratidão." },
  ]),
  topic("deus", "Deus", "As Escrituras apresentam Deus como Criador, santo, justo, misericordioso e próximo.", "Conhecer a Deus transforma nossa identidade, nossos limites e nosso propósito.", "Leia um salmo e anote o que ele revela sobre o caráter de Deus.", [
    { ref: "Salmos 46:1", book: "salmos", chapter: 46, verse: 1, text: "Deus é o nosso refúgio e fortaleza." },
    { ref: "1 João 4:8", book: "1-joao", chapter: 4, verse: 8, text: "Deus é amor." },
  ]),
  topic("jesus", "Jesus", "Jesus Cristo revela o Pai, anuncia o Reino e oferece reconciliação.", "Os Evangelhos convidam a ouvir Jesus, segui-lo e aprender seu caminho.", "Leia um trecho de um Evangelho e observe o que Jesus revela e chama a praticar.", [
    { ref: "João 14:6", book: "joao", chapter: 14, verse: 6, text: "Eu sou o caminho, e a verdade e a vida." },
    { ref: "Mateus 11:29", book: "mateus", chapter: 11, verse: 29, text: "Aprendei de mim, que sou manso e humilde de coração." },
  ]),
  topic("paz", "Paz", "A paz bíblica guarda o coração e orienta relações mesmo em tempos instáveis.", "Paz não é passividade; inclui verdade, justiça, reconciliação e confiança em Deus.", "Reduza uma fonte de agitação e dê hoje um passo em direção à reconciliação.", [
    { ref: "João 14:27", book: "joao", chapter: 14, verse: 27, text: "Deixo-vos a paz, a minha paz vos dou." },
    { ref: "Filipenses 4:7", book: "filipenses", chapter: 4, verse: 7, text: "A paz de Deus guardará os vossos corações e sentimentos." },
  ]),
];

export const getBibleTopic = (slug: string) => BIBLE_TOPICS.find((item) => item.slug === slug);