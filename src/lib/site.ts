export const site = {
  name: "Techly",
  legalName: "Techly",
  url: "https://techlypc.co.za",
  tagline: "Custom Software & IT Solutions Built Around Your Business",
  headline: "BUILD. AUTOMATE. CONNECT. GROW.",
  description:
    "Custom software development and business IT support for organisations across South Africa, with remote services nationwide and onsite assistance available in Gauteng.",
  heroTitle: "Software Development & IT Support",
  email: "info@techlypc.co.za",
  phoneDisplay: "+27 00 000 0000",
  phoneTel: "+27000000000",
  whatsapp: "27000000000",
  location: "South Africa · Remote nationwide · Onsite on request",
  hours: "Monday – Friday, 08:00 – 17:00 SAST",
  hoursShort: "Mon–Fri, 08:00–17:00",
  social: {
    linkedin: "https://www.linkedin.com/",
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
} as const;

export const heroSlides = [
  {
    eyebrow: "Software & IT",
    title: "Software Development & IT Support",
    text: "Custom software development and business IT support for organisations across South Africa, with remote services nationwide and onsite assistance available in Gauteng.",
    cta: "Learn More",
    href: "#services",
    visual: "illustration",
  },
  {
    eyebrow: "Build",
    title: "Custom Software Built Around Your Business",
    text: "Web applications, ERP and CRM platforms, workflow systems and integrations designed around how your team actually works — not generic software you have to fight.",
    cta: "Explore Software",
    href: "/services/software-development",
    visual: "software",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Developer writing software on multiple screens",
  },
  {
    eyebrow: "Support",
    title: "IT Support That Keeps Your Team Productive",
    text: "Remote helpdesk, Microsoft 365, networks, backups and cybersecurity — so downtime stays low without the cost of a full in-house IT department.",
    cta: "View IT Support",
    href: "/services/it-support",
    visual: "support",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Technician providing business IT support",
  },
  {
    eyebrow: "Automate",
    title: "Automate Workflows and Connect Your Systems",
    text: "WhatsApp and document automation, reporting dashboards, hosting and cloud integrations that remove repetitive work and give you a clearer view of the business.",
    cta: "See Automation",
    href: "/services/business-automation",
    visual: "automation",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Server and cloud infrastructure",
  },
] as const;

export const stats = [
  { value: "200+", label: "Web Services Deployed" },
  { value: "50+", label: "Clients Managed" },
  { value: "600+", label: "Support Tickets Resolved" },
] as const;

export const whyChoose = [
  {
    title: "Comprehensive IT Solutions",
    text: "End-to-end technology services empower businesses to boost efficiency, reduce costs, and ensure long-term resilience through fully integrated solutions.",
  },
  {
    title: "Expertise That Drives Growth",
    text: "Deep knowledge across IT, software and cloud solutions improves efficiency, enhances security, and creates scalable systems that support lasting success.",
  },
  {
    title: "More Than Just a Service Provider",
    text: "Acting as a true partner, proactive support and tailored solutions anticipate challenges, streamline operations, and help businesses achieve sustainable growth.",
  },
  {
    title: "A Client-Centric Partnership",
    text: "Focusing on unique business needs, tailored solutions and proactive guidance ensure smooth operations, enhanced efficiency, and long-term success.",
  },
] as const;

export const homeServices = [
  {
    href: "/services/software-development",
    title: "Custom Software Development for South African Businesses",
    text: "Techly designs secure, scalable custom software for businesses across South Africa. We build web applications, ERP and CRM platforms, workflow and job-card systems, billing automation, APIs and integrations around your processes.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Developer screens showing application code",
    items: [
      "Enterprise Resource Planning (ERP) systems tailored to streamline operations",
      "Customer Relationship Management (CRM) systems to enhance client engagement",
      "Job card and workflow management platforms for improved productivity",
      "Automated invoicing and billing solutions to simplify financial processes",
      "API middleware and system integrations for seamless connectivity",
    ],
  },
  {
    href: "/services/software-development",
    title: "Website Design & Development",
    text: "Our team creates dynamic, user-focused websites that combine technical excellence with creative design. We ensure your digital presence reflects your brand and drives measurable results.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Laptop on a desk during website development",
    items: [
      "Bespoke website design and custom development",
      "Advanced plugin creation to extend functionality",
      "Tailored integrations with third-party platforms and tools",
      "Ongoing maintenance and performance optimization",
      "Strategic SEO management to boost visibility",
    ],
  },
  {
    href: "/services/it-support",
    title: "Outsourced IT Support for Businesses",
    text: "Techly delivers proactive outsourced IT support for businesses across South Africa, including remote helpdesk, network management, cybersecurity and Microsoft 365 administration. Onsite assistance is available in Gauteng.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "IT technician working on business systems",
    items: [
      "Remote and onsite IT support for your users",
      "Fast troubleshooting of hardware and software issues",
      "Comprehensive network security and hardening",
      "Administration of Microsoft 365 and email environments",
      "Server management, backups and business continuity",
    ],
  },
  {
    href: "/services/business-automation",
    title: "Business Hosting, Cloud & Automation",
    text: "We provide secure hosting, cloud infrastructure and workflow automation so your systems stay available, connected and easier to run day to day.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Server and cloud infrastructure",
    items: [
      "Professional website and email hosting",
      "Scalable cloud server hosting for applications",
      "Workflow, WhatsApp and document automation",
      "Reporting dashboards and live visibility",
      "Cloud file servers and system integrations",
    ],
  },
  {
    href: "/services/cctv-installations",
    title: "CCTV Camera Installations",
    text: "Techly installs CCTV camera systems for businesses and homes — IP or analogue cameras, recording, remote viewing and onsite cabling — so your premises stay visible and easier to secure.",
    image:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Security camera installed on a commercial building",
    items: [
      "Supply and installation of CCTV cameras",
      "DVR / NVR recording and remote viewing",
      "Indoor, outdoor and night-vision coverage",
      "Cabling, mounting and configuration",
      "Maintenance, repairs and camera upgrades",
    ],
  },
] as const;

export const principles = [
  {
    title: "Innovation with Purpose",
    text: "We combine current technology with a clear plan, creating practical tools that actually help the business grow.",
  },
  {
    title: "Proactive Problem-Solving",
    text: "We look for issues before they become downtime — keeping you secure, efficient and moving forward.",
  },
  {
    title: "Commitment to Excellence",
    text: "Best practice from first conversation to handover: consistent quality, lasting value and systems you can rely on.",
  },
  {
    title: "Client-Centered Solutions",
    text: "We take time to understand your needs, then deliver tailored work that supports your goals and long-term success.",
  },
] as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/approach", label: "Approach" },
  { href: "/profile", label: "Our Profile" },
  { href: "/contact", label: "Contact" },
] as const;

