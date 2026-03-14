import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ContentBlockCard } from "@/components/lesson/ContentBlockCard";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { api } from "@/services/api";
import type { LessonDetail } from "@/types";

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.lessons.get(Number(lessonId));
        setLesson(data);
        const questions = await api.quiz.questions(Number(lessonId));
        setHasQuiz(questions.length > 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const handleStartQuiz = () => {
    router.push({
      pathname: "/(tabs)/quiz/[lessonId]",
      params: { lessonId: lessonId! },
    });
  };

  const handleMarkComplete = async () => {
    await api.progress.complete(Number(lessonId));
    router.back();
  };

  if (loading || !lesson) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>
          {lesson.estimated_minutes} min · {lesson.xp_reward} XP
        </Text>

        <View style={styles.blocks}>
          {lesson.content_blocks.map((block) => (
            <ContentBlockCard key={block.id} block={block} />
          ))}
        </View>

        {lesson.vocabulary_items.length > 0 && (
          <View style={styles.vocabSection}>
            <Text style={styles.sectionTitle}>Vocabulary</Text>
            {lesson.vocabulary_items.map((item) => (
              <View key={item.id} style={styles.vocabItem}>
                <Text style={styles.vocabUrhobo}>{item.urhobo_text}</Text>
                <Text style={styles.vocabEnglish}>{item.english_text}</Text>
                {item.pronunciation_guide ? (
                  <Text style={styles.vocabPron}>
                    {item.pronunciation_guide}
                  </Text>
                ) : null}
                {item.example_usage ? (
                  <Text style={styles.vocabExample}>{item.example_usage}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {hasQuiz ? (
          <Button title="Start Quiz" onPress={handleStartQuiz} />
        ) : (
          <Button title="Mark as Complete" onPress={handleMarkComplete} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: layout.padding,
    paddingTop: 24,
    paddingBottom: 100,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 6,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  blocks: {
    gap: 0,
  },
  vocabSection: {
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 14,
  },
  vocabItem: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusSmall,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  vocabUrhobo: {
    ...typography.urhobo,
    color: colors.primary,
    marginBottom: 2,
  },
  vocabEnglish: {
    ...typography.body,
    color: colors.text,
  },
  vocabPron: {
    ...typography.pronunciation,
    color: colors.textSecondary,
    marginTop: 4,
  },
  vocabExample: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: layout.padding,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
