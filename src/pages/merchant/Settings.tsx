import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  LockKeyhole,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function MerchantSettings() {
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("almveNotificationsEnabled") !== "false"
  );
  const [twoFactor, setTwoFactor] = useState(
    localStorage.getItem("almveTwoFactorEnabled") === "true"
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const savePreferences = () => {
    localStorage.setItem(
      "almveNotificationsEnabled",
      String(notificationsEnabled)
    );
    localStorage.setItem("almveTwoFactorEnabled", String(twoFactor));
    setMessage("Settings saved successfully.");
    setError("");
  };

  const changePassword = async () => {
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    const token = localStorage.getItem("almveToken");

    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "https://maapsetu-w1sf.onrender.com/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Password change API is not available on the current server."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change password.");
    }
  };

  const logout = () => {
    localStorage.removeItem("almveToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 h-[78px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <button
            type="button"
            onClick={() => navigate("/merchant/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">
              <ShieldCheck size={23} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-green-800">ALMVE</p>
              <p className="text-xs text-slate-500">Merchant Portal</p>
            </div>
          </button>

          <div className="hidden text-center md:block">
            <h1 className="text-xl font-bold lg:text-2xl">Settings</h1>
            <p className="text-xs text-slate-500">Account & Security</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/merchant/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-[78px] lg:pl-[258px]">
        <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-7">
          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <Bell className="text-green-700" />
                <div>
                  <h2 className="text-lg font-bold">Notifications</h2>
                  <p className="text-sm text-slate-500">
                    Control notification preferences.
                  </p>
                </div>
              </div>
            </div>

            <SettingRow
              title="Enable notifications"
              description="Show notification updates in the merchant portal."
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <LockKeyhole className="text-green-700" />
                <div>
                  <h2 className="text-lg font-bold">Change Password</h2>
                  <p className="text-sm text-slate-500">
                    Update your account password securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-600"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-600"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-600"
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => void changePassword()}
                className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
              >
                <Save size={17} />
                Change Password
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-700" />
                <div>
                  <h2 className="text-lg font-bold">Security</h2>
                  <p className="text-sm text-slate-500">
                    Manage additional account security.
                  </p>
                </div>
              </div>
            </div>

            <SettingRow
              title="Two-step verification"
              description="Keep this preference ready for when backend 2FA is enabled."
              checked={twoFactor}
              onChange={setTwoFactor}
            />
          </section>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={savePreferences}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
            >
              <Save size={17} />
              Save Settings
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-6">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-green-700" : "bg-slate-300"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