export const serviceCategories = [
  {
    slug: "software-development",
    href: "/services/software-development",
    title: "Software Development",
    eyebrow: "Build",
    summary:
      "Custom systems designed around how your business actually works — not off-the-shelf software that forces you to adapt.",
    description:
      "From web applications and mobile apps to CRMs, ERPs and integrations, we build secure, scalable software that becomes a real operational advantage.",
    items: [
      "Custom web applications",
      "Business management systems",
      "Mobile applications",
      "CRM & ERP systems",
      "Recruitment / HR platforms",
      "Booking and scheduling systems",
      "E-commerce platforms",
      "API & third-party integrations",
      "Database development",
    ],
  },
  {
    slug: "it-support",
    href: "/services/it-support",
    title: "IT Support",
    eyebrow: "Connect",
    summary:
      "Reliable technical support that keeps your team productive, your systems secure and your operations running without interruption.",
    description:
      "Whether you need a responsive helpdesk, Microsoft 365 support or a stronger backup and security posture, we handle the technology so you can focus on the business.",
    items: [
      "IT helpdesk",
      "Remote technical support",
      "Computer / network troubleshooting",
      "Server management",
      "Microsoft 365 support",
      "Email setup and management",
      "Cybersecurity support",
      "Backup and disaster recovery",
      "Hardware / software configuration",
    ],
  },
  {
    slug: "business-automation",
    href: "/services/business-automation",
    title: "Business Automation",
    eyebrow: "Automate",
    summary:
      "Remove repetitive work from your day. We connect your tools, automate workflows and put live reporting in front of the people who need it.",
    description:
      "From WhatsApp and document automation to AI-assisted workflows and dashboards, we help you operate with fewer bottlenecks and more visibility.",
    items: [
      "Workflow automation",
      "AI-powered solutions",
      "WhatsApp / business automation",
      "Document automation",
      "Reporting dashboards",
      "Integrations between business systems",
    ],
  },
  {
    slug: "cctv-installations",
    href: "/services/cctv-installations",
    title: "CCTV Camera Installations",
    eyebrow: "Secure",
    summary:
      "Professional CCTV camera installations for offices, warehouses, retail and homes — so you can see what is happening on site, on your phone or at your desk.",
    description:
      "We supply, install and maintain CCTV systems with remote viewing, night vision and the cabling done properly — not a DIY kit left half-finished.",
    items: [
      "CCTV camera installations",
      "IP and analogue camera systems",
      "DVR / NVR setup and recording",
      "Remote viewing on phone and desktop",
      "Indoor, outdoor and night-vision cameras",
      "Office, warehouse, retail and home sites",
      "Cabling, mounting and configuration",
      "Maintenance, repairs and camera upgrades",
    ],
  },
] as const;

