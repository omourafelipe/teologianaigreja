-- Script SQL para criação das tabelas de conteúdo da plataforma Teologia na Igreja no Supabase

-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- 2. Tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  is_published BOOLEAN DEFAULT TRUE
);

-- 3. Tabela de Módulos
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- 4. Tabela de Lições
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- 5. Tabela de Quizzes (Exercícios de Fixação)
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Armazena a lista de alternativas em formato JSON
  correct_option_index INTEGER NOT NULL,
  explanation TEXT
);

-- Habilitar leitura pública para todas as tabelas (opcional / dependendo das suas políticas de RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access for modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Allow public read access for lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read access for quizzes" ON quizzes FOR SELECT USING (true);

-- Permitir todas as operações para usuários autenticados (ou professores) - Exemplo básico:
CREATE POLICY "Allow write access for authenticated users on categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access for authenticated users on courses" ON courses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access for authenticated users on modules" ON modules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access for authenticated users on lessons" ON lessons FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access for authenticated users on quizzes" ON quizzes FOR ALL TO authenticated USING (true);
