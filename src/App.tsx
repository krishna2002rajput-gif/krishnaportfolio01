import { type CSSProperties, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Github,
  Linkedin,
  LineChart,
  LockKeyhole,
  Loader2,
  Mail,
  Menu,
  PieChart,
  Play,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | boolean | number>) => void;
        };
      };
    };
  }
}

type AuthState = 'locked' | 'verifying' | 'revealing' | 'unlocked';

type AuthUser = {
  name: string;
  email: string;
  picture?: string;
  method: 'google' | 'otp';
  token?: string;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const apiPost = async <T,>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Secure service is unavailable. Configure Vercel environment variables first.');
  }

  return payload as T;
};

const navItems = [
  { label: 'Profile', href: '#profile' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Applied Skills', href: '#applied-skills' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

const skills = [
  {
    title: 'Business Analysis',
    icon: Briefcase,
    items: ['Requirement Gathering', 'Process Mapping', 'Documentation', 'Stakeholder Management'],
  },
  {
    title: 'Data Analytics',
    icon: BarChart3,
    items: ['Excel', 'Power BI', 'SQL', 'Zoho Analytics'],
  },
  {
    title: 'Automation',
    icon: Zap,
    items: ['Python', 'Google App Script', 'Workflow Automation'],
  },
  {
    title: 'Business Operations',
    icon: CheckCircle2,
    items: ['Procurement', 'Compliance', 'Reporting', 'MIS'],
  },
];

const experiences = [
  {
    period: 'Aug 2025 - Present',
    title: 'Business Operations Associate',
    company: 'Elcom Digital Solutions',
    logo: 'ED',
    summary:
      'Driving vendor and customer lifecycle operations, invoice reconciliation, MIS dashboards, and automation initiatives with Python and Google App Script.',
  },
  {
    period: 'Jun 2024 - Jun 2025',
    title: 'Purchase Executive & Administrative Assistant',
    company: 'J.N. Arora & Co. Pvt. Ltd.',
    logo: 'JN',
    summary:
      'Managed procurement workflows, vendor coordination, delivery tracking, reporting, and vendor evaluation systems while maintaining a 98% on-time delivery rate.',
  },
  {
    period: 'Dec 2023 - Jun 2024',
    title: 'Accounts & Compliance Intern',
    company: 'CA Sapna Joshi & Associates',
    logo: 'CA',
    summary:
      'Supported GST, TDS, TCS filings, reconciliation, ledger hygiene, and compliance documentation for client accounts using Tally ERP.',
  },
  {
    period: 'Apr 2021 - Sep 2021',
    title: 'Customer Service Representative',
    company: 'Lots Wholesale Solutions',
    logo: 'LW',
    summary:
      'Handled customer-facing operations, query resolution, billing support, database updates, and MIS reporting.',
  },
];

const appliedSkills = [
  {
    title: 'Business Workflow Automation',
    category: 'Operations Automation',
    icon: Zap,
    description:
      'Python and Google App Script workflows for invoicing, reconciliation, and customer onboarding to reduce repetitive manual processing.',
    tags: ['Python', 'Apps Script', 'Automation', 'MIS'],
    github: 'https://github.com/krishna2002rajput-gif',
    live: 'https://github.com/krishna2002rajput-gif',
  },
  {
    title: 'Procurement Analytics Dashboard',
    category: 'Analytics Dashboard',
    icon: BarChart3,
    description:
      'Vendor performance, purchase order lifecycle, and spend analysis dashboards designed for weekly leadership visibility.',
    tags: ['SQL', 'Zoho Analytics', 'Procurement', 'Reporting'],
    github: 'https://github.com/krishna2002rajput-gif',
    live: 'https://github.com/krishna2002rajput-gif',
  },
  {
    title: 'Vendor Evaluation Framework',
    category: 'Process Excellence',
    icon: Briefcase,
    description:
      'A structured vendor onboarding, scoring, and compliance tracking framework that improved procurement transparency.',
    tags: ['Excel', 'Vendor Ops', 'Process Mapping', 'Compliance'],
    github: 'https://github.com/krishna2002rajput-gif',
    live: 'https://github.com/krishna2002rajput-gif',
  },
  {
    title: 'SQL Operations Analysis',
    category: 'Data Insights',
    icon: LineChart,
    description:
      'Operational data analysis to surface bottlenecks, process gaps, cost leakages, and opportunities for SOP improvements.',
    tags: ['SQL', 'Analysis', 'Operations', 'SOP'],
    github: 'https://github.com/krishna2002rajput-gif',
    live: 'https://github.com/krishna2002rajput-gif',
  },
];

const certifications = [
  {
    title: 'Data Analytics Certification',
    icon: BarChart3,
    link: 'https://drive.google.com/file/d/1PhC9REkHygjkOvY8pcW7o_G40gORaN_Q/view?usp=drive_link',
  },
  {
    title: 'Financial Analysis Certification',
    icon: LineChart,
    link: 'https://drive.google.com/file/d/1UIeexX4PgQHXRb4NPgepoE5w-h3Occew/view?usp=drive_link',
  },
];

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
} as const;

const authSteps = ['Authenticating...', 'Verifying Identity...', 'Loading Portfolio...', 'Preparing Dashboard...'];

const AuthPortal = ({
  authState,
  email,
  otp,
  error,
  statusStep,
  googleReady,
  onEmailChange,
  onOtpChange,
  onRequestOtp,
  onVerifyOtp,
}: {
  authState: AuthState;
  email: string;
  otp: string;
  error: string;
  statusStep: number;
  googleReady: boolean;
  onEmailChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
}) => {
  const isWorking = authState === 'verifying' || authState === 'revealing';

  return (
    <section className={`auth-portal ${authState !== 'locked' ? 'is-clearing' : ''}`} aria-label="Executive portfolio access">
      <div className="security-grid" />
      <div className="particle-field" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <motion.div
        className="access-card glass-card"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="access-emblem">
          <LockKeyhole size={28} />
        </div>
        <span>Private Access Gateway</span>
        <h1>Executive Portfolio Access</h1>
        <p>Secure access required to continue.</p>

        <div className="google-access" id="google-access-button">
          {!googleReady && (
            <button className="btn btn-primary" type="button" disabled>
              <ShieldCheck size={18} /> Continue with Google
            </button>
          )}
        </div>

        <div className="access-divider">
          <span>Email OTP fallback</span>
        </div>

        <label className="auth-field">
          <span>Email Address</span>
          <input
            type="email"
            value={email}
            placeholder="name@company.com"
            autoComplete="email"
            disabled={isWorking}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>

        <div className="otp-row">
          <button className="btn btn-secondary" type="button" disabled={isWorking || !email} onClick={onRequestOtp}>
            Request OTP
          </button>
          <label className="auth-field otp-field">
            <span>Verification Code</span>
            <input
              type="text"
              value={otp}
              placeholder="KR7XQ8"
              maxLength={6}
              autoComplete="one-time-code"
              disabled={isWorking}
              onChange={(event) => onOtpChange(event.target.value.toUpperCase())}
            />
          </label>
        </div>

        <button className="btn btn-primary access-submit" type="button" disabled={isWorking || !email || otp.length < 6} onClick={onVerifyOtp}>
          {isWorking ? <Loader2 className="spin" size={18} /> : <UserCheck size={18} />}
          Continue
        </button>

        {error && <p className="auth-error">{error}</p>}

        {isWorking && (
          <div className="auth-progress" aria-live="polite">
            <div className="progress-track">
              <span style={{ width: `${Math.min((statusStep + 1) * 25, 100)}%` }} />
            </div>
            <strong>{authState === 'revealing' ? 'Identity Verified' : authSteps[statusStep]}</strong>
            <small>{authState === 'revealing' ? 'Loading Executive Portfolio' : 'Encrypted access checks in progress'}</small>
          </div>
        )}
      </motion.div>
    </section>
  );
};

const SecurityShutter = ({ active }: { active: boolean }) => (
  <div className={`security-shutter ${active ? 'is-opening' : ''}`} aria-hidden="true">
    <div className="shutter-light" />
    <div className="shutter-panel">
      {Array.from({ length: 10 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  </div>
);

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [authState, setAuthState] = useState<AuthState>(() => {
    return sessionStorage.getItem('portfolio-access-token') ? 'unlocked' : 'locked';
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem('portfolio-access-user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [statusStep, setStatusStep] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    document.body.style.overflow = videoOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [videoOpen]);

  useEffect(() => {
    document.body.classList.toggle('protected-content', authState === 'unlocked');
    return () => document.body.classList.remove('protected-content');
  }, [authState]);

  useEffect(() => {
    if (authState !== 'locked' || !googleClientId) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) return;
          try {
            setAuthError('');
            setAuthState('verifying');
            const payload = await apiPost<{ user: AuthUser }>('/api/auth/google', { credential });
            completeAuthentication(payload.user);
          } catch (error) {
            setAuthState('locked');
            setAuthError(error instanceof Error ? error.message : 'Google verification failed.');
          }
        },
      });

      const button = document.getElementById('google-access-button');
      if (button) {
        button.innerHTML = '';
        window.google.accounts.id.renderButton(button, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 300,
        });
        setGoogleReady(true);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [authState]);

  useEffect(() => {
    const block = (event: Event) => {
      if (authState === 'unlocked') {
        event.preventDefault();
        setAuthError('Content Protected');
      }
    };

    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('dragstart', block);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('dragstart', block);
    };
  }, [authState]);

  useEffect(() => {
    if (authState !== 'verifying') return;

    const interval = window.setInterval(() => {
      setStatusStep((step) => Math.min(step + 1, authSteps.length - 1));
    }, 650);

    return () => window.clearInterval(interval);
  }, [authState]);

  const completeAuthentication = (user: AuthUser) => {
    setAuthUser(user);
    setAuthEmail('');
    setAuthOtp('');
    setStatusStep(0);
    sessionStorage.setItem('portfolio-access-token', user.token || 'client-session');
    sessionStorage.setItem('portfolio-access-user', JSON.stringify(user));

    window.setTimeout(() => setAuthState('revealing'), 2100);
    window.setTimeout(() => setAuthState('unlocked'), 4700);
  };

  const requestOtp = async () => {
    try {
      setAuthError('');
      await apiPost('/api/auth/request-otp', { email: authEmail });
      setAuthError('OTP sent. It expires in 5 minutes.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'OTP request failed.');
    }
  };

  const verifyOtp = async () => {
    try {
      setAuthError('');
      setAuthState('verifying');
      const payload = await apiPost<{ user: AuthUser }>('/api/auth/verify-otp', { email: authEmail, otp: authOtp });
      completeAuthentication(payload.user);
    } catch (error) {
      setAuthState('locked');
      setAuthError(error instanceof Error ? error.message : 'OTP verification failed.');
    }
  };

  const getProtectedAsset = async (assetName: 'resume' | 'intro') => {
    const token = sessionStorage.getItem('portfolio-access-token');
    const response = await fetch(`/api/assets/signed-url?asset=${assetName}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || 'Protected asset service is not configured yet.');
    }

    return payload.url as string;
  };

  const openResume = async () => {
    try {
      const url = await getProtectedAsset('resume');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to open protected resume.');
    }
  };

  const openIntroVideo = async () => {
    try {
      const url = await getProtectedAsset('intro');
      setVideoUrl(url);
      setVideoOpen(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to open protected video.');
    }
  };

  const closeVideo = () => {
    setVideoOpen(false);
    setVideoUrl('');
  };

  return (
    <main className="site-shell">
      {authState !== 'unlocked' && (
        <AuthPortal
          authState={authState}
          email={authEmail}
          otp={authOtp}
          error={authError}
          statusStep={statusStep}
          googleReady={googleReady}
          onEmailChange={setAuthEmail}
          onOtpChange={setAuthOtp}
          onRequestOtp={requestOtp}
          onVerifyOtp={verifyOtp}
        />
      )}
      <SecurityShutter active={authState === 'revealing'} />

      <div className={`portfolio-content ${authState === 'locked' || authState === 'verifying' ? 'is-locked' : ''}`}>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a href="#hero" className="brand-mark" aria-label="Krishna Rajput home">
          KR
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </div>
        {authUser && (
          <div className="user-chip" aria-label={`Verified user ${authUser.email}`}>
            {authUser.picture ? <img src={authUser.picture} alt="" /> : <ShieldCheck size={16} />}
            <span>{authUser.name || authUser.email}</span>
          </div>
        )}
      </nav>

      <section id="hero" className="hero-section">
        <img className="hero-cover" src={asset('KRISHNA.png')} alt="Krishna Rajput" fetchPriority="high" />
        <div className="hero-overlay" />
        <div className="hero-motion hero-motion-one" />
        <div className="hero-motion hero-motion-two" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <div className="hero-kicker">
            <Sparkles size={16} />
            Business operations, analytics, and automation
          </div>
          <h1>
            Hi, I am <span>Krishna Rajput</span>
          </h1>
          <p>
            Business Analyst | Operations Excellence | Data Analytics | Process Automation
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#skills">
              View Skills <ArrowRight size={18} />
            </a>
            <button className="btn btn-secondary" type="button" onClick={openResume}>
              Resume <ExternalLink size={18} />
            </button>
            <button className="btn btn-secondary" type="button" onClick={openIntroVideo}>
              <Play size={18} fill="currentColor" /> Introduction Video
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-card glass-card"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <PieChart size={24} />
          <strong>40% less manual effort</strong>
          <span>Through Python and Google App Script automations.</span>
        </motion.div>

        <div className="floating-socials" aria-label="Social links">
          <a href="mailto:krishna2002rajput@gmail.com" aria-label="Email Krishna">
            <Mail size={20} />
          </a>
          <a href="https://www.linkedin.com/in/krishna-rajput-b30a0025b/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
            <Linkedin size={20} />
          </a>
          <a href="https://github.com/krishna2002rajput-gif" target="_blank" rel="noreferrer" aria-label="GitHub profile">
            <Github size={20} />
          </a>
        </div>

        <a className="scroll-indicator" href="#profile" aria-label="Scroll to profile">
          <ChevronDown size={22} />
        </a>
      </section>

      <section id="profile" className="section profile-section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>Profile</span>
          <h2>Professional Profile</h2>
        </motion.div>
        <motion.div {...sectionMotion} className="profile-grid">
          <div className="profile-copy">
            <h3>Krishna Rajput</h3>
            <p className="role">Business Analyst | Operations Excellence | Data Analytics | Process Automation</p>
            <p>
              I enjoy turning complex business processes into structured, scalable, and data-driven systems.
            </p>
            <p>
              With experience across business operations, procurement, analytics, reporting, automation, and compliance, I work at the intersection of operations, technology, and strategy. From automating repetitive workflows using Python and Google App Script to building MIS dashboards and operational reports, I focus on improving efficiency and enabling smarter business decisions.
            </p>
          </div>
          <div className="profile-stats">
            {[
              ['2+', 'Years Experience'],
              ['98%', 'On-time Delivery'],
              ['4+', 'Automations Built'],
              ['MBA', 'Amity University'],
            ].map(([value, label]) => (
              <div className="glass-card stat-card" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="skills" className="section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>Capabilities</span>
          <h2>Skills by Category</h2>
        </motion.div>
        <div className="skills-grid">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.article
                {...sectionMotion}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="skill-card glass-card"
                key={skill.title}
              >
                <Icon size={26} />
                <h3>{skill.title}</h3>
                <ul>
                  {skill.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="experience" className="section section-light">
        <motion.div {...sectionMotion} className="section-heading dark">
          <span>Career Journey</span>
          <h2>Experience Timeline</h2>
        </motion.div>
        <div className="timeline">
          {experiences.map((experience, index) => (
            <motion.article
              {...sectionMotion}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="timeline-item"
              key={experience.title}
            >
              <div className="timeline-marker">{experience.logo}</div>
              <div className="timeline-card">
                <span>{experience.period}</span>
                <h3>{experience.title}</h3>
                <strong>{experience.company}</strong>
                <p>{experience.summary}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="applied-skills" className="section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>Applied Capabilities</span>
          <h2>Skills</h2>
        </motion.div>
        <div className="projects-grid">
          {appliedSkills.map((project, index) => {
            const Icon = project.icon;
            return (
              <motion.article
                {...sectionMotion}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="project-card"
                key={project.title}
              >
              <div className="project-icon">
                <Icon size={34} />
              </div>
              <div className="project-body">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="project-actions">
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <Github size={17} /> GitHub
                  </a>
                  <a href={project.live} target="_blank" rel="noreferrer">
                    <ExternalLink size={17} /> Live Demo
                  </a>
                </div>
              </div>
            </motion.article>
            );
          })}
        </div>
      </section>

      <section id="certifications" className="section certifications-section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>Credentials</span>
          <h2>Certifications</h2>
        </motion.div>
        <div className="cert-grid">
          {certifications.map((certificate, index) => {
            const Icon = certificate.icon;
            return (
              <motion.a
                {...sectionMotion}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="certificate-card glass-card"
                href={certificate.link}
                target="_blank"
                rel="noreferrer"
                key={certificate.title}
              >
                <Icon size={34} />
                <h3>{certificate.title}</h3>
                <span>
                  View Certificate <ExternalLink size={16} />
                </span>
              </motion.a>
            );
          })}
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <motion.div {...sectionMotion} className="contact-card glass-card">
          <span>Open to opportunities</span>
          <h2>Let’s build cleaner operations and sharper reporting.</h2>
          <div className="contact-actions">
            <a className="btn btn-primary" href="mailto:krishna2002rajput@gmail.com">
              <Mail size={18} /> Email Me
            </a>
            <a className="btn btn-secondary" href="https://www.linkedin.com/in/krishna-rajput-b30a0025b/" target="_blank" rel="noreferrer">
              <Linkedin size={18} /> LinkedIn
            </a>
            <button className="btn btn-secondary" type="button" onClick={openResume}>
              <ExternalLink size={18} /> Resume
            </button>
            <button className="btn btn-secondary" type="button" onClick={openIntroVideo}>
              <Play size={18} fill="currentColor" /> Introduction Video
            </button>
          </div>
        </motion.div>
      </section>

      {videoOpen && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label="Introduction video">
          <button className="video-backdrop" type="button" aria-label="Close video" onClick={closeVideo} />
          <div className="video-panel">
            <button className="video-close" type="button" aria-label="Close video" onClick={closeVideo}>
              <X size={22} />
            </button>
            <video src={videoUrl} controls autoPlay playsInline preload="metadata" />
          </div>
        </div>
      )}
      </div>
    </main>
  );
};

export default App;
