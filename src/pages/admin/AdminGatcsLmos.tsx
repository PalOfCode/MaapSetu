import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  FileCheck2,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type OfficeType = "GATC" | "LMO";

type OfficeStatus =
  | "Active"
  | "Inactive"
  | "Under Review";

interface Office {
  id: string;
  code: string;
  name: string;
  type: OfficeType;
  region: string;
  district: string;
  officer: string;
  designation: string;
  phone: string;
  email: string;
  status: OfficeStatus;
  verificationCount: number;
  inspectionCount: number;
}

/* =========================================
   OFFICE DATA
========================================= */

const initialOffices: Office[] = [
  {
    id: "GATC-001",
    code: "GATC-KOL-01",
    name: "Kolkata GATC",
    type: "GATC",
    region: "West Bengal",
    district: "Kolkata",
    officer: "Rajesh Kumar",
    designation:
      "Senior Legal Metrology Officer",
    phone: "+91 98765 43001",
    email: "kolkata.gatc@almve.gov.in",
    status: "Active",
    verificationCount: 128,
    inspectionCount: 86,
  },

  {
    id: "GATC-002",
    code: "GATC-DGP-01",
    name: "Durgapur GATC",
    type: "GATC",
    region: "West Bengal",
    district: "Durgapur",
    officer: "Priya Singh",
    designation:
      "Legal Metrology Officer",
    phone: "+91 98765 43002",
    email: "durgapur.gatc@almve.gov.in",
    status: "Active",
    verificationCount: 94,
    inspectionCount: 67,
  },

  {
    id: "LMO-001",
    code: "LMO-ASN-01",
    name: "Asansol LMO Office",
    type: "LMO",
    region: "West Bengal",
    district: "Asansol",
    officer: "Amit Das",
    designation:
      "Legal Metrology Inspector",
    phone: "+91 98765 43003",
    email: "asansol.lmo@almve.gov.in",
    status: "Active",
    verificationCount: 76,
    inspectionCount: 58,
  },

  {
    id: "LMO-002",
    code: "LMO-HWH-01",
    name: "Howrah LMO Office",
    type: "LMO",
    region: "West Bengal",
    district: "Howrah",
    officer: "Sourav Roy",
    designation:
      "Assistant Legal Metrology Officer",
    phone: "+91 98765 43004",
    email: "howrah.lmo@almve.gov.in",
    status: "Under Review",
    verificationCount: 61,
    inspectionCount: 42,
  },

  {
    id: "GATC-003",
    code: "GATC-SLG-01",
    name: "Siliguri GATC",
    type: "GATC",
    region: "West Bengal",
    district: "Siliguri",
    officer: "Neha Sharma",
    designation:
      "Legal Metrology Officer",
    phone: "+91 98765 43005",
    email: "siliguri.gatc@almve.gov.in",
    status: "Active",
    verificationCount: 83,
    inspectionCount: 54,
  },

  {
    id: "LMO-003",
    code: "LMO-BDN-01",
    name: "Bardhaman LMO Office",
    type: "LMO",
    region: "West Bengal",
    district: "Bardhaman",
    officer: "Arindam Sen",
    designation:
      "Legal Metrology Inspector",
    phone: "+91 98765 43006",
    email: "bardhaman.lmo@almve.gov.in",
    status: "Inactive",
    verificationCount: 37,
    inspectionCount: 28,
  },
];

/* =========================================
   COMPONENT
========================================= */

