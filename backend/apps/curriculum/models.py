from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    language_code = models.CharField(max_length=10, default="urh")
    order = models.PositiveIntegerField(default=0)
    icon_name = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Unit(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="units")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    icon_name = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]
        unique_together = [("course", "order")]

    def __str__(self):
        return f"{self.course.title} → {self.title}"


class Lesson(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    xp_reward = models.PositiveIntegerField(default=10)
    estimated_minutes = models.PositiveIntegerField(default=5)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]
        unique_together = [("unit", "order")]

    def __str__(self):
        return f"{self.unit.title} → {self.title}"


class ContentBlock(models.Model):
    class BlockType(models.TextChoices):
        WORD = "word", "Word"
        PHRASE = "phrase", "Phrase"
        AUDIO = "audio", "Audio"
        TIP = "tip", "Tip"

    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="content_blocks"
    )
    order = models.PositiveIntegerField(default=0)
    block_type = models.CharField(max_length=10, choices=BlockType.choices)
    urhobo_text = models.CharField(max_length=500)
    english_text = models.CharField(max_length=500)
    pronunciation_guide = models.CharField(max_length=500, blank=True)
    audio_url = models.URLField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"[{self.block_type}] {self.urhobo_text}"


class VocabularyItem(models.Model):
    urhobo_text = models.CharField(max_length=300)
    english_text = models.CharField(max_length=300)
    pronunciation_guide = models.CharField(max_length=300, blank=True)
    audio_url = models.URLField(blank=True)
    example_usage = models.TextField(blank=True)
    category = models.CharField(max_length=50, db_index=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["category", "urhobo_text"]

    def __str__(self):
        return f"{self.urhobo_text} ({self.english_text})"


class LessonVocabulary(models.Model):
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="lesson_vocabulary"
    )
    vocabulary_item = models.ForeignKey(
        VocabularyItem, on_delete=models.CASCADE, related_name="lesson_links"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = [("lesson", "vocabulary_item")]

    def __str__(self):
        return f"{self.lesson.title} ← {self.vocabulary_item.urhobo_text}"