export const steps = [
  {
    number: "01",
    title: "Discover",
    text: "We understand your business, challenges and objectives.",
  },
  {
    number: "02",
    title: "Plan",
    text: "We define the solution, technology, scope and implementation plan.",
  },
  {
    number: "03",
    title: "Design & Develop",
    text: "We build a secure, scalable and user-friendly solution.",
  },
  {
    number: "04",
    title: "Test & Deploy",
    text: "We thoroughly test the system before deployment.",
  },
  {
    number: "05",
    title: "Support & Improve",
    text: "We provide ongoing support, maintenance and continuous improvements.",
  },
] as const;

export const industries = [
  "Professional services",
  "Recruitment & HR",
  "Retail & e-commerce",
  "Hospitality & bookings",
  "Healthcare practices",
  "Education & training",
  "Logistics & operations",
  "Growing SMEs",
] as const;

export const budgetRanges = [
  "Not sure yet",
  "Starter project",
  "Growth project",
  "Enterprise / ongoing partnership",
] as const;

export const contactMethods = ["Email", "Phone", "WhatsApp"] as const;

export const serviceOptions = [
  "Software Development",
  "IT Support",
  "Business Automation",
  "CCTV Camera Installations",
  "Not sure — I need advice",
] as const;

export function contactServiceHref(service: string) {
  return `/contact?service=${encodeURIComponent(service)}#consult`;
}

export const ticketClientTypes = [
  "I am a new client",
  "I am an existing client",
] as const;

export const ticketUrgency = [
  "Down / urgent — need help today",
  "Soon — this week",
  "Planning — no rush",
] as const;

export const ticketProblemGroups = [
  {
    category: "Software Development",
    intro: "New systems, websites, apps and software that is not doing what you need.",
    problems: [
      "I need a new custom web application",
      "I need a business management system",
      "I need a mobile app",
      "I need a CRM or ERP system",
      "I need a recruitment / HR platform",
      "I need a booking or scheduling system",
      "I need an e-commerce / online store",
      "My current website is broken, slow or outdated",
      "I need a new website designed and built",
      "I need API or third-party integrations",
      "I need database design or data migration",
      "Existing software has bugs or is hard to use",
      "I want to start a new software project and need advice",
    ],
  },
  {
    category: "IT Support",
    intro: "Day-to-day technology problems that stop your team from working.",
    problems: [
      "Computer will not start or is running very slowly",
      "Internet / Wi-Fi / network is down",
      "Email is not sending or receiving",
      "Microsoft 365 or Outlook issues",
      "Printer, scanner or shared drive problems",
      "Cannot log in / password / access issues",
      "Server is down or running slowly",
      "Need remote technical support",
      "Need onsite support",
      "Hardware or software needs to be set up",
      "Virus, malware or suspicious activity",
      "Need cybersecurity help or hardening",
      "Backups are failing or I have no backup",
      "Need disaster recovery help",
      "Need a helpdesk for my staff",
    ],
  },
  {
    category: "Automation, Hosting & Cloud",
    intro: "Connecting systems, reducing manual work and keeping services online.",
    problems: [
      "Too much manual admin / paperwork",
      "I need workflow automation",
      "I need WhatsApp or business-chat automation",
      "I need document or invoice automation",
      "I need reporting dashboards",
      "My business systems do not talk to each other",
      "Website or email hosting problems",
      "Need cloud file storage or a shared drive",
      "Need a cloud or application server",
      "I want AI to help with a business process",
    ],
  },
  {
    category: "CCTV Camera Installations",
    intro: "Cameras, recording and remote viewing for your premises.",
    problems: [
      "I need CCTV cameras installed",
      "I need cameras with remote viewing on my phone",
      "Existing CCTV is not recording or is down",
      "I need extra cameras or a system upgrade",
      "I need CCTV maintenance or repairs",
    ],
  },
  {
    category: "Not sure yet",
    intro: "New clients can start here — we will help you choose the right path.",
    problems: [
      "I am not sure what I need — please advise me",
      "I want a consultation before we start",
      "I need a quote for software or IT support",
    ],
  },
] as const;

export const allTicketProblems = ticketProblemGroups.flatMap(
  (group) => group.problems,
);
