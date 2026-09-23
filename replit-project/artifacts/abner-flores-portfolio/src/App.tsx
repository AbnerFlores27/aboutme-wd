import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Github,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  LockKeyhole,
  Maximize2,
  Mail,
  Menu,
  Music2,
  Play,
  Save,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  getListContactMessagesQueryKey,
  useListContactMessages,
  useMarkContactMessageReplied,
  useSubmitContact,
  type ContactMessageInput,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Profile = {
  name: string;
  role: string;
  bio: string;
  longerBio: string;
  email: string;
  location: string;
  photoUrl: string;
  github: string;
  linkedin: string;
  instagram: string;
};

type ContactFormState = Omit<ContactMessageInput, 'reason'> & {
  reason: ContactMessageInput['reason'] | '';
};

const homeIntro = "I'm a freshman from Grossmont High School, learning about web design. I look forward to playing baseball for Grossmont and doing other sports or clubs. Continue exploring each page to learn more about me.";
const previousHomeIntro = 'I build thoughtful websites and digital experiences, with a focus on clear ideas, useful details, and work that feels personal.';
const previousStudentIntro = "I'm a freshman from Grossmont High School, learning about web design. I look forward to playing baseball for Grossmont and doing other sports or clubs.";
const contactReasons: ContactMessageInput['reason'][] = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];

const defaultProfile: Profile = {
  name: 'Abner Flores',
  role: 'Web developer and digital creative',
  bio: homeIntro,
  longerBio:
    'This is a place to introduce yourself in your own words. Add your background, what you enjoy making, and the kind of work or ideas you want people to remember.',
  email: 'hello@example.com',
  location: 'Add your city',
  photoUrl: '',
  github: 'https://github.com/AbnerFlores27',
  linkedin: '',
  instagram: '',
};

