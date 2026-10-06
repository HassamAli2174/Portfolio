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

export interface SkillGroup {
  name: string;
  icon: string;
  items: string[];
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
  location: string;
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
  client: string | null;
  date: string | null;
  url: string | null;
  /** Null renders a generated placeholder cover. */
  cover: string | null;
  images: string[];
  summary: string;
  description: string[];
  highlights: Highlight[];
  tech: string[];
}

export interface Portfolio {
  profile: Profile;
  stats: Stat[];
  skillGroups: SkillGroup[];
  highlights: string[];
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
