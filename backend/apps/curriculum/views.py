from django.db.models import Count, Q
from rest_framework import generics

from .models import Course, Lesson, Unit
from .serializers import (
    CourseSerializer,
    LessonDetailSerializer,
    LessonListSerializer,
    UnitSerializer,
)


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        return (
            Course.objects.filter(is_published=True)
            .annotate(unit_count=Count("units", filter=Q(units__is_published=True)))
        )


class UnitListView(generics.ListAPIView):
    serializer_class = UnitSerializer

    def get_queryset(self):
        return (
            Unit.objects.filter(
                course_id=self.kwargs["course_id"], is_published=True
            )
            .annotate(
                lesson_count=Count(
                    "lessons", filter=Q(lessons__is_published=True)
                )
            )
        )


class LessonListView(generics.ListAPIView):
    serializer_class = LessonListSerializer

    def get_queryset(self):
        return Lesson.objects.filter(
            unit_id=self.kwargs["unit_id"], is_published=True
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["unit"] = Unit.objects.filter(id=self.kwargs["unit_id"]).first()
        return context


class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonDetailSerializer

    def get_queryset(self):
        return Lesson.objects.filter(is_published=True).prefetch_related(
            "content_blocks", "lesson_vocabulary__vocabulary_item"
        )
