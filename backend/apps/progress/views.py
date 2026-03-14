from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.curriculum.models import Lesson, Unit

from .models import LessonAttempt, LessonCompletion
from .serializers import LessonAttemptSerializer, ProgressSummarySerializer


class LessonStartView(APIView):
    """Create a new LessonAttempt when the user starts a quiz."""

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id, is_published=True)
        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        attempt = LessonAttempt.objects.create(
            user=request.user, lesson=lesson
        )
        return Response(
            LessonAttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED,
        )


class LessonCompleteView(APIView):
    """Mark a lesson as complete without a quiz (content-only lessons)."""

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id, is_published=True)
        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            completion, created = LessonCompletion.objects.get_or_create(
                user=request.user, lesson=lesson
            )

            xp_earned = 0
            if created:
                xp_earned = lesson.xp_reward
                profile = request.user.profile
                profile.xp_total += xp_earned
                today = timezone.now().date()
                if profile.last_activity_date == today - timezone.timedelta(days=1):
                    profile.streak_days += 1
                elif profile.last_activity_date != today:
                    profile.streak_days = 1
                profile.last_activity_date = today
                profile.save(
                    update_fields=["xp_total", "streak_days", "last_activity_date"]
                )

        return Response({
            "already_completed": not created,
            "xp_earned": xp_earned,
        })


class ProgressSummaryView(APIView):
    def get(self, request):
        profile = request.user.profile
        lessons_done = LessonCompletion.objects.filter(user=request.user).count()

        # A unit is complete when all published lessons are completed
        units = Unit.objects.filter(is_published=True).annotate(
            total_lessons=Count("lessons", filter=Q(lessons__is_published=True)),
            completed_lessons=Count(
                "lessons",
                filter=Q(lessons__completions__user=request.user),
            ),
        )
        units_completed = sum(
            1 for u in units
            if u.total_lessons > 0 and u.completed_lessons >= u.total_lessons
        )

        data = {
            "xp_total": profile.xp_total,
            "streak_days": profile.streak_days,
            "lessons_completed": lessons_done,
            "units_completed": units_completed,
        }
        serializer = ProgressSummarySerializer(data)
        return Response(serializer.data)
