from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/me/", include("apps.accounts.urls_profile")),
    path("api/v1/", include("apps.curriculum.urls")),
    path("api/v1/", include("apps.quiz.urls")),
    path("api/v1/", include("apps.progress.urls")),
]