const topics = {
  web: {
    title: 'Web Development',
    shortTitle: 'Web development',
    intro: 'The work of making websites clear, useful, and easy to return to.',
    body: 'Use this page to explain what you like about building for the web, which tools you use, and one or two projects that show your approach.',
    needs: ['A short explanation of your interest in web development', 'One project link or screenshot', 'The tools, classes, or skills you want to mention'],
  },
  creative: {
    title: 'Digital Creativity',
    shortTitle: 'Digital creativity',
    intro: 'A space for visual work, experiments, media, and ideas that combine creativity with technology.',
    body: 'Use this page to share the creative topics you care about and give visitors an example they can see, watch, or explore.',
    needs: ['A short explanation of the topic in your own words', 'One image, video, or project example', 'A link or caption that gives the example context'],
  },
};

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Abner Flores`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [title]);
}

function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/media', label: 'Media' },
    { href: '/future', label: 'Future' },
    { href: '/web-development', label: 'Web development' },
    { href: '/digital-creativity', label: 'Digital creativity' },
  ];

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
          <StanfordLogo />
          <span>Abner Flores</span>
        </Link>
        <button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={location === link.href ? 'page' : undefined} className={location === link.href ? 'active' : ''} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin" className="admin-nav-link" onClick={() => setMobileOpen(false)}>Admin</Link>
        </nav>
      </div>
    </header>
  );
}

function StanfordLogo() {
  return (
    <img
      className="stanford-logo"
      src={`${import.meta.env.BASE_URL}assets/stanford-block-s.png`}
      alt="Stanford University logo"
    />
  );
}

function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href={`mailto:${profile.email}`}><Mail size={14} /> {profile.email}</a>
        <span>Personal bio website</span>
      </div>
    </footer>
  );
}

function Shell({ children, profile }: { children: ReactNode; profile: Profile }) {
  return (
    <>
      <Header />
      {children}
      <Footer profile={profile} />
    </>
  );
}

function ProfilePhoto({ profile, large = false }: { profile: Profile; large?: boolean }) {
  return (
    <div className={`profile-photo ${large ? 'profile-photo-large' : ''}`}>
      {profile.photoUrl ? <img src={profile.photoUrl} alt={`${profile.name} profile`} /> : <span>AF</span>}
      {!profile.photoUrl && <small>Profile photo</small>}
    </div>
  );
}

function SocialLinks({ profile }: { profile: Profile }) {
  const links = [
    { href: profile.github, label: 'GitHub', icon: <Github size={17} /> },
    { href: profile.linkedin, label: 'LinkedIn', icon: <Linkedin size={17} /> },
    { href: profile.instagram, label: 'Instagram', icon: <Instagram size={17} /> },
  ].filter((link) => link.href);

  return (
    <div className="social-links">
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
          {link.icon} <span>{link.label}</span> <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
}

function ContactForm() {
  const emptyForm: ContactFormState = { firstName: '', lastName: '', email: '', reason: '', message: '' };
  const [form, setForm] = useState<ContactFormState>(emptyForm);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const mutation = useSubmitContact({
    mutation: {
      onSuccess: () => {
        setForm(emptyForm);
        setError('');
        setSubmitted(true);
      },
      onError: (submissionError) => {
        setSubmitted(false);
        const status = (submissionError as Error & { status?: number }).status;
        setError(status === 400
          ? 'Please check each field and try again.'
          : 'Your message could not be saved. Please try again.');
      },
    },
  });

  const update = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!firstName || !lastName || !email || !form.reason || !message) {
      setSubmitted(false);
      setError('Please complete your first name, last name, email, reason, and message.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setSubmitted(false);
      setError('Please enter a valid email address.');
      return;
    }

    mutation.mutate({
      data: {
        firstName,
        lastName,
        email,
        reason: form.reason as ContactMessageInput['reason'],
        message,
      },
    });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-grid">
        <label className="field"><span>First Name</span><input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></label>
        <label className="field"><span>Last Name</span><input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></label>
      </div>
      <label className="field"><span>Email</span><input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
      <fieldset className="reason-field">
        <legend>Reason for Contact</legend>
        <div className="reason-options">
          {contactReasons.map((reason) => (
            <label key={reason} className={`reason-option ${form.reason === reason ? 'is-selected' : ''}`}>
              <input type="radio" name="reason" value={reason} checked={form.reason === reason} onChange={() => update('reason', reason)} />
              <span>{reason}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field"><span>Message</span><textarea required rows={5} value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Write your message here." /></label>
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {submitted && <p className="form-message form-success" role="status">Your message was saved successfully. Thanks for reaching out.</p>}
      <button className="button button-dark" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}

type MediaCardData = {
  id: string;
  title: string;
  caption: string;
  kind: 'image' | 'video' | 'social';
  label: string;
  href?: string;
  src?: string;
};

function MediaVisual({ item, expanded = false }: { item: MediaCardData; expanded?: boolean }) {
  return (
    <div className={`media-visual media-visual-${item.kind} ${expanded ? 'is-expanded' : ''}`}>
      {item.src ? <img src={item.src} alt={item.caption} /> : <span className="media-visual-label">{item.label}</span>}
      {item.kind === 'video' && <span className="media-play"><Play size={18} fill="currentColor" /></span>}
      {item.kind === 'social' && <span className="media-social-mark"><ExternalLink size={15} /></span>}
    </div>
  );
}

function MediaCard({ item, onOpen }: { item: MediaCardData; onOpen: (item: MediaCardData) => void }) {
  const openCard = () => {
    if (item.kind === 'social' && item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    onOpen(item);
  };

  return (
    <article className="gallery-card">
      <button className="gallery-card-button" type="button" onClick={openCard} aria-label={`${item.title}: ${item.caption}`}>
        <MediaVisual item={item} />
        <span className="gallery-card-overlay"><Maximize2 size={16} /> {item.kind === 'social' ? 'Open post' : 'View larger'}</span>
      </button>
      <div className="gallery-card-copy">
        <span className="type-label">{item.kind}</span>
        <h3>{item.title}</h3>
        <p>{item.caption}</p>
      </div>
    </article>
  );
}

function Home() {
  usePageTitle('Home');
  const [profile] = useStoredState('abner-profile', defaultProfile);
  const visibleIntro = profile.bio === previousHomeIntro || profile.bio === previousStudentIntro ? homeIntro : profile.bio;
  return (
    <Shell profile={profile}>
      <main>
        <section className="site-container home-hero">
          <div className="home-copy">
            <p className="eyebrow">Home / About me</p>
            <h1>{profile.name}</h1>
            <p className="hero-role">{profile.role}</p>
            <div className="bio-copy" aria-label="Biography">
              <p className="hero-bio">{visibleIntro}</p>
            </div>
            <div className="hero-actions">
              <a className="button button-dark" href={`mailto:${profile.email}`}><Mail size={16} /> Contact me</a>
              <Link className="button button-light" href="/media">See my media <ExternalLink size={15} /></Link>
            </div>
          </div>
          <div className="home-profile">
            <div className="hero-logo"><StanfordLogo /><span>My personal website</span></div>
            <ProfilePhoto profile={profile} large />
            <div className="profile-caption"><span>01</span><span>{profile.location}</span></div>
          </div>
        </section>

        <section className="site-container contact-block">
          <div><p className="eyebrow">03 / Contact</p><h2>Want to get in touch?</h2><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}</a></div>
          <div><SocialLinks profile={profile} /><Link className="button button-light" href="/admin">Update my details <ExternalLink size={14} /></Link></div>
        </section>
        <section className="site-container contact-form-section">
          <div className="contact-form-intro"><p className="eyebrow"><span>05</span><span>Contact</span></p><h2>Let&apos;s <em>connect.</em></h2><p>Have a question, idea, or opportunity? Send me a note.</p></div>
          <ContactForm />
        </section>
      </main>
    </Shell>
  );
}

function Media() {
  usePageTitle('Media');
  const [profile] = useStoredState('abner-profile', defaultProfile);
  const [selectedMedia, setSelectedMedia] = useState<MediaCardData | null>(null);
  const media: MediaCardData[] = [
    { id: 'profile', title: 'A little about me', kind: 'image', label: 'ABNER / PROFILE', caption: 'A student profile moment from Abner’s personal website.', src: profile.photoUrl || undefined },
    { id: 'baseball', title: 'Baseball and teamwork', kind: 'image', label: 'BASEBALL / TEAMWORK', caption: 'A story about playing baseball for Grossmont and learning through teamwork.' },
    { id: 'web-design', title: 'Learning web design', kind: 'video', label: 'WEB DESIGN / PLAY', caption: 'A short video space for showing how Abner learns and builds for the web.' },
    { id: 'creative-work', title: 'Digital creativity', kind: 'image', label: 'CREATE / EXPLORE', caption: 'A visual space for creative experiments, ideas, and digital work.' },
    { id: 'process', title: 'Behind the process', kind: 'image', label: 'IDEA → BUILD', caption: 'A closer look at the notes, sketches, and decisions behind a project.' },
    { id: 'social', title: 'Follow the work', kind: 'social', label: 'SOCIAL / UPDATES', caption: 'Open Abner’s public profile to see new work and updates.', href: profile.instagram || profile.linkedin || profile.github },
    { id: 'next-project', title: 'The next project', kind: 'video', label: 'NEXT PROJECT / PLAY', caption: 'A video space for a project demo, walkthrough, or introduction.' },
    { id: 'grossmont', title: 'Where I’m learning', kind: 'image', label: 'GROSSMONT / GROW', caption: 'A related image or moment from school, clubs, or the community.' },
    { id: 'future', title: 'Looking ahead', kind: 'image', label: '2031 / KEEP GOING', caption: 'A visual reminder of the goals and experiences Abner is working toward.' },
  ];
  return (
    <Shell profile={profile}>
      <main className="site-container page-main">
        <PageHeading eyebrow="02 / Media" title={<>Media and <em>gallery.</em></>} description="A collection of moments, interests, and work that help visitors understand Abner beyond the introduction." />
        <div className="requirements-panel">
          <div><p className="eyebrow">Nine ways to know me</p><h2>People, process, and possibility.</h2><p>Every card connects to Abner’s student life, interests, creative work, or next steps. Hover over a card, then click to explore it.</p></div>
          <div className="checklist"><div><CheckCircle2 size={16} /> 9 media cards</div><div><CheckCircle2 size={16} /> Image + video</div><div><CheckCircle2 size={16} /> Social link</div></div>
        </div>
        <div className="gallery-grid">
          {media.map((item) => <MediaCard key={item.id} item={item} onOpen={setSelectedMedia} />)}
        </div>
        {selectedMedia && (
          <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={selectedMedia.title} onClick={() => setSelectedMedia(null)}>
            <div className="media-lightbox-panel" onClick={(event) => event.stopPropagation()}>
              <button className="media-lightbox-close" type="button" onClick={() => setSelectedMedia(null)} aria-label="Close larger media view">×</button>
              <MediaVisual item={selectedMedia} expanded />
              <div className="media-lightbox-copy"><span className="type-label">{selectedMedia.kind}</span><h2>{selectedMedia.title}</h2><p>{selectedMedia.caption}</p></div>
            </div>
          </div>
        )}
      </main>
    </Shell>
  );
}

function Future() {
  usePageTitle('Future');
  const [profile] = useStoredState('abner-profile', defaultProfile);
  return (
    <Shell profile={profile}>
      <main className="site-container page-main">
        <PageHeading eyebrow="03 / Future" title={<>What comes <em>next?</em></>} description="A five-year story about learning, building, playing, and becoming the kind of creative professional I want to be." />
        <section className="future-intro"><div><p className="eyebrow">The five-year direction</p><h2>Build a future that connects <em>web design and baseball.</em></h2></div><div className="future-copy"><p>Over the next five years, I want to keep improving as a web designer, build a portfolio of real projects, and stay connected to the teamwork I learn through baseball.</p><p>My specific goal is to graduate from college by 2031 with a degree or focused training in web development or a related field, while completing at least five polished websites or digital projects.</p></div></section>
        <section className="future-story">
          <figure className="future-visual"><div className="future-visual-number">2031</div><figcaption>A realistic long-term target: education, experience, and a portfolio I can share.</figcaption></figure>
          <div className="future-timeline">
            {[['01', 'Keep learning', 'Strengthen my web design, writing, and digital creativity skills through school and practice.'], ['02', 'Build proof', 'Complete real projects that show how I think, solve problems, and work with other people.'], ['03', 'Reach the goal', 'Graduate with focused training and a portfolio ready for internships, work, or creative opportunities.']].map(([number, title, text]) => <article className="future-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </section>
      </main>
    </Shell>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description: string }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></header>;
}

function TopicPage({ mode }: { mode: 'web' | 'creative' }) {
  usePageTitle(topics[mode].title);
  const [profile] = useStoredState('abner-profile', defaultProfile);
  const topic = topics[mode];
  return (
    <Shell profile={profile}>
      <main className="site-container page-main">
        <PageHeading eyebrow={`04 / Choice page ${mode === 'web' ? '#1' : '#2'}`} title={<>{topic.title.split(' ')[0]} <em>{topic.title.split(' ').slice(1).join(' ')}</em></>} description={topic.intro} />
        <section className="topic-layout"><div className="topic-marker">{mode === 'web' ? '{ }' : '✦'}</div><div><h2>{topic.body}</h2><p className="topic-placeholder">This is the starting point for this topic. Add your own examples, writing, screenshots, or links from the Admin page.</p><div className="topic-needs">{topic.needs.map((need, index) => <div key={need}><span>0{index + 1}</span><p>{need}</p></div>)}</div><Link className="button button-light" href="/admin">Edit this topic <ExternalLink size={14} /></Link></div></section>
      </main>
    </Shell>
  );
}

function Admin() {
  usePageTitle('Admin');
  const [profile, setProfile] = useStoredState('abner-profile', defaultProfile);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(profile);
  const messagesQuery = useListContactMessages({
    query: { queryKey: getListContactMessagesQueryKey(), refetchOnMount: 'always', staleTime: 0 },
  });
  const markRepliedMutation = useMarkContactMessageReplied({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContactMessagesQueryKey() });
      },
    },
  });
  const messages = [...(messagesQuery.data ?? [])].reverse();

  const update = (key: keyof Profile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event: FormEvent) => {
    event.preventDefault();
    setProfile(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="site-container admin-page">
      <div className="admin-header"><div><p className="eyebrow">06 / Admin</p><h1>Website setup.</h1><p>Use this page to collect the information needed for each phase of the project.</p></div><Link className="button button-light" href="/">View website <ExternalLink size={14} /></Link></div>
      <section className="admin-warning"><LockKeyhole size={20} /><div><strong>Password protection is not configured.</strong><p>Contact messages include private information. Add authentication before publishing this Admin page.</p></div></section>
      <div className="admin-grid">
        <form className="admin-card" onSubmit={save}>
          <div className="admin-card-heading"><div><p className="eyebrow">Phase 1</p><h2>Home page information</h2></div>{saved && <span className="saved-message"><CheckCircle2 size={15} /> Saved</span>}</div>
          <p className="admin-card-description">Add your biography, profile photo URL, social links, and contact details here.</p>
          <Field label="Name" value={form.name} onChange={(value) => update('name', value)} />
          <Field label="Role or short description" value={form.role} onChange={(value) => update('role', value)} />
          <Field label="Short biography" value={form.bio} multiline onChange={(value) => update('bio', value)} />
          <Field label="Longer biography" value={form.longerBio} multiline onChange={(value) => update('longerBio', value)} />
          <Field label="Email or contact information" value={form.email} onChange={(value) => update('email', value)} />
          <Field label="Location" value={form.location} onChange={(value) => update('location', value)} />
          <Field label="Profile photo URL" value={form.photoUrl} onChange={(value) => update('photoUrl', value)} placeholder="https://..." />
          <div className="field-grid"><Field label="GitHub URL" value={form.github} onChange={(value) => update('github', value)} /><Field label="LinkedIn URL" value={form.linkedin} onChange={(value) => update('linkedin', value)} /></div>
          <Field label="Instagram URL" value={form.instagram} onChange={(value) => update('instagram', value)} />
          <button className="button button-dark" type="submit"><Save size={15} /> Save home details</button>
        </form>
        <div className="admin-side">
          <PhaseCard number="02" title="Media page" text="Provide 3 images and 1 short video. Audio is optional." icon={<Upload size={18} />} />
          <PhaseCard number="03" title="Future page" text="Provide your goals, a short piece of writing, and any supporting media." icon={<CheckCircle2 size={18} />} />
          <PhaseCard number="04–05" title="Choice pages" text="Current topics are Web Development and Digital Creativity. Replace them if your assignment requires different topics." icon={<ExternalLink size={18} />} />
          <div className="admin-card stats-card"><div className="admin-card-heading"><div><p className="eyebrow">Phase 6</p><h2>Statistics</h2></div><BarChart3 size={20} /></div><p className="admin-card-description">Analytics are not connected yet. This preview shows where a chart can go after a provider is selected.</p><div className="mini-chart"><span style={{ height: '42%' }} /><span style={{ height: '68%' }} /><span style={{ height: '55%' }} /><span style={{ height: '82%' }} /><span style={{ height: '64%' }} /></div><small>Example weekly visits · connect analytics before launch</small></div>
        </div>
      </div>
      <section className="admin-card contact-inbox">
        <div className="admin-card-heading">
          <div><p className="eyebrow">Contact inbox</p><h2>Received messages</h2></div>
          {!messagesQuery.isLoading && <span className="inbox-count">{messages.length} total</span>}
        </div>
        <p className="admin-card-description">Messages submitted through the Home page are saved in App Storage.</p>
        {messagesQuery.isLoading && <p className="inbox-state">Loading messages…</p>}
        {messagesQuery.isError && <p className="form-message form-error">Messages could not be loaded. Try refreshing the page.</p>}
        {!messagesQuery.isLoading && !messagesQuery.isError && messages.length === 0 && <p className="inbox-state">No messages yet.</p>}
        <div className="message-list">
          {messages.map((message) => (
            <article className={`message-card ${message.replied ? 'is-replied' : ''}`} key={message.id}>
              <div className="message-card-top">
                <div>
                  <span className="message-reason">{message.reason}</span>
                  <h3>{message.firstName} {message.lastName}</h3>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                <div className="message-status">
                  <span>{message.replied ? 'Replied' : 'New'}</span>
                  <time dateTime={message.submittedAt}>{new Date(message.submittedAt).toLocaleString()}</time>
                </div>
              </div>
              <p className="message-body">{message.message}</p>
              {!message.replied && (
                <button
                  className="button button-light"
                  type="button"
                  disabled={markRepliedMutation.isPending}
                  onClick={() => markRepliedMutation.mutate({ id: message.id })}
                >
                  <CheckCircle2 size={15} /> Mark replied
                </button>
              )}
              {message.repliedAt && <small>Marked replied {new Date(message.repliedAt).toLocaleString()}</small>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, multiline = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}</label>;
}

function PhaseCard({ number, title, text, icon }: { number: string; title: string; text: string; icon: ReactNode }) {
  return <article className="phase-card"><span className="phase-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="phase-icon">{icon}</span></article>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/media" component={Media} /><Route path="/future" component={Future} /><Route path="/web-development"><TopicPage mode="web" /></Route><Route path="/digital-creativity"><TopicPage mode="creative" /></Route><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;