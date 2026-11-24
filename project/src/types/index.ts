export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type FeedbackType = 'Review' | 'Suggestion' | 'Complaint';
export type FeedbackCategory = 'Product Quality' | 'Service' | 'Pricing' | 'Delivery' | 'Other';
export type Sentiment = 'Positive' | 'Negative' | 'Neutral';
export type FeedbackStatus = 'Pending' | 'In Review' | 'Resolved';

export interface Feedback {
  id: string;
  user_id: string;
  product_id: string;
  type: FeedbackType;
  rating: number;
  comment: string | null;
  category: FeedbackCategory | null;
  sentiment: Sentiment;
  status: FeedbackStatus;
  admin_reply: string | null;
  created_at: string;
}

export interface FeedbackWithProduct extends Feedback {
  product?: Product;
}
