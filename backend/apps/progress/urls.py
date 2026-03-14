from django.urls import path

from . import views

urlpatterns = [
    path(
        "lessons/<int:lesson_id>/start/",
        views.LessonStartView.as_view(),
        name="lesson-start",
    ),
    path(
        "lessons/<int:lesson_id>/complete/",
        views.LessonCompleteView.as_view(),
        name="lesson-complete",
    ),
    path(
        "progress/summary/",
        views.ProgressSummaryView.as_view(),
        name="progress-summary",
    ),
]
