import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  ShieldAlert,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  X,
  MapPin,
  FileText,
  IndianRupee,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type EnforcementStatus =
  | "Open"
  | "Under Review"
  | "Resolved"
  | "Closed";

type Severity =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

interface EnforcementRecord {
  id: string;
  caseId: string;
  applicationId: string;
  instrumentId: string;
  merchant: string;
  instrumentType: string;
  location: string;
  inspector: string;
  violation: string;
  severity: Severity;
  fineAmount: number;
  actionTaken: string;
  date: string;
  status: EnforcementStatus;
}

/* =========================================
   INITIAL DATA
========================================= */

const initialRecords: EnforcementRecord[] = [
  {
    id: "ENF-001",
    caseId: "CASE-27014001",
    applicationId: "APP-270140200751",
    instrumentId: "INS-001",
    merchant: "Sharma Traders",
    instrumentType:
      "Electronic Weighing Scale",
    location: "Kolkata",
    inspector: "Rajesh Kumar",
    violation:
      "Instrument found outside permissible error limit",
    severity: "High",
    fineAmount: 5000,
    actionTaken:
      "Instrument verification failed and corrective notice issued",
    date: "30 Aug 2026",
    status: "Under Review",
  },

  {
    id: "ENF-002",
    caseId: "CASE-27014002",
    applicationId: "APP-270147440083",
    instrumentId: "INS-003",
    merchant: "Jamil Samir",
    instrumentType:
      "Digital Weighing Machine",
    location: "Durgapur",
    inspector: "Priya Singh",
    violation:
      "Verification stamp not available",
    severity: "Medium",
    fineAmount: 2500,
    actionTaken:
      "Notice issued to merchant",
    date: "28 Aug 2026",
    status: "Open",
  },

  {
    id: "ENF-003",
    caseId: "CASE-27014003",
    applicationId: "APP-270147390032",
    instrumentId: "INS-004",
    merchant: "Sharma Traders",
    instrumentType:
      "Counter Weighing Scale",
    location: "Asansol",
    inspector: "Amit Das",
    violation:
      "Improper sealing of measuring instrument",
    severity: "Low",
    fineAmount: 1000,
    actionTaken:
      "Seal replaced and compliance recorded",
    date: "25 Aug 2026",
    status: "Resolved",
  },

  {
    id: "ENF-004",
    caseId: "APP-270147301121",
    applicationId: "APP-270147301121",
    instrumentId: "INS-008",
    merchant: "Roy & Sons",
    instrumentType:
      "Platform Scale",
    location: "Howrah",
    inspector: "Neha Sharma",
    violation:
      "Expired verification certificate",
    severity: "Critical",
    fineAmount: 10000,
    actionTaken:
      "Operation suspended pending re-verification",
    date: "27 Aug 2026",
    status: "Open",
  },

  {
    id: "ENF-005",
    caseId: "CASE-27014005",
    applicationId: "APP-270147110022",
    instrumentId: "INS-011",
    merchant: "Metro Wholesale",
    instrumentType:
      "Platform Weighing Scale",
    location: "Siliguri",
    inspector: "Neha Sharma",
    violation:
      "Incorrect capacity marking",
    severity: "Medium",
    fineAmount: 3000,
    actionTaken:
      "Corrective labeling order issued",
    date: "20 Aug 2026",
    status: "Closed",
  },
];

/* =========================================
   COMPONENT
========================================= */

