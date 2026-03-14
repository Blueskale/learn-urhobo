from adminsortable2.admin import SortableAdminBase, SortableInlineAdminMixin
from django.contrib import admin

from .models import (
    ContentBlock,
    Course,
    Lesson,
    LessonVocabulary,
    Unit,
    VocabularyItem,
)


class UnitInline(SortableInlineAdminMixin, admin.TabularInline):
    model = Unit
    extra = 0
    fields = ["title", "order", "icon_name", "is_published"]


@admin.register(Course)
class CourseAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ["title", "language_code", "order", "is_published"]
    list_editable = ["order", "is_published"]
    inlines = [UnitInline]


class LessonInline(SortableInlineAdminMixin, admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ["title", "order", "xp_reward", "estimated_minutes", "is_published"]


@admin.register(Unit)
class UnitAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ["title", "course", "order", "is_published"]
    list_filter = ["course", "is_published"]
    list_editable = ["order", "is_published"]
    inlines = [LessonInline]


class ContentBlockInline(SortableInlineAdminMixin, admin.TabularInline):
    model = ContentBlock
    extra = 0


class LessonVocabularyInline(SortableInlineAdminMixin, admin.TabularInline):
    model = LessonVocabulary
    extra = 0
    autocomplete_fields = ["vocabulary_item"]


@admin.register(Lesson)
class LessonAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ["title", "unit", "order", "xp_reward", "is_published"]
    list_filter = ["unit__course", "unit", "is_published"]
    list_editable = ["order", "is_published"]
    inlines = [ContentBlockInline, LessonVocabularyInline]


@admin.register(VocabularyItem)
class VocabularyItemAdmin(admin.ModelAdmin):
    list_display = ["urhobo_text", "english_text", "category", "is_published"]
    list_filter = ["category", "is_published"]
    search_fields = ["urhobo_text", "english_text"]
