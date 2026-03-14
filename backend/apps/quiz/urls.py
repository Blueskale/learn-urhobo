from django.urls import path

from . import views

urlpatterns = [
    path(
        "lessons/<int:lesson_id>/quiz/",
        views.QuizQuestionsView.as_view(),
        name="quiz-questions",
    ),
    path(
        "lessons/<int:lesson_id>/quiz/submit/",
        views.QuizSubmitView.as_view(),
        name="quiz-submit",
    ),
]
