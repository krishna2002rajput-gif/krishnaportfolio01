import { useEffect, useState } from 'react';
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
  Mail,
  Menu,
  PieChart,
  Play,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const resumeLink = 'https://drive.google.com/file/d/1iXof1InYkwZvZ-jGlnTuhRf4gbLMjUkv/view?usp=sharing';

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

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = videoOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [videoOpen]);

  const closeVideo = () => setVideoOpen(false);

  return (
    <main className="site-shell">
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
            <a className="btn btn-secondary" href={resumeLink} target="_blank" rel="noreferrer">
              Resume <ExternalLink size={18} />
            </a>
            <button className="btn btn-secondary" type="button" onClick={() => setVideoOpen(true)}>
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
            <a className="btn btn-secondary" href={resumeLink} target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> Resume
            </a>
            <button className="btn btn-secondary" type="button" onClick={() => setVideoOpen(true)}>
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
            <video src={asset('videos/intro.mp4')} controls autoPlay playsInline preload="metadata" />
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
