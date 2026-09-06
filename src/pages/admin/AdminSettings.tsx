import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  Mail,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  UserCog,
} from "lucide-react";

/* =========================================
   SETTINGS TYPE
========================================= */

interface AdminSettingsState {
  emailNotifications: boolean;
  systemNotifications: boolean;
  appointmentReminders: boolean;
  certificateAlerts: boolean;
  autoAssignment: boolean;
  auditLogging: boolean;
  maintenanceMode: boolean;
  sessionTimeout: string;
  defaultVerificationDuration: string;
}

/* =========================================
   DEFAULT SETTINGS
========================================= */

const defaultSettings: AdminSettingsState = {
  emailNotifications: true,
  systemNotifications: true,
  appointmentReminders: true,
  certificateAlerts: true,
  autoAssignment: false,
  auditLogging: true,
  maintenanceMode: false,
  sessionTimeout: "30",
  defaultVerificationDuration: "60",
};

/* =========================================
   STORAGE KEY
========================================= */

const SETTINGS_KEY =
  "almveAdminSettings";

/* =========================================
   MAIN COMPONENT
========================================= */

function AdminSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState<AdminSettingsState>(
      defaultSettings
    );

  const [saved, setSaved] =
    useState(false);

  /* =========================================
     LOAD SAVED SETTINGS
  ========================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          SETTINGS_KEY
        );

      if (!stored) {
        return;
      }

      const parsed: unknown =
        JSON.parse(stored);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return;
      }

      const data =
        parsed as Partial<AdminSettingsState>;

      setSettings({
        ...defaultSettings,
        ...data,
      });
    } catch (error) {
      console.error(
        "Unable to load admin settings:",
        error
      );
    }
  }, []);

  /* =========================================
     UPDATE SETTING
  ========================================= */

  const updateSetting = <
    K extends keyof AdminSettingsState
  >(
    key: K,
    value: AdminSettingsState[K]
  ) => {
    setSettings(
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    setSaved(false);
  };

  /* =========================================
     SAVE
  ========================================= */

  const saveSettings = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Unable to save admin settings:",
        error
      );

      alert(
        "Unable to save settings. Please try again."
      );
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const resetSettings = () => {
    const confirmed =
      window.confirm(
        "Reset all administrator settings to default?"
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      defaultSettings
    );

    localStorage.removeItem(
      SETTINGS_KEY
    );

    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-5xl">

        {/* =================================
            BACK
        ================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/dashboard"
            )
          }
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >

          <ArrowLeft size={18} />

          Back to Admin Dashboard

        </button>

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

              <Settings size={22} />

            </div>

            <div>

              <p className="text-sm font-semibold text-blue-600">
                Administrator Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Admin Settings
              </h1>

            </div>

          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
            Configure notifications, verification workflow,
            security and system preferences.
          </p>

        </div>

        {/* =================================
            SUCCESS MESSAGE
        ================================= */}

        {saved && (

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

            <CheckCircle2
              size={20}
              className="text-green-600"
            />

            <p className="text-sm font-semibold text-green-700">
              Settings saved successfully.
            </p>

          </div>

        )}

        {/* =================================
            GENERAL SETTINGS
        ================================= */}

        <SettingsSection
          icon={
            <Settings size={20} />
          }
          title="General Settings"
          description="Basic administrator and platform preferences."
        >

          <SettingRow
            icon={
              <Clock size={18} />
            }
            title="Session Timeout"
            description="Automatically end inactive admin sessions."
          >

            <select
              value={
                settings.sessionTimeout
              }
              onChange={(event) =>
                updateSetting(
                  "sessionTimeout",
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="15">
                15 minutes
              </option>

              <option value="30">
                30 minutes
              </option>

              <option value="60">
                1 hour
              </option>

              <option value="120">
                2 hours
              </option>

            </select>

          </SettingRow>

          <SettingRow
            icon={
              <Clock size={18} />
            }
            title="Default Verification Duration"
            description="Default appointment duration for verification."
          >

            <select
              value={
                settings.defaultVerificationDuration
              }
              onChange={(event) =>
                updateSetting(
                  "defaultVerificationDuration",
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="30">
                30 minutes
              </option>

              <option value="60">
                60 minutes
              </option>

              <option value="90">
                90 minutes
              </option>

              <option value="120">
                120 minutes
              </option>

            </select>

          </SettingRow>

        </SettingsSection>

        {/* =================================
            NOTIFICATION SETTINGS
        ================================= */}

        <SettingsSection
          icon={
            <Bell size={20} />
          }
          title="Notification Settings"
          description="Choose which administrative alerts should be enabled."
        >

          <ToggleRow
            icon={
              <Mail size={18} />
            }
            title="Email Notifications"
            description="Receive important administrative alerts by email."
            enabled={
              settings.emailNotifications
            }
            onChange={() =>
              updateSetting(
                "emailNotifications",
                !settings.emailNotifications
              )
            }
          />

          <ToggleRow
            icon={
              <Bell size={18} />
            }
            title="System Notifications"
            description="Show important system events inside the notification center."
            enabled={
              settings.systemNotifications
            }
            onChange={() =>
              updateSetting(
                "systemNotifications",
                !settings.systemNotifications
              )
            }
          />

          <ToggleRow
            icon={
              <Clock size={18} />
            }
            title="Appointment Reminders"
            description="Notify administrators about upcoming verification appointments."
            enabled={
              settings.appointmentReminders
            }
            onChange={() =>
              updateSetting(
                "appointmentReminders",
                !settings.appointmentReminders
              )
            }
          />

          <ToggleRow
            icon={
              <ShieldCheck size={18} />
            }
            title="Certificate Alerts"
            description="Alert administrators about certificate expiry and verification events."
            enabled={
              settings.certificateAlerts
            }
            onChange={() =>
              updateSetting(
                "certificateAlerts",
                !settings.certificateAlerts
              )
            }
          />

        </SettingsSection>

        {/* =================================
            WORKFLOW SETTINGS
        ================================= */}

        <SettingsSection
          icon={
            <UserCog size={20} />
          }
          title="Verification Workflow"
          description="Control how applications are assigned and processed."
        >

          <ToggleRow
            icon={
              <UserCog size={18} />
            }
            title="Automatic Inspector Assignment"
            description="Allow the system to automatically assign available inspectors."
            enabled={
              settings.autoAssignment
            }
            onChange={() =>
              updateSetting(
                "autoAssignment",
                !settings.autoAssignment
              )
            }
          />

          <ToggleRow
            icon={
              <Database size={18} />
            }
            title="Audit Logging"
            description="Maintain an activity trail for important administrative actions."
            enabled={
              settings.auditLogging
            }
            onChange={() =>
              updateSetting(
                "auditLogging",
                !settings.auditLogging
              )
            }
          />

        </SettingsSection>

        {/* =================================
            SECURITY
        ================================= */}

        <SettingsSection
          icon={
            <Lock size={20} />
          }
          title="Security"
          description="System protection and administrative access controls."
        >

          <ToggleRow
            icon={
              <Lock size={18} />
            }
            title="Maintenance Mode"
            description="Temporarily restrict normal platform operations while maintenance is performed."
            enabled={
              settings.maintenanceMode
            }
            onChange={() =>
              updateSetting(
                "maintenanceMode",
                !settings.maintenanceMode
              )
            }
            warning
          />

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

            <div className="flex items-start gap-3">

              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>

                <p className="text-sm font-bold text-blue-900">
                  Administrator Access
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Keep administrator credentials secure and
                  use role-based access controls for sensitive
                  operations.
                </p>

              </div>

            </div>

          </div>

        </SettingsSection>

        {/* =================================
            ACTIONS
        ================================= */}

        <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >

            <RotateCcw size={18} />

            Reset

          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
          >

            <Save size={18} />

            Save Settings

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   SETTINGS SECTION
========================================= */

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">

      <div className="border-b border-slate-200 p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

            {icon}

          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div className="divide-y divide-slate-100 px-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================
   SETTING ROW
========================================= */

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-3">

        <div className="mt-0.5 text-slate-400">
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <div className="shrink-0">
        {children}
      </div>

    </div>
  );
}

/* =========================================
   TOGGLE ROW
========================================= */

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  warning = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  warning?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-3">

        <div className="mt-0.5 text-slate-400">
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          warning && enabled
            ? "bg-red-500"
            : enabled
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >

        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />

      </button>

    </div>
  );
}

export default AdminSettings;