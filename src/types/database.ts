/**
 * Database type definitions for Supabase PostgreSQL schema.
 * Matches table definitions in supabase/migrations/20261106_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuestionType = 'mcq' | 'written';

export interface MCQOption {
  id: string;
  text: string;
}

export interface Exam {
  id: string;
  organizer_name: string;
  event_title: string;
  exam_title: string;
  instructions: string | null;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_order: number;
  question_type: QuestionType;
  prompt_text: string;
  image_url: string | null;
  audio_url: string | null;
  options: MCQOption[] | null;
  correct_option_id: string | null;
  max_score: number;
  created_at: string;
}

export interface AccessCode {
  id: string;
  exam_id: string;
  code: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface Attempt {
  id: string;
  exam_id: string;
  access_code_id: string;
  participant_name: string;
  participant_email: string | null;
  started_at: string;
  submitted_at: string | null;
  is_submitted: boolean;
  total_score: number;
  is_graded: boolean;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  written_text: string | null;
  score_awarded: number | null;
  feedback: string | null;
  graded_at: string | null;
}

/**
 * Supabase Generic Database Schema mapping for type-safe SupabaseClient<Database>
 */
export interface Database {
  public: {
    Tables: {
      exams: {
        Row: Exam;
        Insert: Omit<Exam, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Exam, 'id'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Question, 'id'>>;
      };
      access_codes: {
        Row: AccessCode;
        Insert: Omit<AccessCode, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AccessCode, 'id'>>;
      };
      attempts: {
        Row: Attempt;
        Insert: Omit<Attempt, 'id' | 'started_at' | 'total_score' | 'is_submitted' | 'is_graded'> & {
          id?: string;
          started_at?: string;
          total_score?: number;
          is_submitted?: boolean;
          is_graded?: boolean;
        };
        Update: Partial<Omit<Attempt, 'id'>>;
      };
      answers: {
        Row: Answer;
        Insert: Omit<Answer, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<Answer, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
