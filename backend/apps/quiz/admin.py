from adminsortable2.admin import SortableAdminBase, SortableInlineAdminMixin
from django.contrib import admin

from .models import MatchItem, Option, Question


class OptionInline(admin.TabularInline):
    model = Option
    extra = 3


class MatchItemInline(admin.TabularInline):
    model = MatchItem
    extra = 4


@admin.register(Question)
class QuestionAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ["prompt_short", "lesson", "question_type", "order"]
    list_filter = ["question_type", "lesson__unit__course", "lesson__unit", "lesson"]
    inlines = [OptionInline, MatchItemInline]

    @admin.display(description="Prompt")
    def prompt_short(self, obj):
        return obj.prompt[:80]
