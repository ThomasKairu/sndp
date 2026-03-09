export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: 'Land' | 'Residential' | 'Commercial';
  size: string;
  description: string;
  image: string;
  images: string[];
  features: string[];
  status: 'For Sale' | 'Sold' | 'Reserved';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Full article content
  date: string;
  category: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface InstallmentPlan {
  id: number;
  client_name: string;
  phone: string;
  property_name: string;
  total_amount: number;
  amount_paid: number;
  installment_count: number;
  installments_paid: number;
  start_date: string;
  next_due_date: string;
  installment_amount: number;
  status: 'active' | 'completed' | 'defaulted' | 'paused';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPayment {
  id: number;
  plan_id: number;
  client_name: string;
  phone: string;
  amount_paid: number;
  payment_date: string;
  payment_number: number;
  recorded_by: string;
  notes?: string;
  created_at: string;
}