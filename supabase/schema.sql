-- ============================================================
-- Thư Viện Văn Mẫu THCS - Supabase Database Schema
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- Bảng bài văn mẫu
CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  class_level INTEGER CHECK (class_level BETWEEN 6 AND 9),
  category TEXT CHECK (category IN (
    'văn_biểu_cảm', 'văn_tự_sự', 'văn_thuyết_minh',
    'văn_nghị_luận', 'phân_tích_tác_phẩm'
  )),
  author TEXT NOT NULL DEFAULT 'Admin',
  content TEXT NOT NULL,
  outline_intro TEXT,
  outline_body TEXT,
  outline_conclusion TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'hidden')),
  views INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng đề thi trắc nghiệm
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_slug TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 6 AND 10),
  time_limit_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'hidden')),
  total_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng câu hỏi trắc nghiệm
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng đáp án (A, B, C, D)
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, option_label)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_essays_status ON essays(status);
CREATE INDEX IF NOT EXISTS idx_essays_class_level ON essays(class_level);
CREATE INDEX IF NOT EXISTS idx_quizzes_category_slug ON quizzes(category_slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);

-- Row Level Security
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

-- Public read cho nội dung đã xuất bản
CREATE POLICY "Public read published essays" ON essays
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read published quizzes" ON quizzes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read questions of published quizzes" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = questions.quiz_id AND q.status = 'published'
    )
  );

CREATE POLICY "Public read options of published quizzes" ON options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions qu
      JOIN quizzes q ON q.id = qu.quiz_id
      WHERE qu.id = options.question_id AND q.status = 'published'
    )
  );

-- Admin full access (anon key - phù hợp demo CMS hiện tại)
CREATE POLICY "Allow all essays" ON essays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all quizzes" ON quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all options" ON options FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Dữ liệu mẫu: Đề trắc nghiệm Ôn thi vào 10
-- ============================================================

INSERT INTO quizzes (id, title, description, category_slug, grade, time_limit_minutes, status)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'Trắc nghiệm Ngữ Văn 9 - Ôn thi vào 10 (Đề 1)',
    '20 câu hỏi trắc nghiệm cơ bản về tác phẩm, thể loại và kiến thức Ngữ Văn lớp 9.',
    'trac-nghiem-10',
    9,
    30,
    'published'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Trắc nghiệm Ngữ Văn 9 - Ôn thi vào 10 (Đề 2)',
    'Kiểm tra kiến thức về văn bản, nghệ thuật và tác giả - tác phẩm.',
    'trac-nghiem-10',
    9,
    25,
    'published'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Trắc nghiệm Ngữ Văn lớp 6',
    'Câu hỏi trắc nghiệm cơ bản về thể loại văn bản và tác phẩm lớp 6.',
    'trac-nghiem-6',
    6,
    20,
    'published'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'Trắc nghiệm Ngữ Văn lớp 7',
    'Ôn tập kiến thức Ngữ Văn 7 qua các câu hỏi trắc nghiệm.',
    'trac-nghiem-7',
    7,
    20,
    'published'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Trắc nghiệm Ngữ Văn lớp 8',
    'Bài tập trắc nghiệm về văn học và tiếng Việt lớp 8.',
    'trac-nghiem-8',
    8,
    20,
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- Câu hỏi mẫu cho Đề 1 (5 câu)
INSERT INTO questions (id, quiz_id, question_text, explanation, order_index) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
   'Tác phẩm "Chiếc thuyền ngoài xa" của Nguyễn Minh Châu thuộc thể loại văn bản nào?',
   'Đây là truyện ngắn thuộc thể loại văn tự sự, kể về cuộc sống và nghề nghiệp của người dân ven biển.', 1),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001',
   'Hình ảnh "vầng trăng" trong bài thơ "Ánh trăng" (Nguyễn Duy) mang ý nghĩa gì?',
   'Vầng trăng gợi nhớ về quê hương, tuổi thơ và những kỷ niệm đẹp trong lòng người con xa xứ.', 2),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001',
   'Thể loại văn bản nghị luận xã hội thường bàn luận về điều gì?',
   'Văn bản nghị luận xã hội bàn luận về các vấn đề xã hội, đạo đức, lối sống trong cuộc sống.', 3),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001',
   'Tác giả của tác phẩm "Những ngôi sao xa xôi" là ai?',
   'Những ngôi sao xa xôi là truyện ngắn của nhà văn Lê Minh Khuê, viết về cuộc sống chiến tranh.', 4),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001',
   'Biện pháp tu từ "nhân hóa" là gì?',
   'Nhân hóa là gán cho sự vật, hiện tượng những tính cách, hoạt động của con người.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO options (question_id, option_label, option_text, is_correct) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'A', 'Văn tự sự', true),
  ('b1000000-0000-4000-8000-000000000001', 'B', 'Văn nghị luận', false),
  ('b1000000-0000-4000-8000-000000000001', 'C', 'Văn biểu cảm', false),
  ('b1000000-0000-4000-8000-000000000001', 'D', 'Văn thuyết minh', false),
  ('b1000000-0000-4000-8000-000000000002', 'A', 'Vẻ đẹp của thiên nhiên', false),
  ('b1000000-0000-4000-8000-000000000002', 'B', 'Kỷ niệm tuổi thơ và quê hương', true),
  ('b1000000-0000-4000-8000-000000000002', 'C', 'Sự cô đơn của con người', false),
  ('b1000000-0000-4000-8000-000000000002', 'D', 'Vẻ đẹp của tình yêu', false),
  ('b1000000-0000-4000-8000-000000000003', 'A', 'Cảnh đẹp thiên nhiên', false),
  ('b1000000-0000-4000-8000-000000000003', 'B', 'Lịch sử các triều đại', false),
  ('b1000000-0000-4000-8000-000000000003', 'C', 'Các vấn đề xã hội, đạo đức', true),
  ('b1000000-0000-4000-8000-000000000003', 'D', 'Kiến thức khoa học', false),
  ('b1000000-0000-4000-8000-000000000004', 'A', 'Nguyễn Minh Châu', false),
  ('b1000000-0000-4000-8000-000000000004', 'B', 'Lê Minh Khuê', true),
  ('b1000000-0000-4000-8000-000000000004', 'C', 'Nguyễn Duy', false),
  ('b1000000-0000-4000-8000-000000000004', 'D', 'Nam Cao', false),
  ('b1000000-0000-4000-8000-000000000005', 'A', 'So sánh sự vật với sự vật', false),
  ('b1000000-0000-4000-8000-000000000005', 'B', 'Gán cho sự vật tính cách con người', true),
  ('b1000000-0000-4000-8000-000000000005', 'C', 'Nói quá sự thật', false),
  ('b1000000-0000-4000-8000-000000000005', 'D', 'Lặp lại từ ngữ', false);

