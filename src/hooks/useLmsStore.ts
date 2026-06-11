import { useState, useEffect } from "react";
import {
  Profile,
  Category,
  Course,
  Module,
  Lesson,
  Quiz,
  Progress,
  QuizAnswer,
  QuizAttempt,
  SelfAssessment,
  Poll,
  PollVote,
  Comment,
  ForumTopic,
  ForumReply,
  StudyGroup,
  GroupMessage,
  Certificate,
  UserChallenge,
  LessonNote,
} from "@/types/database.types";
import {
  getFullDatabaseData,
  addCategoryServer,
  updateCategoryServer,
  deleteCategoryServer,
  addCourseServer,
  updateCourseServer,
  deleteCourseServer,
  addModuleServer,
  updateModuleServer,
  deleteModuleServer,
  addLessonServer,
  updateLessonServer,
  deleteLessonServer,
  addQuizServer,
  updateQuizServer,
  deleteQuizServer,
} from "@/lib/api/db.server";

// Tabelas globais em memória
let globalProfiles: Profile[] = [];
let globalCategories: Category[] = [];
let globalCourses: Course[] = [];
let globalModules: Module[] = [];
let globalLessons: Lesson[] = [];
let globalQuizzes: Quiz[] = [];
let globalProgress: Progress[] = [];
let globalQuizAnswers: QuizAnswer[] = [];
let globalCurrentUser: Profile | null = null;

// Novas tabelas gamificadas e de comunidade
let globalQuizAttempts: QuizAttempt[] = [];
let globalSelfAssessments: SelfAssessment[] = [];
let globalPolls: Poll[] = [];
let globalPollVotes: PollVote[] = [];
let globalComments: Comment[] = [];
let globalForumTopics: ForumTopic[] = [];
let globalForumReplies: ForumReply[] = [];
let globalStudyGroups: StudyGroup[] = [];
let globalGroupMessages: GroupMessage[] = [];
let globalCertificates: Certificate[] = [];
let globalUserChallenges: UserChallenge[] = [];
let globalLessonNotes: LessonNote[] = [];

const listeners = new Set<() => void>();
const isClient = typeof window !== "undefined";

