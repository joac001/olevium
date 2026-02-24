import type { Iso8601DateTimeString, Ulid } from './common';

export interface User {
  user_id: Ulid;
  email: string;
  username: string;
  created_at: Iso8601DateTimeString;
  updated_at: Iso8601DateTimeString;
}

export type FeedbackPayload = {
  type: 'bug' | 'feature' | 'other';
  message: string;
  page_path?: string;
  metadata?: Record<string, unknown>;
};
