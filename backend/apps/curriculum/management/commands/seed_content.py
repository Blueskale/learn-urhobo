from django.core.management.base import BaseCommand

from apps.curriculum.models import (
    ContentBlock,
    Course,
    Lesson,
    LessonVocabulary,
    Unit,
    VocabularyItem,
)
from apps.quiz.models import MatchItem, Option, Question


class Command(BaseCommand):
    help = "Seed the database with beginner Urhobo content"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Urhobo beginner content...")

        course, _ = Course.objects.get_or_create(
            title="Urhobo for Beginners",
            defaults={
                "description": "Learn the fundamentals of the Urhobo language — "
                "greetings, common words, phrases, and everyday expressions.",
                "language_code": "urh",
                "order": 1,
                "is_published": True,
            },
        )

        # ── Unit 1: Greetings ──
        unit1, _ = Unit.objects.get_or_create(
            course=course,
            title="Greetings",
            defaults={
                "description": "Learn how to greet people in Urhobo.",
                "order": 1,
                "icon_name": "hand-wave",
                "is_published": True,
            },
        )

        # Vocabulary items for greetings
        greetings_vocab = [
            {
                "urhobo_text": "Miguo",
                "english_text": "Hello / Greetings",
                "pronunciation_guide": "Mee-gwo",
                "example_usage": "Miguo! Oma ro re? — Hello! How are you?",
                "category": "greetings",
            },
            {
                "urhobo_text": "Oma ro re?",
                "english_text": "How are you?",
                "pronunciation_guide": "Oh-mah roh reh",
                "example_usage": "Miguo, oma ro re? — Hello, how are you?",
                "category": "greetings",
            },
            {
                "urhobo_text": "Mẹ rẹ",
                "english_text": "I am fine",
                "pronunciation_guide": "Meh reh",
                "example_usage": "Mẹ rẹ, vrendo. — I am fine, thank you.",
                "category": "greetings",
            },
            {
                "urhobo_text": "Vrendo",
                "english_text": "Thank you",
                "pronunciation_guide": "Vreh-ndoh",
                "example_usage": "Vrendo kpahe. — Thank you very much.",
                "category": "greetings",
            },
            {
                "urhobo_text": "Avwanrẹ",
                "english_text": "Good morning",
                "pronunciation_guide": "Ah-vwan-reh",
                "example_usage": "Avwanrẹ, miguo! — Good morning, hello!",
                "category": "greetings",
            },
            {
                "urhobo_text": "Do bro?",
                "english_text": "Good afternoon / evening",
                "pronunciation_guide": "Doh broh",
                "example_usage": "Do bro, oma ro re? — Good evening, how are you?",
                "category": "greetings",
            },
        ]

        vocab_objects = {}
        for v in greetings_vocab:
            obj, _ = VocabularyItem.objects.get_or_create(
                urhobo_text=v["urhobo_text"],
                defaults=v,
            )
            vocab_objects[v["urhobo_text"]] = obj

        # Lesson 1.1: Basic Greetings
        lesson1, _ = Lesson.objects.get_or_create(
            unit=unit1,
            title="Basic Greetings",
            defaults={
                "order": 1,
                "xp_reward": 10,
                "estimated_minutes": 5,
                "is_published": True,
            },
        )

        content_blocks_1 = [
            ("word", "Miguo", "Hello / Greetings", "Mee-gwo"),
            ("phrase", "Oma ro re?", "How are you?", "Oh-mah roh reh"),
            ("phrase", "Mẹ rẹ", "I am fine", "Meh reh"),
            ("tip", "Miguo", "The most common Urhobo greeting. Use it anytime!", ""),
        ]
        for i, (btype, urh, eng, pron) in enumerate(content_blocks_1, 1):
            ContentBlock.objects.get_or_create(
                lesson=lesson1,
                order=i,
                defaults={
                    "block_type": btype,
                    "urhobo_text": urh,
                    "english_text": eng,
                    "pronunciation_guide": pron,
                },
            )

        # Link vocab to lesson 1
        for i, key in enumerate(["Miguo", "Oma ro re?", "Mẹ rẹ"], 1):
            LessonVocabulary.objects.get_or_create(
                lesson=lesson1,
                vocabulary_item=vocab_objects[key],
                defaults={"order": i},
            )

        # Quiz for Lesson 1
        q1, _ = Question.objects.get_or_create(
            lesson=lesson1,
            order=1,
            defaults={
                "question_type": "multiple_choice",
                "prompt": "What does 'Miguo' mean?",
                "vocabulary_item": vocab_objects["Miguo"],
            },
        )
        if _:
            Option.objects.bulk_create([
                Option(question=q1, text="Hello / Greetings", is_correct=True),
                Option(question=q1, text="Goodbye", is_correct=False),
                Option(question=q1, text="Thank you", is_correct=False),
                Option(question=q1, text="I am fine", is_correct=False),
            ])

        q2, _ = Question.objects.get_or_create(
            lesson=lesson1,
            order=2,
            defaults={
                "question_type": "translation",
                "prompt": "How do you say 'How are you?' in Urhobo?",
            },
        )
        if _:
            Option.objects.bulk_create([
                Option(question=q2, text="Oma ro re?", is_correct=True),
                Option(question=q2, text="Miguo", is_correct=False),
                Option(question=q2, text="Vrendo", is_correct=False),
                Option(question=q2, text="Mẹ rẹ", is_correct=False),
            ])

        q3, _ = Question.objects.get_or_create(
            lesson=lesson1,
            order=3,
            defaults={
                "question_type": "fill_blank",
                "prompt": "Complete the greeting: ___ ro re? (How are you?)",
                "correct_answer_text": "Oma",
            },
        )

        # Lesson 1.2: Saying Thank You & Goodbye
        lesson2, _ = Lesson.objects.get_or_create(
            unit=unit1,
            title="Thank You & Goodbye",
            defaults={
                "order": 2,
                "xp_reward": 10,
                "estimated_minutes": 5,
                "is_published": True,
            },
        )

        content_blocks_2 = [
            ("word", "Vrendo", "Thank you", "Vreh-ndoh"),
            ("phrase", "Vrendo kpahe", "Thank you very much", "Vreh-ndoh kpah-heh"),
            ("word", "Ode", "Goodbye / Farewell", "Oh-deh"),
            ("tip", "Vrendo", "'Vrendo' is used the same way as 'thank you' — after receiving something or when showing gratitude.", ""),
        ]
        for i, (btype, urh, eng, pron) in enumerate(content_blocks_2, 1):
            ContentBlock.objects.get_or_create(
                lesson=lesson2,
                order=i,
                defaults={
                    "block_type": btype,
                    "urhobo_text": urh,
                    "english_text": eng,
                    "pronunciation_guide": pron,
                },
            )

        for i, key in enumerate(["Vrendo"], 1):
            LessonVocabulary.objects.get_or_create(
                lesson=lesson2,
                vocabulary_item=vocab_objects[key],
                defaults={"order": i},
            )

        # Quiz for Lesson 2 — includes a matching question
        q4, _ = Question.objects.get_or_create(
            lesson=lesson2,
            order=1,
            defaults={
                "question_type": "matching",
                "prompt": "Match the Urhobo words to their English meanings",
            },
        )
        if _:
            MatchItem.objects.bulk_create([
                MatchItem(question=q4, text="Miguo", side="left", pair_key=1),
                MatchItem(question=q4, text="Hello", side="right", pair_key=1),
                MatchItem(question=q4, text="Vrendo", side="left", pair_key=2),
                MatchItem(question=q4, text="Thank you", side="right", pair_key=2),
                MatchItem(question=q4, text="Ode", side="left", pair_key=3),
                MatchItem(question=q4, text="Goodbye", side="right", pair_key=3),
            ])

        q5, _ = Question.objects.get_or_create(
            lesson=lesson2,
            order=2,
            defaults={
                "question_type": "fill_blank",
                "prompt": "Say 'thank you very much': ___ kpahe",
                "correct_answer_text": "Vrendo",
            },
        )

        # ── Unit 2: Common Words ──
        unit2, _ = Unit.objects.get_or_create(
            course=course,
            title="Common Words",
            defaults={
                "description": "Learn everyday Urhobo words for family, food, and more.",
                "order": 2,
                "icon_name": "book-open",
                "is_published": True,
            },
        )

        common_vocab = [
            {
                "urhobo_text": "Ọwha",
                "english_text": "Father",
                "pronunciation_guide": "Aw-wah",
                "example_usage": "Ọwha mẹ — My father",
                "category": "family",
            },
            {
                "urhobo_text": "Ẹnẹ",
                "english_text": "Mother",
                "pronunciation_guide": "Eh-neh",
                "example_usage": "Ẹnẹ mẹ — My mother",
                "category": "family",
            },
            {
                "urhobo_text": "Ọmọ",
                "english_text": "Child",
                "pronunciation_guide": "Aw-maw",
                "example_usage": "Ọmọ nẹ — This child",
                "category": "family",
            },
            {
                "urhobo_text": "Amẹ",
                "english_text": "Water",
                "pronunciation_guide": "Ah-meh",
                "example_usage": "Mẹ hwo amẹ — I want water",
                "category": "everyday",
            },
            {
                "urhobo_text": "Irri",
                "english_text": "Food",
                "pronunciation_guide": "Ee-rree",
                "example_usage": "Irri re odjẹ — The food is good",
                "category": "everyday",
            },
            {
                "urhobo_text": "Obọ",
                "english_text": "Hand",
                "pronunciation_guide": "Oh-baw",
                "example_usage": "Fi obọ — Wash your hands",
                "category": "body",
            },
        ]

        common_vocab_objs = {}
        for v in common_vocab:
            obj, _ = VocabularyItem.objects.get_or_create(
                urhobo_text=v["urhobo_text"],
                defaults=v,
            )
            common_vocab_objs[v["urhobo_text"]] = obj

        # Lesson 2.1: Family Words
        lesson3, _ = Lesson.objects.get_or_create(
            unit=unit2,
            title="Family Words",
            defaults={
                "order": 1,
                "xp_reward": 10,
                "estimated_minutes": 5,
                "is_published": True,
            },
        )

        family_blocks = [
            ("word", "Ọwha", "Father", "Aw-wah"),
            ("word", "Ẹnẹ", "Mother", "Eh-neh"),
            ("word", "Ọmọ", "Child", "Aw-maw"),
            ("tip", "Ọmọ", "'Ọmọ' can also mean 'person from' — Ọmọ Urhobo means 'Urhobo person'.", ""),
        ]
        for i, (btype, urh, eng, pron) in enumerate(family_blocks, 1):
            ContentBlock.objects.get_or_create(
                lesson=lesson3,
                order=i,
                defaults={
                    "block_type": btype,
                    "urhobo_text": urh,
                    "english_text": eng,
                    "pronunciation_guide": pron,
                },
            )

        for i, key in enumerate(["Ọwha", "Ẹnẹ", "Ọmọ"], 1):
            LessonVocabulary.objects.get_or_create(
                lesson=lesson3,
                vocabulary_item=common_vocab_objs[key],
                defaults={"order": i},
            )

        q6, _ = Question.objects.get_or_create(
            lesson=lesson3,
            order=1,
            defaults={
                "question_type": "translation",
                "prompt": "What is the Urhobo word for 'Mother'?",
            },
        )
        if _:
            Option.objects.bulk_create([
                Option(question=q6, text="Ẹnẹ", is_correct=True),
                Option(question=q6, text="Ọwha", is_correct=False),
                Option(question=q6, text="Ọmọ", is_correct=False),
                Option(question=q6, text="Miguo", is_correct=False),
            ])

        q7, _ = Question.objects.get_or_create(
            lesson=lesson3,
            order=2,
            defaults={
                "question_type": "matching",
                "prompt": "Match the family words",
            },
        )
        if _:
            MatchItem.objects.bulk_create([
                MatchItem(question=q7, text="Ọwha", side="left", pair_key=1),
                MatchItem(question=q7, text="Father", side="right", pair_key=1),
                MatchItem(question=q7, text="Ẹnẹ", side="left", pair_key=2),
                MatchItem(question=q7, text="Mother", side="right", pair_key=2),
                MatchItem(question=q7, text="Ọmọ", side="left", pair_key=3),
                MatchItem(question=q7, text="Child", side="right", pair_key=3),
            ])

        # Lesson 2.2: Everyday Words
        lesson4, _ = Lesson.objects.get_or_create(
            unit=unit2,
            title="Everyday Words",
            defaults={
                "order": 2,
                "xp_reward": 10,
                "estimated_minutes": 5,
                "is_published": True,
            },
        )

        everyday_blocks = [
            ("word", "Amẹ", "Water", "Ah-meh"),
            ("word", "Irri", "Food", "Ee-rree"),
            ("word", "Obọ", "Hand", "Oh-baw"),
        ]
        for i, (btype, urh, eng, pron) in enumerate(everyday_blocks, 1):
            ContentBlock.objects.get_or_create(
                lesson=lesson4,
                order=i,
                defaults={
                    "block_type": btype,
                    "urhobo_text": urh,
                    "english_text": eng,
                    "pronunciation_guide": pron,
                },
            )

        for i, key in enumerate(["Amẹ", "Irri", "Obọ"], 1):
            LessonVocabulary.objects.get_or_create(
                lesson=lesson4,
                vocabulary_item=common_vocab_objs[key],
                defaults={"order": i},
            )

        q8, _ = Question.objects.get_or_create(
            lesson=lesson4,
            order=1,
            defaults={
                "question_type": "multiple_choice",
                "prompt": "What does 'Amẹ' mean?",
                "vocabulary_item": common_vocab_objs["Amẹ"],
            },
        )
        if _:
            Option.objects.bulk_create([
                Option(question=q8, text="Water", is_correct=True),
                Option(question=q8, text="Food", is_correct=False),
                Option(question=q8, text="Hand", is_correct=False),
                Option(question=q8, text="Father", is_correct=False),
            ])

        q9, _ = Question.objects.get_or_create(
            lesson=lesson4,
            order=2,
            defaults={
                "question_type": "fill_blank",
                "prompt": "The Urhobo word for 'food' is: ___",
                "correct_answer_text": "Irri",
            },
        )

        self.stdout.write(self.style.SUCCESS(
            "Seeded: 1 course, 2 units, 4 lessons, "
            f"{VocabularyItem.objects.count()} vocabulary items, "
            f"{Question.objects.count()} quiz questions"
        ))
