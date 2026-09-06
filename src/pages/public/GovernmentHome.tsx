import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gavel,
  Home,
  Info,
  MapPin,
  Menu,
  Scale,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

/* =========================================
   COMPONENT
========================================= */

function GovernmentHome() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  /* =========================================
     NAVIGATION HELPERS
  ========================================= */

  const goToLogin = () => {
    setMobileMenu(false);
    navigate("/login");
  };

  const goToBusinessRegistration = () => {
    setMobileMenu(false);
    navigate("/business-registration");
  };

  const scrollToSection = (
    id: string
  ) => {
    setMobileMenu(false);

    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const goToCertificateVerification =
    () => {
      setMobileMenu(false);

      navigate(
        "/verify/CERT-2701435032"
      );
    };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================
          TOP GOVERNMENT BAR
      ===================================== */}

      <div className="bg-slate-900 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:px-6">

          <div className="flex items-center gap-4">

            <span>
              Government of India
            </span>

            <span className="hidden h-3 w-px bg-slate-500 sm:block" />

            <span className="hidden sm:block">
              Ministry of Consumer Affairs
            </span>

          </div>

          <div className="flex items-center gap-3 sm:gap-4">

            <button
              type="button"
              onClick={() =>
                scrollToSection("main-content")
              }
              className="transition hover:text-green-300"
            >
              Skip to Main Content
            </button>

            <span className="hidden sm:block">
              |
            </span>

            <button
              type="button"
              className="transition hover:text-green-300"
              aria-label="Decrease text size"
            >
              A-
            </button>

            <button
              type="button"
              className="transition hover:text-green-300"
              aria-label="Normal text size"
            >
              A
            </button>

            <button
              type="button"
              className="transition hover:text-green-300"
              aria-label="Increase text size"
            >
              A+
            </button>

          </div>

        </div>

      </div>

      {/* =====================================
          OFFICIAL HEADER
      ===================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 md:px-6">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-4 text-left"
          >

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-50">

              <Scale
                size={34}
                className="text-green-700"
              />

            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Government of India
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                Department of Legal Metrology
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Automated Legal Metrology Verification Engine
              </p>

            </div>

          </button>

          <div className="hidden items-center gap-6 lg:flex">

            <div className="text-right">

              <p className="text-xs text-slate-400">
                Official Digital Portal
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                Legal Metrology Services
              </p>

            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-200 bg-green-50">

              <ShieldCheck
                size={29}
                className="text-green-700"
              />

            </div>

          </div>

        </div>

      </header>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="border-b border-green-800 bg-green-700 text-white">

        <div className="mx-auto max-w-7xl px-4 md:px-6">

          <div className="flex items-center justify-between">

            {/* Desktop Navigation */}

            <div className="hidden items-center md:flex">

              <NavItem
                icon={
                  <Home size={17} />
                }
                label="Home"
                active
                onClick={() =>
                  navigate("/")
                }
              />

              <NavItem
                label="About Department"
                dropdown
                onClick={() =>
                  scrollToSection(
                    "about-department"
                  )
                }
              />

              <NavItem
                label="Services"
                dropdown
                onClick={() =>
                  scrollToSection(
                    "services"
                  )
                }
              />

              <NavItem
                label="Verification"
                dropdown
                onClick={
                  goToCertificateVerification
                }
              />

              <NavItem
                label="Certificates"
                onClick={() =>
                  navigate(
                    "/merchant/certificates"
                  )
                }
              />

              <NavItem
                label="Notices"
                onClick={() =>
                  scrollToSection(
                    "notice"
                  )
                }
              />

              <NavItem
                label="Contact"
                onClick={() =>
                  scrollToSection(
                    "contact"
                  )
                }
              />

            </div>

            {/* Mobile Menu Button */}

            <button
              type="button"
              onClick={() =>
                setMobileMenu(
                  (value) => !value
                )
              }
              className="flex items-center gap-2 py-4 md:hidden"
              aria-label="Toggle menu"
            >

              {mobileMenu ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}

              Menu

            </button>

            {/* Desktop Actions */}

            <div className="hidden items-center gap-2 md:flex">

              <button
                type="button"
                onClick={goToLogin}
                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Login
              </button>

              <button
                type="button"
                onClick={
                  goToBusinessRegistration
                }
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
              >
                Register
              </button>

            </div>

          </div>

          {/* Mobile Navigation */}

          {mobileMenu && (

            <div className="border-t border-green-600 py-3 md:hidden">

              <div className="grid gap-1">

                <MobileNavItem
                  label="Home"
                  onClick={() =>
                    navigate("/")
                  }
                />

                <MobileNavItem
                  label="About Department"
                  onClick={() =>
                    scrollToSection(
                      "about-department"
                    )
                  }
                />

                <MobileNavItem
                  label="Services"
                  onClick={() =>
                    scrollToSection(
                      "services"
                    )
                  }
                />

                <MobileNavItem
                  label="Verification"
                  onClick={
                    goToCertificateVerification
                  }
                />

                <MobileNavItem
                  label="Certificates"
                  onClick={() =>
                    navigate(
                      "/merchant/certificates"
                    )
                  }
                />

                <MobileNavItem
                  label="Notices"
                  onClick={() =>
                    scrollToSection(
                      "notice"
                    )
                  }
                />

                <MobileNavItem
                  label="Contact"
                  onClick={() =>
                    scrollToSection(
                      "contact"
                    )
                  }
                />

                <button
                  type="button"
                  onClick={goToLogin}
                  className="mt-2 rounded-lg bg-white px-4 py-3 text-left text-sm font-semibold text-green-700"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={
                    goToBusinessRegistration
                  }
                  className="rounded-lg bg-green-900 px-4 py-3 text-left text-sm font-semibold text-white"
                >
                  Business Registration
                </button>

              </div>

            </div>

          )}

        </div>

      </nav>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main id="main-content">

        {/* =====================================
            HERO
        ===================================== */}

        <section className="relative overflow-hidden bg-gradient-to-r from-green-50 via-white to-amber-50">

          <div className="absolute inset-0 opacity-30">

            <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-green-200 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-200 blur-3xl" />

          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">

            {/* Hero Left */}

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-700 shadow-sm">

                <ShieldCheck size={15} />

                Official Legal Metrology Portal

              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">

                Ensuring Accuracy,

                <span className="block text-green-700">
                  Fair Trade & Trust
                </span>

              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">

                A unified digital platform for registration,
                verification, inspection and certification of
                weighing and measuring instruments.

              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={
                    goToBusinessRegistration
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800"
                >

                  Register Instrument

                  <ArrowRight
                    size={18}
                  />

                </button>

                <button
                  type="button"
                  onClick={
                    goToCertificateVerification
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50"
                >

                  Verify Certificate

                  <FileCheck2
                    size={18}
                  />

                </button>

              </div>

            </div>

            {/* Hero Panel */}

            <div className="relative">

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">

                <div className="mb-5 flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Digital Governance
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                      ALMVE Portal
                    </h3>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">

                    <Scale size={25} />

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <QuickStat
                    label="Registered"
                    value="25,480"
                  />

                  <QuickStat
                    label="Verified"
                    value="18,910"
                  />

                  <QuickStat
                    label="Inspectors"
                    value="125"
                  />

                  <QuickStat
                    label="Certificates"
                    value="18,910"
                  />

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <div className="flex items-start gap-3">

                    <Info
                      size={19}
                      className="mt-0.5 shrink-0 text-green-700"
                    />

                    <p className="text-sm leading-6 text-slate-600">

                      All verification activities are digitally
                      recorded to improve transparency and
                      citizen access to services.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            NOTICE
        ===================================== */}

        <section
          id="notice"
          className="border-y border-amber-200 bg-amber-50"
        >

          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-6">

            <div className="flex items-center gap-2 font-bold text-amber-800">

              <Bell size={18} />

              Important Notice

            </div>

            <div className="hidden h-5 w-px bg-amber-300 md:block" />

            <p className="text-sm text-amber-900">

              Online verification and certification services are
              available through the ALMVE portal.

            </p>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "services"
                )
              }
              className="ml-auto flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-900"
            >

              View Services

              <ArrowRight
                size={15}
              />

            </button>

          </div>

        </section>

        {/* =====================================
            SERVICES
        ===================================== */}

        <section
          id="services"
          className="mx-auto max-w-7xl px-4 py-14 md:px-6"
        >

          <SectionHeading
            eyebrow="Citizen Services"
            title="Online Services"
            description="Access important Legal Metrology services through a single digital platform."
          />

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            <ServiceCard
              icon={
                <FileText size={26} />
              }
              title="Instrument Registration"
              description="Register weighing and measuring instruments online."
              action={
                goToBusinessRegistration
              }
            />

            <ServiceCard
              icon={
                <ClipboardCheck
                  size={26}
                />
              }
              title="Verification"
              description="Submit and track instrument verification applications."
              action={() =>
                navigate(
                  "/merchant/applications"
                )
              }
            />

            <ServiceCard
              icon={
                <FileCheck2
                  size={26}
                />
              }
              title="Certificate Verification"
              description="Verify the authenticity and validity of certificates."
              action={
                goToCertificateVerification
              }
            />

            <ServiceCard
              icon={
                <CalendarDays
                  size={26}
                />
              }
              title="Appointments"
              description="View and manage scheduled verification appointments."
              action={() =>
                navigate(
                  "/merchant/appointments"
                )
              }
            />

          </div>

        </section>

        {/* =====================================
            ABOUT
        ===================================== */}

        <section
          id="about-department"
          className="bg-slate-50"
        >

          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">

            <SectionHeading
              eyebrow="About the Department"
              title="Department Highlights"
              description="Supporting fair trade, consumer protection and reliable measurements."
            />

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

              <HighlightCard
                icon={
                  <ShieldCheck
                    size={28}
                  />
                }
                title="Our Vision"
                description="To promote accurate, reliable and standardised weighing and measuring practices through transparent digital services."
              />

              <HighlightCard
                icon={
                  <Scale size={28} />
                }
                title="Legal Metrology"
                description="Ensuring measuring instruments used in commercial transactions meet prescribed standards and verification requirements."
              />

              <HighlightCard
                icon={
                  <Gavel size={28} />
                }
                title="Inspection & Enforcement"
                description="Supporting inspections, detection of violations and appropriate corrective actions for fair marketplace practices."
              />

            </div>

          </div>

        </section>

        {/* =====================================
            QUICK LINKS
        ===================================== */}

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">

          <SectionHeading
            eyebrow="Public Information"
            title="Quick Links"
            description="Important resources for merchants, inspectors and citizens."
          />

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            <QuickLink
              icon={
                <Building2
                  size={22}
                />
              }
              title="Department"
              description="About Legal Metrology"
              action={() =>
                scrollToSection(
                  "about-department"
                )
              }
            />

            <QuickLink
              icon={
                <FileText
                  size={22}
                />
              }
              title="Acts & Rules"
              description="Legal documents and regulations"
              action={() =>
                alert(
                  "Acts & Rules module will be connected next."
                )
              }
            />

            <QuickLink
              icon={
                <Bell size={22} />
              }
              title="Public Notices"
              description="Latest department updates"
              action={() =>
                scrollToSection(
                  "notice"
                )
              }
            />

            <QuickLink
              icon={
                <Users size={22} />
              }
              title="Contact Offices"
              description="Regional office information"
              action={() =>
                scrollToSection(
                  "contact"
                )
              }
            />

          </div>

        </section>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <section className="bg-green-800 text-white">

          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

              <GovernmentStat
                label="Registered Instruments"
                value="25,480"
              />

              <GovernmentStat
                label="Certificates Issued"
                value="18,910"
              />

              <GovernmentStat
                label="Active Inspectors"
                value="125"
              />

              <GovernmentStat
                label="Verification Centres"
                value="32"
              />

            </div>

          </div>

        </section>

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer
        id="contact"
        className="bg-slate-950 text-slate-300"
      >

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">

                <Scale size={22} />

              </div>

              <div>

                <p className="font-bold text-white">
                  ALMVE
                </p>

                <p className="text-xs text-slate-400">
                  Legal Metrology Portal
                </p>

              </div>

            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">

              Automated Legal Metrology Verification Engine
              for transparent and efficient digital verification
              services.

            </p>

          </div>

          {/* Useful Links */}

          <FooterColumn
            title="Useful Links"
            items={[
              {
                label:
                  "About Department",
                action: () =>
                  scrollToSection(
                    "about-department"
                  ),
              },
              {
                label:
                  "Services",
                action: () =>
                  scrollToSection(
                    "services"
                  ),
              },
              {
                label:
                  "Public Notices",
                action: () =>
                  scrollToSection(
                    "notice"
                  ),
              },
              {
                label:
                  "Acts & Rules",
                action: () =>
                  alert(
                    "Acts & Rules module will be connected next."
                  ),
              },
            ]}
          />

          {/* Citizen Services */}

          <FooterColumn
            title="Citizen Services"
            items={[
              {
                label:
                  "Register Instrument",
                action:
                  goToBusinessRegistration,
              },
              {
                label:
                  "Track Application",
                action: () =>
                  navigate(
                    "/merchant/applications"
                  ),
              },
              {
                label:
                  "Verify Certificate",
                action:
                  goToCertificateVerification,
              },
              {
                label:
                  "Appointments",
                action: () =>
                  navigate(
                    "/merchant/appointments"
                  ),
              },
            ]}
          />

          {/* Contact */}

          <div>

            <p className="font-semibold text-white">
              Contact
            </p>

            <div className="mt-4 space-y-4 text-sm">

              <div className="flex gap-3">

                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  Department of Legal Metrology
                </span>

              </div>

              <div className="flex gap-3">

                <Users
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  Government Administration
                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-800">

          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-6">

            <p>
              © 2026 ALMVE. All rights reserved.
            </p>

            <p>
              Official Digital Legal Metrology Platform
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

