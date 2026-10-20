import { Experience, Portfolio, Project, ProjectCategory } from '../core/portfolio.models';
import { yearsSince } from '../core/portfolio.service';

/**
 * Answers visitors' questions from the portfolio content alone: no network,
 * no API key. It recognises projects, companies and technologies by name, and
 * otherwise picks the topic (skills, experience, contact, …) from keywords.
 */

export interface ChatLink {
  label: string;
  /** App route (starts with "/"), or an external/mailto/tel URL. */
  url: string;
}

export interface ChatReply {
  text: string;
  items?: string[];
  links?: ChatLink[];
  suggestions?: string[];
}

type Topic =
  | 'greet'
  | 'thanks'
  | 'bye'
  | 'help'
  | 'about'
  | 'skills'
  | 'experience'
  | 'current'
  | 'education'
  | 'projects'
  | 'contact'
  | 'resume'
  | 'availability'
  | 'location'
  | 'age';

/** Keywords per topic, already normalised. Earlier topics win ties. */
const TOPICS: [Topic, string[]][] = [
  ['current', ['current', 'currently', 'now', 'present', 'presently', 'these days', 'at the moment']],
  ['contact', ['contact', 'email', 'mail', 'phone', 'call', 'reach', 'message', 'number', 'whatsapp', 'connect', 'linkedin']],
  ['resume', ['resume', 'cv', 'download', 'pdf']],
  ['availability', ['available', 'availability', 'freelance', 'freelancing', 'hire', 'hiring', 'open to', 'opportunity', 'opportunities']],
  ['education', ['education', 'degree', 'university', 'study', 'studied', 'college', 'school', 'graduate', 'graduated', 'qualification', 'diploma', 'bachelor']],
  ['projects', ['project', 'projects', 'portfolio', 'built', 'build', 'app', 'apps', 'samples', 'showcase', 'made', 'developed']],
  ['experience', ['experience', 'work', 'worked', 'working', 'job', 'jobs', 'career', 'company', 'companies', 'employer', 'employment', 'role', 'roles', 'position', 'history']],
  ['skills', ['skill', 'skills', 'tech', 'technologies', 'technology', 'stack', 'language', 'languages', 'framework', 'frameworks', 'tools', 'expertise', 'good at', 'know', 'proficient', 'specialize', 'specialise', 'specialty']],
  ['location', ['where', 'located', 'location', 'based', 'city', 'country', 'live', 'lives']],
  ['age', ['age', 'old', 'born', 'birthday']],
  ['about', ['about', 'who', 'yourself', 'introduce', 'introduction', 'background', 'summary', 'bio', 'overview', 'tell me', 'what does']],
  ['greet', ['hi', 'hello', 'hey', 'salam', 'assalam', 'good morning', 'good evening', 'greetings', 'howdy']],
  ['thanks', ['thanks', 'thank', 'thx', 'appreciate', 'great', 'awesome', 'nice', 'cool']],
  ['bye', ['bye', 'goodbye', 'see you', 'later']],
  ['help', ['help', 'what can', 'options', 'menu']],
];

/** Common ways people write tech names, mapped to the name used in the content. */
const ALIASES: Record<string, string> = {
  springboot: 'spring boot',
  spring: 'spring boot',
  js: 'javascript',
  ts: 'typescript',
  k8s: 'kubernetes',
  postgres: 'postgresql',
  reactjs: 'react',
  'react js': 'react',
  angularjs: 'angular',
  fcc: 'fusion corporate channels',
  fti: 'fusion trade innovation',
};

/** Words too common to identify a project by. */
const GENERIC = new Set([
  'system', 'systems', 'app', 'application', 'dashboard', 'industrial', 'custom', 'using', 'with', 'based',
  'platform', 'finder', 'mobile', 'desktop', 'real', 'time', 'safety', 'chat', 'google', 'electronic',
]);

const CATEGORY_WORDS: Record<ProjectCategory, string[]> = {
  web: ['web', 'website', 'websites'],
  mobile: ['mobile', 'android', 'ios', 'phone'],
  desktop: ['desktop', 'windows'],
};

