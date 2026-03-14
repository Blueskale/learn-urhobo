from rest_framework import serializers

from apps.curriculum.models import Lesson

from .models import LessonAttempt, LessonCompletion


class LessonAttemptSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonAttempt
        fields = [
            "id", "lesson", "lesson_title", "started_at",
            "submitted_at", "quiz_score", "xp_earned",
        ]
        read_only_fields = fields


class LessonCompletionSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonCompletion
        fields = ["id", "lesson", "lesson_title", "first_completed_at", "best_quiz_score"]
        read_only_fields = fields


class ProgressSummarySerializer(serializers.Serializer):
    xp_total = serializers.IntegerField()
    streak_days = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    units_completed = serializers.IntegerField()
