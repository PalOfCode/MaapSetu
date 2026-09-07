import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  FileCheck2,
  FileText,
  Home as HomeIcon,
  Info,
  MapPin,
  Menu,
  Scale,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function GovernmentHome() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =========================================
     NAVIGATION
  ========================================= */

  const closeMenu = () => {
    setMobileMenu(false);
  };

  const goToLogin = () => {
    closeMenu();
    navigate("/login");
  };

  const goToBusinessRegistration = () => {
    closeMenu();
    navigate("/business-registration");
  };

  const goToCertificateVerification = () => {
    closeMenu();
    navigate("/verify");
  };

  const scrollToSection = (id: string) => {
    closeMenu();

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <div className="hidden bg-slate-950 text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:px-6">

          <div className="flex items-center gap-3">
            <span>Government of India</span>

            <span className="h-3 w-px bg-slate-600" />

            <span className="text-slate-300">
              Ministry of Consumer Affairs
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection("main-content")}
              className="transition hover:text-white"
            >
              Skip to Main Content
            </button>

            <span>|</span>

            <span>A-</span>
            <span>A</span>
            <span>A+</span>
          </div>

        </div>
      </div>

      {/* =====================================
          MOBILE HEADER / DESKTOP HEADER
      ===================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:h-[76px] md:px-6">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => {
              closeMenu();
              navigate("/");
            }}
            className="flex items-center gap-3 text-left"
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 md:h-12 md:w-12">
              <Scale size={25} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                Government of India
              </p>

              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                MaapSetu
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Digital Legal Metrology Portal
              </p>
            </div>

          </button>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-3 md:flex">

            <button
              type="button"
              onClick={goToCertificateVerification}
              className="flex items-center gap-2 rounded-lg border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              <ShieldCheck size={17} />
              Verify Certificate
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Login
            </button>

          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setMobileMenu((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenu ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>

        </div>

        {/* =====================================
            DESKTOP NAVIGATION
        ===================================== */}

        <nav className="hidden border-t border-green-800 bg-green-700 md:block">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">

            <div className="flex items-center">

              <NavItem
                icon={<HomeIcon size={16} />}
                label="Home"
                active
                onClick={() => navigate("/")}
              />

              <NavItem
                label="About"
                onClick={() => scrollToSection("about-department")}
              />

              <NavItem
                label="Services"
                onClick={() => scrollToSection("services")}
              />

              <NavItem
                label="Verification"
                onClick={goToCertificateVerification}
              />

              <NavItem
                label="Notices"
                onClick={() => scrollToSection("notice")}
              />

              <NavItem
                label="Contact"
                onClick={() => scrollToSection("contact")}
              />

            </div>

            <button
              type="button"
              onClick={goToBusinessRegistration}
              className="my-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50"
            >
              Register Business
            </button>

          </div>

        </nav>

        {/* =====================================
            MOBILE MENU
        ===================================== */}

        {mobileMenu && (

          <div className="border-t border-slate-200 bg-white shadow-xl md:hidden">

            <div className="mx-auto max-w-7xl px-4 py-4">

              <div className="mb-4 rounded-2xl bg-green-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                    <Scale size={23} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      MaapSetu
                    </p>

                    <p className="text-xs text-slate-500">
                      Fair Measurement. Stronger India.
                    </p>
                  </div>

                </div>

              </div>

              <div className="grid gap-1">

                <MobileNavItem
                  icon={<HomeIcon size={18} />}
                  label="Home"
                  active
                  onClick={() => navigate("/")}
                />

                <MobileNavItem
                  icon={<Info size={18} />}
                  label="About Department"
                  onClick={() => scrollToSection("about-department")}
                />

                <MobileNavItem
                  icon={<FileText size={18} />}
                  label="Services"
                  onClick={() => scrollToSection("services")}
                />

                <MobileNavItem
                  icon={<Search size={18} />}
                  label="Verify Certificate"
                  active
                  onClick={goToCertificateVerification}
                />

                <MobileNavItem
                  icon={<Bell size={18} />}
                  label="Notices"
                  onClick={() => scrollToSection("notice")}
                />

                <MobileNavItem
                  icon={<MapPin size={18} />}
                  label="Contact"
                  onClick={() => scrollToSection("contact")}
                />

              </div>

              <div className="mt-4 grid gap-2">

                <button
                  type="button"
                  onClick={goToLogin}
                  className="rounded-xl border border-green-700 px-4 py-3.5 text-left text-sm font-bold text-green-700"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={goToBusinessRegistration}
                  className="rounded-xl bg-green-700 px-4 py-3.5 text-left text-sm font-bold text-white"
                >
                  Business Registration
                </button>

              </div>

            </div>

          </div>

        )}

      </header>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main id="main-content">

        {/* =====================================
            HERO
        ===================================== */}

        <section
          className="relative min-h-[560px] overflow-hidden bg-slate-950 bg-cover bg-center sm:min-h-[620px] md:min-h-[680px]"
          style={{
            backgroundImage: "url('/images/hero-machine.png')",
            backgroundPosition: "center center",
          }}
        >

          {/* Dark overlay for readable text */}
          <div className="absolute inset-0 bg-slate-950/60" />

          {/* Extra left-side gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/20" />

          <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-14 sm:min-h-[620px] sm:py-16 md:min-h-[680px] md:px-6 md:py-20">

            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:px-4 sm:text-xs">
                <ShieldCheck size={15} />
                Official Legal Metrology Portal
              </div>

              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                Fair Measurement

                <span className="block text-green-300">
                  Stronger India
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg md:text-xl md:leading-8">
                Digital Verification for Weighing and Measuring Instruments
                through a secure and transparent Legal Metrology platform.
              </p>

              <div className="mt-7 grid max-w-md gap-3 sm:flex sm:max-w-none">

                <button
                  type="button"
                  onClick={goToCertificateVerification}
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-green-950/30 transition hover:bg-green-500 active:scale-[0.98] sm:px-7 sm:text-base"
                >
                  Verify Certificate
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={goToBusinessRegistration}
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98] sm:px-7 sm:text-base"
                >
                  Register Instrument
                  <FileText size={18} />
                </button>

              </div>

              {/* Quick access */}
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3 sm:gap-5">

                <HeroFeature
                  icon={<ShieldCheck size={20} />}
                  title="For Citizens"
                  description="Verify certificates instantly"
                />

                <HeroFeature
                  icon={<Building2 size={20} />}
                  title="For Businesses"
                  description="Register and manage instruments"
                />

                <HeroFeature
                  icon={<Users size={20} />}
                  title="For Inspectors"
                  description="Field verification tools"
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            CITIZEN QUICK ACCESS
        ===================================== */}

        <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-4 pb-8 md:px-6">

          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:grid-cols-3">

            <QuickAccessCard
              icon={<ShieldCheck size={24} />}
              title="For Citizens"
              description="Verify certificates instantly"
              onClick={goToCertificateVerification}
            />

            <QuickAccessCard
              icon={<Building2 size={24} />}
              title="For Businesses"
              description="Register and manage instruments"
              onClick={goToBusinessRegistration}
            />

            <QuickAccessCard
              icon={<Users size={24} />}
              title="For Inspectors"
              description="Access field verification tools"
              onClick={goToLogin}
            />

          </div>

        </section>

        {/* =====================================
            NOTICE
        ===================================== */}

        <section
          id="notice"
          className="border-y border-amber-200 bg-amber-50"
        >

          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center md:px-6">

            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Bell size={18} />
              Important Notice
            </div>

            <p className="text-sm leading-6 text-amber-900">
              Online verification and certification services are
              available through the ALMVE portal.
            </p>

            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="flex items-center gap-1 text-sm font-bold text-green-700 sm:ml-auto"
            >
              View Services
              <ArrowRight size={15} />
            </button>

          </div>

        </section>

        {/* =====================================
            SERVICES
        ===================================== */}

        <section
          id="services"
          className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20"
        >

          <SectionHeading
            eyebrow="Citizen Services"
            title="Online Services"
            description="Access important Legal Metrology services through a single digital platform."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ServiceCard
              icon={<FileText size={25} />}
              title="Instrument Registration"
              description="Register weighing and measuring instruments online."
              action={goToBusinessRegistration}
            />

            <ServiceCard
              icon={<FileCheck2 size={25} />}
              title="Certificate Verification"
              description="Verify the authenticity and validity of certificates."
              action={goToCertificateVerification}
            />

            <ServiceCard
              icon={<CalendarDays size={25} />}
              title="Appointments"
              description="View and manage scheduled verification appointments."
              action={() => navigate("/merchant/appointments")}
            />

            <ServiceCard
              icon={<Search size={25} />}
              title="Application Tracking"
              description="Submit and track instrument verification applications."
              action={() => navigate("/merchant/applications")}
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

          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">

            <SectionHeading
              eyebrow="About the Department"
              title="Fair Measurement. Stronger India."
              description="Supporting fair trade, consumer protection and reliable measurements."
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-3">

              <HighlightCard
                icon={<ShieldCheck size={27} />}
                title="Our Vision"
                description="To promote accurate, reliable and standardised weighing and measuring practices through transparent digital services."
              />

              <HighlightCard
                icon={<Scale size={27} />}
                title="Legal Metrology"
                description="Ensuring measuring instruments used in commercial transactions meet prescribed standards and verification requirements."
              />

              <HighlightCard
                icon={<FileCheck2 size={27} />}
                title="Inspection & Verification"
                description="Supporting inspections, verification and certification for fair marketplace practices."
              />

            </div>

          </div>

        </section>

        {/* =====================================
            QUICK LINKS
        ===================================== */}

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">

          <SectionHeading
            eyebrow="Public Information"
            title="Quick Links"
            description="Important resources for merchants, inspectors and citizens."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <QuickLink
              icon={<Building2 size={22} />}
              title="Department"
              description="About Legal Metrology"
              action={() => scrollToSection("about-department")}
            />

            <QuickLink
              icon={<FileText size={22} />}
              title="Acts & Rules"
              description="Legal documents and regulations"
              action={() =>
                alert("Acts & Rules module will be connected next.")
              }
            />

            <QuickLink
              icon={<Bell size={22} />}
              title="Public Notices"
              description="Latest department updates"
              action={() => scrollToSection("notice")}
            />

            <QuickLink
              icon={<Users size={22} />}
              title="Contact Offices"
              description="Regional office information"
              action={() => scrollToSection("contact")}
            />

          </div>

        </section>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <section className="bg-green-800 text-white">

          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

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

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">
                <Scale size={22} />
              </div>

              <div>
                <p className="font-bold text-white">
                  MaapSetu
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

          {/* USEFUL LINKS */}

          <FooterColumn
            title="Useful Links"
            items={[
              {
                label: "About Department",
                action: () => scrollToSection("about-department"),
              },
              {
                label: "Services",
                action: () => scrollToSection("services"),
              },
              {
                label: "Public Notices",
                action: () => scrollToSection("notice"),
              },
              {
                label: "Acts & Rules",
                action: () =>
                  alert("Acts & Rules module will be connected next."),
              },
            ]}
          />

          {/* CITIZEN SERVICES */}

          <FooterColumn
            title="Citizen Services"
            items={[
              {
                label: "Register Instrument",
                action: goToBusinessRegistration,
              },
              {
                label: "Track Application",
                action: () => navigate("/merchant/applications"),
              },
              {
                label: "Verify Certificate",
                action: goToCertificateVerification,
              },
              {
                label: "Appointments",
                action: () => navigate("/merchant/appointments"),
              },
            ]}
          />

          {/* CONTACT */}

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
              © 2026 MaapSetu. All rights reserved.
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
   DESKTOP NAV ITEM
