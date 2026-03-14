from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    readonly_fields = ["xp_total", "streak_days", "last_activity_date"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ["email", "username", "is_active", "date_joined"]
    ordering = ["-date_joined"]
