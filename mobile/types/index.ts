// ── Auth ──

export interface UserProfile {
  display_name: string;
  avatar_url: string;
  xp_total: number;
  streak_days: number;
  last_activity_date: string | null;
  onboarding_complete: boolean;
  motivation: string;
  current_level: string;
  learning_goal: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  profile: UserProfile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// ── Curriculum ──

export interface Course {
  id: number;
  title: string;
  description: string;
  language_code: string;
  icon_name: string;
  unit_count: number;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  icon_name: string;
  lesson_count: number;
  progress_percent: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  order: number;
  xp_reward: number;
  estimated_minutes: number;
  is_locked: boolean;
  is_completed: boolean;
}

export interface ContentBlock {
  id: number;
  order: number;
  block_type: "word" | "phrase" | "audio" | "tip";
  urhobo_text: string;
  english_text: string;
  pronunciation_guide: string;
  audio_url: string;
}

export interface VocabularyItem {
  id: number;
  urhobo_text: string;
  english_text: string;
  pronunciation_guide: string;
  audio_url: string;
  example_usage: string;
  category: string;
}

export interface LessonDetail {
  id: number;
  title: string;
  order: number;
  xp_reward: number;
  estimated_minutes: number;
  content_blocks: ContentBlock[];
  vocabulary_items: VocabularyItem[];
}

// ── Quiz ──

export interface Option {
  id: number;
  text: string;
}

export interface MatchItemData {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  order: number;
  question_type: "multiple_choice" | "translation" | "fill_blank" | "matching";
  prompt: string;
  options: Option[] | null;
  left_items: MatchItemData[] | null;
  right_items: MatchItemData[] | null;
}

export interface QuizAnswer {
  question_id: number;
  option_id?: number;
  text?: string;
  matches?: { left_id: number; right_id: number }[];
}

export interface QuizSubmitPayload {
  attempt_id: number;
  answers: QuizAnswer[];
}

export interface QuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  xp_earned: number;
  best_score: number;
}

// ── Progress ──

export interface LessonAttempt {
  id: number;
  lesson: number;
  lesson_title: string;
  started_at: string;
  submitted_at: string | null;
  quiz_score: number | null;
  xp_earned: number;
}

export interface ProgressSummary {
  xp_total: number;
  streak_days: number;
  lessons_completed: number;
  units_completed: number;
}
