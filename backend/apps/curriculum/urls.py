from django.urls import path

from . import views

urlpatterns = [
    path("courses/", views.CourseListView.as_view(), name="course-list"),
    path(
        "courses/<int:course_id>/units/",
        views.UnitListView.as_view(),
        name="unit-list",
    ),
    path(
        "units/<int:unit_id>/lessons/",
        views.LessonListView.as_view(),
        name="lesson-list",
    ),
    path(
        "lessons/<int:pk>/",
        views.LessonDetailView.as_view(),
        name="lesson-detail",
    ),
]
