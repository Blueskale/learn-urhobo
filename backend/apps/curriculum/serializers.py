from rest_framework import serializers

from apps.progress.models import LessonCompletion

from .models import ContentBlock, Course, Lesson, LessonVocabulary, Unit, VocabularyItem


class CourseSerializer(serializers.ModelSerializer):
    unit_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "language_code", "icon_name", "unit_count"]


class UnitSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = [
            "id", "title", "description", "order", "icon_name",
            "lesson_count", "progress_percent",
        ]

    def get_progress_percent(self, obj):
        user = self.context["request"].user
        total = obj.lessons.filter(is_published=True).count()
        if total == 0:
            return 0
        done = LessonCompletion.objects.filter(
            user=user, lesson__unit=obj
        ).count()
        return round(done / total * 100)


class VocabularyItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyItem
        fields = [
            "id", "urhobo_text", "english_text", "pronunciation_guide",
            "audio_url", "example_usage", "category",
        ]


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = [
            "id", "order", "block_type", "urhobo_text", "english_text",
            "pronunciation_guide", "audio_url",
        ]


class LessonListSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "title", "order", "xp_reward", "estimated_minutes",
            "is_locked", "is_completed",
        ]

    def _get_completions(self):
        """Cache the user's completions for this unit to avoid N+1 queries."""
        if "_completions" not in self.context:
            user = self.context["request"].user
            unit = self.context.get("unit")
            if unit:
                self.context["_completions"] = set(
                    LessonCompletion.objects.filter(
                        user=user, lesson__unit=unit
                    ).values_list("lesson_id", flat=True)
                )
            else:
                self.context["_completions"] = set()
        return self.context["_completions"]

    def get_is_completed(self, obj):
        return obj.id in self._get_completions()

    def get_is_locked(self, obj):
        completions = self._get_completions()
        # First lesson in the first unit is always unlocked
        if obj.order == 1:
            unit = obj.unit
            if unit.order == 1:
                return False
            # First lesson of a later unit: requires all lessons
            # in the previous unit to be completed
            prev_unit = Unit.objects.filter(
                course=unit.course, order=unit.order - 1
            ).first()
            if prev_unit:
                total = prev_unit.lessons.filter(is_published=True).count()
                done = LessonCompletion.objects.filter(
                    user=self.context["request"].user,
                    lesson__unit=prev_unit,
                ).count()
                return done < total
            return False
        # Otherwise: previous lesson in this unit must be completed
        prev_lesson = Lesson.objects.filter(
            unit=obj.unit, order=obj.order - 1
        ).first()
        if prev_lesson:
            return prev_lesson.id not in completions
        return False


class LessonDetailSerializer(serializers.ModelSerializer):
    content_blocks = ContentBlockSerializer(many=True, read_only=True)
    vocabulary_items = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "title", "order", "xp_reward", "estimated_minutes",
            "content_blocks", "vocabulary_items",
        ]

    def get_vocabulary_items(self, obj):
        links = LessonVocabulary.objects.filter(lesson=obj).select_related(
            "vocabulary_item"
        )
        items = [link.vocabulary_item for link in links]
        return VocabularyItemSerializer(items, many=True).data
