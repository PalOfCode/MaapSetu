import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Printer,
  Search,
  Users,
  X,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type ReportType =
  | "All"
  | "Applications"
  | "Certificates"
  | "Inspections"
  | "Inspectors";

type ReportCategory =
  | "Applications"
  | "Certificates"
  | "Inspections"
  | "Inspectors";

interface ReportRow {
  id: string;
  type: ReportCategory;
  title: string;
  reference: string;
  owner: string;
  status: string;
  date: string;
  value: string;
}

/* =========================================
   DEFAULT REPORTS
========================================= */

const defaultReports: ReportRow[] = [
  {
    id: "RPT-001",
    type: "Applications",
    title: "Verification Applications Report",
    reference: "APP-270140200751",
    owner: "Sharma Traders",
    status: "Pending",
    date: "30 Aug 2026",
    value: "24 Applications",
  },
  {
    id: "RPT-002",
    type: "Applications",
    title: "Scheduled Applications Report",
    reference: "APP-270147440083",
    owner: "Jamil Samir",
    status: "Scheduled",
    date: "30 Aug 2026",
    value: "18 Applications",
  },
  {
    id: "RPT-003",
    type: "Certificates",
    title: "Issued Certificates Report",
    reference: "CERT-2701435032",
    owner: "Sharma Traders",
    status: "Valid",
    date: "30 Aug 2026",
    value: "112 Certificates",
  },
  {
    id: "RPT-004",
    type: "Certificates",
    title: "Expiring Certificates Report",
    reference: "CERT-EXP-001",
    owner: "Multiple Merchants",
    status: "Expiring Soon",
    date: "30 Aug 2026",
    value: "09 Certificates",
  },
  {
    id: "RPT-005",
    type: "Inspections",
    title: "Completed Inspections Report",
    reference: "INS-REPORT-001",
    owner: "Inspection Division",
    status: "Completed",
    date: "30 Aug 2026",
    value: "83 Inspections",
  },
  {
    id: "RPT-006",
    type: "Inspectors",
    title: "Inspector Workload Report",
    reference: "LM-1001",
    owner: "Rajesh Kumar",
    status: "Available",
    date: "30 Aug 2026",
    value: "04 Assigned",
  },
];

/* =========================================
   READ LOCAL STORAGE
========================================= */

function readArray<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as T[];
  } catch {
    return [];
  }
}

/* =========================================
   TODAY
========================================= */

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================
   MAIN COMPONENT
========================================= */