========================================= */

function NavItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition ${
        active
          ? "bg-green-800"
          : "hover:bg-green-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================
   MOBILE NAV ITEM
========================================= */

function MobileNavItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition ${
        active
          ? "bg-green-50 text-green-700"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================
   HERO FEATURE
========================================= */

function HeroFeature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/20 p-3 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-300/50 bg-green-500/10 text-green-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-white sm:text-sm">{title}</p>
        <p className="mt-0.5 text-[10px] leading-4 text-slate-200 sm:text-xs">{description}</p>
      </div>
    </div>
  );
}

/* =========================================
   QUICK ACCESS CARD
========================================= */

function QuickAccessCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 border-b border-slate-100 p-4 text-left transition hover:bg-green-50 md:border-b-0 md:border-r md:last:border-r-0"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-green-700"
      />

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

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700 sm:text-sm">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>

      <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-amber-500" />

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>

    </div>
  );
}

/* =========================================
   QUICK STAT
========================================= */



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
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg active:scale-[0.99] sm:p-6"
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

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-green-700">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

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
      className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-green-300 hover:bg-green-50"
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

      <p className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-green-100 sm:text-sm">
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

        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className="block text-left text-sm text-slate-400 transition hover:text-white"
          >
            {item.label}
          </button>
        ))}

      </div>

    </div>
  );
}

export default GovernmentHome;