-- Câu hỏi mẫu cho Đề 2 (3 câu)
INSERT INTO questions (id, quiz_id, question_text, explanation, order_index) VALUES
  ('b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000002',
   'Tác phẩm "Đất nước" của Nguyễn Khoa Điềm thuộc thể loại thơ nào?',
   'Bài thơ Đất nước thuộc thể loại thơ ca ngợi Tổ quốc, ca ngợi lòng yêu nước.', 1),
  ('b1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000002',
   'Nhân vật chính trong truyện "Lặng lẽ Sa Pa" là ai?',
   'Nhân vật chính là cô giáo Vũ, người đã cống hiến cho sự nghiệp giáo dục vùng cao.', 2),
  ('b1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000002',
   'Thành ngữ "Ăn quả nhớ kẻ trồng cây" thể hiện đức tính gì?',
   'Thành ngữ thể hiện lòng biết ơn, nhớ công lao của người đi trước.', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO options (question_id, option_label, option_text, is_correct) VALUES
  ('b1000000-0000-4000-8000-000000000006', 'A', 'Thơ ca ngợi Tổ quốc', true),
  ('b1000000-0000-4000-8000-000000000006', 'B', 'Thơ tự sự', false),
  ('b1000000-0000-4000-8000-000000000006', 'C', 'Thơ trữ tình', false),
  ('b1000000-0000-4000-8000-000000000006', 'D', 'Thơ hài hước', false),
  ('b1000000-0000-4000-8000-000000000007', 'A', 'Cô giáo Vũ', true),
  ('b1000000-0000-4000-8000-000000000007', 'B', 'An', false),
  ('b1000000-0000-4000-8000-000000000007', 'C', 'Thảo', false),
  ('b1000000-0000-4000-8000-000000000007', 'D', 'Lan', false),
  ('b1000000-0000-4000-8000-000000000008', 'A', 'Lòng dũng cảm', false),
  ('b1000000-0000-4000-8000-000000000008', 'B', 'Lòng biết ơn', true),
  ('b1000000-0000-4000-8000-000000000008', 'C', 'Lòng nhân hậu', false),
  ('b1000000-0000-4000-8000-000000000008', 'D', 'Lòng kiên trì', false);
