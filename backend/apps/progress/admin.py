from django.contrib import admin

from .models import LessonAttempt, LessonCompletion


@admin.register(LessonAttempt)
class LessonAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "started_at", "submitted_at", "quiz_score", "xp_earned"]
    list_filter = ["lesson__unit__course", "lesson__unit"]
    readonly_fields = ["user", "lesson", "started_at", "submitted_at", "quiz_score", "xp_earned"]


@admin.register(LessonCompletion)
class LessonCompletionAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "first_completed_at", "best_quiz_score"]
    list_filter = ["lesson__unit__course", "lesson__unit"]
    readonly_fields = ["user", "lesson", "first_completed_at", "best_quiz_score"]
