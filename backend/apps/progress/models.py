from django.conf import settings
from django.db import models

from apps.curriculum.models import Lesson


class LessonAttempt(models.Model):
    """One row per attempt at a lesson's quiz. Supports retries."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_attempts",
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="attempts"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    quiz_score = models.PositiveIntegerField(null=True, blank=True)
    xp_earned = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        status = f"score={self.quiz_score}" if self.submitted_at else "in progress"
        return f"{self.user.email} → {self.lesson.title} ({status})"


class LessonCompletion(models.Model):
    """One row per user per lesson. Created on first successful completion."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_completions",
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="completions"
    )
    first_completed_at = models.DateTimeField(auto_now_add=True)
    best_quiz_score = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = [("user", "lesson")]
        ordering = ["-first_completed_at"]

    def __str__(self):
        return f"{self.user.email} ✓ {self.lesson.title}"
