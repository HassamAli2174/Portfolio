// Mirrors com.hassam.portfolio.content.PortfolioContent on the backend.

export type ProjectCategory = 'web' | 'mobile' | 'desktop';

export interface Social {
  name: string;
  url: string;
  icon: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  roles: string[];
  photo: string;
  birthday: string;
  degree: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  freelance: string;
  resumeUrl: string;
  about: string;
  summary: string;
  socials: Social[];
}

export interface Stat {
  icon: string;
  value: number;
  label: string;
}

export interface Skill {
  name: string;
  level: number;
  description: string;
}

export interface Interest {
  name: string;
  icon: string;
  color: string;
}

export interface Education {
  title: string;
  period: string;
  institution: string;
}

export interface Experience {
  role: string;
  period: string;
  company: string;
  highlights: string[];
}

export interface Highlight {
  title: string;
  text: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  type: string;
  client: string;
  date: string;
  url: string | null;
  cover: string;
  images: string[];
  summary: string;
  description: string[];
  highlights: Highlight[];
  tech: string[];
}

export interface Portfolio {
  profile: Profile;
  stats: Stat[];
  skills: Skill[];
  interests: Interest[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: must stay empty. */
  website: string;
}