// Seeding inicial expandido
const runDatabaseSeeding = () => {
  const seededProfiles: Profile[] = [
    {
      id: "prof-123",
      role: "teacher",
      name: "Professor EBD",
      email: "professor@ebd.com",
      xp: 500,
      level: "Estudioso",
      streak: 5,
      max_streak: 12,
      last_activity_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      badges: ["Primeiro Passo", "Teólogo Dedicado"],
    },
    {
      id: "stud-123",
      role: "student",
      name: "Aluno EBD",
      email: "aluno@ebd.com",
      xp: 40,
      level: "Iniciante",
      streak: 2,
      max_streak: 3,
      last_activity_date: new Date().toISOString().split("T")[0],
      badges: ["Primeiro Passo"],
    },
  ];

  const seededCategories: Category[] = [
    {
      id: "cat-biblia",
      name: "Estudo Bíblico",
      description: "Cursos de interpretação, exegese e panorama bíblico.",
    },
    {
      id: "cat-teologia",
      name: "Teologia Sistemática",
      description: "Grandes doutrinas e tópicos sistemáticos.",
    },
    {
      id: "cat-historia",
      name: "História da Igreja",
      description: "O caminhar da noiva de Cristo ao longo dos séculos.",
    },
  ];

  const seededCourses: Course[] = [
    {
      id: "course-hermeneutica",
      title: "Fundamentos da Hermenêutica Bíblica",
      description:
        "Aprenda os princípios fundamentais para interpretar as Escrituras com fidelidade, considerando abismos históricos, culturais e linguísticos.",
      category_id: "cat-biblia",
      is_published: true,
      navigation_mode: "progressive",
      min_score_required: 70,
      version: "v1.2",
    },
    {
      id: "course-historia",
      title: "História da Igreja Primitiva",
      description:
        "Do dia de Pentecostes até a queda de Roma. Conheça as perseguições, os concílios ecumênicos e os pais da igreja.",
      category_id: "cat-historia",
      is_published: true,
      navigation_mode: "free",
      version: "v1.0",
    },
  ];

  const seededModules: Module[] = [
    {
      id: "mod-1",
      course_id: "course-hermeneutica",
      title: "Módulo 1: O que é Interpretação?",
      order: 1,
    },
    {
      id: "mod-2",
      course_id: "course-hermeneutica",
      title: "Módulo 2: O Contexto e a História",
      order: 2,
    },
    { id: "mod-3", course_id: "course-historia", title: "Módulo 1: A Era dos Apóstolos", order: 1 },
  ];

  const seededLessons: Lesson[] = [
    {
      id: "lesson-intro",
      module_id: "mod-1",
      title: "Introdução à Hermenêutica: O Método Histórico-Gramatical",
      content: `# Introdução à Hermenêutica: O Método Histórico-Gramatical\n*Trechos e conceitos baseados nos ensinos de Ligonier Ministries & Voltemos ao Evangelho*\n\nA **hermenêutica bíblica** é a ciência e a arte de interpretar as Escrituras Sagradas. O termo deriva do grego *hermeneuein*, que significa "explicar", "interpretar" ou "traduzir". Como ensinado pelo Dr. R.C. Sproul (Ligonier Ministries), o nosso principal objetivo na interpretação bíblica é descobrir o sentido original do texto, não criar novas opiniões.\n\n## Regras Fundamentais da Hermenêutica Reformada\n\n1. **A Escritura é a sua própria intérprete (Scriptura sacra sui ipsius interpres):** \n   Esta máxima reformada clássica significa que passagens bíblicas mais obscuras devem ser interpretadas à luz daquelas que são mais claras. A analogia da fé nos assegura que a Escritura não se contradiz.\n   \n2. **O Sentido Histórico-Gramatical (Interpretação Literal):**\n   Interpretar a Bíblia de forma fiel significa interpretá-la de acordo com a intenção do autor humano original e as regras do gênero literário. Uma metáfora deve ser interpretada como tal, uma narrativa histórica como narrativa, e poesia como poesia.\n\n3. **Superar os Três Grandes Abismos:**\n   - **Abismo Histórico:** Distância temporal de milhares de anos entre nós e os eventos bíblicos.\n   - **Abismo Cultural:** Costumes, visão de mundo e leis do antigo Oriente Médio e do período greco-romano.\n   - **Abismo Linguístico:** Nuances e sintaxe dos idiomas originais: hebraico, aramaico e grego koiné.\n\n> *"Não temos o direito de interpretar a Bíblia de acordo com nossas próprias preferências pessoais ou ideologias populares. A Palavra de Deus julga a nossa cultura; nós não julgamos a Palavra."* — R.C. Sproul\n\nRecomendamos o método de estudo indutivo básico:\n* **Observação:** O que o texto realmente diz?\n* **Interpretação:** O que o texto significava para os destinatários originais?\n* **Aplicação:** Como esse princípio eterno se aplica à minha vida cristã hoje?`,
      order: 1,
      content_type: "text",
      estimated_reading_time: 4,
    },
    {
      id: "lesson-contexto",
      module_id: "mod-2",
      title: "A Centralidade da Doutrina da Justificação",
      content: `# A Centralidade da Doutrina da Justificação\n*Doutrina sistemática adaptada de estudos do Monergismo (Monergismo.com)*\n\nA doutrina da **Justificação somente pela Fé** (*Sola Fide*) foi descrita por Martinho Lutero como "o artigo sobre o qual a igreja permanece de pé ou cai". No estudo sistemático da salvação, a justificação se destaca como um ato judicial declarativo de Deus, onde Ele declara justo o pecador impiedoso.\n\n## Monergismo vs. Sinergismo na Salvação\n\nComo amplamente documentado nos artigos do Monergismo, a distinção entre a operação soberana de Deus (monergismo) e a cooperação humana (sinergismo) é crucial para entender a regeneração:\n\n* **Monergismo (Regeneração Soberana):** A regeneração é obra exclusiva do Espírito Santo. O homem, estando morto em seus delitos e pecados (Efésios 2.1), é passivo no ato inicial do novo nascimento. Deus implanta uma nova vontade e concede o dom da fé salvadora.\n* **Sinergismo:** A crença de que a salvação depende de uma cooperação mútua entre a graça de Deus e a decisão autônoma do livre-arbítrio humano.\n\n## A Dupla Imputação da Justiça de Cristo\n\nNa justificação bíblica, ocorre uma dupla transferência judicial:\n1. Nossos pecados são imputados (creditados) a Cristo na cruz, recebendo a ira justa de Deus.\n2. A perfeita justiça e obediência de Cristo são imputadas (creditadas) a nós pela fé.\n\n> *"A fé não é a causa meritória da nossa justificação, mas sim o instrumento pelo qual estendemos as mãos vazias para receber a justiça de Jesus Cristo."* — João Calvino`,
      order: 1,
      content_type: "video",
      media_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      video_duration: 360,
      transcript:
        "Transcrição teológica: Esta lição detalha a doutrina clássica da justificação de acordo com a teologia reformada e o princípio da graça monergística da salvação.",
      estimated_reading_time: 3,
    },
    {
      id: "lesson-apostolos",
      module_id: "mod-3",
      title: "A Centralidade do Evangelho na Cultura",
      content: `# A Centralidade do Evangelho na Cultura\n*Artigos de cosmovisão cristã adaptados da Coalizão pelo Evangelho (TGC Brasil)*\n\nViver a fé cristã no mundo contemporâneo exige o desenvolvimento de uma cosmovisão moldada pela **Teologia Bíblica**. Como exposto nas diretrizes confessionais da Coalizão pelo Evangelho, a igreja não deve nem se isolar da sociedade (escapismo), nem se assimilar a ela (sincretismo), mas sim redimi-la através do Evangelho.\n\n## O Mandato Cultural e a Grande Comissão\n\nMuitos cristãos dividem a vida em áreas estanques: o "sagrado" (atividades da igreja) e o "secular" (trabalho, faculdade, arte e entretenimento). No entanto, as Escrituras apresentam um chamado integrado:\n\n* **O Mandato Cultural (Gênesis 1.28):** O chamado original dado à humanidade para cultivar a criação, desenvolver as artes, a ciência, e espelhar a glória do Criador na terra.\n* **A Grande Comissão (Mateus 28.19):** O mandato de fazer discípulos em todas as nações, batizando-os e ensinando-os a obedecer a todos os mandamentos de Cristo.\n\n## Engajamento Cultural Redentor\n\nA Coalizão pelo Evangelho incentiva os cristãos a se engajarem de forma ativa na esfera pública com amor e coragem:\n* **Vocação como Adoração:** Entender o trabalho comum como um meio de glorificar a Deus e servir ao próximo com excelência.\n* **Apologética Cultural:** Defender a verdade das Escrituras com mansidão, respondendo com clareza aos ceticismos intelectuais do nosso tempo.\n* **Amor e Justiça Social:** Expressar a verdade do Evangelho por meio do serviço aos pobres, necessitados e marginalizados.`,
      order: 1,
      content_type: "audio",
      media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      estimated_reading_time: 5,
    },
  ];

  const seededQuizzes: Quiz[] = [
    {
      id: "quiz-1",
      lesson_id: "lesson-intro",
      question: "Qual o significado de eisegese?",
      options: [
        "Extrair o sentido original pretendido pelo autor do texto.",
        "A tradução literal de palavras em hebraico para o grego.",
        "Inserir ideias próprias ou preconceitos na interpretação do texto bíblico.",
        "O estudo exegético da poesia hebraica antiga.",
      ],
      correct_option_index: 2,
      explanation:
        "Eisegese ocorre quando o leitor introduz seus próprios pensamentos ou doutrinas no texto bíblico ('ler para dentro'), ao contrário da exegese, que busca retirar o sentido original do próprio texto ('ler para fora').",
      type: "multiple_choice",
      difficulty: "easy",
      tags: ["introdução", "hermenêutica"],
    },
    {
      id: "quiz-2",
      lesson_id: "lesson-intro",
      question:
        "Quais são os três grandes abismos interpretativos que a hermenêutica auxilia a superar?",
      options: [
        "Social, Financeiro e Eclesiástico.",
        "Geográfico, Filosófico e Doutrinário.",
        "Histórico, Cultural e Linguístico.",
        "Linguístico, Psicológico e Comunitário.",
      ],
      correct_option_index: 2,
      explanation:
        "Os três abismos básicos são o Histórico (passagem do tempo), o Cultural (diferença de tradições) e o Linguístico (idiomas originais).",
      type: "multiple_choice",
      difficulty: "easy",
      tags: ["introdução", "hermenêutica"],
    },
    {
      id: "quiz-3",
      lesson_id: "lesson-contexto",
      question:
        "O contexto literário diz respeito apenas à geologia e geografia do local da escrita.",
      options: ["Verdadeiro", "Falso"],
      correct_option_index: 1,
      explanation:
        "Falso. O contexto literário refere-se ao texto circundante (frases, parágrafos, capítulos, gênero literário). O contexto geográfico/geológico faz parte do contexto histórico-cultural.",
      type: "true_false",
      difficulty: "medium",
      tags: ["contexto"],
    },
  ];

  const seededStudyGroups: StudyGroup[] = [
    {
      id: "grp-1",
      name: "Teologia Sistemática",
      description: "Grupo de discussão profunda sobre os loci teológicos, trindade e escatologia.",
      category: "Teologia",
      members_count: 12,
      joined_by_user: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "grp-2",
      name: "Apologética Cristã",
      description: "Estudo e debate racional sobre a defesa da fé cristã no mundo contemporâneo.",
      category: "Filosofia",
      members_count: 8,
      joined_by_user: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "grp-3",
      name: "História da Igreja",
      description: "Leitura conjunta de patrologia, reforma protestante e avivamentos.",
      category: "História",
      members_count: 15,
      joined_by_user: false,
      created_at: new Date().toISOString(),
    },
  ];

  const seededForumTopics: ForumTopic[] = [
    {
      id: "top-1",
      user_id: "prof-123",
      user_name: "Professor EBD",
      user_role: "teacher",
      category: "duvidas",
      title: "Como conciliar Soberania Divina e Responsabilidade Humana?",
      content:
        "Uma das maiores discussões da história da teologia. Como vocês abordam Romanos 9 na Escola Dominical de forma equilibrada?",
      likes: 8,
      liked_by: ["stud-123"],
      replies_count: 2,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "top-2",
      user_id: "stud-123",
      user_name: "Aluno EBD",
      user_role: "student",
      category: "testemunhos",
      title: "O impacto do estudo da Hermenêutica em minha leitura diária",
      content:
        "Queria testemunhar que após aprender sobre o abismo cultural, ler os Evangelhos tem sido uma experiência muito mais rica e emocionante!",
      likes: 12,
      liked_by: ["prof-123"],
      replies_count: 1,
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
  ];

  const seededForumReplies: ForumReply[] = [
    {
      id: "rep-1",
      topic_id: "top-1",
      user_id: "stud-123",
      user_name: "Aluno EBD",
      user_role: "student",
      content:
        "Acho que o segredo é aceitar a tensão bíblica sem tentar forçar resoluções filosóficas extremas que anulem um dos lados.",
      likes: 4,
      liked_by: ["prof-123"],
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "rep-2",
      topic_id: "top-1",
      user_id: "prof-123",
      user_name: "Professor EBD",
      user_role: "teacher",
      content:
        "Excelente colocação! Spurgeon costumava dizer que são 'duas linhas paralelas que se encontram na eternidade'.",
      likes: 5,
      liked_by: [],
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
  ];

  const seededUserChallenges: UserChallenge[] = [
    {
      id: "ch-1",
      user_id: "stud-123",
      title: "Leitor Dedicado",
      description: "Marque 3 lições como concluídas nesta semana.",
      type: "lessons",
      target: 3,
      current: 1,
      xp_reward: 50,
      is_completed: false,
      expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
    {
      id: "ch-2",
      user_id: "stud-123",
      title: "Mestre dos Quizzes",
      description: "Responda 20 questões de fixação corretas.",
      type: "quizzes",
      target: 20,
      current: 4,
      xp_reward: 80,
      is_completed: false,
      expires_at: new Date(Date.now() + 6 * 86400000).toISOString(),
    },
    {
      id: "ch-3",
      user_id: "stud-123",
      title: "Esforço Bíblico",
      description: "Acumule 200 XP em qualquer atividade da plataforma.",
      type: "xp",
      target: 200,
      current: 40,
      xp_reward: 100,
      is_completed: false,
      expires_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    },
  ];

  const seededPolls: Poll[] = [
    {
      id: "poll-1",
      lesson_id: "lesson-intro",
      question:
        "Qual abismo interpretativo você acha mais difícil de superar na sua leitura pessoal?",
      options: [
        "O Abismo Histórico (tempo)",
        "O Abismo Cultural (costumes)",
        "O Abismo Linguístico (idiomas originais)",
      ],
    },
  ];

  const seededComments: Comment[] = [
    {
      id: "com-1",
      user_id: "prof-123",
      user_name: "Professor EBD",
      user_role: "teacher",
      target_type: "lesson",
      target_id: "lesson-intro",
      content:
        "Lembrem-se de fazer a leitura complementar indicada e responder o quiz antes do domingo!",
      likes: 3,
      liked_by: ["stud-123"],
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  return {
    seededProfiles,
    seededCategories,
    seededCourses,
    seededModules,
    seededLessons,
    seededQuizzes,
    seededStudyGroups,
    seededForumTopics,
    seededForumReplies,
    seededUserChallenges,
    seededPolls,
    seededComments,
  };
};

const loadDataFromServer = async () => {
  try {
    const data = await getFullDatabaseData();
    if (data.courses && data.courses.length > 0) {
      globalCourses = data.courses;
      globalCategories = data.categories;
      globalModules = data.modules;
      globalLessons = data.lessons;
      globalQuizzes = data.quizzes;
      sync();
    }
  } catch (e) {
    console.error("Falha ao carregar banco de dados do servidor:", e);
  }
};

if (isClient) {
  try {
    const savedProfiles = localStorage.getItem("lms_db_profiles");
    const savedCategories = localStorage.getItem("lms_db_categories");
    const savedCourses = localStorage.getItem("lms_db_courses");
    const savedModules = localStorage.getItem("lms_db_modules");
    const savedLessons = localStorage.getItem("lms_db_lessons");
    const savedQuizzes = localStorage.getItem("lms_db_quizzes");
    const savedProgress = localStorage.getItem("lms_db_progress");
    const savedQuizAnswers = localStorage.getItem("lms_db_quiz_answers");
    const savedUser = localStorage.getItem("lms_auth_user");

    const savedQuizAttempts = localStorage.getItem("lms_db_quiz_attempts");
    const savedSelfAssessments = localStorage.getItem("lms_db_self_assessments");
    const savedPolls = localStorage.getItem("lms_db_polls");
    const savedPollVotes = localStorage.getItem("lms_db_poll_votes");
    const savedComments = localStorage.getItem("lms_db_comments");
    const savedForumTopics = localStorage.getItem("lms_db_forum_topics");
    const savedForumReplies = localStorage.getItem("lms_db_forum_replies");
    const savedStudyGroups = localStorage.getItem("lms_db_study_groups");
    const savedGroupMessages = localStorage.getItem("lms_db_group_messages");
    const savedCertificates = localStorage.getItem("lms_db_certificates");
    const savedUserChallenges = localStorage.getItem("lms_db_user_challenges");
    const savedLessonNotes = localStorage.getItem("lms_db_lesson_notes");

    if (savedProfiles) {
      globalProfiles = JSON.parse(savedProfiles);
    } else {
      const seeded = runDatabaseSeeding();
      globalProfiles = seeded.seededProfiles;
      globalCategories = seeded.seededCategories;
      globalCourses = seeded.seededCourses;
      globalModules = seeded.seededModules;
      globalLessons = seeded.seededLessons;
      globalQuizzes = seeded.seededQuizzes;
      globalStudyGroups = seeded.seededStudyGroups;
      globalForumTopics = seeded.seededForumTopics;
      globalForumReplies = seeded.seededForumReplies;
      globalUserChallenges = seeded.seededUserChallenges;
      globalPolls = seeded.seededPolls;
      globalComments = seeded.seededComments;
      sync();
    }

    if (savedCategories) globalCategories = JSON.parse(savedCategories);
    if (savedCourses) globalCourses = JSON.parse(savedCourses);
    if (savedModules) globalModules = JSON.parse(savedModules);
    if (savedLessons) globalLessons = JSON.parse(savedLessons);
    if (savedQuizzes) globalQuizzes = JSON.parse(savedQuizzes);
    if (savedProgress) globalProgress = JSON.parse(savedProgress);
    if (savedQuizAnswers) globalQuizAnswers = JSON.parse(savedQuizAnswers);
    if (savedUser) globalCurrentUser = JSON.parse(savedUser);

    if (savedQuizAttempts) globalQuizAttempts = JSON.parse(savedQuizAttempts);
    if (savedSelfAssessments) globalSelfAssessments = JSON.parse(savedSelfAssessments);
    if (savedPolls) globalPolls = JSON.parse(savedPolls);
    if (savedPollVotes) globalPollVotes = JSON.parse(savedPollVotes);
    if (savedComments) globalComments = JSON.parse(savedComments);
    if (savedForumTopics) globalForumTopics = JSON.parse(savedForumTopics);
    if (savedForumReplies) globalForumReplies = JSON.parse(savedForumReplies);
    if (savedStudyGroups) globalStudyGroups = JSON.parse(savedStudyGroups);
    if (savedGroupMessages) globalGroupMessages = JSON.parse(savedGroupMessages);
    if (savedCertificates) globalCertificates = JSON.parse(savedCertificates);
    if (savedUserChallenges) globalUserChallenges = JSON.parse(savedUserChallenges);
    if (savedLessonNotes) globalLessonNotes = JSON.parse(savedLessonNotes);

    loadDataFromServer();
  } catch (e) {
    console.error("Falha ao inicializar o banco LMS mock", e);
  }
}

function sync() {
  listeners.forEach((l) => l());
  if (isClient) {
    localStorage.setItem("lms_db_profiles", JSON.stringify(globalProfiles));
    localStorage.setItem("lms_db_categories", JSON.stringify(globalCategories));
    localStorage.setItem("lms_db_courses", JSON.stringify(globalCourses));
    localStorage.setItem("lms_db_modules", JSON.stringify(globalModules));
    localStorage.setItem("lms_db_lessons", JSON.stringify(globalLessons));
    localStorage.setItem("lms_db_quizzes", JSON.stringify(globalQuizzes));
    localStorage.setItem("lms_db_progress", JSON.stringify(globalProgress));
    localStorage.setItem("lms_db_quiz_answers", JSON.stringify(globalQuizAnswers));
    localStorage.setItem("lms_db_quiz_attempts", JSON.stringify(globalQuizAttempts));
    localStorage.setItem("lms_db_self_assessments", JSON.stringify(globalSelfAssessments));
    localStorage.setItem("lms_db_polls", JSON.stringify(globalPolls));
    localStorage.setItem("lms_db_poll_votes", JSON.stringify(globalPollVotes));
    localStorage.setItem("lms_db_comments", JSON.stringify(globalComments));
    localStorage.setItem("lms_db_forum_topics", JSON.stringify(globalForumTopics));
    localStorage.setItem("lms_db_forum_replies", JSON.stringify(globalForumReplies));
    localStorage.setItem("lms_db_study_groups", JSON.stringify(globalStudyGroups));
    localStorage.setItem("lms_db_group_messages", JSON.stringify(globalGroupMessages));
    localStorage.setItem("lms_db_certificates", JSON.stringify(globalCertificates));
    localStorage.setItem("lms_db_user_challenges", JSON.stringify(globalUserChallenges));
    localStorage.setItem("lms_db_lesson_notes", JSON.stringify(globalLessonNotes));
    if (globalCurrentUser) {
      localStorage.setItem("lms_auth_user", JSON.stringify(globalCurrentUser));
    } else {
      localStorage.removeItem("lms_auth_user");
    }
  }
}

export function useLmsStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = (email: string): { success: boolean; error?: string } => {
    const profile = globalProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (profile) {
      globalCurrentUser = profile;
      updateStreak(profile.id);
      sync();
      return { success: true };
    }
    return { success: false, error: "Usuário não encontrado." };
  };

  const register = (
    name: string,
    email: string,
    role: "student" | "teacher" | "admin" | "editor" | "monitor",
  ): { success: boolean; error?: string } => {
    const exists = globalProfiles.some((p) => p.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: "Este e-mail já está sendo utilizado." };
    const newProfile: Profile = {
      id: "profile-" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      xp: 0,
      level: "Iniciante",
      streak: 0,
      max_streak: 0,
      last_activity_date: "",
      badges: [],
    };
    globalProfiles = [...globalProfiles, newProfile];
    globalCurrentUser = newProfile;
    sync();
    return { success: true };
  };

  const logout = () => {
    globalCurrentUser = null;
    sync();
  };

  const awardXp = (userId: string, amount: number, reason: string) => {
    globalProfiles = globalProfiles.map((p) => {
      if (p.id === userId) {
        const currentXp = (p.xp || 0) + amount;
        let level = p.level || "Iniciante";
        if (currentXp >= 1001) level = "Mestre";
        else if (currentXp >= 601) level = "Estudioso";
        else if (currentXp >= 301) level = "Discípulo";
        else if (currentXp >= 101) level = "Aprendiz";
        const badges = p.badges || [];
        if (currentXp >= 100 && !badges.includes("Primeiro Passo")) badges.push("Primeiro Passo");
        if (currentXp >= 500 && !badges.includes("Leitor Dedicado")) badges.push("Leitor Dedicado");
        const updated = { ...p, xp: currentXp, level, badges };
        if (globalCurrentUser?.id === userId) globalCurrentUser = updated;
        return updated;
      }
      return p;
    });
    globalUserChallenges = globalUserChallenges.map((ch) => {
      if (ch.user_id === userId && ch.type === "xp" && !ch.is_completed) {
        const nextVal = ch.current + amount;
        const comp = nextVal >= ch.target;
        return { ...ch, current: Math.min(nextVal, ch.target), is_completed: comp };
      }
      return ch;
    });
    sync();
  };

  const updateStreak = (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    globalProfiles = globalProfiles.map((p) => {
      if (p.id === userId) {
        let currentStreak = p.streak || 0;
        let maxStreak = p.max_streak || 0;
        const lastAct = p.last_activity_date || "";
        if (lastAct === today) return p;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        currentStreak = lastAct === yesterday ? currentStreak + 1 : 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        const updated = {
          ...p,
          streak: currentStreak,
          max_streak: maxStreak,
          last_activity_date: today,
        };
        if (globalCurrentUser?.id === userId) globalCurrentUser = updated;
        return updated;
      }
      return p;
    });
    sync();
  };

  const freezeStreak = (userId: string) => {
    globalProfiles = globalProfiles.map((p) => {
      if (p.id === userId && p.xp && p.xp >= 50) {
        const updated = {
          ...p,
          xp: p.xp - 50,
          last_activity_date: new Date().toISOString().split("T")[0],
        };
        if (globalCurrentUser?.id === userId) globalCurrentUser = updated;
        return updated;
      }
      return p;
    });
    sync();
  };

  const getCategories = () => globalCategories;
  const addCategory = (name: string, description?: string) => {
    const id = "cat-" + Math.random().toString(36).substring(2, 9);
    const newCat: Category = { id, name, description };
    globalCategories = [...globalCategories, newCat];
    sync();
    addCategoryServer({ id, name, description }).catch(() => {});
    return newCat;
  };
  const updateCategory = (id: string, updates: Partial<Omit<Category, "id">>) => {
    globalCategories = globalCategories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    sync();
  };
  const deleteCategory = (id: string) => {
    globalCategories = globalCategories.filter((c) => c.id !== id);
    sync();
    deleteCategoryServer({ id }).catch(() => {});
  };

  const getCourses = () => globalCourses;
  const getCourse = (id: string) => globalCourses.find((c) => c.id === id);
  const addCourse = (title: string, description: string, category_id: string) => {
    const id = "course-" + Math.random().toString(36).substring(2, 9);
    const newCourse: Course = {
      id,
      title,
      description,
      category_id,
      is_published: true,
      navigation_mode: "free",
      min_score_required: 0,
      version: "v1.0",
    };
    globalCourses = [...globalCourses, newCourse];
    sync();
    addCourseServer({ id, title, description, category_id }).catch(() => {});
    return newCourse;
  };
  const updateCourse = (id: string, updates: Partial<Omit<Course, "id">>) => {
    globalCourses = globalCourses.map((c) => (c.id === id ? { ...c, ...updates } : c));
    sync();
  };
  const deleteCourse = (id: string) => {
    globalCourses = globalCourses.filter((c) => c.id !== id);
    sync();
    deleteCourseServer({ id }).catch(() => {});
  };
  const duplicateCourse = (courseId: string) => {
    const original = getCourse(courseId);
    if (!original) return null;
    const newId = "course-" + Math.random().toString(36).substring(2, 9);
    const duplicated: Course = { ...original, id: newId, title: `${original.title} (Cópia)` };
    globalCourses = [...globalCourses, duplicated];
    sync();
    return duplicated;
  };

  const getCourseModules = (courseId: string) =>
    globalModules.filter((m) => m.course_id === courseId).sort((a, b) => a.order - b.order);
  const addModule = (courseId: string, title: string) => {
    const id = "mod-" + Math.random().toString(36).substring(2, 9);
    const newMod: Module = {
      id,
      course_id: courseId,
      title,
      order: globalModules.filter((m) => m.course_id === courseId).length + 1,
    };
    globalModules = [...globalModules, newMod];
    sync();
    return newMod;
  };
  const updateModule = (id: string, title: string) => {
    globalModules = globalModules.map((m) => (m.id === id ? { ...m, title } : m));
    sync();
  };
  const deleteModule = (id: string) => {
    globalModules = globalModules.filter((m) => m.id !== id);
    sync();
  };

  const getModuleLessons = (moduleId: string) =>
    globalLessons.filter((l) => l.module_id === moduleId).sort((a, b) => a.order - b.order);
  const getLesson = (id: string) => globalLessons.find((l) => l.id === id);
  const addLesson = (moduleId: string, title: string, content: string) => {
    const id = "lesson-" + Math.random().toString(36).substring(2, 9);
    const newLesson: Lesson = {
      id,
      module_id: moduleId,
      title,
      content,
      order: globalLessons.filter((l) => l.module_id === moduleId).length + 1,
    };
    globalLessons = [...globalLessons, newLesson];
    sync();
    return newLesson;
  };
  const updateLesson = (id: string, updates: Partial<Omit<Lesson, "id" | "module_id">>) => {
    globalLessons = globalLessons.map((l) => (l.id === id ? { ...l, ...updates } : l));
    sync();
  };
  const deleteLesson = (id: string) => {
    globalLessons = globalLessons.filter((l) => l.id !== id);
    sync();
  };

  const getLessonQuizzes = (lessonId: string) =>
    globalQuizzes.filter((q) => q.lesson_id === lessonId);
  const addQuiz = (
    lessonId: string,
    question: string,
    options: string[],
    correctIndex: number,
    explanation?: string,
  ) => {
    const id = "quiz-" + Math.random().toString(36).substring(2, 9);
    const newQuiz: Quiz = {
      id,
      lesson_id: lessonId,
      question,
      options,
      correct_option_index: correctIndex,
      explanation,
    };
    globalQuizzes = [...globalQuizzes, newQuiz];
    sync();
    return newQuiz;
  };
  const updateQuiz = (id: string, updates: Partial<Omit<Quiz, "id" | "lesson_id">>) => {
    globalQuizzes = globalQuizzes.map((q) => (q.id === id ? { ...q, ...updates } : q));
    sync();
  };
  const deleteQuiz = (id: string) => {
    globalQuizzes = globalQuizzes.filter((q) => q.id !== id);
    sync();
  };

  const getLessonProgress = (userId: string, lessonId: string) =>
    globalProgress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
  const toggleLessonProgress = (userId: string, lessonId: string) => {
    const idx = globalProgress.findIndex((p) => p.user_id === userId && p.lesson_id === lessonId);
    if (idx > -1) {
      globalProgress[idx].is_completed = !globalProgress[idx].is_completed;
    } else {
      globalProgress.push({
        id: "prg-" + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        lesson_id: lessonId,
        is_completed: true,
      });
    }
    sync();
  };
  const getCourseProgressPercent = (userId: string, courseId: string) => {
    const modules = getCourseModules(courseId);
    const lessonIds = globalLessons
      .filter((l) => modules.some((m) => m.id === l.module_id))
      .map((l) => l.id);
    if (lessonIds.length === 0) return 0;
    const completed = globalProgress.filter(
      (p) => p.user_id === userId && lessonIds.includes(p.lesson_id) && p.is_completed,
    ).length;
    return Math.round((completed / lessonIds.length) * 100);
  };

  const getQuizAnswer = (userId: string, quizId: string) =>
    globalQuizAnswers.find((a) => a.user_id === userId && a.quiz_id === quizId);
  const submitQuizAnswer = (
    userId: string,
    quizId: string,
    selectedOptionIndex: number,
    isCorrect: boolean,
  ) => {
    const newAnswer: QuizAnswer = {
      id: "ans-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      quiz_id: quizId,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect,
    };
    globalQuizAnswers = [
      ...globalQuizAnswers.filter((a) => a.quiz_id !== quizId || a.user_id !== userId),
      newAnswer,
    ];
    sync();
    return newAnswer;
  };

  const submitQuizAttempt = (
    userId: string,
    lessonId: string,
    score: number,
    totalQuestions: number,
    isPassed: boolean,
    answers: Record<string, any>,
  ) => {
    const newAttempt: QuizAttempt = {
      id: "att-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      lesson_id: lessonId,
      score,
      total_questions: totalQuestions,
      is_passed: isPassed,
      answers,
      attempt_number: 1,
      created_at: new Date().toISOString(),
    };
    globalQuizAttempts.push(newAttempt);
    sync();
    return newAttempt;
  };

  const getQuizAttempts = (userId: string, lessonId: string) =>
    globalQuizAttempts.filter((a) => a.user_id === userId && a.lesson_id === lessonId);
  const submitSelfAssessment = (
    userId: string,
    lessonId: string,
    comprehension: number,
    confidence: number,
    clarity: boolean,
  ) => {
    const sa: SelfAssessment = {
      id: "sa-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      lesson_id: lessonId,
      comprehension,
      confidence,
      clarity,
      created_at: new Date().toISOString(),
    };
    globalSelfAssessments.push(sa);
    sync();
    return sa;
  };
  const getSelfAssessmentsByLesson = (lessonId: string) =>
    globalSelfAssessments.filter((sa) => sa.lesson_id === lessonId);
  const getPollByLesson = (lessonId: string) =>
    globalPolls.find((p) => p.lesson_id === lessonId) || null;
  const getPollVotesCount = (pollId: string) => ({
    total: globalPollVotes.filter((v) => v.poll_id === pollId).length,
    breakdown: {},
  });
  const submitPollVote = (pollId: string, userId: string, selectedIdx: number) => {
    const vote: PollVote = {
      id: "vte-" + Math.random().toString(36).substring(2, 9),
      poll_id: pollId,
      user_id: userId,
      selected_option_index: selectedIdx,
      created_at: new Date().toISOString(),
    };
    globalPollVotes.push(vote);
    sync();
    return vote;
  };
  const getUserPollVote = (pollId: string, userId: string) =>
    globalPollVotes.find((v) => v.poll_id === pollId && v.user_id === userId) || null;

  const getComments = (targetType: "course" | "lesson", targetId: string) =>
    globalComments.filter((c) => c.target_type === targetType && c.target_id === targetId);
  const addComment = (
    userId: string,
    targetType: "course" | "lesson",
    targetId: string,
    content: string,
  ) => {
    const user = globalProfiles.find((p) => p.id === userId);
    const comment: Comment = {
      id: "com-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      user_name: user?.name || "User",
      user_role: user?.role || "student",
      target_type: targetType,
      target_id: targetId,
      content,
      likes: 0,
      liked_by: [],
      created_at: new Date().toISOString(),
    };
    globalComments.push(comment);
    sync();
    return comment;
  };
  const toggleCommentLike = (commentId: string, userId: string) => {
    globalComments = globalComments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            liked_by: c.liked_by.includes(userId)
              ? c.liked_by.filter((id) => id !== userId)
              : [...c.liked_by, userId],
          }
        : c,
    );
    sync();
  };
  const deleteComment = (commentId: string) => {
    globalComments = globalComments.filter((c) => c.id !== commentId);
    sync();
  };

  const getForumTopics = (category?: string) =>
    category ? globalForumTopics.filter((t) => t.category === category) : globalForumTopics;
  const getForumTopic = (topicId: string) =>
    globalForumTopics.find((t) => t.id === topicId) || null;
  const createForumTopic = (userId: string, category: any, title: string, content: string) => {
    const user = globalProfiles.find((p) => p.id === userId);
    const t: ForumTopic = {
      id: "top-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      user_name: user?.name || "",
      user_role: user?.role || "student",
      category,
      title,
      content,
      likes: 0,
      liked_by: [],
      replies_count: 0,
      created_at: new Date().toISOString(),
    };
    globalForumTopics.push(t);
    sync();
    return t;
  };
  const getForumReplies = (topicId: string) =>
    globalForumReplies.filter((r) => r.topic_id === topicId);
  const addForumReply = (userId: string, topicId: string, content: string) => {
    const user = globalProfiles.find((p) => p.id === userId);
    const r: ForumReply = {
      id: "rep-" + Math.random().toString(36).substring(2, 9),
      topic_id: topicId,
      user_id: userId,
      user_name: user?.name || "",
      user_role: user?.role || "student",
      content,
      likes: 0,
      liked_by: [],
      created_at: new Date().toISOString(),
    };
    globalForumReplies.push(r);
    sync();
    return r;
  };

  const getStudyGroups = () => globalStudyGroups;
  const toggleGroupJoin = (groupId: string, userId: string) => {
    globalStudyGroups = globalStudyGroups.map((g) =>
      g.id === groupId ? { ...g, joined_by_user: !g.joined_by_user } : g,
    );
    sync();
  };
  const getGroupMessages = (groupId: string) =>
    globalGroupMessages.filter((m) => m.group_id === groupId);
  const sendGroupMessage = (groupId: string, userId: string, content: string) => {
    const msg: GroupMessage = {
      id: "gmsg-" + Math.random().toString(36).substring(2, 9),
      group_id: groupId,
      user_id: userId,
      user_name: "User",
      user_role: "student",
      content,
      created_at: new Date().toISOString(),
    };
    globalGroupMessages.push(msg);
    sync();
    return msg;
  };

  const getCertificates = (userId: string) =>
    globalCertificates.filter((c) => c.user_id === userId);
  const getCertificateByCode = (code: string) =>
    globalCertificates.find((c) => c.validation_code === code) || null;
  const issueCertificate = (userId: string, courseId: string) => {
    const cert: Certificate = {
      id: "cert-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      user_name: "",
      course_id: courseId,
      course_title: "",
      hours: 10,
      validation_code: "CERT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      issued_at: new Date().toISOString(),
    };
    globalCertificates.push(cert);
    sync();
    return cert;
  };

  const getActiveChallenges = (userId: string) =>
    globalUserChallenges.filter((ch) => ch.user_id === userId);
  const getLessonNotes = (userId: string, lessonId: string) =>
    globalLessonNotes.filter((n) => n.user_id === userId && n.lesson_id === lessonId);
  const addLessonNote = (userId: string, lessonId: string, content: string) => {
    const note: LessonNote = {
      id: "note-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      lesson_id: lessonId,
      content,
      created_at: new Date().toISOString(),
    };
    globalLessonNotes.push(note);
    sync();
    return note;
  };
  const deleteLessonNote = (noteId: string) => {
    globalLessonNotes = globalLessonNotes.filter((n) => n.id !== noteId);
    sync();
  };

  const sendTutorMessage = async (lessonContent: string, userMessage: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const cleanMsg = userMessage.toLowerCase();
        let answer =
          "Excelente dúvida teológica! A Bíblia nos ensina a analisar as passagens à luz de sua intenção original e da analogia da fé (as Escrituras explicam as próprias Escrituras).";

        if (cleanMsg.includes("eisegese") || cleanMsg.includes("exegese")) {
          answer =
            "A **exegese** (do grego *exēgeomai*, 'extrair') é o processo correto de puxar do texto o que o autor originalmente quis dizer. A **eisegese** ('inserir para dentro') ocorre quando lemos nossas próprias pressuposições ou doutrinas de forma forçada no texto. Para fazer boa exegese, olhe para os verbos, destinatários e contexto imediato.";
        } else if (cleanMsg.includes("abismo") || cleanMsg.includes("cultura")) {
          answer =
            "Os **três abismos interpretativos** são a nossa barreira de contato com o texto original: o *Histórico* (séculos de distância), o *Cultural* (visões de sociedade orientais e judaico-romanas) e o *Linguístico* (as nuances do hebraico, aramaico e grego). Ferramentas como dicionários teológicos e comentários bíblicos ajudam a cruzar estas pontes.";
        } else if (cleanMsg.includes("resumo") || cleanMsg.includes("resuma")) {
          answer =
            "Aqui está um resumo teológico desta lição:\n\n1. **Objetivo:** Interpretar as Escrituras Sagradas respeitando o sentido gramatical e histórico do texto.\n2. **Importância:** Evitar ensinos sectários ou heresias causados por versículos fora do contexto.\n3. **Prática:** Usar o método indutivo básico — Observação do texto, Interpretação do sentido original e Aplicação relevante para a vida cristã hoje.";
        }
        resolve(answer);
      }, 800);
    });
  };

  const generateQuizFromText = (lessonId: string, lessonContent: string) => {
    const question =
      "Com base no texto da lição, qual das seguintes alternativas define a exegese teológica?";
    const options = [
      "A inserção de preconceitos modernos no texto bíblico.",
      "A extração fiel do significado pretendido pelo autor original.",
      "O estudo exclusivo da arqueologia na Mesopotâmia.",
      "A tradução sistemática de epístolas paulinas apenas.",
    ];
    const newQuiz = addQuiz(
      lessonId,
      question,
      options,
      1,
      "A exegese consiste em retirar do texto bíblico a sua mensagem original, analisando os contextos históricos, gramaticais e literários.",
    );
    return newQuiz;
  };

  const getFullCourse = (courseId: string) => {
    const c = getCourse(courseId);
    if (!c) return null;
    return {
      ...c,
      modules: getCourseModules(courseId).map((m) => ({
        ...m,
        lessons: getModuleLessons(m.id).map((l) => ({
          ...l,
          quizzes: getLessonQuizzes(l.id),
        })),
      })),
    };
  };

  const getCourseFlatLessons = (courseId: string) => {
    const modules = getCourseModules(courseId);
    return modules.flatMap((m) =>
      getModuleLessons(m.id).map((l) => ({
        moduleId: m.id,
        moduleTitle: m.title,
        lesson: l,
      })),
    );
  };

  const findRelationalLesson = (lessonId: string) => {
    const lesson = getLesson(lessonId);
    if (!lesson) return null;
    const module = globalModules.find((x) => x.id === lesson.module_id);
    if (!module) return null;
    const course = getCourse(module.course_id);
    if (!course) return null;

    const flat = getCourseFlatLessons(course.id);
    const idx = flat.findIndex((x) => x.lesson.id === lessonId);
    if (idx === -1) return null;

    return {
      course,
      module,
      lesson,
      entry: flat[idx],
      prev: idx > 0 ? flat[idx - 1] : null,
      next: idx < flat.length - 1 ? flat[idx + 1] : null,
    };
  };

  return {
    currentUser: globalCurrentUser,
    profiles: globalProfiles,
    categories: globalCategories,
    courses: globalCourses,
    modules: globalModules,
    lessons: globalLessons,
    quizzes: globalQuizzes,
    progress: globalProgress,
    quizAnswers: globalQuizAnswers,
    quizAttempts: globalQuizAttempts,
    selfAssessments: globalSelfAssessments,
    polls: globalPolls,
    pollVotes: globalPollVotes,
    comments: globalComments,
    forumTopics: globalForumTopics,
    forumReplies: globalForumReplies,
    studyGroups: globalStudyGroups,
    groupMessages: globalGroupMessages,
    certificates: globalCertificates,
    userChallenges: globalUserChallenges,
    lessonNotes: globalLessonNotes,
    login,
    register,
    logout,
    awardXp,
    updateStreak,
    freezeStreak,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    getCourseModules,
    addModule,
    updateModule,
    deleteModule,
    getModuleLessons,
    getLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    getLessonQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    getLessonProgress,
    toggleLessonProgress,
    getCourseProgressPercent,
    getQuizAnswer,
    submitQuizAnswer,
    submitQuizAttempt,
    getQuizAttempts,
    submitSelfAssessment,
    getSelfAssessmentsByLesson,
    getPollByLesson,
    getPollVotesCount,
    submitPollVote,
    getUserPollVote,
    getComments,
    addComment,
    toggleCommentLike,
    deleteComment,
    getForumTopics,
    getForumTopic,
    createForumTopic,
    getForumReplies,
    addForumReply,
    getStudyGroups,
    toggleGroupJoin,
    getGroupMessages,
    sendGroupMessage,
    getCertificates,
    getCertificateByCode,
    issueCertificate,
    getActiveChallenges,
    getLessonNotes,
    addLessonNote,
    deleteLessonNote,
    sendTutorMessage,
    generateQuizFromText,
    getFullCourse,
    getCourseFlatLessons,
    findRelationalLesson,
  };
}