function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] =
    useState<ReportRow[]>(defaultReports);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<ReportType>("All");

  const [selectedReport, setSelectedReport] =
    useState<ReportRow | null>(null);

  /* =========================================
     GENERATE LIVE REPORTS
  ========================================= */

  const generateReports = () => {
    const applications =
      readArray<Record<string, unknown>>(
        "merchantApplications"
      );

    const instruments =
      readArray<Record<string, unknown>>(
        "merchantInstruments"
      );

    const assignments =
      readArray<Record<string, unknown>>(
        "inspectorAssignedApplications"
      );

    const certificates =
      readArray<Record<string, unknown>>(
        "almveCertificates"
      );

    const today = getTodayLabel();

    const pendingApplications =
      applications.filter(
        (item) =>
          String(item.status ?? "") ===
          "Pending"
      ).length;

    const scheduledApplications =
      applications.filter(
        (item) =>
          String(item.status ?? "") ===
          "Scheduled"
      ).length;

    const approvedApplications =
      applications.filter(
        (item) =>
          String(item.status ?? "") ===
          "Approved"
      ).length;

    const validCertificates =
      certificates.filter((item) => {
        const status =
          String(item.status ?? "");

        return (
          status === "Valid" ||
          status === "Expiring Soon"
        );
      }).length;

    const expiringCertificates =
      certificates.filter(
        (item) =>
          String(item.status ?? "") ===
          "Expiring Soon"
      ).length;

    const assignedInspectorNames =
      assignments
        .map((item) =>
          String(
            item.inspector ?? ""
          ).trim()
        )
        .filter(
          (name) => name !== ""
        );

    const uniqueInspectorCount =
      new Set(
        assignedInspectorNames
      ).size;

    const liveReports: ReportRow[] = [
      {
        id: "RPT-LIVE-001",
        type: "Applications",
        title:
          "Current Verification Applications",
        reference: "APP-LIVE",
        owner:
          "ALMVE Application Registry",
        status:
          pendingApplications > 0
            ? "Pending"
            : "Completed",
        date: today,
        value:
          `${applications.length} Applications`,
      },

      {
        id: "RPT-LIVE-002",
        type: "Applications",
        title:
          "Scheduled Verification Applications",
        reference: "APP-SCHEDULED",
        owner:
          "Verification Administration",
        status:
          scheduledApplications > 0
            ? "Scheduled"
            : "None",
        date: today,
        value:
          `${scheduledApplications} Applications`,
      },

      {
        id: "RPT-LIVE-003",
        type: "Applications",
        title: "Approved Applications",
        reference: "APP-APPROVED",
        owner:
          "ALMVE Approval Registry",
        status:
          approvedApplications > 0
            ? "Approved"
            : "None",
        date: today,
        value:
          `${approvedApplications} Applications`,
      },

      {
        id: "RPT-LIVE-004",
        type: "Certificates",
        title:
          "Current Digital Certificates",
        reference: "CERT-LIVE",
        owner:
          "ALMVE Certificate Registry",
        status:
          validCertificates > 0
            ? "Valid"
            : "Pending",
        date: today,
        value:
          `${certificates.length} Certificates`,
      },

      {
        id: "RPT-LIVE-005",
        type: "Certificates",
        title:
          "Expiring Certificates",
        reference:
          "CERT-EXPIRING",
        owner:
          "Certificate Monitoring",
        status:
          expiringCertificates > 0
            ? "Expiring Soon"
            : "Clear",
        date: today,
        value:
          `${expiringCertificates} Certificates`,
      },

      {
        id: "RPT-LIVE-006",
        type: "Inspections",
        title:
          "Assigned Verification Inspections",
        reference: "INS-LIVE",
        owner:
          "Inspection Division",
        status:
          assignments.length > 0
            ? "Scheduled"
            : "Pending",
        date: today,
        value:
          `${assignments.length} Inspections`,
      },

      {
        id: "RPT-LIVE-007",
        type: "Inspectors",
        title:
          "Inspector Workload Report",
        reference: "LMO-LIVE",
        owner:
          "Legal Metrology Division",
        status:
          uniqueInspectorCount > 0
            ? "Active"
            : "Available",
        date: today,
        value:
          `${assignedInspectorNames.length} Assigned`,
      },

      {
        id: "RPT-LIVE-008",
        type: "Inspections",
        title:
          "Registered Instrument Summary",
        reference: "INS-REGISTRY",
        owner:
          "Instrument Registry",
        status:
          instruments.length > 0
            ? "Active"
            : "No Data",
        date: today,
        value:
          `${instruments.length} Instruments`,
      },
    ];

    setReports([
      ...liveReports,
      ...defaultReports,
    ]);
  };

  /* =========================================
     UNIQUE REPORTS
  ========================================= */

  const uniqueReports = useMemo(() => {
    const map =
      new Map<string, ReportRow>();

    reports.forEach((report) => {
      map.set(report.id, report);
    });

    return Array.from(
      map.values()
    );
  }, [reports]);

  /* =========================================
     FILTER REPORTS
  ========================================= */

  const filteredReports = useMemo(() => {
    const searchText =
      search
        .trim()
        .toLowerCase();

    return uniqueReports.filter(
      (report) => {
        const searchable = [
          report.id,
          report.type,
          report.title,
          report.reference,
          report.owner,
          report.status,
          report.date,
          report.value,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          searchable.includes(
            searchText
          );

        const matchesFilter =
          filter === "All" ||
          report.type === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    uniqueReports,
    search,
    filter,
  ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const applicationReports =
    uniqueReports.filter(
      (report) =>
        report.type ===
        "Applications"
    ).length;

  const certificateReports =
    uniqueReports.filter(
      (report) =>
        report.type ===
        "Certificates"
    ).length;

  const inspectionReports =
    uniqueReports.filter(
      (report) =>
        report.type ===
        "Inspections"
    ).length;

  const inspectorReports =
    uniqueReports.filter(
      (report) =>
        report.type ===
        "Inspectors"
    ).length;

  /* =========================================
     DOWNLOAD
  ========================================= */

  const downloadReport = (
    report: ReportRow
  ) => {
    const content = `
ALMVE
AUTOMATED LEGAL METROLOGY VERIFICATION ENGINE

ADMINISTRATOR REPORT
================================================

Report ID:
${report.id}

Report Type:
${report.type}

Report Title:
${report.title}

Reference:
${report.reference}

Owner:
${report.owner}

Status:
${report.status}

Date:
${report.date}

Value:
${report.value}

Generated By:
ALMVE Administrator Portal

================================================
`;

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${report.reference}-report.txt`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* =========================================
     ESCAPE HTML
  ========================================= */

  const escapeHtml = (
    value: string
  ) => {
    return value
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  };

  /* =========================================
     PRINT
  ========================================= */

  const printReport = (
    report: ReportRow
  ) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=750"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the report."
      );

      return;
    }

    printWindow.document.write(
      `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
${escapeHtml(report.title)}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 40px;
  font-family: Arial, Helvetica, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
}

.report {
  max-width: 800px;
  margin: 0 auto;
  padding: 38px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-top: 6px solid #2563eb;
  border-radius: 16px;
}

.header {
  text-align: center;
  padding-bottom: 22px;
  border-bottom: 1px solid #e2e8f0;
}

.header h1 {
  margin: 0;
  font-size: 30px;
  color: #1e3a8a;
}

.header p {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.title {
  margin-top: 22px;
  font-size: 22px;
  font-weight: 700;
  color: #1d4ed8;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 25px;
}

.item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 10px;
}

.label {
  margin-bottom: 7px;
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
}

.value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.footer {
  margin-top: 30px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}

@media print {

  body {
    padding: 0;
    background: #ffffff;
  }

  .report {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }

}

</style>

</head>

<body>

<div class="report">

  <div class="header">

    <h1>
      ALMVE
    </h1>

    <p>
      Automated Legal Metrology Verification Engine
    </p>

    <div class="title">
      Administrator Report
    </div>

  </div>

  <div class="grid">

    <div class="item">

      <div class="label">
        Report ID
      </div>

      <div class="value">
        ${escapeHtml(report.id)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Report Type
      </div>

      <div class="value">
        ${escapeHtml(report.type)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Report Title
      </div>

      <div class="value">
        ${escapeHtml(report.title)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Reference
      </div>

      <div class="value">
        ${escapeHtml(report.reference)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Owner
      </div>

      <div class="value">
        ${escapeHtml(report.owner)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Status
      </div>

      <div class="value">
        ${escapeHtml(report.status)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Date
      </div>

      <div class="value">
        ${escapeHtml(report.date)}
      </div>

    </div>

    <div class="item">

      <div class="label">
        Value
      </div>

      <div class="value">
        ${escapeHtml(report.value)}
      </div>

    </div>

  </div>

  <div class="footer">
    Generated by ALMVE Administrator Portal
  </div>

</div>

<script>

window.onload = function () {
  window.print();
};

</script>

</body>

</html>
`
    );

    printWindow.document.close();
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            BACK
        ================================= */}

        <div className="mb-5">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >

            <ArrowLeft size={18} />

            Back to Admin Dashboard

          </button>

        </div>

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Administrator Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
              Analyse applications, certificates,
              inspections, instruments and inspector
              workload.
            </p>

          </div>

          <button
            type="button"
            onClick={
              generateReports
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >

            <BarChart3 size={18} />

            Refresh Live Reports

          </button>

        </div>

        {/* =================================
            STAT CARDS
        ================================= */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Application Reports"
            value={String(
              applicationReports
            )}
            icon={
              <ClipboardList
                size={22}
              />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Certificate Reports"
            value={String(
              certificateReports
            )}
            icon={
              <FileCheck2
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            title="Inspection Reports"
            value={String(
              inspectionReports
            )}
            icon={
              <BarChart3
                size={22}
              />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Inspector Reports"
            value={String(
              inspectorReports
            )}
            icon={
              <Users size={22} />
            }
            iconClass="bg-purple-100 text-purple-600"
          />

        </div>

        {/* =================================
            SEARCH AND FILTER
        ================================= */}

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-xl">

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
                placeholder="Search reports..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex flex-wrap gap-2">

              <FilterButton
                label="All"
                active={
                  filter === "All"
                }
                onClick={() =>
                  setFilter("All")
                }
              />

              <FilterButton
                label="Applications"
                active={
                  filter ===
                  "Applications"
                }
                onClick={() =>
                  setFilter(
                    "Applications"
                  )
                }
              />

              <FilterButton
                label="Certificates"
                active={
                  filter ===
                  "Certificates"
                }
                onClick={() =>
                  setFilter(
                    "Certificates"
                  )
                }
              />

              <FilterButton
                label="Inspections"
                active={
                  filter ===
                  "Inspections"
                }
                onClick={() =>
                  setFilter(
                    "Inspections"
                  )
                }
              />

              <FilterButton
                label="Inspectors"
                active={
                  filter ===
                  "Inspectors"
                }
                onClick={() =>
                  setFilter(
                    "Inspectors"
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* =================================
            REPORT TABLE
        ================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <FileText
                  size={22}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Administrative Reports
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {
                    filteredReports.length
                  }{" "}
                  reports found

                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Report
                  </TableHead>

                  <TableHead>
                    Type
                  </TableHead>

                  <TableHead>
                    Reference
                  </TableHead>

                  <TableHead>
                    Owner
                  </TableHead>

                  <TableHead>
                    Value
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Actions
                  </TableHead>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredReports.length >
                0 ? (

                  filteredReports.map(
                    (
                      report
                    ) => (

                      <tr
                        key={
                          report.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <p className="font-semibold text-slate-800">

                            {
                              report.title
                            }

                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {
                              report.id
                            }

                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

                            {
                              report.type
                            }

                          </span>

                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-blue-600">

                          {
                            report.reference
                          }

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">

                          {
                            report.owner
                          }

                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">

                          {
                            report.value
                          }

                        </td>

                        <td className="px-6 py-5">

                          <ReportStatus
                            status={
                              report.status
                            }
                          />

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">

                          {
                            report.date
                          }

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              title="View Report"
                              onClick={() =>
                                setSelectedReport(
                                  report
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            >

                              <Eye
                                size={17}
                              />

                            </button>

                            <button
                              type="button"
                              title="Download Report"
                              onClick={() =>
                                downloadReport(
                                  report
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            >

                              <Download
                                size={17}
                              />

                            </button>

                            <button
                              type="button"
                              title="Print Report"
                              onClick={() =>
                                printReport(
                                  report
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            >

                              <Printer
                                size={17}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >

                      <FileText
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-800">
                        No reports found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* =====================================
          REPORT DETAILS MODAL
      ===================================== */}

      {selectedReport && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() =>
            setSelectedReport(
              null
            )
          }
        >

          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Report Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">

                  {
                    selectedReport.title
                  }

                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReport(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close report"
              >

                <X size={21} />

              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-5 p-6">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailBox
                  label="Report ID"
                  value={
                    selectedReport.id
                  }
                />

                <DetailBox
                  label="Report Type"
                  value={
                    selectedReport.type
                  }
                />

                <DetailBox
                  label="Report Title"
                  value={
                    selectedReport.title
                  }
                />

                <DetailBox
                  label="Reference"
                  value={
                    selectedReport.reference
                  }
                />

                <DetailBox
                  label="Owner"
                  value={
                    selectedReport.owner
                  }
                />

                <DetailBox
                  label="Status"
                  value={
                    selectedReport.status
                  }
                />

                <DetailBox
                  label="Date"
                  value={
                    selectedReport.date
                  }
                />

                <DetailBox
                  label="Value"
                  value={
                    selectedReport.value
                  }
                />

              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    downloadReport(
                      selectedReport
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >

                  <Download
                    size={18}
                  />

                  Download

                </button>

                <button
                  type="button"
                  onClick={() =>
                    printReport(
                      selectedReport
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >

                  <Printer
                    size={18}
                  />

                  Print

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedReport(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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
   TABLE HEAD
========================================= */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600">
      {children}
    </th>
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
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >

      {label}

    </button>
  );
}

/* =========================================
   REPORT STATUS
========================================= */

function ReportStatus({
  status,
}: {
  status: string;
}) {
  let className =
    "bg-slate-100 text-slate-700";

  if (
    status === "Completed" ||
    status === "Valid" ||
    status === "Approved" ||
    status === "Active" ||
    status === "Clear"
  ) {
    className =
      "bg-green-100 text-green-700";
  } else if (
    status === "Pending" ||
    status === "Expiring Soon"
  ) {
    className =
      "bg-orange-100 text-orange-700";
  } else if (
    status === "Scheduled"
  ) {
    className =
      "bg-blue-100 text-blue-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
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

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   EXPORT
========================================= */

export default AdminReports;