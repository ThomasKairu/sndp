export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: 'Land' | 'Residential' | 'Commercial';
  size: string;
  bedrooms?: number;
  bathrooms?: number;
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