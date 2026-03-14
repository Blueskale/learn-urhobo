from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    display_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["email", "username", "password", "display_name"]

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
        if display_name:
            user.profile.display_name = display_name
            user.profile.save(update_fields=["display_name"])
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "display_name",
            "avatar_url",
            "xp_total",
            "streak_days",
            "last_activity_date",
            "onboarding_complete",
            "motivation",
            "current_level",
            "learning_goal",
        ]
        read_only_fields = [
            "xp_total",
            "streak_days",
            "last_activity_date",
            "onboarding_complete",
        ]


class MeSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "email", "username", "profile"]
        read_only_fields = ["id", "email", "username"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class OnboardingSerializer(serializers.Serializer):
    motivation = serializers.ChoiceField(choices=UserProfile.Motivation.choices)
    current_level = serializers.ChoiceField(choices=UserProfile.Level.choices)
    learning_goal = serializers.ChoiceField(choices=UserProfile.Goal.choices)
