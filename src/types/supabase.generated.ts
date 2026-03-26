export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          body_fat_pct_encrypted: string | null
          chest_cm_encrypted: string | null
          hips_cm_encrypted: string | null
          id: string
          measured_at: string
          notes: string | null
          user_id: string
          waist_cm_encrypted: string | null
          weight_kg_encrypted: string | null
        }
        Insert: {
          body_fat_pct_encrypted?: string | null
          chest_cm_encrypted?: string | null
          hips_cm_encrypted?: string | null
          id?: string
          measured_at?: string
          notes?: string | null
          user_id: string
          waist_cm_encrypted?: string | null
          weight_kg_encrypted?: string | null
        }
        Update: {
          body_fat_pct_encrypted?: string | null
          chest_cm_encrypted?: string | null
          hips_cm_encrypted?: string | null
          id?: string
          measured_at?: string
          notes?: string | null
          user_id?: string
          waist_cm_encrypted?: string | null
          weight_kg_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          current_score: number | null
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          current_score?: number | null
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          current_score?: number | null
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_public: boolean | null
          name: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          is_public?: boolean | null
          name: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_public?: boolean | null
          name?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_substitutes: {
        Row: {
          exercise_id: string
          id: string
          priority: number | null
          substitute_id: string
          substitute_reason: string | null
        }
        Insert: {
          exercise_id: string
          id?: string
          priority?: number | null
          substitute_id: string
          substitute_reason?: string | null
        }
        Update: {
          exercise_id?: string
          id?: string
          priority?: number | null
          substitute_id?: string
          substitute_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_substitutes_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_substitutes_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          alternative_names: string[] | null
          common_mistakes: string[] | null
          contraindicated_for: string[] | null
          created_at: string
          default_reps_max: number | null
          default_reps_min: number | null
          default_rest_seconds: number | null
          default_sets_max: number | null
          default_sets_min: number | null
          description: string | null
          difficulty: number | null
          equipment_required: string[] | null
          evidence_quality: string | null
          form_cues: string[] | null
          id: string
          is_compound: boolean | null
          is_verified: boolean | null
          movement_pattern: string | null
          name: string
          primary_muscles: string[]
          research_rationale: string | null
          secondary_muscles: string[] | null
          slug: string
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          alternative_names?: string[] | null
          common_mistakes?: string[] | null
          contraindicated_for?: string[] | null
          created_at?: string
          default_reps_max?: number | null
          default_reps_min?: number | null
          default_rest_seconds?: number | null
          default_sets_max?: number | null
          default_sets_min?: number | null
          description?: string | null
          difficulty?: number | null
          equipment_required?: string[] | null
          evidence_quality?: string | null
          form_cues?: string[] | null
          id?: string
          is_compound?: boolean | null
          is_verified?: boolean | null
          movement_pattern?: string | null
          name: string
          primary_muscles: string[]
          research_rationale?: string | null
          secondary_muscles?: string[] | null
          slug: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          alternative_names?: string[] | null
          common_mistakes?: string[] | null
          contraindicated_for?: string[] | null
          created_at?: string
          default_reps_max?: number | null
          default_reps_min?: number | null
          default_rest_seconds?: number | null
          default_sets_max?: number | null
          default_sets_min?: number | null
          description?: string | null
          difficulty?: number | null
          equipment_required?: string[] | null
          evidence_quality?: string | null
          form_cues?: string[] | null
          id?: string
          is_compound?: boolean | null
          is_verified?: boolean | null
          movement_pattern?: string | null
          name?: string
          primary_muscles?: string[]
          research_rationale?: string | null
          secondary_muscles?: string[] | null
          slug?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      fallback_programs: {
        Row: {
          created_at: string
          days_per_week: number
          equipment_type: string
          experience_level: number
          generation_model: string | null
          goal: string
          id: string
          program_json: Json
          validation_errors: Json | null
          was_validated: boolean | null
        }
        Insert: {
          created_at?: string
          days_per_week: number
          equipment_type: string
          experience_level: number
          generation_model?: string | null
          goal: string
          id?: string
          program_json: Json
          validation_errors?: Json | null
          was_validated?: boolean | null
        }
        Update: {
          created_at?: string
          days_per_week?: number
          equipment_type?: string
          experience_level?: number
          generation_model?: string | null
          goal?: string
          id?: string
          program_json?: Json
          validation_errors?: Json | null
          was_validated?: boolean | null
        }
        Relationships: []
      }
      intake_conversations: {
        Row: {
          created_at: string
          expires_at: string | null
          extracted_profile: Json | null
          id: string
          is_complete: boolean | null
          messages: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          extracted_profile?: Json | null
          id?: string
          is_complete?: boolean | null
          messages?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          extracted_profile?: Json | null
          id?: string
          is_complete?: boolean | null
          messages?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_recovery: {
        Row: {
          estimated_recovery_pct: number | null
          id: string
          last_trained_at: string | null
          muscle_group: string
          sets_this_week: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          estimated_recovery_pct?: number | null
          id?: string
          last_trained_at?: string | null
          muscle_group: string
          sets_this_week?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          estimated_recovery_pct?: number | null
          id?: string
          last_trained_at?: string | null
          muscle_group?: string
          sets_this_week?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_recovery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          exercise_id: string
          id: string
          record_type: string
          set_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          exercise_id: string
          id?: string
          record_type: string
          set_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          exercise_id?: string
          id?: string
          record_type?: string
          set_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age_range: string | null
          archetype: string | null
          avatar_url: string | null
          body_fat_pct_encrypted: string | null
          created_at: string
          days_per_week: number | null
          display_name: string | null
          equipment: string[] | null
          experience_level: number | null
          gender: string | null
          goal: string | null
          height_cm_encrypted: string | null
          id: string
          injuries_encrypted: string | null
          kiro_persona_enabled: boolean | null
          obstacles: string[] | null
          onboarding_completed_at: string | null
          onboarding_step: number | null
          other_training: string[] | null
          preferred_units: string | null
          psych_scores: number[] | null
          session_duration_preference: string | null
          sleep_hours_range: string | null
          split_preference: string | null
          stripe_customer_id: string | null
          subscription_period_end: string | null
          subscription_status: string | null
          training_recency_months: number | null
          trial_ends_at: string | null
          updated_at: string
          weight_kg_encrypted: string | null
          why_now: string | null
          work_schedule: string | null
          workout_time_preference: string | null
        }
        Insert: {
          activity_level?: string | null
          age_range?: string | null
          archetype?: string | null
          avatar_url?: string | null
          body_fat_pct_encrypted?: string | null
          created_at?: string
          days_per_week?: number | null
          display_name?: string | null
          equipment?: string[] | null
          experience_level?: number | null
          gender?: string | null
          goal?: string | null
          height_cm_encrypted?: string | null
          id: string
          injuries_encrypted?: string | null
          kiro_persona_enabled?: boolean | null
          obstacles?: string[] | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          other_training?: string[] | null
          preferred_units?: string | null
          psych_scores?: number[] | null
          session_duration_preference?: string | null
          sleep_hours_range?: string | null
          split_preference?: string | null
          stripe_customer_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          training_recency_months?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          weight_kg_encrypted?: string | null
          why_now?: string | null
          work_schedule?: string | null
          workout_time_preference?: string | null
        }
        Update: {
          activity_level?: string | null
          age_range?: string | null
          archetype?: string | null
          avatar_url?: string | null
          body_fat_pct_encrypted?: string | null
          created_at?: string
          days_per_week?: number | null
          display_name?: string | null
          equipment?: string[] | null
          experience_level?: number | null
          gender?: string | null
          goal?: string | null
          height_cm_encrypted?: string | null
          id?: string
          injuries_encrypted?: string | null
          kiro_persona_enabled?: boolean | null
          obstacles?: string[] | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          other_training?: string[] | null
          preferred_units?: string | null
          psych_scores?: number[] | null
          session_duration_preference?: string | null
          sleep_hours_range?: string | null
          split_preference?: string | null
          stripe_customer_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          training_recency_months?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          weight_kg_encrypted?: string | null
          why_now?: string | null
          work_schedule?: string | null
          workout_time_preference?: string | null
        }
        Relationships: []
      }
      program_days: {
        Row: {
          day_number: number
          estimated_duration_minutes: number | null
          focus_muscles: string[] | null
          id: string
          name: string
          program_id: string
          session_type: string | null
          week_number: number | null
        }
        Insert: {
          day_number: number
          estimated_duration_minutes?: number | null
          focus_muscles?: string[] | null
          id?: string
          name: string
          program_id: string
          session_type?: string | null
          week_number?: number | null
        }
        Update: {
          day_number?: number
          estimated_duration_minutes?: number | null
          focus_muscles?: string[] | null
          id?: string
          name?: string
          program_id?: string
          session_type?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_exercises: {
        Row: {
          exercise_id: string
          id: string
          is_flagged_for_injury: boolean | null
          modification_note: string | null
          order_index: number
          program_day_id: string
          progression_scheme: string | null
          rationale: string | null
          reps_max: number
          reps_min: number
          rest_seconds: number
          rir_target: number | null
          rpe_target: number | null
          sets: number
          superset_group: number | null
          user_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          is_flagged_for_injury?: boolean | null
          modification_note?: string | null
          order_index: number
          program_day_id: string
          progression_scheme?: string | null
          rationale?: string | null
          reps_max: number
          reps_min: number
          rest_seconds: number
          rir_target?: number | null
          rpe_target?: number | null
          sets: number
          superset_group?: number | null
          user_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          is_flagged_for_injury?: boolean | null
          modification_note?: string | null
          order_index?: number
          program_day_id?: string
          progression_scheme?: string | null
          rationale?: string | null
          reps_max?: number
          reps_min?: number
          rest_seconds?: number
          rir_target?: number | null
          rpe_target?: number | null
          sets?: number
          superset_group?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_exercises_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          ai_rationale: string | null
          created_at: string
          current_mesocycle: number | null
          current_week: number | null
          days_per_week: number | null
          description: string | null
          experience_level_target: number | null
          generation_model: string | null
          generation_prompt_version: string | null
          goal: string | null
          id: string
          is_active: boolean | null
          is_ai_generated: boolean | null
          name: string
          progression_scheme: string | null
          projected_outcome_description: string | null
          projected_weeks_to_goal: number | null
          split_type: string | null
          updated_at: string
          user_id: string
          weeks_duration: number | null
        }
        Insert: {
          ai_rationale?: string | null
          created_at?: string
          current_mesocycle?: number | null
          current_week?: number | null
          days_per_week?: number | null
          description?: string | null
          experience_level_target?: number | null
          generation_model?: string | null
          generation_prompt_version?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          name: string
          progression_scheme?: string | null
          projected_outcome_description?: string | null
          projected_weeks_to_goal?: number | null
          split_type?: string | null
          updated_at?: string
          user_id: string
          weeks_duration?: number | null
        }
        Update: {
          ai_rationale?: string | null
          created_at?: string
          current_mesocycle?: number | null
          current_week?: number | null
          days_per_week?: number | null
          description?: string | null
          experience_level_target?: number | null
          generation_model?: string | null
          generation_prompt_version?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_generated?: boolean | null
          name?: string
          progression_scheme?: string | null
          projected_outcome_description?: string | null
          projected_weeks_to_goal?: number | null
          split_type?: string | null
          updated_at?: string
          user_id?: string
          weeks_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          body_weight_kg_encrypted: string | null
          created_at: string
          id: string
          is_private: boolean | null
          notes: string | null
          photo_type: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          body_weight_kg_encrypted?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          notes?: string | null
          photo_type?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          body_weight_kg_encrypted?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          notes?: string | null
          photo_type?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          is_active: boolean | null
          subscription_json: Json
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          subscription_json: Json
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          subscription_json?: Json
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          ai_debrief: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          energy_level: number | null
          id: string
          next_session_adjustments: Json | null
          perceived_effort: number | null
          program_day_id: string | null
          program_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          ai_debrief?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          next_session_adjustments?: Json | null
          perceived_effort?: number | null
          program_day_id?: string | null
          program_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          ai_debrief?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          next_session_adjustments?: Json | null
          perceived_effort?: number | null
          program_day_id?: string | null
          program_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          exercise_id: string
          id: string
          is_dropset: boolean | null
          is_warmup: boolean | null
          logged_at: string | null
          program_exercise_id: string | null
          reps_completed: number
          rpe: number | null
          session_id: string
          set_number: number
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          is_dropset?: boolean | null
          is_warmup?: boolean | null
          logged_at?: string | null
          program_exercise_id?: string | null
          reps_completed: number
          rpe?: number | null
          session_id: string
          set_number: number
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          is_dropset?: boolean | null
          is_warmup?: boolean | null
          logged_at?: string | null
          program_exercise_id?: string | null
          reps_completed?: number
          rpe?: number | null
          session_id?: string
          set_number?: number
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_program_exercise_id_fkey"
            columns: ["program_exercise_id"]
            isOneToOne: false
            referencedRelation: "program_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
