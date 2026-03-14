from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.progress.models import LessonAttempt, LessonCompletion

from .models import MatchItem, Option, Question
from .serializers import QuestionSerializer, QuizSubmitSerializer


class QuizQuestionsView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        return Question.objects.filter(
            lesson_id=self.kwargs["lesson_id"]
        ).prefetch_related("options", "match_items")


class QuizSubmitView(APIView):
    def post(self, request, lesson_id):
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        attempt_id = serializer.validated_data["attempt_id"]
        answers = serializer.validated_data["answers"]

        # Validate attempt belongs to this user and lesson
        try:
            attempt = LessonAttempt.objects.get(
                id=attempt_id,
                user=request.user,
                lesson_id=lesson_id,
                submitted_at__isnull=True,
            )
        except LessonAttempt.DoesNotExist:
            return Response(
                {"error": "Invalid or already submitted attempt."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions = Question.objects.filter(lesson_id=lesson_id)
        total = questions.count()
        if total == 0:
            return Response(
                {"error": "No questions for this lesson."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct = 0
        for answer in answers:
            qid = answer["question_id"]
            try:
                question = questions.get(id=qid)
            except Question.DoesNotExist:
                continue

            if question.question_type in ("multiple_choice", "translation"):
                option_id = answer.get("option_id")
                if option_id and Option.objects.filter(
                    id=option_id, question=question, is_correct=True
                ).exists():
                    correct += 1

            elif question.question_type == "fill_blank":
                text = (answer.get("text") or "").strip().lower()
                if text == question.correct_answer_text.strip().lower():
                    correct += 1

            elif question.question_type == "matching":
                matches = answer.get("matches", [])
                all_correct = True
                for match in matches:
                    left_id = match.get("left_id")
                    right_id = match.get("right_id")
                    try:
                        left = MatchItem.objects.get(
                            id=left_id, question=question, side="left"
                        )
                        right = MatchItem.objects.get(
                            id=right_id, question=question, side="right"
                        )
                        if left.pair_key != right.pair_key:
                            all_correct = False
                            break
                    except MatchItem.DoesNotExist:
                        all_correct = False
                        break
                if all_correct and len(matches) > 0:
                    correct += 1

        score = round(correct / total * 100)
        passed = score >= 70

        # Wrap completion + XP + attempt update in a transaction
        # to prevent duplicate XP or partial writes
        with transaction.atomic():
            attempt.quiz_score = score
            attempt.submitted_at = timezone.now()

            xp_earned = 0
            best_score = score
            if passed:
                completion, created = LessonCompletion.objects.get_or_create(
                    user=request.user,
                    lesson_id=lesson_id,
                    defaults={
                        "best_quiz_score": score,
                    },
                )
                if created:
                    xp_earned = attempt.lesson.xp_reward
                    profile = request.user.profile
                    profile.xp_total += xp_earned
                    today = timezone.now().date()
                    if profile.last_activity_date == today - timezone.timedelta(days=1):
                        profile.streak_days += 1
                    elif profile.last_activity_date != today:
                        profile.streak_days = 1
                    profile.last_activity_date = today
                    profile.save(
                        update_fields=[
                            "xp_total", "streak_days", "last_activity_date"
                        ]
                    )
                else:
                    if completion.best_quiz_score is None or score > completion.best_quiz_score:
                        completion.best_quiz_score = score
                        completion.save(update_fields=["best_quiz_score"])
                best_score = completion.best_quiz_score

            attempt.xp_earned = xp_earned
            attempt.save(update_fields=["quiz_score", "submitted_at", "xp_earned"])

        return Response({
            "score": score,
            "correct": correct,
            "total": total,
            "passed": passed,
            "xp_earned": xp_earned,
            "best_score": best_score,
        })
