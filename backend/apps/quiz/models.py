from django.db import models

from apps.curriculum.models import Lesson, VocabularyItem


class Question(models.Model):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = "multiple_choice", "Multiple Choice"
        TRANSLATION = "translation", "Choose Correct Translation"
        FILL_BLANK = "fill_blank", "Fill in the Blank"
        MATCHING = "matching", "Matching"

    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="questions"
    )
    order = models.PositiveIntegerField(default=0)
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    prompt = models.TextField()
    correct_answer_text = models.CharField(
        max_length=300,
        blank=True,
        help_text="Used for fill_blank questions. Server validates against this.",
    )
    vocabulary_item = models.ForeignKey(
        VocabularyItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions",
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"[{self.question_type}] {self.prompt[:60]}"


class Option(models.Model):
    """Answer option for multiple_choice and translation questions."""

    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="options"
    )
    text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        mark = "✓" if self.is_correct else "✗"
        return f"{mark} {self.text}"


class MatchItem(models.Model):
    """Individual item in a matching question. Items with the same pair_key
    on opposite sides form a correct match."""

    class Side(models.TextChoices):
        LEFT = "left", "Left"
        RIGHT = "right", "Right"

    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="match_items"
    )
    text = models.CharField(max_length=300)
    side = models.CharField(max_length=5, choices=Side.choices)
    pair_key = models.PositiveIntegerField(
        help_text="Items with matching pair_key on opposite sides are correct pairs."
    )

    class Meta:
        ordering = ["pair_key", "side"]

    def __str__(self):
        return f"[{self.side}:{self.pair_key}] {self.text}"