function AdminGatcsLmos() {
  const navigate = useNavigate();

  const [offices] =
    useState<Office[]>(
      initialOffices
    );

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<
      "All" | OfficeType
    >("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | OfficeStatus
    >("All");

  const [
    selectedOffice,
    setSelectedOffice,
  ] = useState<Office | null>(
    null
  );

  /* =========================================
     FILTERED DATA
  ========================================= */

  const filteredOffices =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return offices.filter(
        (office) => {
          const matchesSearch =
            office.name
              .toLowerCase()
              .includes(text) ||
            office.code
              .toLowerCase()
              .includes(text) ||
            office.region
              .toLowerCase()
              .includes(text) ||
            office.district
              .toLowerCase()
              .includes(text) ||
            office.officer
              .toLowerCase()
              .includes(text);

          const matchesType =
            typeFilter === "All" ||
            office.type === typeFilter;

          const matchesStatus =
            statusFilter === "All" ||
            office.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        }
      );
    }, [
      offices,
      search,
      typeFilter,
      statusFilter,
    ]);

  /* =========================================
     COUNTS
  ========================================= */

  const totalOffices =
    offices.length;

  const totalGatcs =
    offices.filter(
      (office) =>
        office.type === "GATC"
    ).length;

  const totalLmos =
    offices.filter(
      (office) =>
        office.type === "LMO"
    ).length;

  const activeOffices =
    offices.filter(
      (office) =>
        office.status === "Active"
    ).length;

  const verificationTotal =
    offices.reduce(
      (total, office) =>
        total +
        office.verificationCount,
      0
    );

  /* =========================================
     VIEW OFFICE
  ========================================= */

  const openDetails = (
    office: Office
  ) => {
    setSelectedOffice(office);
  };

  /* =========================================
     CLOSE OFFICE
  ========================================= */

  const closeDetails = () => {
    setSelectedOffice(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            BACK
        ===================================== */}

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

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-blue-600">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            GATCs & LMOs
          </h1>

          <p className="mt-2 text-slate-500">
            Manage regional GATCs and Legal Metrology Offices responsible for verification and inspection activities.
          </p>

        </div>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Offices"
            value={String(
              totalOffices
            )}
            icon={
              <Building2 size={22} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="GATCs"
            value={String(
              totalGatcs
            )}
            icon={
              <ShieldCheck
                size={22}
              />
            }
            iconClass="bg-purple-100 text-purple-600"
          />

          <StatCard
            title="LMO Offices"
            value={String(
              totalLmos
            )}
            icon={
              <Building2
                size={22}
              />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Active Offices"
            value={String(
              activeOffices
            )}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-600"
          />

        </div>

        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-blue-50 p-4">

              <p className="text-sm text-blue-700">
                Total Verification Activities
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-900">
                {verificationTotal}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-sm text-slate-600">
                Regional Coverage
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {offices.length} Offices
              </p>

            </div>

          </div>

        </div>

        {/* =====================================
            SEARCH + FILTER
        ===================================== */}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4">

            {/* Search */}

            <div className="relative w-full">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search GATC, LMO, officer, district..."
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              {/* Type */}

              <div className="flex flex-wrap gap-2">

                <FilterButton
                  label="All Types"
                  active={
                    typeFilter ===
                    "All"
                  }
                  onClick={() =>
                    setTypeFilter(
                      "All"
                    )
                  }
                />

                <FilterButton
                  label="GATC"
                  active={
                    typeFilter ===
                    "GATC"
                  }
                  onClick={() =>
                    setTypeFilter(
                      "GATC"
                    )
                  }
                />

                <FilterButton
                  label="LMO"
                  active={
                    typeFilter ===
                    "LMO"
                  }
                  onClick={() =>
                    setTypeFilter(
                      "LMO"
                    )
                  }
                />

              </div>

              {/* Status */}

              <div className="flex flex-wrap gap-2">

                <FilterButton
                  label="All Status"
                  active={
                    statusFilter ===
                    "All"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "All"
                    )
                  }
                />

                <FilterButton
                  label="Active"
                  active={
                    statusFilter ===
                    "Active"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Active"
                    )
                  }
                />

                <FilterButton
                  label="Under Review"
                  active={
                    statusFilter ===
                    "Under Review"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Under Review"
                    )
                  }
                />

                <FilterButton
                  label="Inactive"
                  active={
                    statusFilter ===
                    "Inactive"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Inactive"
                    )
                  }
                />

              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <Building2
                  size={22}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  GATC & LMO Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    filteredOffices.length
                  }{" "}
                  offices found
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Office
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Type
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Region
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Officer
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Verification
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredOffices.map(
                  (office) => (
                    <tr
                      key={office.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Office */}

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-800">
                          {office.name}
                        </p>

                        <p className="mt-1 text-xs font-medium text-blue-600">
                          {office.code}
                        </p>

                      </td>

                      {/* Type */}

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            office.type ===
                            "GATC"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {office.type}
                        </span>

                      </td>

                      {/* Region */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={16}
                            className="text-slate-400"
                          />

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              {
                                office.district
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              {
                                office.region
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Officer */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                            {
                              office.officer.charAt(
                                0
                              )
                            }
                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              {
                                office.officer
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              {
                                office.designation
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Contact */}

                      <td className="px-6 py-5">

                        <p className="text-sm text-slate-600">
                          {
                            office.phone
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            office.email
                          }
                        </p>

                      </td>

                      {/* Verification */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-700">
                          {
                            office.verificationCount
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            office.inspectionCount
                          }{" "}
                          inspections
                        </p>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            office.status
                          }
                        />

                      </td>

                      {/* Action */}

                      <td className="px-6 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              office
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >

                          <Eye size={16} />

                          View

                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* Empty state */}

          {filteredOffices.length ===
            0 && (
            <div className="p-12 text-center">

              <Building2
                size={42}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-800">
                No offices found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or filter.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedOffice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={closeDetails}
        >

          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Office Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    selectedOffice.name
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedOffice.code
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>

            </div>

            {/* Body */}

            <div className="space-y-6 p-6">

              {/* Status */}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={20}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Office Status
                  </span>

                </div>

                <StatusBadge
                  status={
                    selectedOffice.status
                  }
                />

              </div>

              {/* Office information */}

              <div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Office Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <Building2
                        size={18}
                      />
                    }
                    label="Office Type"
                    value={
                      selectedOffice.type
                    }
                  />

                  <InfoBox
                    icon={
                      <MapPin
                        size={18}
                      />
                    }
                    label="District"
                    value={
                      selectedOffice.district
                    }
                  />

                  <InfoBox
                    icon={
                      <MapPin
                        size={18}
                      />
                    }
                    label="Region"
                    value={
                      selectedOffice.region
                    }
                  />

                  <InfoBox
                    icon={
                      <User size={18} />
                    }
                    label="Officer"
                    value={
                      selectedOffice.officer
                    }
                  />

                </div>

              </div>

              {/* Contact */}

              <div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <Phone
                        size={18}
                      />
                    }
                    label="Phone"
                    value={
                      selectedOffice.phone
                    }
                  />

                  <InfoBox
                    icon={
                      <Mail
                        size={18}
                      />
                    }
                    label="Email"
                    value={
                      selectedOffice.email
                    }
                  />

                  <InfoBox
                    icon={
                      <User size={18} />
                    }
                    label="Designation"
                    value={
                      selectedOffice.designation
                    }
                  />

                </div>

              </div>

              {/* Activity */}

              <div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Activity Summary
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-green-50 p-4">

                    <div className="flex items-center gap-2 text-green-600">

                      <FileCheck2
                        size={18}
                      />

                      <span className="text-xs font-semibold uppercase">
                        Verification Activities
                      </span>

                    </div>

                    <p className="mt-2 text-2xl font-bold text-green-800">
                      {
                        selectedOffice.verificationCount
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-orange-50 p-4">

                    <div className="flex items-center gap-2 text-orange-600">

                      <CheckCircle2
                        size={18}
                      />

                      <span className="text-xs font-semibold uppercase">
                        Inspections
                      </span>

                    </div>

                    <p className="mt-2 text-2xl font-bold text-orange-800">
                      {
                        selectedOffice.inspectionCount
                      }
                    </p>

                  </div>

                </div>

              </div>

              {/* Close */}

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   FILTER BUTTON
========================================= */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({
  status,
}: {
  status: OfficeStatus;
}) {
  const styles: Record<
    OfficeStatus,
    string
  > = {
    Active:
      "bg-green-100 text-green-700",

    Inactive:
      "bg-red-100 text-red-700",

    "Under Review":
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================
   INFO BOX
========================================= */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="mb-2 flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

export default AdminGatcsLmos;