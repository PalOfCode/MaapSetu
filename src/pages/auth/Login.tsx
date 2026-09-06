import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  Home,
  LockKeyhole,
  Mail,
  Menu,
  Scale,
  ShieldCheck,
} from "lucide-react";

/* =========================================
   ROLE TYPE
========================================= */

type Role =
  | "Merchant"
  | "Inspector"
  | "Admin";

/* =========================================
   LOGIN
========================================= */

function Login() {
  const navigate = useNavigate();

  const [role, setRole] =
    useState<Role>("Merchant");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  /* =========================================
     RESTORE REMEMBERED EMAIL
  ========================================= */

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem(
        "almveRememberEmail"
      );

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  /* =========================================
     LOGIN HANDLER
  ========================================= */

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!password.trim()) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      let data: {
        success?: boolean;
        message?: string;
        token?: string;
        user?: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string;
          role?: string;
          created_at?: string;
        };
      } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        setError(
          data?.message ||
            "Unable to login. Please try again."
        );

        return;
      }

      if (!data.token || !data.user) {
        setError(
          "Login response is incomplete. Please try again."
        );

        return;
      }

      /* ================================
         CHECK SELECTED ROLE
      ================================= */

      const backendRole =
        String(
          data.user.role || ""
        ).toLowerCase();

      const selectedRole =
        role.toLowerCase();

      if (
        backendRole !==
        selectedRole
      ) {
        setError(
          `This account is registered as ${data.user.role || "another role"}. Please select the correct portal.`
        );

        return;
      }

      /* ================================
         REMEMBER EMAIL
      ================================= */

      if (rememberMe) {
        localStorage.setItem(
          "almveRememberEmail",
          normalizedEmail
        );
      } else {
        localStorage.removeItem(
          "almveRememberEmail"
        );
      }

      /* ================================
         SAVE AUTH SESSION
      ================================= */

      localStorage.setItem(
        "almveToken",
        data.token
      );

      localStorage.setItem(
        "almveUser",
        JSON.stringify(
          data.user
        )
      );

      localStorage.setItem(
        "almveRole",
        role
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      /* ================================
         ROLE ROUTING
      ================================= */

      if (backendRole === "merchant") {
        navigate(
          "/merchant/dashboard",
          { replace: true }
        );

        return;
      }

      if (
        backendRole ===
        "inspector"
      ) {
        navigate(
          "/inspector/dashboard",
          { replace: true }
        );

        return;
      }

      if (backendRole === "admin") {
        navigate(
          "/admin/dashboard",
          { replace: true }
        );

        return;
      }

      setError(
        "Unsupported account role."
      );
    } catch (error) {
      console.error(
        "Login request failed:",
        error
      );

      setError(
        "Cannot connect to the ALMVE server. Make sure the backend is running on port 5000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================
     REGISTER BUSINESS
  ========================================= */

  const handleRegister = () => {
    navigate(
      "/business-registration"
    );
  };

  /* =========================================
     FORGOT PASSWORD
  ========================================= */

  const handleForgotPassword = () => {
    setError(
      "Password recovery will be connected next."
    );
  };

  /* =========================================
     RETURN UI
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* =====================================
          TOP GOVERNMENT BAR
      ===================================== */}

      <div className="bg-slate-900 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:px-6">

          <div className="flex items-center gap-4">

            <span>
              Government Digital Services
            </span>

            <span className="hidden h-3 w-px bg-slate-600 sm:block" />

            <span className="hidden sm:block">
              Legal Metrology Services
            </span>

          </div>

          <div className="flex items-center gap-4">

            <button
              type="button"
              className="transition hover:text-green-300"
            >
              Accessibility
            </button>

            <span className="hidden text-slate-600 sm:block">
              |
            </span>

            <button
              type="button"
              className="hidden sm:block hover:text-green-300"
            >
              A-
            </button>

            <button
              type="button"
              className="hidden sm:block hover:text-green-300"
            >
              A
            </button>

            <button
              type="button"
              className="hidden sm:block hover:text-green-300"
            >
              A+
            </button>

          </div>

        </div>

      </div>

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">

          {/* Brand */}

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-green-200 bg-green-50">

              <Scale
                size={34}
                className="text-green-700"
              />

            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Government Digital Portal
              </p>

              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                Department of Legal Metrology
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Automated Legal Metrology Verification Engine
              </p>

            </div>

          </div>

          {/* Right Header */}

          <div className="hidden items-center gap-4 lg:flex">

            <div className="text-right">

              <p className="text-xs text-slate-400">
                Digital Service Portal
              </p>

              <p className="mt-1 font-semibold text-slate-700">
                ALMVE
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50">

              <ShieldCheck
                size={25}
                className="text-green-700"
              />

            </div>

          </div>

        </div>

      </header>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="bg-green-700 text-white shadow-sm">

        <div className="mx-auto max-w-7xl px-4 md:px-6">

          <div className="flex min-h-[58px] items-center justify-between">

            {/* Desktop Navigation */}

            <div className="hidden items-stretch md:flex">

              <NavItem
                icon={
                  <Home size={17} />
                }
                label="Home"
                onClick={() =>
                  navigate("/")
                }
              />

              <NavItem
                label="About Department"
                dropdown
              />

              <NavItem
                label="Services"
                dropdown
              />

              <NavItem
                label="Verification"
                dropdown
              />

              <NavItem
                label="Certificates"
              />

              <NavItem
                label="Notices"
              />

              <NavItem
                label="Contact"
              />

            </div>

            {/* Mobile Menu */}

            <button
              type="button"
              onClick={() =>
                setMobileMenu(
                  !mobileMenu
                )
              }
              className="flex items-center gap-2 py-4 md:hidden"
            >

              <Menu size={20} />

              Menu

            </button>

            {/* Right Buttons */}

            <div className="hidden items-center gap-2 md:flex">

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >

                Home

              </button>

              <div className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700">

                Login

              </div>

            </div>

          </div>

          {/* Mobile menu */}

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
                />

                <MobileNavItem
                  label="Services"
                />

                <MobileNavItem
                  label="Verification"
                />

                <MobileNavItem
                  label="Certificates"
                />

                <MobileNavItem
                  label="Notices"
                />

                <MobileNavItem
                  label="Contact"
                />

              </div>

            </div>
          )}

        </div>

      </nav>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="relative overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-amber-50" />

        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-green-100 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-100 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-190px)] max-w-7xl items-center gap-12 px-4 py-12 md:grid-cols-[1fr_480px] md:px-6 md:py-16">

          {/* =================================
              LEFT INFORMATION
          ================================= */}

          <div className="hidden md:block">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-700 shadow-sm">

              <ShieldCheck size={15} />

              Secure Digital Government Service

            </div>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl">

              Secure Access to

              <span className="block text-green-700">
                Legal Metrology Services
              </span>

            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 lg:text-lg">

              Access instrument registration,
              verification, inspection,
              appointment and certification
              services through the ALMVE
              digital platform.

            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-4">

              <InfoCard
                icon={
                  <FileText
                    size={21}
                  />
                }
                title="Online Services"
                text="Digital application and verification"
              />

              <InfoCard
                icon={
                  <FileCheck2
                    size={21}
                  />
                }
                title="Certificates"
                text="Secure digital certification"
              />

              <InfoCard
                icon={
                  <Building2
                    size={21}
                  />
                }
                title="Department"
                text="Connected verification offices"
              />

              <InfoCard
                icon={
                  <ShieldCheck
                    size={21}
                  />
                }
                title="Secure Access"
                text="Role-based portal access"
              />

            </div>

          </div>

          {/* =================================
              LOGIN CARD
          ================================= */}

          <div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">

              {/* Heading */}

              <div className="mb-7">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">

                  <LockKeyhole
                    size={24}
                  />

                </div>

                <p className="text-sm font-semibold text-green-700">
                  ALMVE Citizen & Officer Portal
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Sign in
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use your registered credentials to access the portal.
                </p>

              </div>

              {/* Role */}

              <div className="mb-6">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select portal
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {(
                    [
                      "Merchant",
                      "Inspector",
                      "Admin",
                    ] as Role[]
                  ).map((item) => (

                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setRole(item)
                      }
                      className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                        role === item
                          ? "border-green-600 bg-green-700 text-white shadow-md"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >

                      {item}

                    </button>

                  ))}

                </div>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                  {error}

                </div>
              )}

              {/* Email */}

              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >

                  Email address

                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleLogin();
                      }
                    }}
                    placeholder="Enter registered email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="mb-4">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >

                    Password

                  </label>

                  <button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    className="text-xs font-semibold text-green-700 transition hover:text-green-800"
                  >

                    Forgot password?

                  </button>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleLogin();
                      }
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-green-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}

                  </button>

                </div>

              </div>

              {/* Remember */}

              <div className="mb-6 flex items-center">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target
                          .checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>

                </label>

              </div>

              {/* Sign In */}

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoading
                  ? "Signing in..."
                  : `Sign in as ${role}`}

                {!isLoading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}

              </button>

              {/* Register */}

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">

                <span className="text-sm text-slate-500">
                  Don't have an account?{" "}
                </span>

                <button
                  type="button"
                  onClick={
                    handleRegister
                  }
                  className="text-sm font-bold text-green-700 transition hover:text-green-800 hover:underline"
                >

                  Register now

                </button>

              </div>

            </div>

            {/* Back to portal */}

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-700"
            >

              <ArrowLeft
                size={16}
              />

              Back to Government Portal

            </button>

          </div>

        </div>

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left md:px-6">

          <p>
            © 2026 ALMVE Digital Portal
          </p>

          <div className="flex items-center justify-center gap-4">

            <span>
              Legal Metrology Services
            </span>

            <span className="text-slate-300">
              |
            </span>

            <span>
              Secure Digital Access
            </span>

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
  onClick?: () => void;
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
        <ChevronDown
          size={15}
        />
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
  onClick?: () => void;
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
   INFO CARD
========================================= */

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">

        {icon}

      </div>

      <p className="font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

export default Login;