export function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim()} `;
}

function contains(haystack: string, phrase: string): boolean {
  return phrase.trim().length > 0 && haystack.includes(` ${phrase.trim()} `);
}

interface TechEntry {
  name: string;
  groups: string[];
  interest: boolean;
}

export class ChatEngine {
  private readonly first: string;
  private readonly tech = new Map<string, TechEntry>();

  constructor(private readonly data: Portfolio) {
    this.first = data.profile.name.split(' ')[0];
    this.indexTech();
  }

  greeting(): ChatReply {
    return {
      text: `Hi! I'm ${this.first}'s portfolio assistant. Ask me about ${this.first}'s skills, experience, projects, or how to get in touch.`,
      suggestions: this.defaultSuggestions(),
    };
  }

  reply(question: string): ChatReply {
    const text = this.applyAliases(normalize(question));
    if (!text.trim()) return this.help();

    const topic = this.topTopic(text);
    const job = this.findJob(text);
    if (job && topic !== 'contact') return this.jobReply(job);

    const project = this.findProject(text);
    const techs = this.findTech(text);
    // An exact title/slug always wins. A partial title match (e.g. "trade finance") loses to a
    // named technology, whose answer links to the matching projects anyway.
    const partialProjectFits = topic === 'projects' || topic === null || topic === 'about';
    if (project && (project.score >= 3 || (!techs.length && partialProjectFits))) {
      return this.projectReply(project.project);
    }

    const techFits = topic === null || topic === 'skills' || topic === 'projects' || topic === 'experience' || topic === 'about';
    if (techs.length && techFits) {
      return this.techReply(techs);
    }

    switch (topic) {
      case 'greet':
        return this.greeting();
      case 'thanks':
        return { text: `You're welcome! Anything else you'd like to know about ${this.first}?`, suggestions: this.defaultSuggestions() };
      case 'bye':
        return { text: `Thanks for stopping by! Feel free to reach out to ${this.first} any time.`, links: this.contactLinks() };
      case 'about':
        return this.aboutReply();
      case 'skills':
        return this.skillsReply();
      case 'current':
        return this.data.experience.length ? this.jobReply(this.data.experience[0], true) : this.experienceReply();
      case 'experience':
        return this.experienceReply();
      case 'education':
        return this.educationReply();
      case 'projects':
        return this.projectsReply(text);
      case 'contact':
        return this.contactReply();
      case 'resume':
        return this.resumeReply();
      case 'availability':
        return this.availabilityReply();
      case 'location':
        return this.locationReply();
      case 'age':
        return this.ageReply();
      case 'help':
        return this.help();
      default:
        return this.help(true);
    }
  }

  // ---------------------------------------------------------------- matching

  private applyAliases(text: string): string {
    let result = text;
    for (const [alias, target] of Object.entries(ALIASES)) {
      if (contains(result, alias) && !contains(result, target)) {
        result = result.replace(` ${alias} `, ` ${target} `);
      }
    }
    return result;
  }

  private topTopic(text: string): Topic | null {
    let best: Topic | null = null;
    let bestScore = 0;
    for (const [topic, words] of TOPICS) {
      const score = words.filter((w) => contains(text, w)).length;
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    }
    return best;
  }

  private findJob(text: string): Experience | undefined {
    return this.data.experience.find((job) =>
      normalize(job.company)
        .trim()
        .split(' ')
        .filter((w) => w.length >= 4 && !['the', 'labs', 'solutions', 'pvt', 'ltd'].includes(w))
        .some((w) => contains(text, w)),
    );
  }

  private findProject(text: string): { project: Project; score: number } | undefined {
    let best: { project: Project; score: number } | undefined;
    for (const project of this.data.projects) {
      let score = contains(text, normalize(project.slug.replace(/-/g, ' '))) ? 3 : 0;
      if (contains(text, normalize(project.title))) score = Math.max(score, 3);
      const words = new Set(normalize(project.title).trim().split(' '));
      for (const word of words) {
        if (word.length >= 4 && !GENERIC.has(word) && contains(text, word)) score++;
      }
      if (score > 0 && (!best || score > best.score)) best = { project, score };
    }
    return best;
  }

  private indexTech(): void {
    const add = (raw: string, group: string | null, interest: boolean) => {
      const base = raw.replace(/\(.*?\)/g, '').trim();
      const parts = [base, ...base.split(/\s*(?:&|\/|,| and )\s*/)];
      for (const part of parts) {
        const key = normalize(part).trim();
        if (key.length < 2) continue;
        const entry = this.tech.get(key) ?? { name: part.trim(), groups: [], interest: false };
        if (group && !entry.groups.includes(group)) entry.groups.push(group);
        entry.interest ||= interest;
        this.tech.set(key, entry);
      }
    };
    for (const group of this.data.skillGroups) group.items.forEach((item) => add(item, group.name, false));
    for (const interest of this.data.interests) add(interest.name, null, true);
    for (const project of this.data.projects) project.tech.forEach((t) => add(t, null, false));
  }

  /** Technologies mentioned in the text, longest names first, without overlaps. */
  private findTech(text: string): TechEntry[] {
    const found: TechEntry[] = [];
    let remaining = text;
    const keys = [...this.tech.keys()].sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (contains(remaining, key)) {
        const entry = this.tech.get(key)!;
        if (!found.includes(entry)) found.push(entry);
        remaining = remaining.replace(` ${key} `, ' ');
      }
    }
    return found;
  }

  // ----------------------------------------------------------------- replies

  private aboutReply(): ChatReply {
    const p = this.data.profile;
    const job = this.data.experience[0];
    const now = job ? ` Currently ${job.role} at ${job.company}.` : '';
    return {
      text: `${p.name} is a ${p.title}, based in ${p.city}.${now}\n\nIn ${this.first}'s words: “${p.summary}”`,
      links: [
        { label: 'About page', url: '/about' },
        { label: 'Resume', url: '/resume' },
      ],
      suggestions: ['Top skills', 'Work experience', 'Show projects'],
    };
  }

  private skillsReply(): ChatReply {
    return {
      text: `Here's ${this.first}'s toolkit:`,
      items: this.data.skillGroups.map((g) => `${g.name}: ${g.items.join(', ')}`),
      links: [{ label: 'Skills on the About page', url: '/about' }],
      suggestions: this.techSuggestions(),
    };
  }

  private techReply(techs: TechEntry[]): ChatReply {
    const items: string[] = [];
    const links: ChatLink[] = [];
    const lines: string[] = [];

    for (const tech of techs.slice(0, 3)) {
      const key = normalize(tech.name).trim();
      const projects = this.data.projects.filter(
        (p) =>
          p.tech.some((t) => normalize(t).includes(` ${key} `)) ||
          normalize(`${p.title} ${p.summary} ${p.description.join(' ')}`).includes(` ${key} `),
      );
      const jobs = this.data.experience.filter((j) =>
        normalize(`${j.role} ${j.highlights.join(' ')}`).includes(` ${key} `),
      );

      if (tech.groups.length) {
        lines.push(`Yes, ${tech.name} is part of ${this.first}'s ${tech.groups.join(' and ')}.`);
      } else if (tech.interest) {
        lines.push(`Yes, ${tech.name} is one of the tools ${this.first} enjoys working with.`);
      } else {
        lines.push(`${this.first} has used ${tech.name} in projects.`);
      }
      for (const job of jobs.slice(0, 2)) items.push(`${job.company}: ${job.role} (${job.period})`);
      for (const project of projects.slice(0, 3)) {
        if (!links.some((l) => l.url.endsWith(project.slug))) {
          links.push({ label: project.title, url: `/portfolio/${project.slug}` });
        }
      }
    }

    if (items.length) lines.push(`Used professionally at:`);
    return {
      text: lines.join('\n'),
      items: items.length ? items : undefined,
      links: links.length ? links : [{ label: 'All projects', url: '/portfolio' }],
      suggestions: ['Show projects', 'Work experience', `How can I contact ${this.first}?`],
    };
  }

  private experienceReply(): ChatReply {
    return {
      text: `${this.first}'s work experience:`,
      items: this.data.experience.map(
        (j) => `${j.role} at ${j.company}${j.location ? `, ${j.location}` : ''} (${j.period})`,
      ),
      links: [{ label: 'Full resume', url: '/resume' }],
      suggestions: this.data.experience.slice(0, 2).map((j) => `What did ${this.first} do at ${j.company}?`),
    };
  }

  private jobReply(job: Experience, current = false): ChatReply {
    const where = job.location ? ` in ${job.location}` : '';
    const intro = current
      ? `${this.first} currently works as ${job.role} at ${job.company}${where} (${job.period}).`
      : `${this.first} worked as ${job.role} at ${job.company}${where} (${job.period}).`;
    return {
      text: `${intro} Highlights:`,
      items: job.highlights,
      links: [{ label: 'Full resume', url: '/resume' }],
      suggestions: ['Work experience', 'Top skills', 'Show projects'],
    };
  }

  private educationReply(): ChatReply {
    return {
      text: `${this.first}'s education:`,
      items: this.data.education.map((e) => `${e.title}, ${e.institution} (${e.period})`),
      links: [{ label: 'Resume', url: '/resume' }],
      suggestions: ['Work experience', 'Top skills'],
    };
  }

  private projectsReply(text: string): ChatReply {
    const category = (Object.keys(CATEGORY_WORDS) as ProjectCategory[]).find((c) =>
      CATEGORY_WORDS[c].some((w) => contains(text, w)),
    );
    const projects = category ? this.data.projects.filter((p) => p.category === category) : this.data.projects;
    if (!projects.length) {
      return { text: `There are no ${category} projects listed yet.`, links: [{ label: 'All projects', url: '/portfolio' }] };
    }
    const label = category ? `${category} projects` : 'projects';
    return {
      text: `${this.first} has ${projects.length} ${label}${category ? '' : ' across web, mobile and desktop'}. Some highlights:`,
      items: projects.slice(0, 5).map((p) => `${p.title}: ${p.summary}`),
      links: [
        ...projects.slice(0, 3).map((p) => ({ label: p.title, url: `/portfolio/${p.slug}` })),
        { label: category ? `All ${label}` : 'All projects', url: category ? `/portfolio?category=${category}` : '/portfolio' },
      ],
      suggestions: ['Web projects', 'Mobile projects', 'Desktop projects'].filter(
        (s) => !category || !s.toLowerCase().startsWith(category),
      ),
    };
  }

  private projectReply(project: Project): ChatReply {
    const facts = [project.type, project.client ? `for ${project.client}` : null].filter(Boolean).join(' ');
    const links: ChatLink[] = [{ label: 'Project details', url: `/portfolio/${project.slug}` }];
    if (project.url) links.push({ label: 'View project', url: project.url });
    return {
      text: `${project.title} (${facts}): ${project.summary}`,
      items: project.highlights.length
        ? project.highlights.slice(0, 4).map((h) => `${h.title}: ${h.text}`)
        : project.description.slice(0, 1),
      links,
      suggestions: project.tech.slice(0, 2).map((t) => `Other ${t} projects`).concat('Show projects'),
    };
  }

  private contactReply(): ChatReply {
    const p = this.data.profile;
    return {
      text: `You can reach ${this.first} here:`,
      items: [`Email: ${p.email}`, `Phone: ${p.phone}`, `Location: ${p.city}`],
      links: this.contactLinks(),
    };
  }

  private contactLinks(): ChatLink[] {
    const p = this.data.profile;
    const linkedin = p.socials.find((s) => /linkedin/i.test(s.name));
    return [
      { label: 'Contact form', url: '/contact' },
      { label: 'Send an email', url: `mailto:${p.email}` },
      ...(linkedin ? [{ label: 'LinkedIn', url: linkedin.url }] : []),
    ];
  }

  private resumeReply(): ChatReply {
    return {
      text: `Here's ${this.first}'s resume. You can read it on the site or download the PDF.`,
      links: [
        { label: 'Resume page', url: '/resume' },
        { label: 'Download PDF', url: this.data.profile.resumeUrl },
      ],
      suggestions: ['Work experience', 'Education'],
    };
  }

  private availabilityReply(): ChatReply {
    const available = /available|open|yes/i.test(this.data.profile.freelance);
    return {
      text: available
        ? `Yes, ${this.first} is available for freelance work and open to new opportunities.`
        : `${this.first}'s freelance status: ${this.data.profile.freelance}.`,
      links: this.contactLinks(),
    };
  }

  private locationReply(): ChatReply {
    const p = this.data.profile;
    return { text: `${this.first} is based in ${p.city} (${p.address}).`, links: [{ label: 'Contact', url: '/contact' }] };
  }

  private ageReply(): ChatReply {
    const age = yearsSince(this.data.profile.birthday);
    return { text: `${this.first} is ${age} years old.`, suggestions: ['Education', 'Work experience'] };
  }

  private help(unknown = false): ChatReply {
    return {
      text: unknown
        ? `I'm not sure about that one. I can only answer from ${this.first}'s portfolio. Try asking about:`
        : 'I can tell you about:',
      items: ['Skills and technologies', 'Work experience and current role', 'Projects', 'Education', 'Contact details and resume'],
      suggestions: this.defaultSuggestions(),
    };
  }

  private defaultSuggestions(): string[] {
    return [`What does ${this.first} do?`, 'Top skills', 'Show projects', 'Work experience', 'How to contact?'];
  }

  private techSuggestions(): string[] {
    const items = this.data.skillGroups.flatMap((g) => g.items).filter((i) => i.length <= 14);
    return items.slice(0, 3).map((i) => `Does ${this.first} know ${i}?`);
  }
}
