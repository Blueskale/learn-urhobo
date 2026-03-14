import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";

import { FillBlankQuestion } from "@/components/quiz/FillBlankQuestion";
import { MatchingQuestion } from "@/components/quiz/MatchingQuestion";
import { MultipleChoiceQuestion } from "@/components/quiz/MultipleChoiceQuestion";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { api } from "@/services/api";
import type { Question, QuizAnswer } from "@/types";

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, QuizAnswer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [qs, attempt] = await Promise.all([
          api.quiz.questions(Number(lessonId)),
          api.progress.start(Number(lessonId)),
        ]);
        setQuestions(qs);
        setAttemptId(attempt.id);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  if (loading || !attemptId) return <LoadingScreen />;

  const question = questions[currentIndex];
  const currentAnswer = answers.get(question.id);

  const updateAnswer = (answer: Partial<QuizAnswer>) => {
    const updated = new Map(answers);
    updated.set(question.id, {
      question_id: question.id,
      ...currentAnswer,
      ...answer,
    });
    setAnswers(updated);
  };

  const canProceed = (() => {
    if (!currentAnswer) return false;
    switch (question.question_type) {
      case "multiple_choice":
      case "translation":
        return currentAnswer.option_id != null;
      case "fill_blank":
        return (currentAnswer.text?.trim().length ?? 0) > 0;
      case "matching":
        return (
          (currentAnswer.matches?.length ?? 0) ===
          (question.left_items?.length ?? 0)
        );
      default:
        return false;
    }
  })();

  const isLast = currentIndex === questions.length - 1;

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    // Submit quiz
    setSubmitting(true);
    try {
      const result = await api.quiz.submit(Number(lessonId), {
        attempt_id: attemptId,
        answers: Array.from(answers.values()),
      });
      router.replace({
        pathname: "/(tabs)/quiz/result",
        params: {
          lessonId: lessonId!,
          score: result.score,
          correct: result.correct,
          total: result.total,
          passed: result.passed ? "1" : "0",
          xp_earned: result.xp_earned,
          best_score: result.best_score,
        },
      });
    } catch {
      Alert.alert("Error", "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "translation":
        return (
          <MultipleChoiceQuestion
            prompt={question.prompt}
            options={question.options ?? []}
            selectedId={currentAnswer?.option_id ?? null}
            onSelect={(id) => updateAnswer({ option_id: id })}
          />
        );
      case "fill_blank":
        return (
          <FillBlankQuestion
            prompt={question.prompt}
            value={currentAnswer?.text ?? ""}
            onChangeText={(text) => updateAnswer({ text })}
          />
        );
      case "matching":
        return (
          <MatchingQuestion
            prompt={question.prompt}
            leftItems={question.left_items ?? []}
            rightItems={question.right_items ?? []}
            matches={currentAnswer?.matches ?? []}
            onMatchesChange={(matches) => updateAnswer({ matches })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <QuizProgress current={currentIndex + 1} total={questions.length} />

      <View style={styles.content}>{renderQuestion()}</View>

      <View style={styles.footer}>
        <Button
          title={isLast ? "Submit" : "Next"}
          onPress={handleNext}
          disabled={!canProceed}
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: layout.padding,
    paddingTop: 24,
  },
  footer: {
    padding: layout.padding,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
