import random

from rest_framework import serializers

from .models import MatchItem, Option, Question


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]


class MatchItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchItem
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    left_items = serializers.SerializerMethodField()
    right_items = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id", "order", "question_type", "prompt",
            "options", "left_items", "right_items",
        ]

    def get_options(self, obj):
        if obj.question_type not in ("multiple_choice", "translation"):
            return None
        return OptionSerializer(obj.options.all(), many=True).data

    def get_left_items(self, obj):
        if obj.question_type != "matching":
            return None
        items = list(obj.match_items.filter(side="left"))
        return MatchItemSerializer(items, many=True).data

    def get_right_items(self, obj):
        if obj.question_type != "matching":
            return None
        items = list(obj.match_items.filter(side="right"))
        random.shuffle(items)
        return MatchItemSerializer(items, many=True).data


# --- Submission serializers ---


class MCAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    option_id = serializers.IntegerField(required=False)
    text = serializers.CharField(required=False)
    matches = serializers.ListField(
        child=serializers.DictField(), required=False
    )


class QuizSubmitSerializer(serializers.Serializer):
    attempt_id = serializers.IntegerField()
    answers = MCAnswerSerializer(many=True)
