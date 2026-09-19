export interface DailyVerseItem {
  bookSlug: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  theme: string;
  explanation: string;
  reflection: string;
  application: string;
  prayer: string;
  relatedStudySlug?: string;
  relatedDevotionalSlug?: string;
}

export const DAILY_REFS: DailyVerseItem[] = [
  {
    bookSlug: "joao",
    bookId: "JHN",
    bookName: "João",
    chapter: 3,
    verse: 16,
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    theme: "Amor e Salvação",
    explanation:
      "Jesus pronuncia estas palavras no diálogo noturno com Nicodemos, um mestre da lei em Jerusalém. O amor de Deus não é abstrato ou condicional: ele se traduz na mais alta entrega pessoal pela humanidade necessitada de redenção.",
    reflection:
      "Em momentos em que nos sentimos rejeitados, solitários ou culpados, João 3:16 é a âncora suprema: fomos amados com a maior demonstração de amor da história do universo.",
    application:
      "Agradeça a Deus pelo dom supremo da salvação e transmita compaixão e acolhimento a alguém que esteja se sentindo desvalorizado hoje.",
    prayer:
      "Pai celestial, obrigado pelo teu amor imensurável revelado em Cristo Jesus. Ajuda-me a viver na certeza da salvação e a compartilhar essa mesma graça com o meu próximo. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 23,
    verse: 1,
    text: "O Senhor é o meu pastor; nada me faltará.",
    theme: "Provisão e Cuidado",
    explanation:
      "Davi, que conhecia a fundo a rotina árdua de pastorear rebanhos no deserto da Judeia, reconhece que a humanidade depende inteiramente do cuidado diligente e zeloso de Deus.",
    reflection:
      "A promessa de que 'nada me faltará' não se refere a caprichos consumistas, mas à provisão fiel daquilo que é essencial para o sustento físico e espiritual da nossa jornada.",
    application:
      "Troque a ansiedade financeira ou material por uma oração de gratidão, confiando que o Senhor supre as necessidades fundamentais do dia a dia.",
    prayer:
      "Senhor meu Pastor, guia os meus passos e acalma o meu coração. Ensina-me a descansar na tua fidelidade e a confiar plenamente na tua provisão. Amém.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    bookSlug: "filipenses",
    bookId: "PHP",
    bookName: "Filipenses",
    chapter: 4,
    verse: 13,
    text: "Posso todas as coisas naquele que me fortalece.",
    theme: "Fortaleza e Perseverança",
    explanation:
      "Paulo escreve esta carta acorrentado em uma prisão romana. Ele não está reivindicando superpoderes mundanos, mas declarando o contentamento espiritual e a capacidade de suportar tanto a fartura quanto a escassez através de Cristo.",
    reflection:
      "Sua capacidade de enfrentar desafios e pressões não depende apenas da sua força psicológica ou recursos materiais, mas da presença viva de Cristo em seu íntimo.",
    application:
      "Identifique a tarefa ou dificuldade que mais parece esgotar suas energias hoje e enfrente-a com a certeza da força renovada que Deus concede.",
    prayer:
      "Jesus amado, quando minhas forças humanas se esgotarem, capacita-me com o teu poder. Que eu aprenda a ser grato em qualquer circunstância. Amém.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "renovo-nas-tribulacoes",
  },
  {
    bookSlug: "isaias",
    bookId: "ISA",
    bookName: "Isaías",
    chapter: 41,
    verse: 10,
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
    theme: "Proteção Divina",
    explanation:
      "Dirigida a Israel em tempos de exílio e incerteza geopolítica, a profecia de Isaías ancora a paz não na força bélica, mas no braço soberano do Criador que sustenta Seus servos.",
    reflection:
      "O medo paralisa nossas decisões. A resposta bíblica contra o pânico não é autossuficiência, mas a companhia fiel de um Deus que segura nossa mão direita.",
    application:
      "Respire fundo quando sentir medo ou apreensão e repita mentalmente: 'Deus está comigo, Ele me fortalece'.",
    prayer:
      "Deus vivo e verdadeiro, dissipa os temores que assolam meus pensamentos. Segura minhas mãos e conduz meus passos com retidão e paz. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "deus-e-nosso-refugio",
  },
  {
    bookSlug: "romanos",
    bookId: "ROM",
    bookName: "Romanos",
    chapter: 8,
    verse: 28,
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.",
    theme: "Propósito e Soberania",
    explanation:
      "Paulo afirma com convicção teológica que nenhum sofrimento, perda ou revés na vida do crente é em vão: Deus tece os fios da história para um propósito redentor eterno.",
    reflection:
      "Nem tudo o que nos acontece é bom em si mesmo, mas Deus tem o poder de extrair maturidade, sabedoria e testemunho até dos momentos mais dolorosos.",
    application:
      "Reavalie uma decepção recente sob a perspectiva do crescimento espiritual, confiando que Deus continua no controle da sua história.",
    prayer:
      "Senhor, mesmo quando não compreendo os caminhos do presente, confio no teu cuidado. Faze com que cada circunstância coopere para o amadurecimento da minha fé. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
  {
    bookSlug: "josue",
    bookId: "JOS",
    bookName: "Josué",
    chapter: 1,
    verse: 9,
    text: "Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares.",
    theme: "Coragem e Liderança",
    explanation:
      "Diante da morte de Moisés e do imenso desafio de liderar a transição do povo rumo à terra prometida, Deus encoraja Josué fundamentando a bravura na obediência e fidelidade divina.",
    reflection:
      "Coragem bíblica não é a ausência de tremor interior, mas o avanço decidido alicerçado na ordem e presença do Deus Todo-Poderoso.",
    application:
      "Dê hoje aquele passo necessário que você vem adiando por insegurança ou receio da opinião alheia.",
    prayer:
      "Pai celestial, renova meu ânimo e dá-me bravura para enfrentar os desafios deste dia. Que a tua palavra seja meu guia seguro. Amém.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "proverbios",
    bookId: "PRO",
    bookName: "Provérbios",
    chapter: 3,
    verse: 5,
    text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.",
    theme: "Sabedoria e Confiança",
    explanation:
      "O sábio Salomão alerta contra a ilusão da autossuficiência intelectual. Nossa inteligência é dom divino, mas falha e limitada quando desvinculada do temor de Deus.",
    reflection:
      "Querer controlar todos os desdobramentos da vida gera cansaço mental. A verdadeira paz começa quando abrimos mão da pretensão de saber mais que o Criador.",
    application:
      "Antes de assinar contratos, tomar decisões familiares ou profissionais, faça uma pausa silenciosa para consagrar o projeto ao Senhor.",
    prayer:
      "Senhor, renuncio ao orgulho de achar que tenho todas as respostas. Guia meus pensamentos e endireita as minhas decisões conforme a tua sabedoria. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "mateus",
    bookId: "MAT",
    bookName: "Mateus",
    chapter: 11,
    verse: 28,
    text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    theme: "Descanso Espiritual",
    explanation:
      "Jesus se contrapõe aos fardos pesados impostos pelo legalismo religioso da época, oferecendo descanso interior profundo para a alma fatigada pelas cobranças do mundo.",
    reflection:
      "O cansaço que sentimos não é apenas do corpo, mas da alma sobrecarregada por preocupações, culpas e pressões constantes.",
    application:
      "Reserve um tempo sem telas hoje para expor suas aflições a Jesus em oração sincera.",
    prayer:
      "Jesus amado, entrego meu cansaço e minhas frustrações em tuas mãos compassivas. Alivia minha alma e concede-me o teu doce repouso. Amém.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "o-descanso-que-jesus-oferece",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 46,
    verse: 1,
    text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.",
    theme: "Refúgio e Serenidade",
    explanation:
      "Composto pelos filhos de Corá, este salmo celebra a segurança inabalável do povo de Deus mesmo quando montanhas estremecem e as águas rugem.",
    reflection:
      "Em meio à instabilidade econômica, familiar ou política, Deus é a fortaleza permanente onde nossa alma encontra proteção inviolável.",
    application:
      "Quando sentir instabilidade ao seu redor, refugie-se na leitura bíblica e na oração em vez de consumir desespero nas notícias.",
    prayer:
      "Deus nosso abrigo, socorre-me nas tribulações e guarda o meu coração em perfeita calma. Tu és a rocha inabalável sobre a qual permaneço de pé. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "deus-e-nosso-refugio",
  },
  {
    bookSlug: "1-pedro",
    bookId: "1PE",
    bookName: "1 Pedro",
    chapter: 5,
    verse: 7,
    text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.",
    theme: "Cuidado Pessoal de Deus",
    explanation:
      "Pedro usa uma linguagem gráfica de 'arremessar' ou 'descarregar' fardos pesados sobre os ombros fortes daquele que cuida minuciosamente de cada um de Seus filhos.",
    reflection:
      "Você não precisa carregar sozinho os pesos do amanhã. Deus não dorme e tem zelo contínuo por tudo o que diz respeito à sua vida.",
    application:
      "Anote suas maiores preocupações em um papel e, em oração, apresente cada uma a Deus, soltando a necessidade de controlar tudo.",
    prayer:
      "Pai de bondade, lanço sobre ti as angústias que roubam a minha paz. Confio que o teu cuidado é maior do que qualquer problema que eu enfrente hoje. Amém.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "a-paz-que-excede-todo-entendimento",
  },
  {
    bookSlug: "jeremias",
    bookId: "JER",
    bookName: "Jeremias",
    chapter: 29,
    verse: 11,
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    theme: "Esperança e Futuro",
    explanation:
      "Enviada aos cativos na Babilônia, a mensagem profética garantia que a aflição presente não seria o ponto final da história do povo da aliança.",
    reflection:
      "Mesmo quando o presente parece árido ou doloroso, os propósitos de Deus convergem para a redenção, paz e esperança eterna.",
    application:
      "Mantenha os olhos firmes na esperança que não decepciona, perseverando com fidelidade nas pequenas rotinas do dia.",
    prayer:
      "Senhor meu Deus, alegro-me nos teus pensamentos de paz a meu respeito. Guarda-me do desespero e enche meu coração de santa expectativa pelo teu agir. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 119,
    verse: 105,
    text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
    theme: "Orientação e Clareza",
    explanation:
      "O autor do Salmo 119 compara a revelação das Escrituras a uma tocha que dissipa a escuridão noturna, permitindo discernir com clareza cada passo adiante.",
    reflection:
      "A Bíblia não é apenas um livro de valor histórico ou literário, mas a voz viva de Deus orientando nossas escolhas éticas, morais e existenciais.",
    application:
      "Consulte os ensinamentos bíblicos antes de adotar opiniões apressadas sobre questões difíceis da vida contemporânea.",
    prayer:
      "Senhor, que a tua Palavra seja farol para a minha mente e luz para as minhas escolhas diárias. Livra-me dos tropeços na escuridão. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "hebreus",
    bookId: "HEB",
    bookName: "Hebreus",
    chapter: 11,
    verse: 1,
    text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não vêem.",
    theme: "Fé Vitoriosa",
    explanation:
      "O termo grego 'hypostasis' aponta para uma substância ou escritura que comprova posse: a fé confere realidade concreta às promessas divinas antes de sua materialização.",
    reflection:
      "Crer não é um pensamento mágico sem fundamentação, mas a confiança lúcida e inabalável no caráter infalível daquele que fez as promessas.",
    application:
      "Pratique a fé através de atitudes de generosidade e integridade, demonstrando na prática aquilo em que você professa acreditar.",
    prayer:
      "Senhor, fortalece a minha fé. Ajuda-me a enxergar além das aparências passageiras e a descansar na solidez das tuas eternas promessas. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
  {
    bookSlug: "galatas",
    bookId: "GAL",
    bookName: "Gálatas",
    chapter: 5,
    verse: 22,
    text: "Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.",
    theme: "Caráter Cristão",
    explanation:
      "Paulo detalha a transformação interior genuína produzida pela habitação do Espírito Santo, em nítido contraste com o egoísmo e hostilidade do homem caído.",
    reflection:
      "O fruto do Espírito floresce gradualmente quando cultivamos a comunhão com Deus, gerando relacionamentos saudáveis, pacíficos e compassivos.",
    application:
      "Escolha agir com mansidão e domínio próprio diante de alguma provocação ou estresse que possa surgir hoje.",
    prayer:
      "Espírito Santo, sopra sobre meu coração e produz em mim o teu fruto bendito. Que as pessoas ao meu redor sintam o amor de Cristo através das minhas atitudes. Amém.",
    relatedStudySlug: "o-fruto-do-espirito-santo",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    bookSlug: "1-corintios",
    bookId: "1CO",
    bookName: "1 Coríntios",
    chapter: 13,
    verse: 4,
    text: "O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbece.",
    theme: "Amor Verdadeiro",
    explanation:
      "No célebre cântico do amor em 1 Coríntios 13, o apóstolo Paulo define o amor ('ágape') não como sentimento volúvel, mas como compromisso ativo com o bem do outro.",
    reflection:
      "O amor bíblico suporta desafios, pratica o perdão e celebra o crescimento alheio sem espaço para inveja, ciúme ou vaidade destruidora.",
    application:
      "Demonstre apreço genuíno e tenha paciência extra com um familiar ou colega de trabalho ao longo do dia.",
    prayer:
      "Deus de amor, purifica as minhas intenções. Ensina-me a amar de forma desinteressada e generosa, refletindo a graça que recebi na cruz. Amém.",
    relatedStudySlug: "familia-e-casamento-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    bookSlug: "efesios",
    bookId: "EPH",
    bookName: "Efésios",
    chapter: 2,
    verse: 8,
    text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.",
    theme: "Graça Imerecida",
    explanation:
      "O fundamento da salvação cristã é a graça soberana de Deus. Nenhuma obra humana meritória poderia comprar o perdão ou a reconciliação com o Criador.",
    reflection:
      "Compreender a graça nos liberta do orgulho espiritual e do medo do fracasso: nossa aceitação diante de Deus repousa nos méritos de Cristo.",
    application:
      "Viva hoje a partir da gratidão por ter sido aceito por graça, estendendo essa mesma generosidade para quem cometeu falhas com você.",
    prayer:
      "Senhor, louvo a tua graça maravilhosa que me alcançou. Que eu jamais me esqueça de que sou fruto do teu favor imerecido. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 91,
    verse: 1,
    text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.",
    theme: "Proteção Espiritual",
    explanation:
      "O Salmo 91 retrata a comunhão diária com o Altíssimo como um santuário inexpugnável onde o crente encontra abrigo contra as adversidades da existência.",
    reflection:
      "'Habitar' indica permanência, não apenas visitas ocasionais em tempos de desespero. O descanso sob a sombra divina é fruto da intimidade cotidiana.",
    application:
      "Inicie e termine o seu dia dedicando instantes de silêncio e oração para habitar na presença do Senhor.",
    prayer:
      "Altíssimo Deus, tu és meu esconderijo seguro. Sob as tuas asas encontro descanso e proteção contra todo laço do mal. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "deus-e-nosso-refugio",
  },
  {
    bookSlug: "tiago",
    bookId: "JAS",
    bookName: "Tiago",
    chapter: 1,
    verse: 5,
    text: "E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada.",
    theme: "Sabedoria Prática",
    explanation:
      "Tiago assegura que Deus é um doador generoso que não repreende quem reconhece sua própria carência de discernimento para enfrentar provações.",
    reflection:
      "A sabedoria bíblica difere da mera erudição humana: ela consiste na capacidade divina de aplicar princípios espirituais às escolhas diárias com bom senso.",
    application:
      "Peça sabedoria a Deus antes de emitir opiniões acaloradas em conversas difíceis ou redes sociais.",
    prayer:
      "Deus liberal e bondoso, concedo-te o controle das minhas decisões. Dá-me sabedoria para agir com prudência, justiça e mansidão. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "colossenses",
    bookId: "COL",
    bookName: "Colossenses",
    chapter: 3,
    verse: 23,
    text: "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens.",
    theme: "Excelência e Dedicação",
    explanation:
      "Paulo dignifica o trabalho e a rotina diária dos crentes em Colossos, mostrando que até as tarefas mais simples tornam-se sagradas quando executadas para o Senhor.",
    reflection:
      "Nossa rotina profissional e doméstica adquire novo significado quando compreendemos que o Senhor é o nosso supremo avaliador e recompensador.",
    application:
      "Execute suas tarefas de hoje com atenção, capricho e entusiasmo, enxergando seu trabalho como ato de adoração.",
    prayer:
      "Senhor, consagro a ti o trabalho das minhas mãos e os estudos da minha mente. Que tudo o que eu fizer glorifique o teu santo nome. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 37,
    verse: 5,
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    theme: "Confiança e Descanso",
    explanation:
      "Davi aconselha a colocar o futuro nas mãos de Deus, sem invejar a prosperidade ilusória daqueles que operam pela injustiça.",
    reflection:
      "Entregar o caminho é um ato deliberado de transferência: soltar as rédeas da ansiedade e permitir que Deus trace os rumos da nossa história.",
    application:
      "Em vez de ruminar apreensão quanto a projetos futuros, faça uma declaração verbal de fé entregando seus planos a Deus.",
    prayer:
      "Senhor, coloco meus sonhos, planos e anseios em teu altar. Confio na tua soberania e descanso no teu agir perfeito. Amém.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "miqueias",
    bookId: "MIC",
    bookName: "Miquéias",
    chapter: 6,
    verse: 8,
    text: "Ele te declarou, ó homem, o que é bom; e que é o que o Senhor pede de ti, senão que pratiques a justiça, e ames a benevolência, e andes humildemente com o teu Deus?",
    theme: "Justiça e Humildade",
    explanation:
      "Em meio a rituais religiosos formais e vazios de Israel, Miquéias resume a essência do relacionamento com Deus: conduta justa, amor prático e humildade sincera.",
    reflection:
      "Deus valoriza mais a retidão e a compaixão do que manifestações religiosas superficiais desprovidas de amor ao próximo.",
    application:
      "Seja pontual, honesto e justo em todos os seus acordos de hoje, tratando cada pessoa com consideração e respeito.",
    prayer:
      "Deus santo e misericordioso, quebranta meu coração. Ensina-me a amar a justiça, a praticar a misericórdia e a andar sempre contigo em profunda humildade. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    bookSlug: "joao",
    bookId: "JHN",
    bookName: "João",
    chapter: 14,
    verse: 27,
    text: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.",
    theme: "A Paz de Cristo",
    explanation:
      "Na véspera da crucificação, Jesus conforta Seus discípulos assegurando que Sua paz sobrepuja qualquer tempestade terrena.",
    reflection:
      "A paz que o mundo promete é frágil e depende da ausência de problemas; a paz de Jesus permanece inabalável mesmo no meio das maiores lutas.",
    application:
      "Guarde a calma em momentos de tensão familiar ou no trânsito, recordando que a paz de Cristo habita em seu interior.",
    prayer:
      "Príncipe da Paz, aquieta minha mente e protege meus sentimentos. Que nenhuma circunstância passageira roube a tranquilidade que vem de ti. Amém.",
    relatedStudySlug: "como-vencer-a-ansiedade-com-a-palavra",
    relatedDevotionalSlug: "a-paz-que-excede-todo-entendimento",
  },
  {
    bookSlug: "lamentacoes",
    bookId: "LAM",
    bookName: "Lamentações",
    chapter: 3,
    verse: 22,
    text: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; renovam-se cada manhã.",
    theme: "Misericórdia Renovada",
    explanation:
      "Em meio à destruição de Jerusalém e ao luto do povo, o profeta Jeremias encontra esperança na fidelidade imutável e misericordiosa do Senhor.",
    reflection:
      "Cada novo amanhecer é um lembrete vivo de que as misericórdias de Deus se renovam. O passado ficou para trás; hoje há recomeço na presença divina.",
    application:
      "Perdoe a si mesmo por falhas de ontem e receba o renovo que Deus preparou para este novo dia de vida.",
    prayer:
      "Senhor Deus, agradeço pela tua compaixão inesgotável que se renova a cada manhã. Sustenta meus passos e dá-me novo ânimo. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "comece-o-dia-com-gratidao",
  },
  {
    bookSlug: "romanos",
    bookId: "ROM",
    bookName: "Romanos",
    chapter: 12,
    verse: 2,
    text: "E não sede conformados com este mundo, mas sede transformados pela renovação do vosso entendimento, para que experimenteis qual seja a boa, agradável, e perfeita vontade de Deus.",
    theme: "Transformação Interior",
    explanation:
      "Paulo convoca os cristãos a não se moldarem passivamente aos padrões corrompidos da sociedade, mas a permitirem a renovação mental pelo Espírito Santo.",
    reflection:
      "Viver a vontade de Deus exige coragem para pensar de modo diferente do senso comum, valorizando a verdade, a pureza e a fidelidade.",
    application:
      "Filtre os conteúdos que consome nas telas, buscando materiais que edifiquem e aproximem você dos valores do Reino de Deus.",
    prayer:
      "Pai santo, renova minha mente através da tua verdade. Livra-me do conformismo com o erro e guia-me na tua boa, agradável e perfeita vontade. Amém.",
    relatedStudySlug: "o-fruto-do-espirito-santo",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "salmos",
    bookId: "PSA",
    bookName: "Salmos",
    chapter: 34,
    verse: 18,
    text: "Perto está o Senhor dos que têm o coração quebrantado, e salva os contritos de espírito.",
    theme: "Consolo na Dor",
    explanation:
      "Davi compôs este salmo em fuga perigosa, afirmando que a aflição humana não afasta a Deus, mas atrai Sua presença compassiva e restauradora.",
    reflection:
      "Quando o coração quebra sob o peso de perdas ou lágrimas, Deus não nos abandona: Ele se achega bem perto para confortar e curar.",
    application:
      "Seja solidário com alguém em luto ou sofrimento, oferecendo um ombro amigo e palavras de acolhimento sem julgamentos.",
    prayer:
      "Senhor, tu conheces as feridas secretas do meu coração. Aproxima-te com o teu bálsamo consolador e cura minhas mágoas mais profundas. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "o-descanso-que-jesus-oferece",
  },
  {
    bookSlug: "2-corintios",
    bookId: "2CO",
    bookName: "2 Coríntios",
    chapter: 12,
    verse: 9,
    text: "E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza. De boa vontade, pois, me gloriarei nas minhas fraquezas, para que em mim habite o poder de Cristo.",
    theme: "Poder na Fraqueza",
    explanation:
      "Em resposta às orações de Paulo sobre seu 'espinho na carne', Deus revela que a fraqueza humana é o palco sublime onde o poder da graça mais resplandece.",
    reflection:
      "Nossas limitações nos mantêm humildes e dependentes de Deus, impedindo que a vaidade espiritual nos afaste da essência do evangelho.",
    application:
      "Não se desespere diante de suas fraquezas reconhecidas; utilize-as como motivo para depender mais da força de Cristo.",
    prayer:
      "Jesus, tua graça me basta. Quando me sinto frágil e insuficiente, que o teu poder infinito se manifeste em minha vida e através de mim. Amém.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "renovo-nas-tribulacoes",
  },
  {
    bookSlug: "sofonias",
    bookId: "ZEP",
    bookName: "Sofonias",
    chapter: 3,
    verse: 17,
    text: "O Senhor teu Deus, o poderoso, está no meio de ti, ele salvará; ele se deleitará em ti com alegria; calar-se-á por seu amor, regozijar-se-á em ti com júbilo.",
    theme: "O Amor Paterno de Deus",
    explanation:
      "Esta sublime profecia retrata a afeição apaixonada e protetora de Deus por Seu povo remanescente, celebrando sua salvação com cânticos de alegria.",
    reflection:
      "Você não é um peso para Deus. Ele se alegra em você, silencia suas acusações com amor paternal e celebra sua comunhão com júbilo.",
    application:
      "Lembre-se hoje de que seu valor foi determinado pelo Criador que o ama com amor eterno e se alegra no seu bem-estar.",
    prayer:
      "Deus poderoso e terno, maravilho-me diante do teu amor que se deleita em mim. Que minha vida seja motivo de contínua alegria para ti. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    bookSlug: "proverbios",
    bookId: "PRO",
    bookName: "Provérbios",
    chapter: 16,
    verse: 3,
    text: "Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos.",
    theme: "Consagração do Trabalho",
    explanation:
      "Ao consagrar deliberadamente tarefas e projetos a Deus, o ser humano experimenta clareza mental e alinhamento com a vontade do Soberano.",
    reflection:
      "Pensamentos caóticos e indecisões constantes encontram estabilidade quando depositamos cada objetivo sob o senhorio de Deus.",
    application:
      "Dedique um momento antes de iniciar suas principais atividades do dia para dizer em oração: 'Senhor, este trabalho é para a tua glória'.",
    prayer:
      "Senhor, consagro a ti cada meta, cada tarefa e cada conversa de hoje. Estabelece meus pensamentos em justiça, ordem e paz. Amém.",
    relatedStudySlug: "sabedoria-nos-proverbios-para-o-dia-a-dia",
    relatedDevotionalSlug: "confianca-no-amanha",
  },
  {
    bookSlug: "1-joao",
    bookId: "1JN",
    bookName: "1 João",
    chapter: 4,
    verse: 19,
    text: "Nós o amamos a ele porque ele nos amou primeiro.",
    theme: "Origem do Amor",
    explanation:
      "O apóstolo João esclarece que todo amor humano genuíno e generoso é resposta grata à iniciativa amorosa prévia e soberana de Deus.",
    reflection:
      "Não precisamos merecer primeiro para sermos amados por Deus: Seu amor nos encontrou quando ainda estávamos perdidos e sem esperança.",
    application:
      "Tome a iniciativa de reconciliação ou de gentileza com alguém hoje, mesmo que a outra pessoa ainda não tenha demonstrado iniciativa correspondente.",
    prayer:
      "Pai querido, obrigado porque me amaste antes mesmo de eu te conhecer. Que teu amor flua através de mim alcançando quem precisa de graça. Amém.",
    relatedStudySlug: "o-que-e-fe-segundo-a-biblia",
    relatedDevotionalSlug: "amados-com-amor-eterno",
  },
  {
    bookSlug: "apocalipse",
    bookId: "REV",
    bookName: "Apocalipse",
    chapter: 21,
    verse: 4,
    text: "E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor; porque já as primeiras coisas são passadas.",
    theme: "Esperança Eterna",
    explanation:
      "Na revelação da nova criação, João contempla a consumação definitiva da vitória de Cristo, onde todo sofrimento, luto e dor humana serão para sempre banidos.",
    reflection:
      "As dores e tribulações presentes têm prazo de validade determinado. A esperança cristã aponta para um futuro eterno de comunhão perfeita com Deus.",
    application:
      "Enfrente as lutas temporárias com a certeza de que a dor presente não terá a última palavra em sua existência.",
    prayer:
      "Senhor Jesus, anseio pelo dia em que toda lágrima será enxugada e viveremos na tua luz perpétua. Sustenta minha esperança até aquele glorioso dia. Amém.",
    relatedStudySlug: "versiculos-para-momentos-dificeis",
    relatedDevotionalSlug: "quando-a-resposta-demora",
  },
  {
    bookSlug: "deuteronomio",
    bookId: "DEU",
    bookName: "Deuteronômio",
    chapter: 31,
    verse: 6,
    text: "Esforçai-vos, e tende bom ânimo; não temais, nem vos espanteis diante deles; porque o Senhor teu Deus é o que vai convosco; não vos deixará nem vos desamparará.",
    theme: "Fidelidade e Companhia",
    explanation:
      "Moisés, em suas palavras de despedida à nação de Israel antes de atravessar o Jordão, transmite a promessa irrevogável da presença confortadora de Deus.",
    reflection:
      "Pessoas podem nos decepcionar ou se afastar, mas Deus promete fidelidade perpétua: Ele jamais abandona ou desampara aqueles que o buscam.",
    application:
      "Descanse na certeza de que você nunca está só. Compartilhe esse consolo com alguém que esteja vivendo um período de solidão.",
    prayer:
      "Senhor, obrigado pela tua promessa inabalável de que jamais me deixarás desamparado. Com a tua companhia ao meu lado, marcho em vitória e paz. Amém.",
    relatedStudySlug: "a-armadura-de-deus-efesios-6",
    relatedDevotionalSlug: "deus-e-nosso-refugio",
  },
];

export function dayIndex(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

export function getDailyRef(date = new Date()): DailyVerseItem {
  return DAILY_REFS[dayIndex(date) % DAILY_REFS.length]!;
}

