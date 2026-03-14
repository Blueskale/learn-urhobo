from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    class Motivation(models.TextChoices):
        HERITAGE = "heritage", "Heritage / Identity"
        FAMILY = "family", "Communicate with Family"
        CULTURE = "culture", "Cultural Interest"
        CURIOSITY = "curiosity", "General Curiosity"
        OTHER = "other", "Other"

    class Level(models.TextChoices):
        COMPLETE_BEGINNER = "complete_beginner", "Complete Beginner"
        SOME_EXPOSURE = "some_exposure", "Some Exposure"
        UNDERSTAND_CANT_SPEAK = "understand_cant_speak", "Understand but Can't Speak"

    class Goal(models.TextChoices):
        BASIC_PHRASES = "basic_phrases", "Learn Basic Phrases"
        HOLD_CONVERSATION = "hold_conversation", "Hold a Conversation"
        CONNECT_FAMILY = "connect_family", "Connect with Family"
        GENERAL_INTEREST = "general_interest", "General Interest"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)
    xp_total = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    onboarding_complete = models.BooleanField(default=False)

    # Onboarding answers
    motivation = models.CharField(
        max_length=30, choices=Motivation.choices, blank=True
    )
    current_level = models.CharField(
        max_length=30, choices=Level.choices, blank=True
    )
    learning_goal = models.CharField(
        max_length=30, choices=Goal.choices, blank=True
    )

    def __str__(self):
        return f"{self.user.email} profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
