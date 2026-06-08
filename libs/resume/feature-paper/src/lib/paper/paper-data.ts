import { Icon } from '@angular-monorepo/shared/util';

import type {
  ContactDetail,
  Links,
  Experience,
  RightPanelSection,
  ResumeHeader,
  Education,
  SectionLabels,
  ResumeBlock,
} from '@angular-monorepo/resume/util';

export const HEADER: ResumeHeader = {
  name: 'Leith Osborne',
  title: 'Front-End Focused Product Engineer',
};

export const SECTION_LABELS: SectionLabels = {
  experience: 'EXPERIENCE',
  links: 'LINKS',
  education: 'EDUCATION',
};

export const EDUCATION: Education[] = [
  {
    school: 'Durham University',
    period: 'OCT 2017 - JUL 2020',
    detail: 'BSc Computer Science, First Class Honours',
  },
  {
    school: 'The Ashcombe School, Surrey',
    period: 'SEP 2010 - AUG 2017',
    detail: 'Further Mathematics A*\nMathematics A*\nComputer Science A',
  },
];

export const CONTACT_DETAILS: ContactDetail[] = [
  { icon: Icon.faLocationDot, text: 'London, UK' },
  { icon: Icon.faPhone, text: '+44 7494 391933' },
  {
    icon: Icon.faEnvelope,
    text: 'osborneleith@gmail.com',
    href: 'mailto:osborneleith@gmail.com',
  },
];

export const LINKS: Links[] = [
  {
    icon: Icon.faLinkedin,
    href: 'https://www.linkedin.com/in/leith-osborne-5946161b3',
  },
  { icon: Icon.faGithub, href: 'https://github.com/losborne24' },
  { icon: Icon.faGlobe, href: 'https://losborne24.github.io' },
];

export const EXPERIENCE: Experience[] = [
  {
    companyName: 'OpenGamma Limited',
    positions: [
      {
        position: 'Software Developer',
        period: 'JAN 2025 - PRESENT',
        techStack: [
          'Angular',
          'TypeScript',
          'RxJS',
          'Java',
          'PostgreSQL',
          'Node',
          'AWS',
        ],
        contributions: [
          {
            category: 'Full UI Ownership',
            contribution:
              'Core member of a lean 1.5–3 developer team, owning the complete UI of the company’s flagship multi-million ARR margin optimisation analytics SaaS platform.',
          },
          {
            category: 'BI Integration',
            contribution:
              'Implemented custom date pickers and calculation logic to drive dynamic API parameterisation in embedded AWS QuickSight dashboards.',
          },
          {
            category: 'Tenant-Specific UI Configuration',
            contribution:
              'Owned and delivered the full-stack implementation (database layer, data modeling, API services, and frontend UI orchestration) to power dynamic tenant-specific profiles, modules, navigation menus, and dashboards within a scalable multi-tenant ecosystem.',
          },
        ],
      },
      {
        position: 'Front-End Developer',
        period: 'APR 2022 - JAN 2025',
        techStack: [
          'Angular',
          'TypeScript',
          'RxJS',
          'AG Grid',
          'Figma',
          'Node',
          'AWS',
        ],
        contributions: [
          {
            category: 'On-Demand Risk Simulation Tools',
            contribution:
              'Designed and delivered a portfolio editor and calculation runner, enabling users to perform stressed margin analysis on modified portfolios.',
          },
          {
            category: 'Tenant-Level Configuration Management',
            contribution:
              'Built a dynamic, tenant-level settings UI using editable AG Grid tables to manage complex business and system configurations, incorporating custom field components, validations, attributes, and integrated review/approval workflows.',
          },
          {
            category: 'Micro-Frontend Architecture',
            contribution:
              'Led extraction of the Call Management platform from a monorepo into an independently deployable micro-frontend, including separation of shared frontend libraries into standalone repositories to enable modular releases and scalable delivery.',
          },
          {
            category: 'Design Systems',
            contribution:
              'Created a Figma component library from reusable stateless UI components, standardising design-to-development consistency and accelerating mockup creation',
          },
        ],
      },
    ],
  },
  {
    companyName: 'Policy Monitor Limited',
    positions: [
      {
        position: 'Software Engineer',
        period: 'OCT 2020 - APR 2022',
        techStack: [
          'Angular',
          'TypeScript',
          'RxJS',
          'Java',
          'MySQL',
          'Node',
          'AWS',
        ],
        contributions: [
          {
            category: 'Frontend Modernisation',
            contribution:
              'Played a key role in developing a B2B cybersecurity policy monitoring SaaS product; migrated legacy Dojo.js codebase to Angular 11 using NGXS, RxJS, Angular Material, and Storybook to improve scalability, maintainability, and UI consistency.',
          },
          {
            category: 'API Integration',
            contribution:
              'Integrated frontend components with a Java-based backend API and external platforms including Xero and GoCardless for accounting and payment processing functionality.',
          },
          {
            category: 'DevOps / CI/CD',
            contribution:
              'Upgraded AWS CloudFormation templates for automated, repeatable cloud provisioning and streamlined Bitbucket Pipelines to optimize CI/CD workflows, reducing release cycle time and enhancing deployment reliability.',
          },
        ],
      },
    ],
  },
];

export const RIGHT_PANEL: RightPanelSection[] = [
  {
    header: 'ACHIEVEMENTS',
    items: [
      '2022 First Year Impact Award, OpenGamma',
      '2019/20 Durham University Badminton Club 2nd Team Captain',
      '2018/19 Durham University Badminton Club Vice President',
      '2015/16 Gold Duke Of Edinburgh Award',
      '2014/15 Silver Duke Of Edinburgh Award',
      '2013/14 Bronze Duke Of Edinburgh Award',
    ],
  },
  {
    header: 'CERTIFICATIONS',
    items: [
      'AWS Certified Developer - Associate',
      'AWS Certified Cloud Practitioner',
      'The Open Group Certified: TOGAF® 9 Certified',
    ],
  },
];

/**
 * Initial left-column blocks: existing experience companies and links mapped to
 * entity-level blocks. Seed ids are deterministic; runtime-added blocks get
 * crypto.randomUUID() ids in ResumeStore.
 */
export const SEED_BLOCKS: ResumeBlock[] = EXPERIENCE.map(
  (data, i): ResumeBlock => ({
    id: `seed-experience-${i}`,
    kind: 'experience',
    data,
  }),
);
