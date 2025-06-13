
-- Insert sample courses
INSERT INTO public.courses (id, title_sv, description_sv) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Introduktion till Maskininlärning',
  'Grundläggande koncept inom maskininlärning med Andrew Ng. Lär dig vad maskininlärning är och hur det används i praktiken.'
),
(
  '22222222-2222-2222-2222-222222222222', 
  'Övervakad Inlärning',
  'Djupdykning i övervakad inlärning, inklusive linjär regression, logistisk regression och beslutsträd.'
);

-- Insert sample lessons for Course 1
INSERT INTO public.lessons (id, course_id, title_sv, video_url, summary_sv, order_number) VALUES 
(
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111111',
  'Vad är Maskininlärning?',
  'https://www.youtube.com/watch?v=PPLop4L2eGk',
  'En introduktion till maskininlärning och dess tillämpningar i dagens värld.',
  1
),
(
  '11111111-1111-1111-1111-111111111113',
  '11111111-1111-1111-1111-111111111111',
  'Typer av Maskininlärning',
  'https://www.youtube.com/watch?v=1FZ0A1QCMWc',
  'Lär dig om övervakad, icke-övervakad och förstärkningsinlärning.',
  2
);

-- Insert sample lessons for Course 2
INSERT INTO public.lessons (id, course_id, title_sv, video_url, summary_sv, order_number) VALUES 
(
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222222',
  'Linjär Regression',
  'https://www.youtube.com/watch?v=kHwlB_j7Hkc',
  'Grunderna i linjär regression och hur man förutsäger kontinuerliga värden.',
  1
),
(
  '22222222-2222-2222-2222-222222222224',
  '22222222-2222-2222-2222-222222222222',
  'Logistisk Regression',
  'https://www.youtube.com/watch?v=-la3q9d7AKQ',
  'Lär dig logistisk regression för klassificeringsproblem.',
  2
);

-- Insert sample flashcards
INSERT INTO public.flashcards (lesson_id, front_sv, back_sv) VALUES 
-- Flashcards for lesson 1
(
  '11111111-1111-1111-1111-111111111112',
  'Vad är Maskininlärning?',
  'Ett sätt att ge datorer förmågan att lära sig utan att vara explicit programmerade.'
),
(
  '11111111-1111-1111-1111-111111111112',
  'Vad är skillnaden mellan traditionell programmering och maskininlärning?',
  'Traditionell programmering: Input + Program = Output. Maskininlärning: Input + Output = Program.'
),
-- Flashcards for lesson 2
(
  '11111111-1111-1111-1111-111111111113',
  'Vad är övervakad inlärning?',
  'Inlärning där algoritmen tränas på data med kända svar (etiketter).'
),
(
  '11111111-1111-1111-1111-111111111113',
  'Vad är icke-övervakad inlärning?',
  'Inlärning där algoritmen hittar mönster i data utan kända svar.'
),
-- Flashcards for lesson 3
(
  '22222222-2222-2222-2222-222222222223',
  'Vad är linjär regression?',
  'En metod för att förutsäga kontinuerliga värden genom att hitta den bästa linjen genom datapunkterna.'
),
(
  '22222222-2222-2222-2222-222222222223',
  'Vad är kostnadsfunktionen i linjär regression?',
  'En funktion som mäter hur fel våra förutsägelser är, oftast Mean Squared Error.'
);

-- Insert sample quizzes
INSERT INTO public.quizzes (lesson_id, question_sv, answer_options, correct_answer) VALUES 
-- Quiz for lesson 1
(
  '11111111-1111-1111-1111-111111111112',
  'Vilket av följande är det bästa sättet att beskriva maskininlärning?',
  '["Ett sätt att programmera datorer manuellt", "Ett sätt att ge datorer förmågan att lära sig från data", "Ett sätt att bygga hemsidor", "Ett sätt att designa databaser"]',
  1
),
-- Quiz for lesson 2
(
  '11111111-1111-1111-1111-111111111113',
  'Vilken typ av inlärning använder etiketterad data?',
  '["Icke-övervakad inlärning", "Övervakad inlärning", "Förstärkningsinlärning", "Djupinlärning"]',
  1
),
-- Quiz for lesson 3
(
  '22222222-2222-2222-2222-222222222223',
  'Vad försöker linjär regression att hitta?',
  '["Den bästa cirkeln genom data", "Den bästa linjen genom data", "Den bästa kurvan genom data", "Den bästa punkten i data"]',
  1
),
-- Quiz for lesson 4
(
  '22222222-2222-2222-2222-222222222224',
  'Vad används logistisk regression för?',
  '["Att förutsäga kontinuerliga värden", "Att klassificera data i kategorier", "Att sortera data", "Att radera data"]',
  1
);