function AdminEnforcement() {
  const navigate = useNavigate();

  const [records, setRecords] =
    useState<EnforcementRecord[]>(
      initialRecords
    );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | EnforcementStatus
    >("All");

  const [severityFilter, setSeverityFilter] =
    useState<
      "All" | Severity
    >("All");

  const [
    selectedRecord,
    setSelectedRecord,
  ] = useState<EnforcementRecord | null>(
    null
  );

  /* =========================================
     FILTER
  ========================================= */

  const filteredRecords =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return records.filter(
        (record) => {
          const matchesSearch =
            record.caseId
              .toLowerCase()
              .includes(text) ||
            record.applicationId
              .toLowerCase()
              .includes(text) ||
            record.instrumentId
              .toLowerCase()
              .includes(text) ||
            record.merchant
              .toLowerCase()
              .includes(text) ||
            record.location
              .toLowerCase()
              .includes(text) ||
            record.inspector
              .toLowerCase()
              .includes(text) ||
            record.violation
              .toLowerCase()
              .includes(text);

          const matchesStatus =
            statusFilter === "All" ||
            record.status ===
              statusFilter;

          const matchesSeverity =
            severityFilter === "All" ||
            record.severity ===
              severityFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesSeverity
          );
        }
      );
    }, [
      records,
      search,
      statusFilter,
      severityFilter,
    ]);

  /* =========================================
     COUNTS
  ========================================= */

  const totalCases =
    records.length;

  const openCases =
    records.filter(
      (record) =>
        record.status === "Open"
    ).length;

  const underReviewCases =
    records.filter(
      (record) =>
        record.status ===
        "Under Review"
    ).length;

  const resolvedCases =
    records.filter(
      (record) =>
        record.status ===
        "Resolved" ||
        record.status === "Closed"
    ).length;

  const criticalCases =
    records.filter(
      (record) =>
        record.severity ===
        "Critical"
    ).length;

  const totalFine =
    records.reduce(
      (total, record) =>
        total + record.fineAmount,
      0
    );

  /* =========================================
     CHANGE STATUS
  ========================================= */

  const updateStatus = (
    id: string,
    status: EnforcementStatus
  ) => {
    setRecords(
      (current) =>
        current.map(
          (record) =>
            record.id === id
              ? {
                  ...record,
                  status,
                }
              : record
        )
    );

    if (
      selectedRecord?.id === id
    ) {
      setSelectedRecord(
        (current) =>
          current
            ? {
                ...current,
                status,
              }
            : null
      );
    }
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
            Inspections & Enforcement
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor inspection findings, violations, corrective actions and enforcement cases.
          </p>

        </div>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Cases"
            value={String(
              totalCases
            )}
            icon={
              <ShieldAlert
                size={22}
              />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Open"
            value={String(
              openCases
            )}
            icon={
              <Clock
                size={22}
              />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Under Review"
            value={String(
              underReviewCases
            )}
            icon={
              <ClipboardCheck
                size={22}
              />
            }
            iconClass="bg-purple-100 text-purple-600"
          />

          <StatCard
            title="Resolved"
            value={String(
              resolvedCases
            )}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            title="Critical"
            value={String(
              criticalCases
            )}
            icon={
              <AlertTriangle
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-600"
          />

        </div>

        {/* =====================================
            FINE SUMMARY
        ===================================== */}

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-500">
                Total Recorded Fine
              </p>

              <div className="mt-1 flex items-center gap-1">

                <IndianRupee
                  size={22}
                  className="text-blue-600"
                />

                <span className="text-2xl font-bold text-slate-900">
                  {totalFine.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">

              <span className="font-semibold">
                Enforcement Monitoring
              </span>

              <p className="mt-1 text-xs text-blue-600">
                Track open cases and corrective action status.
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
                placeholder="Search case, merchant, instrument, inspector..."
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              {/* Status */}

              <div className="flex flex-wrap gap-2">

                <FilterButton
                  label="All"
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
                  label="Open"
                  active={
                    statusFilter ===
                    "Open"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Open"
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
                  label="Resolved"
                  active={
                    statusFilter ===
                    "Resolved"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Resolved"
                    )
                  }
                />

                <FilterButton
                  label="Closed"
                  active={
                    statusFilter ===
                    "Closed"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "Closed"
                    )
                  }
                />

              </div>

              {/* Severity */}

              <div className="flex flex-wrap gap-2">

                <SeverityButton
                  label="All Severity"
                  active={
                    severityFilter ===
                    "All"
                  }
                  onClick={() =>
                    setSeverityFilter(
                      "All"
                    )
                  }
                />

                <SeverityButton
                  label="Low"
                  active={
                    severityFilter ===
                    "Low"
                  }
                  onClick={() =>
                    setSeverityFilter(
                      "Low"
                    )
                  }
                />

                <SeverityButton
                  label="Medium"
                  active={
                    severityFilter ===
                    "Medium"
                  }
                  onClick={() =>
                    setSeverityFilter(
                      "Medium"
                    )
                  }
                />

                <SeverityButton
                  label="High"
                  active={
                    severityFilter ===
                    "High"
                  }
                  onClick={() =>
                    setSeverityFilter(
                      "High"
                    )
                  }
                />

                <SeverityButton
                  label="Critical"
                  active={
                    severityFilter ===
                    "Critical"
                  }
                  onClick={() =>
                    setSeverityFilter(
                      "Critical"
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

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">

                <ShieldAlert
                  size={22}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Enforcement Cases
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    filteredRecords.length
                  }{" "}
                  cases found
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1400px] text-left">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Case
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Merchant
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Instrument
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Location
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Inspector
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Violation
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Fine
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

                {filteredRecords.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Case */}

                      <td className="px-6 py-5">

                        <p className="font-semibold text-blue-600">
                          {record.caseId}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            record.applicationId
                          }
                        </p>

                      </td>

                      {/* Merchant */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-700">
                          {
                            record.merchant
                          }
                        </p>

                      </td>

                      {/* Instrument */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-700">
                          {
                            record.instrumentType
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            record.instrumentId
                          }
                        </p>

                      </td>

                      {/* Location */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <MapPin
                            size={15}
                            className="text-slate-400"
                          />

                          {
                            record.location
                          }

                        </div>

                      </td>

                      {/* Inspector */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">

                            {
                              record.inspector.charAt(
                                0
                              )
                            }

                          </div>

                          <span className="text-sm font-semibold text-slate-700">
                            {
                              record.inspector
                            }
                          </span>

                        </div>

                      </td>

                      {/* Violation */}

                      <td className="px-6 py-5">

                        <p className="max-w-[260px] text-sm text-slate-600">
                          {
                            record.violation
                          }
                        </p>

                      </td>

                      {/* Severity */}

                      <td className="px-6 py-5">

                        <SeverityBadge
                          severity={
                            record.severity
                          }
                        />

                      </td>

                      {/* Fine */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-700">

                          ₹
                          {record.fineAmount.toLocaleString(
                            "en-IN"
                          )}

                        </p>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            record.status
                          }
                        />

                      </td>

                      {/* Action */}

                      <td className="px-6 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRecord(
                              record
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

          {filteredRecords.length ===
            0 && (
            <div className="p-12 text-center">

              <ShieldAlert
                size={42}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-800">
                No enforcement cases found
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

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() =>
            setSelectedRecord(null)
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Enforcement Case
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    selectedRecord.caseId
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedRecord.applicationId
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>

            </div>

            {/* Body */}

            <div className="space-y-6 p-6">

              {/* Summary */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailBox
                  label="Merchant"
                  value={
                    selectedRecord.merchant
                  }
                />

                <DetailBox
                  label="Instrument ID"
                  value={
                    selectedRecord.instrumentId
                  }
                />

                <DetailBox
                  label="Instrument Type"
                  value={
                    selectedRecord.instrumentType
                  }
                />

                <DetailBox
                  label="Location"
                  value={
                    selectedRecord.location
                  }
                />

                <DetailBox
                  label="Inspector"
                  value={
                    selectedRecord.inspector
                  }
                />

                <DetailBox
                  label="Inspection Date"
                  value={
                    selectedRecord.date
                  }
                />

              </div>

              {/* Violation */}

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">

                    <AlertTriangle
                      size={20}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                      Violation
                    </p>

                    <p className="mt-1 text-sm font-bold text-red-900">
                      {
                        selectedRecord.violation
                      }
                    </p>

                  </div>

                </div>

              </div>

              {/* Fine + Severity */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Severity
                  </p>

                  <div className="mt-2">

                    <SeverityBadge
                      severity={
                        selectedRecord.severity
                      }
                    />

                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Fine Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ₹
                    {selectedRecord.fineAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>

              {/* Action Taken */}

              <div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Action Taken
                </h3>

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-start gap-3">

                    <FileText
                      size={20}
                      className="mt-0.5 text-blue-600"
                    />

                    <p className="text-sm leading-6 text-slate-700">
                      {
                        selectedRecord.actionTaken
                      }
                    </p>

                  </div>

                </div>

              </div>

              {/* Status Control */}

              <div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Update Case Status
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <StatusAction
                    label="Open"
                    active={
                      selectedRecord.status ===
                      "Open"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedRecord.id,
                        "Open"
                      )
                    }
                  />

                  <StatusAction
                    label="Under Review"
                    active={
                      selectedRecord.status ===
                      "Under Review"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedRecord.id,
                        "Under Review"
                      )
                    }
                  />

                  <StatusAction
                    label="Resolved"
                    active={
                      selectedRecord.status ===
                      "Resolved"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedRecord.id,
                        "Resolved"
                      )
                    }
                  />

                  <StatusAction
                    label="Closed"
                    active={
                      selectedRecord.status ===
                      "Closed"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedRecord.id,
                        "Closed"
                      )
                    }
                  />

                </div>

              </div>

              {/* Close */}

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRecord(
                      null
                    )
                  }
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
   SEVERITY BUTTON
========================================= */

function SeverityButton({
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
          ? "bg-slate-800 text-white shadow-sm"
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
  status: EnforcementStatus;
}) {
  const styles: Record<
    EnforcementStatus,
    string
  > = {
    Open:
      "bg-orange-100 text-orange-700",

    "Under Review":
      "bg-purple-100 text-purple-700",

    Resolved:
      "bg-green-100 text-green-700",

    Closed:
      "bg-slate-100 text-slate-700",
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
   SEVERITY BADGE
========================================= */

function SeverityBadge({
  severity,
}: {
  severity: Severity;
}) {
  const styles: Record<
    Severity,
    string
  > = {
    Low:
      "bg-green-100 text-green-700",

    Medium:
      "bg-yellow-100 text-yellow-700",

    High:
      "bg-orange-100 text-orange-700",

    Critical:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

/* =========================================
   STATUS ACTION
========================================= */

function StatusAction({
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
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================
   DETAIL BOX
========================================= */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

export default AdminEnforcement;