export interface Lesson {
  id: string;
  title: string;
  content: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: Module[];
}

const hermeneuticaLesson1 = `# Introdução à Hermenêutica

> "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça." — 2 Timóteo 3:16

A **hermenêutica bíblica** é a ciência e arte de interpretar as Escrituras Sagradas. O termo deriva do grego *hermeneuein*, que significa "interpretar" ou "traduzir".

## Por que estudar hermenêutica?

Sem princípios sólidos de interpretação, corremos o risco de:

1. Distorcer o sentido original do texto
2. Aplicar passagens fora de seu contexto histórico
3. Construir doutrinas frágeis sobre fundamentos incertos

## Os três horizontes

Toda interpretação responsável considera três horizontes:

- **Horizonte do autor:** o que o escritor original quis comunicar
- **Horizonte do texto:** o que as palavras significam em seu contexto literário
- **Horizonte do leitor:** como o texto se aplica hoje

> A boa interpretação respeita a distância — histórica, cultural e linguística — entre nós e o texto, ao mesmo tempo em que reconhece a relevância eterna da Palavra.

No próximo módulo, exploraremos os principais métodos de interpretação ao longo da história da Igreja.`;

const hermeneuticaLesson2 = `# Métodos de Interpretação

Ao longo da história, a Igreja desenvolveu diferentes abordagens para interpretar as Escrituras. Conhecê-las nos ajuda a discernir os pontos fortes e fracos de cada tradição.

## 1. Método Alegórico

Popularizado pela escola de Alexandria (Orígenes, Clemente), busca significados espirituais ocultos por trás do sentido literal.

## 2. Método Literal-Histórico

Defendido pela escola de Antioquia e retomado pelos Reformadores. Procura o sentido pretendido pelo autor em seu contexto histórico.

## 3. Método Gramático-Histórico

A síntese moderna mais aceita. Combina análise gramatical rigorosa com pesquisa histórica e cultural.

### Princípios gramático-históricos

- Estudar o gênero literário
- Analisar o contexto imediato e remoto
- Considerar paralelos bíblicos
- Pesquisar o pano de fundo histórico-cultural

Cada texto pede sensibilidade ao seu próprio gênero — narrativa, poesia, profecia, epístola ou apocalíptico.`;

const teologiaLesson1 = `# O que é Teologia Sistemática?

A **teologia sistemática** organiza o ensino bíblico em categorias temáticas coerentes, respondendo perguntas como: *O que toda a Bíblia ensina sobre Deus, sobre o homem, sobre a salvação?*

## Distinções importantes

- **Teologia Bíblica:** segue o desenvolvimento progressivo da revelação
- **Teologia Histórica:** estuda como a Igreja formulou suas doutrinas
- **Teologia Sistemática:** integra todo o ensino bíblico em um corpo coerente

> A teologia não é um exercício acadêmico frio — é a fé buscando entendimento, como dizia Anselmo de Cantuária.

## Os principais loci

1. Bibliologia — a doutrina das Escrituras
2. Teologia Própria — a doutrina de Deus
3. Antropologia — a doutrina do homem
4. Cristologia — a doutrina de Cristo
5. Pneumatologia — a doutrina do Espírito Santo
6. Soteriologia — a doutrina da salvação
7. Eclesiologia — a doutrina da Igreja
8. Escatologia — a doutrina das últimas coisas

Nas próximas lições, abordaremos cada um desses temas em profundidade.`;

const teologiaLesson2 = `# A Doutrina das Escrituras

A confissão de fé histórica afirma que as Escrituras são a *única regra infalível de fé e prática*. Esta doutrina repousa sobre quatro pilares.

## 1. Inspiração

As Escrituras são "sopradas por Deus" (*theopneustos*), o que significa que seus autores humanos foram conduzidos pelo Espírito Santo a escrever exatamente o que Deus quis comunicar.

## 2. Inerrância

Em seus manuscritos originais, as Escrituras estão livres de erro em tudo o que afirmam — incluindo questões históricas e factuais.

## 3. Autoridade

Por serem Palavra de Deus, as Escrituras possuem autoridade suprema sobre a consciência humana e a vida da Igreja.

## 4. Suficiência

A Bíblia contém tudo o que é necessário para a salvação e para a vida cristã piedosa.

> *Sola Scriptura* não significa "somente a Bíblia em isolamento", mas "somente a Bíblia como autoridade final" — acima da tradição, da razão e da experiência.`;

export const courses: Course[] = [
  {
    id: "hermeneutica",
    title: "Hermenêutica Bíblica",
    description:
      "Princípios e métodos para interpretar as Escrituras com fidelidade ao texto e relevância para o presente.",
    category: "Bíblia",
    modules: [
      {
        id: "fundamentos",
        title: "Módulo 1 — Fundamentos",
        lessons: [
          { id: "introducao", title: "Introdução à Hermenêutica", content: hermeneuticaLesson1 },
          { id: "metodos", title: "Métodos de Interpretação", content: hermeneuticaLesson2 },
        ],
      },
    ],
  },
  {
    id: "teologia-sistematica",
    title: "Teologia Sistemática",
    description:
      "Um panorama das grandes doutrinas cristãs organizadas tematicamente, do prolegômeno à escatologia.",
    category: "Teologia",
    modules: [
      {
        id: "prolegomeno",
        title: "Módulo 1 — Prolegômeno",
        lessons: [
          { id: "o-que-e", title: "O que é Teologia Sistemática?", content: teologiaLesson1 },
        ],
      },
      {
        id: "bibliologia",
        title: "Módulo 2 — Bibliologia",
        lessons: [
          { id: "doutrina-escrituras", title: "A Doutrina das Escrituras", content: teologiaLesson2 },
        ],
      },
    ],
  },
];

export function findCourse(courseId: string) {
  return courses.find((c) => c.id === courseId);
}

export function getFlatLessons(course: Course) {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ moduleId: m.id, moduleTitle: m.title, lesson: l })),
  );
}

export function findLesson(courseId: string, lessonId: string) {
  const course = findCourse(courseId);
  if (!course) return null;
  const flat = getFlatLessons(course);
  const idx = flat.findIndex((f) => f.lesson.id === lessonId);
  if (idx === -1) return null;
  return {
    course,
    entry: flat[idx],
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
