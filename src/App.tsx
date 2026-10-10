import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
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

const logClientEvent = (event: string, status: string, details = '') => {
  const token = sessionStorage.getItem('portfolio-access-token');
  fetch('/api/audit/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ event, status, details }),
  }).catch(() => undefined);
};

const navItems = [
  { label: 'Showcase', href: '#showcase' },
  { label: 'Business Insight', href: '#business-insight' },
  { label: 'Profile', href: '#profile' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Applied Skills', href: '#applied-skills' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

const skills = [
  {
    title: 'Business Analysis & Consulting',
    icon: Briefcase,
    items: [
      'Requirements Elicitation & Gathering',
      'As-Is / To-Be Process Mapping',
      'BRD / FRD / SRS Authoring',
      'Gap Analysis & Root Cause Analysis',
      'UAT Support & Change Management',
      'Stakeholder Management',
    ],
  },
  {
    title: 'Data Analytics & BI',
    icon: BarChart3,
    items: [
      'SQL (Joins, Aggregations, Data Cleansing)',
      'Zoho Analytics & Power BI Dashboards',
      'Python (Pandas, NumPy, EDA)',
      'Advanced Excel (Power Query, Pivot, Macros)',
      'MIS & KPI Operational Reporting',
    ],
  },
  {
    title: 'Process Automation & Optimization',
    icon: Zap,
    items: [
      'Python Workflow Automation',
      'Google Apps Script',
      'SOP Design & Governance',
      'Lean Process Re-Engineering',
      'Bottleneck Elimination',
    ],
  },
  {
    title: 'Domain & Operational Knowledge',
    icon: CheckCircle2,
    items: [
      'Procurement Lifecycle & Vendor Management',
      'Contract Negotiation & SLA Tracking',
      'Financial Reconciliation',
      'GST / TDS / TCS Compliance',
      'Zoho Books & Tally Prime',
    ],
  },
];

const experiences = [
  {
    period: 'Aug 2025 – Present',
    title: 'Business Operations Associate',
    company: 'Elcom Digital Solutions',
    logo: 'ED',
    summary:
      'Facilitated structured requirement-elicitation sessions with vendor, customer, and internal leadership stakeholders. Mapped As-Is and To-Be workflows for onboarding, invoicing, and billing reconciliations. Authored comprehensive SOPs and BRD-style documentation, automated repetitive tasks using Python and Google Apps Script, and engineered real-time Zoho Analytics dashboards via SQL for executive KPI tracking.',
  },
  {
    period: 'Jun 2024 – Jun 2025',
    title: 'Purchase Executive & Operations Analyst',
    company: 'J.N. Arora & Co. Pvt. Ltd.',
    logo: 'JN',
    summary:
      'Conducted end-to-end gap analysis on vendor evaluation processes, identifying critical bottlenecks and designing a standardized procurement workflow. Managed the complete purchase order lifecycle across a multi-vendor portfolio, achieving a consistent 98% on-time delivery rate. Developed analytical purchase and inventory reports in Excel for cost-effective negotiation and stock replenishment.',
  },
  {
    period: 'Dec 2023 – Jun 2024',
    title: 'Accounts & Compliance Intern',
    company: 'CA Sapna Joshi & Associates',
    logo: 'CA',
    summary:
      'Conducted transactional reconciliations and maintained compliance documentation to ensure 100% audit readiness and statutory accuracy. Supported GST, TCS, and TDS filings for diverse corporate clients under strict regulatory deadlines. Standardized reconciliation spreadsheets using advanced Excel modeling and logic tests.',
  },
  {
    period: 'Apr 2021 – Sep 2021',
    title: 'Customer Service & Operations Representative',
    company: 'Lots Wholesale Solutions',
    logo: 'LW',
    summary:
      'Resolved complex customer billing adjustments and managed dispute resolution workflows. Maintained customer transactional databases and generated daily MIS service reports for management visibility.',
  },
];

const appliedSkills = [
  {
    title: 'Procurement Process Re-Engineering & Vendor SLA Governance',
    category: 'Process Excellence',
    icon: Briefcase,
    description:
      'Conducted comprehensive gap analysis across procurement and vendor touchpoints. Facilitated stakeholder sessions to map As-Is bottlenecks and model To-Be workflows, then designed a centralized vendor evaluation scorecard — achieving a consistent 98% on-time delivery rate across the vendor portfolio.',
    tags: ['Gap Analysis', 'Stakeholder Workshops', 'Vendor Scorecard', '98% OTD'],
  },
  {
    title: 'Operations Digitization & Real-Time Executive BI Dashboard',
    category: 'Analytics & Automation',
    icon: BarChart3,
    description:
      'Led structured requirements workshops converting operational pain points into BRD/SOP specifications. Deployed Python & Google Apps Script automations for repetitive data flows and developed centralized Zoho Analytics dashboards queried via SQL for leadership tracking of operational KPIs.',
    tags: ['BRD / SOP', 'Python', 'Apps Script', 'Zoho Analytics', 'SQL'],
  },
  {
    title: 'Financial Compliance & Audit Reconciliation Automation',
    category: 'Compliance & Finance',
    icon: ShieldCheck,
    description:
      'Standardized multi-client reconciliation spreadsheets using advanced Excel modeling and logic tests. Performed ledger audits aligned with regulatory standards — maintaining 100% compliance accuracy across all assigned GST/TDS/TCS filings and reducing audit-preparation lead time.',
    tags: ['Excel Modeling', 'GST / TDS / TCS', 'Audit Prep', '100% Accuracy'],
  },
  {
    title: 'SQL Operations Analysis & KPI Reporting',
    category: 'Data Insights',
    icon: LineChart,
    description:
      'Operational data analysis using SQL to surface bottlenecks, process gaps, cost leakages, and SLA performance trends. Delivered executive dashboards and MIS reports enabling data-backed decision-making at leadership level.',
    tags: ['SQL', 'KPI Dashboards', 'MIS Reporting', 'SLA Analysis'],
  },
];

const certifications = [
  {
    title: 'McKinsey.org Forward Program',
    subtitle: 'McKinsey & Company · 2026',
    icon: Sparkles,
    link: '',
  },
  {
    title: 'MBA – Business Analysis (Pursuing)',
    subtitle: 'Amity University Online · Jan 2026 – Present',
    icon: Briefcase,
    link: '',
  },
  {
    title: 'Data Analyst Certification',
    subtitle: 'Physics Wallah · Mar 2026',
    icon: BarChart3,
    link: 'https://drive.google.com/file/d/1PhC9REkHygjkOvY8pcW7o_G40gORaN_Q/view?usp=drive_link',
  },
  {
    title: 'Financial Analysis Certification',
    subtitle: 'View Certificate',
    icon: LineChart,
    link: 'https://drive.google.com/file/d/1UIeexX4PgQHXRb4NPgepoE5w-h3Occew/view?usp=drive_link',
  },
];

const portraitFrames = [
  { label: 'The Operator', note: 'Built from the ground up', position: '50% 42%', tint: 'ink' },
  { label: 'The Analyst', note: 'Finding the signal in the noise', position: '50% 30%', tint: 'ember' },
  { label: 'The Strategist', note: 'Turning complexity into clarity', position: '48% 55%', tint: 'blue' },
  { label: 'The Collaborator', note: 'Progress happens together', position: '54% 40%', tint: 'violet' },
  { label: 'The Next Chapter', note: 'Ready for what comes next', position: '50% 48%', tint: 'ink' },
];

const businessFunctions = [
  { name: 'CRM', color: '#34d399', role: 'The growth', connected: 'A customer win becomes a shared business signal.', siloed: 'Won deals stall or get lost, so growth leaks.', differential: 'The customer win carries into delivery.' },
  { name: 'Operations', color: '#60a5fa', role: 'The movement', connected: 'A closed deal activates provisioning and fulfillment.', siloed: 'Missed handoffs delay delivery and frustrate customers.', differential: 'The handoff becomes an active workflow.' },
  { name: 'Finance', color: '#fbbf24', role: 'The lifeblood', connected: 'Revenue meets the ledger; spending connects to value.', siloed: 'Revenue and ledger drift apart, risking leakage and audits.', differential: 'Revenue and costs share operational context.' },
  { name: 'Engagement', color: '#f472b6', role: 'The heartbeat', connected: 'Workload friction and engagement become visible together.', siloed: 'Hidden workload friction can turn into burnout and attrition.', differential: 'Team pressure is visible before it compounds.' },
  { name: 'People', color: '#a78bfa', role: 'The capacity to grow', connected: 'Workforce changes sync access, payroll, and security permissions.', siloed: 'Ex-staff may keep access and payroll errors go unnoticed.', differential: 'People, access, and payroll changes stay in sync.' },
];

const BusinessComparison = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splitRef = useRef(0.5);
  const [split, setSplit] = useState(0.5);
  const [activeFunction, setActiveFunction] = useState(0);

  const moveDivider = (clientX: number, canvas: HTMLCanvasElement) => {
    const bounds = canvas.getBoundingClientRect();
    const next = Math.max(0.06, Math.min(0.94, (clientX - bounds.left) / bounds.width));
    splitRef.current = next;
    setSplit(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let timer = 0;
    let isVisible = false;
    let pixelRatio = 1;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
      pixelRatio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.25 : 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (isVisible && !document.hidden) {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        timer = 0;
        frame = window.requestAnimationFrame(draw);
      }
    };

    const draw = (time: number) => {
      frame = 0;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const divider = width * splitRef.current;
      const points = businessFunctions.map((_, index) => ({ x: width * (0.1 + index * 0.2), y: height * 0.59 }));

      const drawWorld = (connected: boolean, left: number, right: number) => {
        context.save();
        context.beginPath();
        context.rect(left, 0, right - left, height);
        context.clip();
        const background = context.createLinearGradient(left, 0, right, height);
        if (connected) {
          background.addColorStop(0, '#0b1830');
          background.addColorStop(1, '#0a292d');
        } else {
          background.addColorStop(0, '#151523');
          background.addColorStop(1, '#25151f');
        }
        context.fillStyle = background;
        context.fillRect(left, 0, right - left, height);

        context.fillStyle = connected ? '#67e8d1' : '#ff8d9d';
        context.font = '800 10px system-ui, sans-serif';
        context.textAlign = 'left';
        context.fillText(connected ? 'WITH BUSINESS OS' : 'WITHOUT OS', left + 18, 24);
        context.fillStyle = '#a8b3c6';
        context.font = '11px system-ui, sans-serif';
        context.fillText(connected ? 'One signal, shared across teams' : 'Good teams, broken handoffs', left + 18, 42);

        for (let index = 0; index < points.length - 1; index += 1) {
          const from = points[index];
          const to = points[index + 1];
          context.save();
          context.lineWidth = connected ? 2.5 : 1.5;
          context.strokeStyle = connected ? '#2dd4bf' : '#657089';
          context.shadowColor = connected ? '#2dd4bf' : 'transparent';
          context.shadowBlur = connected ? 10 : 0;
          context.setLineDash(connected ? [] : [5, 6]);
          context.beginPath();
          if (connected) {
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
          } else {
            const gapX = (from.x + to.x) / 2;
            context.moveTo(from.x, from.y);
            context.lineTo(gapX - 11, from.y);
            context.moveTo(gapX + 11, to.y);
            context.lineTo(to.x, to.y);
          }
          context.stroke();
          context.restore();

          const progress = ((time / (connected ? 1550 : 3100) + index * 0.19) % 1 + 1) % 1;
          let packetX = from.x + (to.x - from.x) * progress;
          if (!connected && progress > 0.45 && progress < 0.86) packetX = (from.x + to.x) / 2 - 13;
          context.beginPath();
          context.arc(packetX, from.y, connected ? 4.5 : 3.5, 0, Math.PI * 2);
          context.fillStyle = connected ? '#ffffff' : '#ffd99a';
          context.shadowColor = connected ? '#67e8d1' : '#ff8d9d';
          context.shadowBlur = 13;
          context.fill();
          context.shadowBlur = 0;

          if (!connected) {
            const gapX = (from.x + to.x) / 2;
            context.strokeStyle = '#ff8d9d';
            context.lineWidth = 1.5;
            context.beginPath();
            context.moveTo(gapX - 4, from.y - 5);
            context.lineTo(gapX + 4, from.y + 3);
            context.moveTo(gapX + 4, from.y - 5);
            context.lineTo(gapX - 4, from.y + 3);
            context.stroke();
          }
        }

        points.forEach((point, index) => {
          const item = businessFunctions[index];
          context.beginPath();
          context.arc(point.x, point.y, 22, 0, Math.PI * 2);
          context.fillStyle = connected ? '#10223d' : '#171a2a';
          context.fill();
          context.lineWidth = connected ? 2 : 1.5;
          context.strokeStyle = connected ? item.color : '#59627d';
          context.stroke();
          context.fillStyle = connected ? item.color : '#a2abc0';
          context.font = '700 13px Georgia, serif';
          context.textAlign = 'center';
          context.fillText(item.name[0], point.x, point.y + 5);
          context.fillStyle = '#e7ecf5';
          context.font = '600 9px system-ui, sans-serif';
          context.fillText(item.name, point.x, point.y + 39);
        });
        context.restore();
      };

      drawWorld(false, 0, divider);
      drawWorld(true, divider, width);
      context.fillStyle = '#ffffff';
      context.fillRect(divider - 1, 0, 2, height);
      context.beginPath();
      context.arc(divider, height * 0.88, 17, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
      context.fillStyle = '#101827';
      context.font = '700 12px system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText('↔', divider, height * 0.88 + 4);
      if (isVisible && !document.hidden) {
        timer = window.setTimeout(() => {
          timer = 0;
          frame = window.requestAnimationFrame(draw);
        }, 1000 / 30);
      }
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !document.hidden && !frame && !timer) {
        frame = window.requestAnimationFrame(draw);
      } else if (!isVisible) {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        frame = 0;
        timer = 0;
      }
    }, { rootMargin: '100px' });
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        frame = 0;
        timer = 0;
      } else if (isVisible && !frame && !timer) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const active = businessFunctions[activeFunction];
  return (
    <div className="business-simulation">
      <div className="business-canvas-shell">
        <canvas
          ref={canvasRef}
          aria-label="Animated comparison: disconnected teams on the left and a connected business operating system on the right. Drag the divider or use the slider below."
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            moveDivider(event.clientX, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (event.buttons === 1) moveDivider(event.clientX, event.currentTarget);
          }}
        />
      </div>
      <label className="business-scrubber-label" htmlFor="business-scrubber">Drag the divider to compare the two systems</label>
      <input id="business-scrubber" className="business-scrubber" type="range" min="6" max="94" value={Math.round(split * 100)} onChange={(event) => {
        const next = Number(event.target.value) / 100;
        splitRef.current = next;
        setSplit(next);
      }} aria-label="Compare disconnected and connected business systems" />
      <div className="business-department-tabs" role="tablist" aria-label="Business functions">
        {businessFunctions.map((item, index) => (
          <button key={item.name} type="button" role="tab" aria-selected={activeFunction === index} className={activeFunction === index ? 'is-active' : ''} onClick={() => setActiveFunction(index)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="business-function-detail" role="tabpanel">
        <span style={{ color: active.color }}>{active.role}</span>
        <p><b>{active.name}:</b> {active.connected}</p>
      </div>
      <p className="business-simulation-note">Illustrative simulation, not real company data.</p>
    </div>
  );
};

const sectionMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
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
        {Array.from({ length: 10 }).map((_, index) => (
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
  const [portraitFrame, setPortraitFrame] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });
  const heroImageScale = useTransform(heroScrollProgress, [0, 1], [1, 1.48]);
  const heroImageOpacity = useTransform(heroScrollProgress, [0, 0.72, 1], [1, 0.72, 0]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Temporarily unlocked to allow viewing the design locally without Vercel API
    return 'unlocked'; 
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem('portfolio-access-user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [securityNotice, setSecurityNotice] = useState('');
  const [inspectionDetected, setInspectionDetected] = useState(false);
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
        setSecurityNotice('Content Protected');
        logClientEvent('Content Protection', 'Blocked Interaction', event.type);
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
    if (authState !== 'unlocked') return;

    const detectDevtools = () => {
      const threshold = 170;
      const widthGap = window.outerWidth - window.innerWidth > threshold;
      const heightGap = window.outerHeight - window.innerHeight > threshold;

      if ((widthGap || heightGap) && !inspectionDetected) {
        setInspectionDetected(true);
        setSecurityNotice('Protected Portfolio Environment Detected');
        logClientEvent('DevTools Detection', 'Warning', widthGap ? 'Width threshold' : 'Height threshold');
      }
    };

    const interval = window.setInterval(detectDevtools, 1200);
    window.addEventListener('resize', detectDevtools);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', detectDevtools);
    };
  }, [authState, inspectionDetected]);

  useEffect(() => {
    if (!securityNotice) return;
    const timer = window.setTimeout(() => setSecurityNotice(''), 3600);
    return () => window.clearTimeout(timer);
  }, [securityNotice]);

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

    window.setTimeout(() => setAuthState('revealing'), 900);
    window.setTimeout(() => setAuthState('unlocked'), 2800);
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

  const openResume = () => {
    window.open(
      'https://drive.google.com/file/d/1LPOQUiTQ_91vAfQDCktZQbw2aApzo2qM/view?usp=drive_link',
      '_blank',
      'noopener,noreferrer'
    );
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

      <div className={`portfolio-content ${authState === 'locked' || authState === 'verifying' ? 'is-locked' : ''} ${inspectionDetected ? 'inspection-warning' : ''}`}>
      {securityNotice && <div className="security-toast">{securityNotice}</div>}
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

      <section id="hero" className="hero-section" ref={heroRef}>
        <div className="hero-frame">
        <motion.img className="hero-cover" src={asset('hero-intro.webp')} alt="Illustrated portrait of Krishna Rajput with business analytics dashboards" fetchPriority="high" decoding="async" style={{ scale: heroImageScale, opacity: heroImageOpacity }} />
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
            Business Analyst &amp; Operations Analyst
          </div>
          <h1>
            Hi, I am <span>Krishna Rajput</span>
          </h1>
          <p>
            Business Analyst &amp; Operations Analyst — turning complex workflows into structured, data-driven solutions through Requirements Elicitation, Process Mapping, SQL/BI Analytics, and Automation.
          </p>
          <div className="hero-pills">
            <span>🎓 McKinsey Forward Scholar</span>
            <span>📊 MBA Business Analysis</span>
            <span>⚙️ 2+ Yrs Cross-Functional Ops</span>
            <span>🎯 98% SLA Milestone</span>
          </div>
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
          <strong>98% On-Time Delivery</strong>
          <span>Achieved across multi-vendor procurement portfolio.</span>
        </motion.div>

        <div className="floating-socials" aria-label="Social links">
          <a href="mailto:krishna2002rajput@gmail.com" aria-label="Email Krishna">
            <Mail size={20} />
          </a>
          <a href="https://www.linkedin.com/in/krishna-rajput-b30a0025b/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
            <Linkedin size={20} />
          </a>
        </div>

        <a className="scroll-indicator" href="#showcase" aria-label="Scroll to portrait showcase">
          <ChevronDown size={22} />
        </a>
        </div>
      </section>

      <section id="showcase" className="section art-showcase" aria-label="Portrait timeline">
        <div className="showcase-heading">
          <span>One journey, many frames</span>
          <h2>A portrait in progress<span>.</span></h2>
          <p>Drag the timeline to move through the story.</p>
        </div>
        <div className={`art-stage art-stage-${portraitFrames[portraitFrame].tint}`}>
          <div className="art-stage-copy">
            <span className="frame-count">FRAME 0{portraitFrame + 1} / 0{portraitFrames.length}</span>
            <h3>{portraitFrames[portraitFrame].label}</h3>
            <p>{portraitFrames[portraitFrame].note}</p>
          </div>
          <div className="portrait-window">
            <img src={asset('intro-2.webp')} alt="Black-and-white portrait of Krishna Rajput" loading="lazy" decoding="async" style={{ objectPosition: portraitFrames[portraitFrame].position }} />
            <div className="portrait-ink" aria-hidden="true" />
            <span className="portrait-index">KR—26</span>
          </div>
          <span className="stage-mark stage-mark-one" aria-hidden="true">✳</span>
          <span className="stage-mark stage-mark-two" aria-hidden="true">↗</span>
          <span className="stage-caption">A continuous study in work, curiosity &amp; craft</span>
        </div>
        <div className="frame-rail">
          <div className="frame-labels" aria-hidden="true">
            {portraitFrames.map((frame, index) => <button key={frame.label} className={portraitFrame === index ? 'is-active' : ''} onClick={() => setPortraitFrame(index)} type="button"><span>0{index + 1}</span>{frame.label}</button>)}
          </div>
          <input aria-label="Scrub through portrait timeline" type="range" min="0" max={portraitFrames.length - 1} step="1" value={portraitFrame} onChange={(event) => setPortraitFrame(Number(event.target.value))} />
          <div className="rail-foot"><span>DRAG TO SCRUB</span><span>01—05</span></div>
        </div>
      </section>

      <section id="business-insight" className="section business-insight">
        <div className="insight-heading">
          <span>Business insight · A story for every business</span>
          <h2>One customer win.<br /><em>Five teams in motion.</em></h2>
          <p className="insight-user-story"><b>Customer story</b> “When I sign a contract, I expect every team to know what happens next—without repeating information or waiting on internal handoffs.”</p>
        </div>
        <div className="insight-layout">
          <div className="insight-image-wrap">
            <img src={asset('intro.webp')} alt="Portrait of Krishna Rajput" loading="lazy" decoding="async" />
            <span>CONNECTED THINKING / 01</span>
          </div>
          <div className="insight-story">
            <BusinessComparison />
          </div>
        </div>
        <div className="insight-differential" role="table" aria-label="Business OS differential by function">
          <h3>Business OS differential</h3>
          <div className="differential-header" role="row">
            <span role="columnheader">Function</span>
            <span role="columnheader">Without OS</span>
            <span role="columnheader">With Business OS</span>
            <span role="columnheader">The difference</span>
          </div>
          {businessFunctions.map((item) => (
            <div className="differential-row" role="row" key={item.name}>
              <span className="differential-function" role="cell" data-label="Function" style={{ color: item.color }}>{item.name}</span>
              <span role="cell" data-label="Without OS">{item.siloed}</span>
              <span role="cell" data-label="With Business OS">{item.connected}</span>
              <span className="differential-result" role="cell" data-label="The difference">{item.differential}</span>
            </div>
          ))}
        </div>
        <p className="insight-source-note">Illustrative business scenario based on the Business OS presentation; outcomes depend on each organization’s processes and systems.</p>
      </section>

      <section id="profile" className="section profile-section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>About Me</span>
          <h2>From Operational Execution to Strategic Business Analysis</h2>
        </motion.div>
        <motion.div {...sectionMotion} className="profile-grid">
          <div className="profile-copy">
            <h3>Krishna Rajput</h3>
            <p className="role">Business Analyst &amp; Operations Analyst · Process Optimization · Data-Driven Insights</p>
            <p>
              My professional journey began in the operational core of organizations — managing procurement lifecycles, vendor ecosystems, and financial compliance. Experiencing firsthand where communication breaks, where data gets siloed, and where manual inefficiencies slow teams down inspired my deliberate transition into Business Analysis.
            </p>
            <p>
              Today, I combine my practical operational foundation with structured problem-solving frameworks cultivated through the McKinsey.org Forward Program and an MBA in Business Analysis. I specialize in breaking down ambiguous business problems into structured requirements, designing automated workflows, and delivering actionable BI dashboards.
            </p>
            <div className="differentiators">
              <div className="diff-item">
                <strong>01 · Requirements Engineering with Operational Empathy</strong>
                <p>Because I have executed workflows myself, the SOPs, BRDs, and process maps I design are realistic, scalable, and user-adopted.</p>
              </div>
              <div className="diff-item">
                <strong>02 · Structured Problem Solving (McKinsey Forward Framework)</strong>
                <p>Applying hypothesis-driven analysis, MECE issue breakdown, and root-cause investigation (5 Whys / Fishbone) to solve core business bottlenecks.</p>
              </div>
              <div className="diff-item">
                <strong>03 · End-to-End Analytical Fluency</strong>
                <p>From writing SQL queries and building Zoho Analytics/BI dashboards to automating routine tasks with Python and Google Apps Script.</p>
              </div>
            </div>
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
          <span>Featured Case Studies</span>
          <h2>BA Projects & Impact</h2>
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
              </div>
            </motion.article>
            );
          })}
        </div>
      </section>

      <section id="certifications" className="section certifications-section">
        <motion.div {...sectionMotion} className="section-heading">
          <span>Credentials</span>
          <h2>Education & Certifications</h2>
        </motion.div>
        <div className="cert-grid">
          {certifications.map((certificate, index) => {
            const Icon = certificate.icon;
            const CardTag = certificate.link ? motion.a : motion.div;
            const linkProps = certificate.link
              ? { href: certificate.link, target: '_blank', rel: 'noreferrer' }
              : {};
            return (
              <CardTag
                {...sectionMotion}
                {...linkProps}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="certificate-card glass-card"
                key={certificate.title}
              >
                <Icon size={34} />
                <h3>{certificate.title}</h3>
                <span>
                  {certificate.link ? (
                    <>{certificate.subtitle} <ExternalLink size={14} /></>
                  ) : (
                    certificate.subtitle
                  )}
                </span>
              </CardTag>
            );
          })}
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <motion.div {...sectionMotion} className="contact-card glass-card">
          <span>Open to Business Analyst &amp; Operations Analyst Roles</span>
          <h2>Let's collaborate &mdash; ready to drive your next BA or Ops initiative.</h2>
          <p className="contact-value-prop">
            Available for full-time BA / Operations Analyst roles. Bringing 2+ years of hands-on experience in process re-engineering, stakeholder requirements, and data-driven reporting.
          </p>
          <div className="contact-chips">
            <span>📍 Krishna Nagar, Delhi – 110051</span>
            <span>📞 +91 9650259801</span>
            <span>✉️ krishna2002rajput@gmail.com</span>
          </div>
          <div className="contact-actions">
            <a className="btn btn-primary" href="mailto:krishna2002rajput@gmail.com">
              <Mail size={18} /> Email Me
            </a>
            <a className="btn btn-secondary" href="https://www.linkedin.com/in/krishna-rajput-b30a0025b/" target="_blank" rel="noreferrer">
              <Linkedin size={18} /> LinkedIn
            </a>
            <button className="btn btn-secondary" type="button" onClick={openResume}>
              <ExternalLink size={18} /> View Resume
            </button>
            <button className="btn btn-secondary" type="button" onClick={openIntroVideo}>
              <Play size={18} fill="currentColor" /> Intro Video
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
