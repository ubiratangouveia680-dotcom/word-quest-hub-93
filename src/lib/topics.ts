export interface TopicVerse {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface TopicFaq {
  q: string;
  a: string;
}

export interface BibleTopic {
  slug: string;
  name: string;
  description: string;
  reflection: string;
  application: string;
  verses: TopicVerse[];
  faq?: TopicFaq[];
  relatedPrayers?: { name: string; link: string }[];
  relatedChapters?: { name: string; link: string }[];
}

const topic = (
  slug: string,
  name: string,
  description: string,
  reflection: string,
  application: string,
  verses: TopicVerse[],
  faq?: TopicFaq[],
  relatedPrayers?: { name: string; link: string }[],
  relatedChapters?: { name: string; link: string }[],
): BibleTopic => ({
  slug,
  name,
  description,
  reflection,
  application,
  verses,
  ...(faq ? { faq } : {}),
  ...(relatedPrayers ? { relatedPrayers } : {}),
  ...(relatedChapters ? { relatedChapters } : {}),
});

export const BIBLE_TOPICS: BibleTopic[] = [
  topic(
    "amor",
    "Amor",
    "O amor bíblico nasce no próprio Deus e se expressa em cuidado concreto, fidelidade, verdade e doação abnegada.",
    "Amar bíblicamente é mais do que emoção passageira: é um compromisso deliberado de buscar o bem do próximo, perdoar faltas e refletir o amor redentor de Cristo.",
    "Demonstre amor hoje com uma atitude prática de serviço, reconciliação ou escuta atenta a alguém que precisa.",
    [
      { ref: "1 Coríntios 13:4-7", book: "1-corintios", chapter: 13, verse: 4, text: "O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece, não se porta com indecência, não busca os seus interesses, não se irrita, não suspeita mal." },
      { ref: "1 João 4:19", book: "1-joao", chapter: 4, verse: 19, text: "Nós o amamos a ele porque ele nos amou primeiro." },
      { ref: "João 15:12", book: "joao", chapter: 15, verse: 12, text: "O meu mandamento é este: Que vos ameis uns aos outros, assim como eu vos amei." },
    ],
    [
      { q: "Qual é a maior definição de amor na Bíblia?", a: "Em 1 Coríntios 13 e 1 João 4:8, as Escrituras ensinam que Deus é amor, e que o amor cristão (ágape) busca o bem eterno do próximo antes de seus próprios interesses." },
      { q: "Como praticar o amor quando é difícil conviver?", a: "O amor bíblico é uma decisão de respeito e benevolência, exercitado mediante o perdão e a oração pela outra pessoa, mesmo quando sentimentos afetuosos não estão presentes." },
    ],
    [{ name: "Oração pela família", link: "/oracoes/oracao-pela-familia" }],
    [{ name: "1 Coríntios 13", link: "/biblia/1-corintios/13" }, { name: "1 João 4", link: "/biblia/1-joao/4" }]
  ),

  topic(
    "fe",
    "Fé",
    "Fé é confiar no caráter, nas promessas e na fidelidade de Deus, respondendo à Sua Palavra com obediência e constância.",
    "A fé não é ignorar a realidade dos desafios, mas crer que o poder e a bondade do Senhor são maiores do que qualquer impossibilidade visível.",
    "Apresente uma preocupação concreta a Deus em oração e dê um passo de obediência coerente com sua confiança Nele.",
    [
      { ref: "Hebreus 11:1", book: "hebreus", chapter: 11, verse: 1, text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem." },
      { ref: "Romanos 10:17", book: "romanos", chapter: 10, verse: 17, text: "De sorte que a fé é pelo ouvir, e o ouvir pela palavra de Deus." },
      { ref: "2 Coríntios 5:7", book: "2-corintios", chapter: 5, verse: 7, text: "Porque andamos por fé, e não por vista." },
    ],
    [
      { q: "Como aumentar a fé segundo a Bíblia?", a: "De acordo com Romanos 10:17, a fé cresce pelo contato diário com a Palavra de Deus e pela prática obediente em meio às experiências da vida." },
    ],
    [{ name: "Oração de esperança", link: "/oracoes/oracao-de-esperanca" }],
    [{ name: "Hebreus 11", link: "/biblia/hebreus/11" }, { name: "Romanos 4", link: "/biblia/romanos/4" }]
  ),

  topic(
    "esperanca",
    "Esperança",
    "A esperança bíblica é uma âncora firme da alma, fundamentada na certeza de que Deus cumpre todas as Suas promessas no tempo certo.",
    "Ter esperança não significa negar a dor do presente, mas lembrar com convicção de que as tribulações atuais não têm a palavra final.",
    "Anote uma promessa bíblica de esperança e leia-a em momentos de incerteza durante o seu dia.",
    [
      { ref: "Romanos 15:13", book: "romanos", chapter: 15, verse: 13, text: "Ora o Deus de esperança vos encha de todo o gozo e paz em crença, para que abundeis em esperança pela virtude do Espírito Santo." },
      { ref: "Salmos 42:11", book: "salmos", chapter: 42, verse: 11, text: "Por que estás abatida, ó minha alma, e por que te perturbas dentro de mim? Espera em Deus, pois ainda o louvarei, o qual é a salvação da minha face e o meu Deus." },
      { ref: "Jeremias 29:11", book: "jeremias", chapter: 29, verse: 11, text: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais." },
    ],
    [
      { q: "Qual a diferença entre esperança comum e bíblica?", a: "A esperança humana comum é um mero desejo de que algo aconteça, enquanto a esperança bíblica é uma certeza inabalável alicerçada no caráter fiel de Deus." },
    ],
    [{ name: "Oração de esperança", link: "/oracoes/oracao-de-esperanca" }],
    [{ name: "Salmos 42", link: "/biblia/salmos/42" }, { name: "Romanos 8", link: "/biblia/romanos/8" }]
  ),

  topic(
    "protecao",
    "Proteção",
    "As Escrituras revelam Deus como refúgio seguro, torre forte e escudo protetor para aqueles que Nele confiam.",
    "A promessa da proteção divina traz paz interior sem estimular imprudência; Deus nos cerca de cuidado e nos orienta a agir com sabedoria.",
    "Ore pedindo a proteção de Deus sobre sua família e tome medidas conscientes de prudência no seu dia a dia.",
    [
      { ref: "Salmos 91:1-2", book: "salmos", chapter: 91, verse: 1, text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei." },
      { ref: "Salmos 121:7-8", book: "salmos", chapter: 121, verse: 7, text: "O Senhor te guardará de todo o mal; guardará a tua alma. O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre." },
    ],
    [
      { q: "O que a Bíblia ensina no Salmo 91?", a: "O Salmo 91 declara que quem faz do Senhor sua habitação permanente encontra refúgio espiritual contra ciladas, temores e perigos da vida." },
    ],
    [{ name: "Oração por proteção", link: "/oracoes/oracao-por-protecao" }],
    [{ name: "Salmos 91", link: "/biblia/salmos/91" }, { name: "Salmos 121", link: "/biblia/salmos/121" }]
  ),

  topic(
    "ansiedade",
    "Ansiedade",
    "A Bíblia reconhece as aflições do coração e convida o crente a descarregar suas inquietações na presença de Deus através da oração com súplica e ação de graças.",
    "Vencer a ansiedade bíblica não é fingir calma externa, mas transferir o fardo do controle imaginário para Aquele que realmente rege todas as coisas.",
    "Faça uma pausa de silêncio, anote o que está provocando angústia e entregue cada detalhe em oração sincera ao Senhor.",
    [
      { ref: "Filipenses 4:6-7", book: "filipenses", chapter: 4, verse: 6, text: "Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus." },
      { ref: "1 Pedro 5:7", book: "1-pedro", chapter: 5, verse: 7, text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós." },
      { ref: "Mateus 6:34", book: "mateus", chapter: 6, verse: 34, text: "Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal." },
    ],
    [
      { q: "O que Jesus ensinou sobre a ansiedade no Sermão da Montanha?", a: "Em Mateus 6, Jesus usou as aves do céu e os lírios do campo para demonstrar que o Pai cuida de nós e que a preocupação não pode acrescentar um côvado à nossa vida." },
    ],
    [{ name: "Oração antes de dormir", link: "/oracoes/oracao-antes-de-dormir" }],
    [{ name: "Filipenses 4", link: "/biblia/filipenses/4" }, { name: "Mateus 6", link: "/biblia/mateus/6" }]
  ),

  topic(
    "paz",
    "Paz",
    "A paz bíblica (shalom) é muito mais do que ausência de conflitos: é integridade, harmonia com Deus, serenidade de mente e retidão relacional.",
    "A paz que Cristo dá não depende de circunstâncias perfeitas no ambiente ao nosso redor, pois ela opera como sentinela que guarda o coração por dentro.",
    "Decida hoje ser promotor de paz: peça desculpas caso tenha ofendido alguém e evite discussões desnecessárias.",
    [
      { ref: "João 14:27", book: "joao", chapter: 14, verse: 27, text: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize." },
      { ref: "Isaías 26:3", book: "isaias", chapter: 26, verse: 3, text: "Tu conservarás em paz aquele cuja mente está firme em ti; porque ele confia em ti." },
    ],
    [
      { q: "Como desfrutar da paz de Deus no dia a dia?", a: "Mantendo a mente firmada na fidelidade divina e entregando petições em oração contínua, permitindo que a paz de Cristo arbitre as reações do coração." },
    ],
    [{ name: "Oração da noite", link: "/oracoes/oracao-da-noite" }],
    [{ name: "João 14", link: "/biblia/joao/14" }, { name: "Isaías 26", link: "/biblia/isaias/26" }]
  ),

  topic(
    "familia",
    "Família",
    "O projeto divino para a família fundamenta-se no respeito mútuo, na honra, no cuidado com os vulneráveis e na transmissão dos princípios sagrados.",
    "Um lar forte é edificado diariamente na prática do perdão e da comunicação amorosa, e não na expectativa irrealista de perfeição humana.",
    "Reúna a família ou entre em contato com um familiar hoje para manifestar afeto, apreço e oração.",
    [
      { ref: "Josué 24:15", book: "josue", chapter: 24, verse: 15, text: "Porém eu e a minha casa serviremos ao Senhor." },
      { ref: "Salmos 127:1", book: "salmos", chapter: 127, verse: 1, text: "Se o Senhor não edificar a casa, em vão trabalham os que a edificam; se o Senhor não guardar a cidade, em vão vigia a sentinela." },
      { ref: "Colossenses 3:13-14", book: "colossenses", chapter: 3, verse: 13, text: "Suportando-vos uns aos outros, e perdoando-vos uns aos outros, se algum tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também." },
    ],
    [
      { q: "Qual o princípio bíblico essencial para a convivência em família?", a: "O respeito mútuo, o perdão rápido e a centralidade da Palavra de Deus como guia para decisões e resolução de conflitos." },
    ],
    [{ name: "Oração pela família", link: "/oracoes/oracao-pela-familia" }],
    [{ name: "Salmos 127", link: "/biblia/salmos/127" }, { name: "Efésios 5", link: "/biblia/efesios/5" }]
  ),

  topic(
    "casamento",
    "Casamento",
    "O matrimônio é uma aliança sagrada diante de Deus que reflete a fidelidade, a entrega e a união entre Cristo e a Sua Igreja.",
    "A estabilidade conjugal se constrói na perseverança diária do amor ágape, na paciência mútua e na renúncia ao egoísmo.",
    "Surpreenda seu cônjuge com um gesto de gratidão, palavra de encorajamento ou tempo de qualidade a dois.",
    [
      { ref: "Gênesis 2:24", book: "genesis", chapter: 2, verse: 24, text: "Portanto deixará o homem o seu pai e a sua mãe, e apegar-se-á à sua mulher, e serão ambos uma carne." },
      { ref: "Efésios 5:25", book: "efesios", chapter: 5, verse: 25, text: "Vós, maridos, amai vossas mulheres, como também Cristo amou a igreja, e a si mesmo se entregou por ela." },
      { ref: "Eclesiastes 4:12", book: "eclesiastes", chapter: 4, verse: 12, text: "E, se alguém prevalecer contra um, os dois lhe resistirão; e o cordão de três dobras não se quebra tão depressa." },
    ],
    [
      { q: "O que significa o 'cordão de três dobras' no casamento?", a: "Representa a união entre marido, mulher e Deus no centro da aliança, tornando o vínculo conjugal infinitamente mais resistente às crises." },
    ],
    [{ name: "Oração pela família", link: "/oracoes/oracao-pela-familia" }],
    [{ name: "Efésios 5", link: "/biblia/efesios/5" }, { name: "1 Coríntios 13", link: "/biblia/1-corintios/13" }]
  ),

  topic(
    "filhos",
    "Filhos",
    "As Escrituras declaram que os filhos são herança preciosa do Senhor, confiados aos pais para serem educados com amor, sabedoria e exemplo íntegro.",
    "O maior investimento na vida dos filhos é o exemplo moral consistente e a cobertura contínua de oração intercessória diária.",
    "Dedique tempo exclusivo para ouvir seus filhos com empatia e ore individualmente por cada um deles hoje.",
    [
      { ref: "Salmos 127:3", book: "salmos", chapter: 127, verse: 3, text: "Eis que os filhos são herança do Senhor, e o fruto do ventre o seu galardão." },
      { ref: "Provérbios 22:6", book: "proverbios", chapter: 22, verse: 6, text: "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele." },
    ],
    [
      { q: "Qual a principal instrução bíblica aos pais?", a: "Instruir os filhos no conhecimento do Senhor com amor, sem exasperá-los, servindo como modelo vivo de integridade e fé." },
    ],
    [{ name: "Oração pelos filhos", link: "/oracoes/oracao-pelos-filhos" }],
    [{ name: "Salmos 127", link: "/biblia/salmos/127" }, { name: "Provérbios 22", link: "/biblia/proverbios/22" }]
  ),

  topic(
    "amizade",
    "Amizade",
    "A verdadeira amizade bíblica é leal, generosa, disposta a falar a verdade com amor e permanece presente nos dias de crise.",
    "Bons amigos são presentes providenciais que nos ajudam a manter o foco espiritual e oferecem consolo sincero nos momentos de aflição.",
    "Envie uma mensagem sincera a um amigo fiel hoje, expressando gratidão por sua presença e apoio na caminhada.",
    [
      { ref: "Provérbios 17:17", book: "proverbios", chapter: 17, verse: 17, text: "Em todo o tempo ama o amigo e para a hora da angústia nasce o irmão." },
      { ref: "Provérbios 27:17", book: "proverbios", chapter: 27, verse: 17, text: "Como o ferro com o ferro se aguça, assim o homem afia o rosto do seu amigo." },
      { ref: "João 15:13", book: "joao", chapter: 15, verse: 13, text: "Ninguém tem maior amor do que este, de dar alguém a sua vida pelos seus amigos." },
    ],
    [
      { q: "Qual o maior exemplo de amizade na Bíblia?", a: "A amizade leal e desinteressada entre Davi e Jônatas, relatada em 1 Samuel, e o ensinamento de Jesus chamando Seus discípulos de amigos." },
    ],
    [{ name: "Oração de agradecimento", link: "/oracoes/oracao-de-agradecimento" }],
    [{ name: "Provérbios 27", link: "/biblia/proverbios/27" }, { name: "João 15", link: "/biblia/joao/15" }]
  ),

  topic(
    "perdao",
    "Perdão",
    "O perdão bíblico é uma resposta agradecida à graça de Deus que perdoou todas as nossas faltas, quebrando o ciclo corrosivo do ressentimento.",
    "Perdoar não é fingir que a ofensa não existiu nem autorizar novos abusos; é soltar o direito da vingança pessoal nas mãos da justiça divina.",
    "Renuncie hoje em oração a qualquer desejo de retaliação e peça a Deus para libertar seu coração da amargura.",
    [
      { ref: "Efésios 4:32", book: "efesios", chapter: 4, verse: 32, text: "Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo." },
      { ref: "Mateus 6:14-15", book: "mateus", chapter: 6, verse: 14, text: "Porque, se perdoardes aos homens as suas ofensas, também vosso Pai celestial vos perdoará a vós; se, porém, não perdoardes aos homens as suas ofensas, também vosso Pai vos não perdoará as vossas ofensas." },
      { ref: "Colossenses 3:13", book: "colossenses", chapter: 3, verse: 13, text: "Suportando-vos e perdoando-vos uns aos outros... assim como Cristo vos perdoou, assim fazei vós também." },
    ],
    [
      { q: "Perdoar significa conviver da mesma forma?", a: "O perdão é incondicional no coração, mas a reconciliação e a restauração de confiança dependem do arrependimento genuíno e de limites saudáveis de segurança." },
    ],
    [{ name: "Oração da noite", link: "/oracoes/oracao-da-noite" }],
    [{ name: "Mateus 18", link: "/biblia/mateus/18" }, { name: "Efésios 4", link: "/biblia/efesios/4" }]
  ),

  topic(
    "gratidao",
    "Gratidão",
    "A gratidão é o reconhecimento consciente de que tudo o que temos de bom procede da infinita generosidade de Deus.",
    "Cultivar um coração grato transforma a perspectiva sobre a vida: dissipa a inveja, neutraliza a queixa e amplia o contentamento.",
    "Liste mentalmente ou no papel cinco bênçãos específicas recebidas hoje e agradeça a Deus por cada uma.",
    [
      { ref: "1 Tessalonicenses 5:18", book: "1-tessalonicenses", chapter: 5, verse: 18, text: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." },
      { ref: "Salmos 103:1-2", book: "salmos", chapter: 103, verse: 1, text: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome. Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios." },
    ],
    [
      { q: "Como dar graças 'em tudo' quando as coisas dão errado?", a: "A Bíblia ensina a dar graças 'em tudo', e não 'por tudo'. Mesmo em dificuldades, podemos agradecer pela presença, sustento e fidelidade de Deus." },
    ],
    [{ name: "Oração de agradecimento", link: "/oracoes/oracao-de-agradecimento" }],
    [{ name: "Salmos 103", link: "/biblia/salmos/103" }, { name: "Salmos 100", link: "/biblia/salmos/100" }]
  ),

  topic(
    "sabedoria",
    "Sabedoria",
    "A verdadeira sabedoria bíblica começa no temor do Senhor e se traduz na habilidade prática de discernir o bem e escolher o caminho justo.",
    "Enquanto a inteligência acumula dados e informações, a sabedoria divina direciona as motivações do coração para escolhas que edificam a vida.",
    "Antes de tomar uma decisão importante hoje, peça a Deus discernimento sincero em oração e consulte conselheiros prudentes.",
    [
      { ref: "Tiago 1:5", book: "tiago", chapter: 1, verse: 5, text: "E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada." },
      { ref: "Provérbios 3:5-6", book: "proverbios", chapter: 3, verse: 5, text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
      { ref: "Provérbios 9:10", book: "proverbios", chapter: 9, verse: 10, text: "O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo a prudência." },
    ],
    [
      { q: "Qual a promessa para quem pede sabedoria a Deus?", a: "Tiago 1:5 garante que Deus concede sabedoria com generosidade a todo aquele que pedir com fé sincera, sem censura." },
    ],
    [{ name: "Oração por sabedoria", link: "/oracoes/oracao-por-sabedoria" }],
    [{ name: "Provérbios 3", link: "/biblia/proverbios/3" }, { name: "Tiago 1", link: "/biblia/tiago/1" }]
  ),

  topic(
    "forca",
    "Força",
    "O Senhor é a fonte inesgotável de vigor espiritual, físico e moral para os cansados e oprimidos pela caminhada.",
    "A verdadeira força do cristão não nasce na autossuficiência orgulhosa, mas na humildade de depender do poder de Deus aperfeiçoado em nossa fraqueza.",
    "Assuma seus limites diante de Deus e peça a Ele que derrame novo vigor para cumprir com excelência o seu dever de hoje.",
    [
      { ref: "Filipenses 4:13", book: "filipenses", chapter: 4, verse: 13, text: "Posso todas as coisas naquele que me fortalece." },
      { ref: "Isaías 40:29-31", book: "isaias", chapter: 40, verse: 29, text: "Dá força ao cansado, e multiplica as forças ao que não tem nenhum vigor... os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão." },
      { ref: "2 Coríntios 12:9", book: "2-corintios", chapter: 12, verse: 9, text: "E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza." },
    ],
    [
      { q: "O que significa 'Posso todas as coisas naquele que me fortalece'?", a: "No contexto de Filipenses 4, Paulo ensina que Cristo concede força para viver contente e fiel em qualquer circunstância: seja na fartura ou na escassez." },
    ],
    [{ name: "Oração de fortalecimento", link: "/oracoes/oracao-de-fortalecimento" }],
    [{ name: "Isaías 40", link: "/biblia/isaias/40" }, { name: "Filipenses 4", link: "/biblia/filipenses/4" }]
  ),

  topic(
    "coragem",
    "Coragem",
    "A coragem bíblica não é ausência de medo, mas a decisão firme de obedecer e avançar sustentado pela certeza de que Deus está com você.",
    "Quando o Senhor ordena ter bom ânimo, Ele não nos envia desamparados: Sua presença soberana é o fundamento de toda audácia justa.",
    "Enfrente hoje aquela conversa ou tarefa desafiadora que você vinha procrastinando por receio do resultado.",
    [
      { ref: "Josué 1:9", book: "josue", chapter: 1, verse: 9, text: "Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares." },
      { ref: "Salmos 27:1", book: "salmos", chapter: 27, verse: 1, text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?" },
    ],
    [
      { q: "Qual o fundamento da coragem cristã?", a: "A promessa irrevogável da presença constante de Deus: 'O Senhor teu Deus é contigo por onde quer que andares' (Josué 1:9)." },
    ],
    [{ name: "Oração de fortalecimento", link: "/oracoes/oracao-de-fortalecimento" }],
    [{ name: "Josué 1", link: "/biblia/josue/1" }, { name: "Salmos 27", link: "/biblia/salmos/27" }]
  ),

  topic(
    "prosperidade",
    "Prosperidade",
    "Na perspectiva bíblica, a genuína prosperidade engloba fidelidade a Deus, suficiência material, generosidade com os necessitados e paz de espírito.",
    "A Bíblia adverte com firmeza contra a avareza e a ganância, ensinando que a riqueza honesta provém da bênção do Senhor aliada ao trabalho digno.",
    "Avalie suas finanças com critérios bíblicos: seja generoso com alguém necessitado e evite endividamentos imprudentes.",
    [
      { ref: "Provérbios 10:22", book: "proverbios", chapter: 10, verse: 22, text: "A bênção do Senhor é que enriquece; e não traz consigo dores." },
      { ref: "Salmos 1:1-3", book: "salmos", chapter: 1, verse: 3, text: "Pois será como a árvore plantada junto a ribeiros de águas, a qual dá o seu fruto na estação própria... e tudo quanto fizer prosperará." },
      { ref: "3 João 1:2", book: "3-joao", chapter: 1, verse: 2, text: "Amado, desejo que te vá bem em todas as coisas, e que tenhas saúde, assim como bem vai a tua alma." },
    ],
    [
      { q: "O que a Bíblia ensina sobre a prosperidade autêntica?", a: "Ensinar que a verdadeira prosperidade começa na saúde da alma e se expressa em integridade moral, contentamento e coração generoso para repartir." },
    ],
    [{ name: "Oração pelo trabalho", link: "/oracoes/oracao-pelo-trabalho" }],
    [{ name: "Salmos 1", link: "/biblia/salmos/1" }, { name: "Provérbios 3", link: "/biblia/proverbios/3" }]
  ),

  topic(
    "trabalho",
    "Trabalho",
    "O trabalho foi instituído por Deus antes mesmo da queda humana como uma forma digna de cocriação, serviço à comunidade e honra ao Senhor.",
    "Quando trabalhamos com excelência e integridade de coração, qualquer ofício honesto se torna uma oferta de adoração a Deus.",
    "Execute suas funções profissionais hoje com esmero e gentileza, lembrando que seu trabalho presta serviço ao próprio Deus.",
    [
      { ref: "Colossenses 3:23-24", book: "colossenses", chapter: 3, verse: 23, text: "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens; sabendo que recebereis do Senhor o galardão da herança, porque a Cristo, o Senhor, servis." },
      { ref: "Provérbios 16:3", book: "proverbios", chapter: 16, verse: 3, text: "Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos." },
    ],
    [
      { q: "Como enxergar o trabalho diário como vocação?", a: "Reconhecendo que toda profissão ética que atende necessidades humanas cumpre o mandato divino de cuidar do próximo e manifestar justiça." },
    ],
    [{ name: "Oração pelo trabalho", link: "/oracoes/oracao-pelo-trabalho" }],
    [{ name: "Colossenses 3", link: "/biblia/colossenses/3" }, { name: "Provérbios 16", link: "/biblia/proverbios/16" }]
  ),

  topic(
    "saude",
    "Saúde",
    "A Bíblia valoriza o corpo como templo do Espírito Santo e nos exorta a cuidar da saúde física, emocional e espiritual com prudência e fé.",
    "A oração por saúde e alívio do sofrimento caminha em harmonia com a busca responsável por tratamento médico e disciplina nos hábitos.",
    "Pratique hoje um cuidado concreto com seu corpo: alimente-se de maneira saudável, descanse no momento adequado e ore pela sua restauração.",
    [
      { ref: "Jeremias 17:14", book: "jeremias", chapter: 17, verse: 14, text: "Cura-me, Senhor, e sararei; salva-me, e serei salvo; porque tu és o meu louvor." },
      { ref: "1 Coríntios 6:19-20", book: "1-corintios", chapter: 6, verse: 19, text: "Ou não sabeis que o vosso corpo é o templo do Espírito Santo, que habita em vós, proveniente de Deus, e que não sois de vós mesmos?" },
    ],
    [
      { q: "A fé bíblica substitui os cuidados médicos?", a: "Não. A Bíblia retrata médicos como Lucas com apreço e valoriza remédios e prudência, demonstrando que Deus age tanto por meio da ciência quanto de Sua soberana graça." },
    ],
    [{ name: "Oração por saúde", link: "/oracoes/oracao-por-saude" }],
    [{ name: "Salmos 103", link: "/biblia/salmos/103" }, { name: "Jeremias 17", link: "/biblia/jeremias/17" }]
  ),

  topic(
    "medo",
    "Medo",
    "O medo paralisante é combatido nas Escrituras com a revelação constante da proximidade e da soberania salvadora de Deus.",
    "Ter medo diante de ameaças é uma reação natural da fragilidade humana; o chamado bíblico é não permitir que o medo determine nossas decisões.",
    "Quando sentir o coração apertado pelo medo, declare em voz alta o versículo do Salmo 56:3 e descanse sob o cuidado do Altíssimo.",
    [
      { ref: "Salmos 56:3", book: "salmos", chapter: 56, verse: 3, text: "Em qualquer tempo em que eu temer, confiarei em ti." },
      { ref: "Isaías 41:10", book: "isaias", chapter: 41, verse: 10, text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça." },
      { ref: "2 Timóteo 1:7", book: "2-timoteo", chapter: 1, verse: 7, text: "Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação." },
    ],
    [
      { q: "Quantas vezes a Bíblia diz 'Não temas'?", a: "A expressão e suas variantes aparecem centenas de vezes nas Escrituras, lembrando que a presença protetora de Deus é o antídoto constante contra o pavor." },
    ],
    [{ name: "Oração por proteção", link: "/oracoes/oracao-por-protecao" }],
    [{ name: "Isaías 41", link: "/biblia/isaias/41" }, { name: "Salmos 27", link: "/biblia/salmos/27" }]
  ),

  topic(
    "tristeza",
    "Tristeza",
    "A Bíblia acolhe a tristeza humana com ternura e misericórdia, assegurando que o choro pode durar uma noite, mas a alegria vem ao amanhecer.",
    "Lamentar diante de Deus não é pecado nem falta de fé: homens de Deus como Davi e o próprio Jesus choraram, ensinando-nos a derramar a dor em prece.",
    "Não represe seu sofrimento: converse com Deus em oração íntima e procure o abraço acolhedor de pessoas de confiança.",
    [
      { ref: "Salmos 34:18", book: "salmos", chapter: 34, verse: 18, text: "Perto está o Senhor dos que têm o coração quebrantado, e salva os contritos de espírito." },
      { ref: "Salmos 30:5", book: "salmos", chapter: 30, verse: 5, text: "O choro pode durar uma noite, mas a alegria vem pela manhã." },
      { ref: "Mateus 5:4", book: "mateus", chapter: 5, verse: 4, text: "Bem-aventurados os que choram, porque eles serão consolados." },
    ],
    [
      { q: "Jesus chorou na Bíblia?", a: "Sim, em João 11:35 relata-se o menor versículo da Bíblia: 'Jesus chorou', demonstrando Sua profunda empatia e compaixão diante da dor da perda humana." },
    ],
    [{ name: "Oração em momentos difíceis", link: "/oracoes/oracao-em-momentos-dificeis" }],
    [{ name: "Salmos 34", link: "/biblia/salmos/34" }, { name: "Salmos 42", link: "/biblia/salmos/42" }]
  ),

  topic(
    "felicidade",
    "Felicidade",
    "A verdadeira bem-aventurança bíblica transcende o prazer efêmero do mundo e brota da comunhão viva com Deus e da retidão de coração.",
    "Ser feliz segundo a Bíblia é desfrutar de uma consciência limpa, da certeza do perdão e da esperança viva que o mundo não pode roubar.",
    "Celebre uma vitória de alguém próximo e agradeça a Deus pelas fontes de alegria pura presentes no seu cotidiano.",
    [
      { ref: "Salmos 144:15", book: "salmos", chapter: 144, verse: 15, text: "Bem-aventurado o povo a quem assim sucede; bem-aventurado é o povo cujo Deus é o Senhor." },
      { ref: "Salmos 16:11", book: "salmos", chapter: 16, verse: 11, text: "Far-me-ás ver a vereda da vida; na tua presença há fartura de alegrias; à tua mão direita há delícias perpetuamente." },
    ],
    [
      { q: "O que significa 'bem-aventurado' na Bíblia?", a: "Significa ser plenamente feliz, abençoado e aprovado por Deus, desfrutando de uma paz e dignidade espiritual que não dependem do acúmulo material." },
    ],
    [{ name: "Oração de agradecimento", link: "/oracoes/oracao-de-agradecimento" }],
    [{ name: "Salmos 16", link: "/biblia/salmos/16" }, { name: "Mateus 5", link: "/biblia/mateus/5" }]
  ),

  topic(
    "confianca-em-deus",
    "Confiança em Deus",
    "Confiar no Senhor é descansar seguro na Sua soberania, sabendo que Seus caminhos e pensamentos são infinitamente mais elevados que os nossos.",
    "A confiança se prova nas encruzilhadas da vida, quando abrimos mão da autossuficiência e nos submetemos à direção sábia do Pai celestial.",
    "Entregue uma situação que foge ao seu controle pessoal a Deus e decida não gastar energia tentando adivinhar desfechos futuros.",
    [
      { ref: "Provérbios 3:5-6", book: "proverbios", chapter: 3, verse: 5, text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
      { ref: "Salmos 37:5", book: "salmos", chapter: 37, verse: 5, text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará." },
    ],
    [
      { q: "Como confiar em Deus quando tudo parece dar errado?", a: "Recordando o histórico da fidelidade de Deus no passado e lembrando que Romanos 8:28 ensina que todas as coisas cooperam para o bem dos que O amam." },
    ],
    [{ name: "Oração de fortalecimento", link: "/oracoes/oracao-de-fortalecimento" }],
    [{ name: "Provérbios 3", link: "/biblia/proverbios/3" }, { name: "Salmos 37", link: "/biblia/salmos/37" }]
  ),

  topic(
    "oracao",
    "Oração",
    "Orar é dialogar com Deus com sinceridade, reverência e intimidade, abrindo o coração para louvar, confessar, suplicar e ouvir Sua voz.",
    "A oração transforma não apenas as circunstâncias, mas primordialmente a mente de quem ora, alinhando nossos desejos com a santa vontade do Pai.",
    "Reserve dez minutos de recolhimento sem ruídos para falar espontaneamente com Deus hoje sobre sua vida.",
    [
      { ref: "Filipenses 4:6", book: "filipenses", chapter: 4, verse: 6, text: "Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças." },
      { ref: "1 Tessalonicenses 5:17", book: "1-tessalonicenses", chapter: 5, verse: 17, text: "Orai sem cessar." },
      { ref: "Mateus 6:9-13", book: "mateus", chapter: 6, verse: 9, text: "Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome..." },
    ],
    [
      { q: "Qual a maneira correta de orar segundo Jesus?", a: "Jesus ensinou no Sermão da Montanha a orar em secreto, sem vãs repetições hipócritas, usando o modelo do Pai Nosso com foco na glória de Deus e nas necessidades reais." },
    ],
    [{ name: "Oração da manhã", link: "/oracoes/oracao-da-manha" }],
    [{ name: "Mateus 6", link: "/biblia/mateus/6" }, { name: "Filipenses 4", link: "/biblia/filipenses/4" }]
  ),

  topic(
    "perseveranca",
    "Perseverança",
    "A perseverança bíblica é a firmeza constante de permanecer no caminho da fé diante das oposições, cansaços e demoras da jornada.",
    "Quem persevera compreende que a coroa da vida e a maturidade espiritual são forjadas na paciência em meio às provações.",
    "Não desista daquele projeto ético ou ministério nobre apenas porque encontrou resistência inicial; ore e continue trabalhando.",
    [
      { ref: "Hebreus 12:1-2", book: "hebreus", chapter: 12, verse: 1, text: "Corramos com paciência a carreira que nos está proposta, olhando para Jesus, autor e consumador da fé." },
      { ref: "Gálatas 6:9", book: "galatas", chapter: 6, verse: 9, text: "E não nos cansemos de fazer bem, porque a seu tempo ceifaremos, se não houvermos desfalecido." },
    ],
    [
      { q: "O que a Bíblia diz sobre desistir nas dificuldades?", a: "A Escritura adverte que desfalecer no dia da angústia mostra que a nossa força é pequena, e incentiva a buscar a renovação do Senhor em Gálatas 6:9." },
    ],
    [{ name: "Oração de fortalecimento", link: "/oracoes/oracao-de-fortalecimento" }],
    [{ name: "Hebreus 12", link: "/biblia/hebreus/12" }, { name: "Tiago 1", link: "/biblia/tiago/1" }]
  ),

  topic(
    "bencaos",
    "Bênçãos",
    "As bênçãos de Deus enriquecem a alma, trazem vida abundante e nos capacitam para sermos canais de bênção e auxílio para outras pessoas.",
    "A maior de todas as bênçãos celestiais é a salvação e a reconciliação com o Pai por intermédio de Jesus Cristo.",
    "Seja intencional em abençoar alguém com palavras de honra, ajuda financeira ou auxílio prático hoje.",
    [
      { ref: "Números 6:24-26", book: "numeros", chapter: 6, verse: 24, text: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." },
      { ref: "Efésios 1:3", book: "efesios", chapter: 1, verse: 3, text: "Bendito o Deus e Pai de nosso Senhor Jesus Cristo, o qual nos abençoou com todas as bênçãos espirituais nos lugares celestiais em Cristo." },
    ],
    [
      { q: "Qual a célebre bênção sacerdotal da Bíblia?", a: "A bênção registrada em Números 6:24-26, invocando a proteção, o favor e a paz soberana de Deus sobre a vida do Seu povo." },
    ],
    [{ name: "Oração da manhã", link: "/oracoes/oracao-da-manha" }],
    [{ name: "Números 6", link: "/biblia/numeros/6" }, { name: "Efésios 1", link: "/biblia/efesios/1" }]
  ),

  topic(
    "livramento",
    "Livramento",
    "Deus é poderoso para livrar os Seus servos das mãos dos adversários, das armadilhas ocultas e das garras do desespero.",
    "O livramento do Senhor se manifesta muitas vezes de formas sutis que só conseguimos enxergar com os olhos da fé ao final da tempestade.",
    "Recorde um momento em que você foi poupado de um grande mal e eleve um louvor fervoroso pelo livramento recebido.",
    [
      { ref: "Salmos 34:7", book: "salmos", chapter: 34, verse: 7, text: "O anjo do Senhor acampa-se ao redor dos que o temem, e os livra." },
      { ref: "Salmos 107:6", book: "salmos", chapter: 107, verse: 6, text: "E clamaram ao Senhor na sua angústia, e os livrou das suas dificuldades." },
    ],
    [
      { q: "Como Deus nos concede livramento?", a: "Ele age enviando anjos, alterando circunstâncias, concedendo sabedoria para desviar de armadilhas e sustentando nossa fé durante os perigos." },
    ],
    [{ name: "Oração por proteção", link: "/oracoes/oracao-por-protecao" }],
    [{ name: "Salmos 34", link: "/biblia/salmos/34" }, { name: "Salmos 107", link: "/biblia/salmos/107" }]
  ),

  topic(
    "motivacao",
    "Motivação",
    "A motivação cristã autêntica brota da certeza do chamado divino, do propósito eterno da vida e da esperança da recompensa gloriosa.",
    "Em vez de buscar entusiasmo passageiro, o cristão renova seu ânimo interior na contemplação da graça e na fidelidade das Escrituras.",
    "Defina uma meta honrada para esta semana e comece executando a primeira etapa com dedicação fervorosa.",
    [
      { ref: "Colossenses 3:17", book: "colossenses", chapter: 3, verse: 17, text: "E, quanto fizerdes por palavras ou por obras, fazei tudo em nome do Senhor Jesus, dando por ele graças a Deus Pai." },
      { ref: "1 Coríntios 15:58", book: "1-corintios", chapter: 15, verse: 58, text: "Portanto, meus amados irmãos, sede firmes e constantes, sempre abundantes na obra do Senhor, sabendo que o vosso trabalho não é vão no Senhor." },
    ],
    [
      { q: "Onde encontrar ânimo quando bate o cansaço?", a: "Lembrando que o nosso esforço honesto no Senhor não é vão (1 Co 15:58) e buscando descanso restaurador na presença de Cristo." },
    ],
    [{ name: "Oração de fortalecimento", link: "/oracoes/oracao-de-fortalecimento" }],
    [{ name: "1 Coríntios 15", link: "/biblia/1-corintios/15" }, { name: "Colossenses 3", link: "/biblia/colossenses/3" }]
  ),

  topic(
    "relacionamento",
    "Relacionamento",
    "Relações saudáveis são pautadas na humildade, na escuta paciente, no perdão recíproco e no compromisso com o crescimento do outro.",
    "O modelo bíblico para o convívio fraterno é o próprio Cristo, que nos acolheu graciosamente e nos ensinou a honrar os semelhantes.",
    "Procure ouvir com verdadeira empatia alguém com quem você discorda, buscando pontos de união e edificação mútua.",
    [
      { ref: "Romanos 12:10", book: "romanos", chapter: 12, verse: 10, text: "Amai-vos cordialmente uns aos outros com amor fraternal, preferindo-vos em honra uns aos outros." },
      { ref: "Filipenses 2:3-4", book: "filipenses", chapter: 2, verse: 3, text: "Nada façais por contenda ou por vanglória, mas por humildade; cada um considere os outros superiores a si mesmo. Não atente cada um para o que é propriamente seu, mas cada qual também para o que é dos outros." },
    ],
    [
      { q: "Qual a chave bíblica para evitar brigas relacionais?", a: "A humildade em considerar os outros, o domínio próprio no falar e a disposição para pedir perdão antes que o ressentimento crie raízes." },
    ],
    [{ name: "Oração pela família", link: "/oracoes/oracao-pela-familia" }],
    [{ name: "Romanos 12", link: "/biblia/romanos/12" }, { name: "Filipenses 2", link: "/biblia/filipenses/2" }]
  ),

  topic(
    "vida",
    "Vida",
    "A vida humana é um dom sagrado outorgado por Deus, com dignidade inegociável, propósito eterno e vocação para o bem.",
    "Viver com propósito bíblico é desfrutar de comunhão com o Autor da Vida e refletir Sua justiça e compaixão no mundo ao nosso redor.",
    "Reflita sobre o legado que suas escolhas têm deixado e alinhe suas prioridades com o que tem valor eterno diante de Deus.",
    [
      { ref: "João 10:10", book: "joao", chapter: 10, verse: 10, text: "O ladrão não vem senão a roubar, a matar, e a destruir; eu vim para que tenham vida, e a tenham com abundância." },
      { ref: "Salmos 139:13-14", book: "salmos", chapter: 139, verse: 13, text: "Pois possuíste os meus rins; entreteceste-me no ventre de minha mãe. Eu te louvarei, porque de um modo terrível e tão maravilhoso fui formado." },
    ],
    [
      { q: "O que significa a 'vida abundante' prometida por Jesus?", a: "Significa plenitude espiritual, comunhão com Deus, paz de consciência e propósito eterno, independentemente da quantidade de bens materiais." },
    ],
    [{ name: "Oração da manhã", link: "/oracoes/oracao-da-manha" }],
    [{ name: "Salmos 139", link: "/biblia/salmos/139" }, { name: "João 10", link: "/biblia/joao/10" }]
  ),

  topic(
    "sofrimento",
    "Sofrimento",
    "A dor e a perda fazem parte da realidade humana caída, mas na mão soberana de Deus o sofrimento pode forjar caráter, compaixão e maturidade.",
    "O Evangelho não oferece isenção de lágrimas no mundo presente, mas a garantia da presença consoladora do Senhor e da redenção final de toda dor.",
    "Ofereça apoio silencioso ou ajuda concreta a alguém que está passando por luto, enfermidade ou provação nesta semana.",
    [
      { ref: "Romanos 8:18", book: "romanos", chapter: 8, verse: 18, text: "Porque para mim tenho por certo que as aflições deste tempo presente não são para comparar com a glória que em nós há de ser revelada." },
      { ref: "2 Coríntios 1:3-4", book: "2-corintios", chapter: 1, verse: 3, text: "Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo, o Pai das misericórdias e o Deus de toda a consolação; que nos consola em toda a nossa tribulação, para que também possamos consolar os que estiverem em alguma tribulação." },
    ],
    [
      { q: "Por que os justos sofrem segundo a Bíblia?", a: "A Bíblia (especialmente o livro de Jó e as cartas apostólicas) mostra que o sofrimento ocorre num mundo quebrado, mas Deus o usa para purificar nossa fé e capacitar-nos a consolar outros." },
    ],
    [{ name: "Oração em momentos difíceis", link: "/oracoes/oracao-em-momentos-dificeis" }],
    [{ name: "Romanos 8", link: "/biblia/romanos/8" }, { name: "2 Coríntios 1", link: "/biblia/2-corintios/1" }]
  ),

  // Complementary topics for backward compatibility
  topic(
    "momentos-dificeis",
    "Momentos Difíceis",
    "Passagens bíblicas para atravessar perdas, incertezas e dias de cansaço extremo com a certeza do amparo do Senhor.",
    "A Escritura permite lamentar e voltar os olhos para a fidelidade incondicional de Deus em meio às cinzas.",
    "Compartilhe o que sente com o Senhor em oração e procure o apoio pastoral e fraterno de pessoas experientes.",
    [
      { ref: "Salmos 34:18", book: "salmos", chapter: 34, verse: 18, text: "Perto está o Senhor dos que têm o coração quebrantado, e salva os contritos de espírito." },
      { ref: "Mateus 11:28", book: "mateus", chapter: 11, verse: 28, text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." },
    ],
    [
      { q: "Onde encontrar refúgio em momentos de crise?", a: "Nos Salmos de lamento e consolo (como Salmos 23, 46 e 91) e na promessa de Jesus de dar descanso a quem Nele confia." },
    ],
    [{ name: "Oração em momentos difíceis", link: "/oracoes/oracao-em-momentos-dificeis" }],
    [{ name: "Salmos 34", link: "/biblia/salmos/34" }, { name: "Mateus 11", link: "/biblia/mateus/11" }]
  ),

  topic(
    "deus",
    "Deus",
    "As Escrituras revelam Deus como Criador transcendente, Santo, justo, misericordioso, onipresente e infinitamente bom.",
    "Conhecer a Deus transforma nossa identidade, nosso modo de encarar a vida e nossa esperança para a eternidade.",
    "Leia um salmo de louvor e anote os atributos de Deus que mais tocam seu coração hoje.",
    [
      { ref: "Salmos 46:1", book: "salmos", chapter: 46, verse: 1, text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia." },
      { ref: "1 João 4:8", book: "1-joao", chapter: 4, verse: 8, text: "Aquele que não ama não conhece a Deus; porque Deus é amor." },
    ],
    [
      { q: "Como conhecer a Deus de maneira pessoal?", a: "Através da leitura bíblica, da oração sincera e da fé em Jesus Cristo, que é a imagem visível do Deus invisível." },
    ],
    [{ name: "Oração da manhã", link: "/oracoes/oracao-da-manha" }],
    [{ name: "Salmos 46", link: "/biblia/salmos/46" }, { name: "1 João 4", link: "/biblia/1-joao/4" }]
  ),

  topic(
    "jesus",
    "Jesus",
    "Jesus Cristo é o Filho unigênito de Deus, o Verbo encarnado, Salvador do mundo e o Bom Pastor que deu Sua vida pelas ovelhas.",
    "Seguir a Jesus é aprender Sua mansidão, Sua compaixão e Seu compromisso intransigente com a verdade e o amor.",
    "Leia um capítulo dos Evangelhos hoje e pratique um ensinamento direto de Jesus em sua rotina.",
    [
      { ref: "João 14:6", book: "joao", chapter: 14, verse: 6, text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim." },
      { ref: "Mateus 11:29", book: "mateus", chapter: 11, verse: 29, text: "Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas." },
    ],
    [
      { q: "Qual a mensagem central de Jesus Cristo?", a: "O arrependimento, o anúncio do Reino de Deus e a salvação gratuita por Sua morte e ressurreição mediante a fé." },
    ],
    [{ name: "Oração de esperança", link: "/oracoes/oracao-de-esperanca" }],
    [{ name: "João 14", link: "/biblia/joao/14" }, { name: "Mateus 11", link: "/biblia/mateus/11" }]
  ),
];

export const getBibleTopic = (slug: string) => BIBLE_TOPICS.find((item) => item.slug === slug);