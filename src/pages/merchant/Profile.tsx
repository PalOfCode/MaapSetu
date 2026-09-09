import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

const API_BASE = "https://maapsetu-w1sf.onrender.com";

interface UserData {
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  businessName?: string;
  business_name?: string;
  address?: string;
}

export default function MerchantProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("almveToken");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load profile.");
        }

        const user = data?.user || data?.data || data;
        setProfile(user || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [token]);

  const update = (key: keyof UserData, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  };

  const saveProfile = async () => {
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name || profile.fullName || "",
          phone: profile.phone || profile.mobile || "",
          businessName: profile.businessName || profile.business_name || "",
          address: profile.address || "",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Profile update API is not available on the current server."
        );
      }

      setProfile(data?.user || data?.data || profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const name = profile.name || profile.fullName || "";

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
              <User size={23} />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-green-800">ALMVE</p>
              <p className="text-xs text-slate-500">Merchant Portal</p>
            </div>
          </button>

          <div className="hidden text-center md:block">
            <h1 className="text-xl font-bold lg:text-2xl">Profile</h1>
            <p className="text-xs text-slate-500">Merchant Profile</p>
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
        <div className="mx-auto max-w-4xl p-4 md:p-7">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                View and update your merchant account information.
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center font-semibold text-slate-600">
                Loading profile...
              </div>
            ) : (
              <div className="space-y-5 p-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    {message}
                  </div>
                )}

                <div className="flex items-center gap-4 rounded-2xl bg-green-50 p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-2xl font-bold text-white">
                    {name.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{name || "Merchant"}</h3>
                    <p className="text-sm text-slate-500">
                      {profile.email || "Merchant account"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    icon={<User size={17} />}
                    label="Name"
                    value={name}
                    onChange={(value) => update("name", value)}
                  />
                  <Field
                    icon={<Mail size={17} />}
                    label="Email"
                    value={profile.email || ""}
                    disabled
                    onChange={() => {}}
                  />
                  <Field
                    icon={<Phone size={17} />}
                    label="Phone"
                    value={profile.phone || profile.mobile || ""}
                    onChange={(value) => update("phone", value)}
                  />
                  <Field
                    icon={<Building2 size={17} />}
                    label="Business Name"
                    value={profile.businessName || profile.business_name || ""}
                    onChange={(value) => update("businessName", value)}
                  />
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={17} />
                        Address
                      </span>
                    </label>
                    <textarea
                      value={profile.address || ""}
                      onChange={(e) => update("address", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      placeholder="Enter business address"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => void saveProfile()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  disabled = false,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}