/* =========================================
   NAV ITEM
========================================= */

function NavItem({
  label,
  icon,
  active = false,
  dropdown = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  dropdown?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold transition ${
        active
          ? "bg-green-800"
          : "hover:bg-green-800"
      }`}
    >

      {icon}

      {label}

      {dropdown && (
        <ChevronDown size={15} />
      )}

    </button>
  );
}

/* =========================================
   MOBILE NAV ITEM
========================================= */

function MobileNavItem({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-green-800"
    >
      {label}
    </button>
  );
}

/* =========================================
   SECTION HEADING
========================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">

      <p className="text-sm font-bold uppercase tracking-wider text-green-700">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {title}
      </h2>

      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-amber-500" />

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
        {description}
      </p>

    </div>
  );
}

/* =========================================
   QUICK STAT
========================================= */

function QuickStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   SERVICE CARD
========================================= */

function ServiceCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
    >

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">

        {icon}

      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-700">

        Access Service

        <ArrowRight size={16} />

      </div>

    </button>
  );
}

/* =========================================
   HIGHLIGHT CARD
========================================= */

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">

        {icon}

      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================
   QUICK LINK
========================================= */

function QuickLink({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-green-300 hover:bg-green-50"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

        {icon}

      </div>

      <div>

        <p className="font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </button>
  );
}

/* =========================================
   GOVERNMENT STAT
========================================= */

function GovernmentStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">

      <p className="text-3xl font-bold md:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-sm text-green-100">
        {label}
      </p>

    </div>
  );
}

/* =========================================
   FOOTER COLUMN
========================================= */

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    action: () => void;
  }[];
}) {
  return (
    <div>

      <p className="font-semibold text-white">
        {title}
      </p>

      <div className="mt-4 space-y-3">

        {items.map(
          (item) => (
            <button
              key={item.label}
              type="button"
              onClick={
                item.action
              }
              className="block text-left text-sm text-slate-400 transition hover:text-white"
            >

              {item.label}

            </button>
          )
        )}

      </div>

    </div>
  );
}

export default GovernmentHome;