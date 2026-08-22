export type Testament = "AT" | "NT";

export interface BibleBook {
  id: string;
  name: string;
  slug: string;
  testament: Testament;
  chapters: number;
  description: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  { id: "GEN", name: "Gênesis", slug: "genesis", testament: "AT", chapters: 50, description: "O livro das origens: criação, queda, dilúvio e os patriarcas de Israel." },
  { id: "EXO", name: "Êxodo", slug: "exodo", testament: "AT", chapters: 40, description: "A libertação de Israel do Egito, a Lei no Sinai e o Tabernáculo." },
  { id: "LEV", name: "Levítico", slug: "levitico", testament: "AT", chapters: 27, description: "Leis de culto, sacrifícios e santidade para o povo de Deus." },
  { id: "NUM", name: "Números", slug: "numeros", testament: "AT", chapters: 36, description: "A caminhada de Israel pelo deserto rumo à Terra Prometida." },
  { id: "DEU", name: "Deuteronômio", slug: "deuteronomio", testament: "AT", chapters: 34, description: "Os últimos discursos de Moisés e a renovação da aliança." },
  { id: "JOS", name: "Josué", slug: "josue", testament: "AT", chapters: 24, description: "A conquista e a divisão da Terra Prometida." },
  { id: "JDG", name: "Juízes", slug: "juizes", testament: "AT", chapters: 21, description: "Ciclos de queda e libertação sob os juízes de Israel." },
  { id: "RUT", name: "Rute", slug: "rute", testament: "AT", chapters: 4, description: "Uma história de lealdade, redenção e providência divina." },
  { id: "1SA", name: "1 Samuel", slug: "1-samuel", testament: "AT", chapters: 31, description: "Samuel, Saul e a ascensão de Davi." },
  { id: "2SA", name: "2 Samuel", slug: "2-samuel", testament: "AT", chapters: 24, description: "O reinado de Davi, suas vitórias e suas quedas." },
  { id: "1KI", name: "1 Reis", slug: "1-reis", testament: "AT", chapters: 22, description: "Salomão, o Templo e a divisão do reino." },
  { id: "2KI", name: "2 Reis", slug: "2-reis", testament: "AT", chapters: 25, description: "Profetas, reis e o exílio de Israel e Judá." },
  { id: "1CH", name: "1 Crônicas", slug: "1-cronicas", testament: "AT", chapters: 29, description: "Genealogias e o reinado de Davi sob perspectiva sacerdotal." },
  { id: "2CH", name: "2 Crônicas", slug: "2-cronicas", testament: "AT", chapters: 36, description: "O Templo, os reis de Judá e os avivamentos espirituais." },
  { id: "EZR", name: "Esdras", slug: "esdras", testament: "AT", chapters: 10, description: "O retorno do exílio e a reconstrução do Templo." },
  { id: "NEH", name: "Neemias", slug: "neemias", testament: "AT", chapters: 13, description: "A reconstrução dos muros de Jerusalém e a reforma do povo." },
  { id: "EST", name: "Ester", slug: "ester", testament: "AT", chapters: 10, description: "A providência de Deus na libertação do povo judeu." },
  { id: "JOB", name: "Jó", slug: "jo", testament: "AT", chapters: 42, description: "O sofrimento do justo e a soberania de Deus." },
  { id: "PSA", name: "Salmos", slug: "salmos", testament: "AT", chapters: 150, description: "Orações, louvores e lamentos: o livro de oração da Bíblia." },
  { id: "PRO", name: "Provérbios", slug: "proverbios", testament: "AT", chapters: 31, description: "Sabedoria prática para a vida cotidiana." },
  { id: "ECC", name: "Eclesiastes", slug: "eclesiastes", testament: "AT", chapters: 12, description: "A busca por sentido debaixo do sol." },
  { id: "SNG", name: "Cânticos", slug: "canticos", testament: "AT", chapters: 8, description: "Um poema sobre o amor e a beleza do relacionamento." },
  { id: "ISA", name: "Isaías", slug: "isaias", testament: "AT", chapters: 66, description: "Juízo e consolo: profecias messiânicas e o Servo Sofredor." },
  { id: "JER", name: "Jeremias", slug: "jeremias", testament: "AT", chapters: 52, description: "O profeta chorão e a promessa da nova aliança." },
  { id: "LAM", name: "Lamentações", slug: "lamentacoes", testament: "AT", chapters: 5, description: "Lamentos pela queda de Jerusalém e esperança na misericórdia." },
  { id: "EZK", name: "Ezequiel", slug: "ezequiel", testament: "AT", chapters: 48, description: "Visões, juízo e restauração do povo de Deus." },
  { id: "DAN", name: "Daniel", slug: "daniel", testament: "AT", chapters: 12, description: "Fidelidade no exílio e visões sobre os reinos e o fim." },
  { id: "HOS", name: "Oséias", slug: "oseias", testament: "AT", chapters: 14, description: "O amor fiel de Deus diante da infidelidade do povo." },
  { id: "JOL", name: "Joel", slug: "joel", testament: "AT", chapters: 3, description: "O Dia do Senhor e a promessa do Espírito." },
  { id: "AMO", name: "Amós", slug: "amos", testament: "AT", chapters: 9, description: "Justiça social e o chamado ao arrependimento." },
  { id: "OBA", name: "Obadias", slug: "obadias", testament: "AT", chapters: 1, description: "O juízo sobre Edom e a soberania do Senhor." },
  { id: "JON", name: "Jonas", slug: "jonas", testament: "AT", chapters: 4, description: "A misericórdia de Deus alcança até os inimigos." },
  { id: "MIC", name: "Miquéias", slug: "miqueias", testament: "AT", chapters: 7, description: "Justiça, misericórdia e humildade diante de Deus." },
  { id: "NAM", name: "Naum", slug: "naum", testament: "AT", chapters: 3, description: "O juízo sobre Nínive e a fidelidade de Deus." },
  { id: "HAB", name: "Habacuque", slug: "habacuque", testament: "AT", chapters: 3, description: "Perguntas difíceis e a fé que sustenta o justo." },
  { id: "ZEP", name: "Sofonias", slug: "sofonias", testament: "AT", chapters: 3, description: "O Dia do Senhor e a alegria da restauração." },
  { id: "HAG", name: "Ageu", slug: "ageu", testament: "AT", chapters: 2, description: "Prioridades espirituais e a reconstrução do Templo." },
  { id: "ZEC", name: "Zacarias", slug: "zacarias", testament: "AT", chapters: 14, description: "Visões proféticas e a vinda do Rei humilde." },
  { id: "MAL", name: "Malaquias", slug: "malaquias", testament: "AT", chapters: 4, description: "Um chamado à fidelidade antes do grande Dia." },
  { id: "MAT", name: "Mateus", slug: "mateus", testament: "NT", chapters: 28, description: "Jesus, o Messias prometido e Rei do Reino dos céus." },
  { id: "MRK", name: "Marcos", slug: "marcos", testament: "NT", chapters: 16, description: "O evangelho da ação: Jesus, o Servo que salva." },
  { id: "LUK", name: "Lucas", slug: "lucas", testament: "NT", chapters: 24, description: "Jesus, o Salvador de todos, com atenção aos excluídos." },
  { id: "JHN", name: "João", slug: "joao", testament: "NT", chapters: 21, description: "Jesus, o Verbo eterno: crer nele é ter vida eterna." },
  { id: "ACT", name: "Atos", slug: "atos", testament: "NT", chapters: 28, description: "O Espírito Santo e o nascimento da Igreja." },
  { id: "ROM", name: "Romanos", slug: "romanos", testament: "NT", chapters: 16, description: "O evangelho explicado: justificação pela fé." },
  { id: "1CO", name: "1 Coríntios", slug: "1-corintios", testament: "NT", chapters: 16, description: "Correção pastoral, dons espirituais e o amor." },
  { id: "2CO", name: "2 Coríntios", slug: "2-corintios", testament: "NT", chapters: 13, description: "Fraqueza, consolo e o ministério da reconciliação." },
  { id: "GAL", name: "Gálatas", slug: "galatas", testament: "NT", chapters: 6, description: "A liberdade cristã e a graça contra o legalismo." },
  { id: "EPH", name: "Efésios", slug: "efesios", testament: "NT", chapters: 6, description: "A Igreja, corpo de Cristo, e a vida em unidade." },
  { id: "PHP", name: "Filipenses", slug: "filipenses", testament: "NT", chapters: 4, description: "A carta da alegria em meio às circunstâncias." },
  { id: "COL", name: "Colossenses", slug: "colossenses", testament: "NT", chapters: 4, description: "A supremacia de Cristo sobre todas as coisas." },
  { id: "1TH", name: "1 Tessalonicenses", slug: "1-tessalonicenses", testament: "NT", chapters: 5, description: "Esperança na volta de Cristo e vida santa." },
  { id: "2TH", name: "2 Tessalonicenses", slug: "2-tessalonicenses", testament: "NT", chapters: 3, description: "Perseverança e esclarecimentos sobre o Dia do Senhor." },
  { id: "1TI", name: "1 Timóteo", slug: "1-timoteo", testament: "NT", chapters: 6, description: "Orientações para a liderança e a vida da igreja." },
  { id: "2TI", name: "2 Timóteo", slug: "2-timoteo", testament: "NT", chapters: 4, description: "As últimas palavras de Paulo: guarde a boa doutrina." },
  { id: "TIT", name: "Tito", slug: "tito", testament: "NT", chapters: 3, description: "Boas obras como fruto da graça de Deus." },
  { id: "PHM", name: "Filemom", slug: "filemom", testament: "NT", chapters: 1, description: "Perdão e reconciliação entre irmãos em Cristo." },
  { id: "HEB", name: "Hebreus", slug: "hebreus", testament: "NT", chapters: 13, description: "Cristo é superior: o sumo sacerdote da nova aliança." },
  { id: "JAS", name: "Tiago", slug: "tiago", testament: "NT", chapters: 5, description: "Fé prática que se mostra em obras e palavras." },
  { id: "1PE", name: "1 Pedro", slug: "1-pedro", testament: "NT", chapters: 5, description: "Esperança viva em meio ao sofrimento." },
  { id: "2PE", name: "2 Pedro", slug: "2-pedro", testament: "NT", chapters: 3, description: "Crescimento na graça e alerta contra falsos mestres." },
  { id: "1JN", name: "1 João", slug: "1-joao", testament: "NT", chapters: 5, description: "Deus é luz e amor: certeza da vida eterna." },
  { id: "2JN", name: "2 João", slug: "2-joao", testament: "NT", chapters: 1, description: "Andar na verdade e no amor." },
  { id: "3JN", name: "3 João", slug: "3-joao", testament: "NT", chapters: 1, description: "Hospitalidade e fidelidade na comunidade cristã." },
  { id: "JUD", name: "Judas", slug: "judas", testament: "NT", chapters: 1, description: "Contender pela fé diante do erro." },
  { id: "REV", name: "Apocalipse", slug: "apocalipse", testament: "NT", chapters: 22, description: "A revelação de Jesus Cristo e a vitória final de Deus." },
];

export const getBookBySlug = (slug: string) =>
  BIBLE_BOOKS.find((b) => b.slug === slug.toLowerCase());

export const getBookIndex = (slug: string) =>
  BIBLE_BOOKS.findIndex((b) => b.slug === slug.toLowerCase());

export const OLD_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "AT");
export const NEW_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "NT");
