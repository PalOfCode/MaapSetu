import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  MapPin,
  Search,
  Scale,
  ShieldX,
  User,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type InstrumentStatus =
  | "Verified"
  | "Pending Verification"
  | "Expired"
  | "Rejected";

interface Instrument {
  id: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  nominalCapacity: string;
  merchant: string;
  location: string;
  registrationDate: string;
  lastVerification: string;
  nextVerification: string;
  status: InstrumentStatus;
  certificateId: string;
  inspector: string;
}

/* =========================================
   DEFAULT DATA
========================================= */

const defaultInstruments: Instrument[] = [
  {
    id: "INS-001",
    instrumentType: "Electronic Weighing Scale",
    manufacturer: "Essae",
    model: "DS-30",
    serialNumber: "ES30-2024-001",
    nominalCapacity: "30 kg",
    merchant: "Sharma Traders",
    location: "Kolkata",
    registrationDate: "10 Jan 2025",
    lastVerification: "18 Aug 2026",
    nextVerification: "18 Aug 2028",
    status: "Verified",
    certificateId: "CERT-2701435032",
    inspector: "Rajesh Kumar",
  },

  {
    id: "INS-003",
    instrumentType: "Digital Weighing Machine",
    manufacturer: "Contech",
    model: "CW-50",
    serialNumber: "CT50-2025-003",
    nominalCapacity: "50 kg",
    merchant: "Jamil Samir",
    location: "Durgapur",
    registrationDate: "15 Mar 2025",
    lastVerification: "16 Aug 2026",
    nextVerification: "16 Sep 2026",
    status: "Pending Verification",
    certificateId: "",
    inspector: "Priya Singh",
  },

  {
    id: "INS-004",
    instrumentType: "Counter Weighing Scale",
    manufacturer: "Phoenix",
    model: "PH-10",
    serialNumber: "PX10-2024-004",
    nominalCapacity: "10 kg",
    merchant: "Sharma Traders",
    location: "Asansol",
    registrationDate: "20 Jun 2024",
    lastVerification: "25 Aug 2026",
    nextVerification: "25 Aug 2028",
    status: "Verified",
    certificateId: "CERT-2701434018",
    inspector: "Amit Das",
  },

  {
    id: "INS-008",
    instrumentType: "Platform Scale",
    manufacturer: "Mettler Toledo",
    model: "MT-100",
    serialNumber: "MT100-2023-008",
    nominalCapacity: "100 kg",
    merchant: "Roy & Sons",
    location: "Howrah",
    registrationDate: "05 May 2023",
    lastVerification: "27 Aug 2024",
    nextVerification: "27 Aug 2026",
    status: "Expired",
    certificateId: "CERT-2701431008",
    inspector: "Neha Sharma",
  },

  {
    id: "INS-011",
    instrumentType: "Platform Weighing Scale",
    manufacturer: "Avery",
    model: "AW-200",
    serialNumber: "AV200-2025-011",
    nominalCapacity: "200 kg",
    merchant: "Metro Wholesale",
    location: "Siliguri",
    registrationDate: "12 Feb 2025",
    lastVerification: "20 Aug 2026",
    nextVerification: "20 Aug 2028",
    status: "Verified",
    certificateId: "CERT-2701432011",
    inspector: "Neha Sharma",
  },

  {
    id: "INS-014",
    instrumentType: "Retail Weighing Scale",
    manufacturer: "W & M",
    model: "WM-20",
    serialNumber: "WM20-2026-014",
    nominalCapacity: "20 kg",
    merchant: "City Mart",
    location: "Bardhaman",
    registrationDate: "19 Aug 2026",
    lastVerification: "N/A",
    nextVerification: "To be scheduled",
    status: "Pending Verification",
    certificateId: "",
    inspector: "Rajesh Kumar",
  },

  {
    id: "INS-017",
    instrumentType: "Industrial Weighing Scale",
    manufacturer: "A&D",
    model: "AD-500",
    serialNumber: "AD500-2024-017",
    nominalCapacity: "500 kg",
    merchant: "Eastern Logistics",
    location: "Kolkata",
    registrationDate: "08 Jul 2024",
    lastVerification: "10 Aug 2026",
    nextVerification: "10 Aug 2028",
    status: "Rejected",
    certificateId: "",
    inspector: "Sourav Roy",
  },
];

/* =========================================
   STORAGE
========================================= */

const INSTRUMENT_STORAGE =
  "merchantInstruments";

const ASSIGNMENT_STORAGE =
  "inspectorAssignedApplications";

/* =========================================
   SAFE ARRAY READER
========================================= */

function readArray<T>(
  key: string
): T[] {
  try {
    const saved =
      localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

/* =========================================
   STATUS
========================================= */

function normalizeStatus(
  value?: string
): InstrumentStatus {
  switch (value) {
    case "Verified":
      return "Verified";

    case "Expired":
      return "Expired";

    case "Rejected":
      return "Rejected";

    case "Pending Verification":
      return "Pending Verification";

    case "Pending":
      return "Pending Verification";

    case "Approved":
      return "Verified";

    default:
      return "Pending Verification";
  }
}

/* =========================================
   CONVERT MERCHANT DATA
========================================= */

function convertMerchantInstrument(
  item: Record<string, unknown>,
  index: number
): Instrument {
  const instrumentId =
    String(
      item.instrumentId ??
        item.id ??
        `INS-${String(
          index + 1
        ).padStart(3, "0")}`
    );

  const nominalValue =
    String(
      item.nominalValue ??
        ""
    );

  const unit =
    String(
      item.unit ??
        ""
    );

  return {
    id: instrumentId,

    instrumentType:
      String(
        item.instrumentType ??
          "Measuring Instrument"
      ),

    manufacturer:
      String(
        item.manufacturer ??
          "Not Provided"
      ),

    model:
      String(
        item.modelNumber ??
          "Not Provided"
      ),

    serialNumber:
      String(
        item.serialNumber ??
          "Not Provided"
      ),

    nominalCapacity:
      nominalValue
        ? `${nominalValue}${
            unit
              ? ` ${unit}`
              : ""
          }`
        : "N/A",

    merchant:
      String(
        item.merchant ??
          item.businessName ??
          item.applicant ??
          "Current Merchant"
      ),

    location:
      String(
        item.installationLocation ??
          item.location ??
          "Not Provided"
      ),

    registrationDate:
      formatDate(
        String(
          item.createdAt ??
            ""
        )
      ),

    lastVerification:
      "Not Verified",

    nextVerification:
      "To be scheduled",

    status:
      normalizeStatus(
        String(
          item.status ??
            "Pending Verification"
        )
      ),

    certificateId:
      String(
        item.certificateId ??
          ""
      ),

    inspector:
      String(
        item.inspector ??
          ""
      ),
  };
}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
  value: string
): string {
  if (!value) {
    return new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================
   MERGE
========================================= */

function mergeInstruments(
  defaults: Instrument[],
  merchantData: Instrument[]
): Instrument[] {
  const map =
    new Map<
      string,
      Instrument
    >();

  defaults.forEach(
    (item) => {
      map.set(
        item.id,
        item
      );
    }
  );

  merchantData.forEach(
    (item) => {
      map.set(
        item.id,
        item
      );
    }
  );

  return Array.from(
    map.values()
  );
}

/* =========================================
   COMPONENT
========================================= */

function AdminInstruments() {
  const navigate =
    useNavigate();

  const [
    instruments,
    setInstruments,
  ] = useState<Instrument[]>(
    defaultInstruments
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | InstrumentStatus
  >("All");

  const [
    selectedInstrument,
    setSelectedInstrument,
  ] =
    useState<Instrument | null>(
      null
    );

  /* =========================================
     LOAD DATA
  ========================================= */

  const loadInstruments =
    () => {
      const merchantData =
        readArray<
          Record<string, unknown>
        >(
          INSTRUMENT_STORAGE
        );

      const converted =
        merchantData.map(
          (
            item,
            index
          ) =>
            convertMerchantInstrument(
              item,
              index
            )
        );

      /* Also get inspector assignment data */

      const assignments =
        readArray<
          Record<string, unknown>
        >(
          ASSIGNMENT_STORAGE
        );

      const assignmentMap =
        new Map<
          string,
          Record<string, unknown>
        >();

      assignments.forEach(
        (item) => {
          const instrumentId =
            String(
              item.instrumentId ??
                item.instrument ??
                ""
            );

          if (
            instrumentId
          ) {
            assignmentMap.set(
              instrumentId,
              item
            );
          }
        }
      );

      const updated =
        converted.map(
          (instrument) => {
            const assignment =
              assignmentMap.get(
                instrument.id
              );

            if (!assignment) {
              return instrument;
            }

            return {
              ...instrument,

              inspector:
                String(
                  assignment.inspector ??
                    instrument.inspector
                ),

              location:
                String(
                  assignment.location ??
                    instrument.location
                ),

              status:
                assignment.status ===
                  "Completed"
                  ? "Verified"
                  : instrument.status,
            };
          }
        );

      setInstruments(
        mergeInstruments(
          defaultInstruments,
          updated
        )
      );
    };

  useEffect(() => {
    loadInstruments();
  }, []);

  /* =========================================
     FILTER
  ========================================= */

  const filteredInstruments =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return instruments.filter(
        (instrument) => {
          const searchable =
            [
              instrument.id,
              instrument.instrumentType,
              instrument.manufacturer,
              instrument.model,
              instrument.serialNumber,
              instrument.merchant,
              instrument.location,
              instrument.inspector,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            searchable.includes(
              text
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            instrument.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      instruments,
      search,
      statusFilter,
    ]);

  /* =========================================
     COUNTS
  ========================================= */

  const totalCount =
    instruments.length;

  const verifiedCount =
    instruments.filter(
      (item) =>
        item.status ===
        "Verified"
    ).length;

  const pendingCount =
    instruments.filter(
      (item) =>
        item.status ===
        "Pending Verification"
    ).length;

  const expiredCount =
    instruments.filter(
      (item) =>
        item.status ===
        "Expired"
    ).length;

  const rejectedCount =
    instruments.filter(
      (item) =>
        item.status ===
        "Rejected"
    ).length;

  /* =========================================
     DETAILS
  ========================================= */

  const openDetails = (
    instrument: Instrument
  ) => {
    setSelectedInstrument(
      instrument
    );
  };

  const closeDetails = () => {
    setSelectedInstrument(
      null
    );
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================
            BACK
        ================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

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

          <button
            type="button"
            onClick={
              loadInstruments
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-blue-600">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Instrument Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
            Monitor registered weighing and measuring instruments, verification status and certificates.
          </p>

        </div>

        {/* ==================================
            STATISTICS
        ================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Instruments"
            value={String(
              totalCount
            )}
            icon={
              <Scale size={22} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Verified"
            value={String(
              verifiedCount
            )}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            title="Pending"
            value={String(
              pendingCount
            )}
            icon={
              <Clock size={22} />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Expired"
            value={String(
              expiredCount
            )}
            icon={
              <AlertTriangle
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-600"
          />

          <StatCard
            title="Rejected"
            value={String(
              rejectedCount
            )}
            icon={
              <ShieldXIcon />
            }
            iconClass="bg-slate-200 text-slate-700"
          />

        </div>

        {/* ==================================
            SEARCH + FILTER
        ================================== */}

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-2xl">

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
                placeholder="Search instrument, merchant, serial number..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

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
                label="Verified"
                active={
                  statusFilter ===
                  "Verified"
                }
                onClick={() =>
                  setStatusFilter(
                    "Verified"
                  )
                }
              />

              <FilterButton
                label="Pending"
                active={
                  statusFilter ===
                  "Pending Verification"
                }
                onClick={() =>
                  setStatusFilter(
                    "Pending Verification"
                  )
                }
              />

              <FilterButton
                label="Expired"
                active={
                  statusFilter ===
                  "Expired"
                }
                onClick={() =>
                  setStatusFilter(
                    "Expired"
                  )
                }
              />

              <FilterButton
                label="Rejected"
                active={
                  statusFilter ===
                  "Rejected"
                }
                onClick={() =>
                  setStatusFilter(
                    "Rejected"
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* ==================================
            TABLE
        ================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <Scale size={22} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Registered Instruments
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {
                    filteredInstruments.length
                  }{" "}
                  instruments found

                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1400px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Instrument
                  </TableHead>

                  <TableHead>
                    Manufacturer
                  </TableHead>

                  <TableHead>
                    Serial Number
                  </TableHead>

                  <TableHead>
                    Capacity
                  </TableHead>

                  <TableHead>
                    Merchant
                  </TableHead>

                  <TableHead>
                    Location
                  </TableHead>

                  <TableHead>
                    Inspector
                  </TableHead>

                  <TableHead>
                    Next Verification
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Action
                  </TableHead>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredInstruments.length >
                0 ? (

                  filteredInstruments.map(
                    (
                      instrument
                    ) => (

                      <tr
                        key={
                          instrument.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* Instrument */}

                        <td className="px-6 py-5">

                          <p className="font-semibold text-blue-600">
                            {
                              instrument.id
                            }
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {
                              instrument.instrumentType
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Model:{" "}
                            {
                              instrument.model
                            }
                          </p>

                        </td>

                        {/* Manufacturer */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-700">
                            {
                              instrument.manufacturer
                            }
                          </p>

                        </td>

                        {/* Serial */}

                        <td className="px-6 py-5">

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            {
                              instrument.serialNumber
                            }
                          </span>

                        </td>

                        {/* Capacity */}

                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">

                          {
                            instrument.nominalCapacity
                          }

                        </td>

                        {/* Merchant */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <User
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-semibold text-slate-700">
                              {
                                instrument.merchant
                              }
                            </span>

                          </div>

                        </td>

                        {/* Location */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin
                              size={16}
                              className="text-slate-400"
                            />

                            {
                              instrument.location
                            }

                          </div>

                        </td>

                        {/* Inspector */}

                        <td className="px-6 py-5">

                          {instrument.inspector ? (

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">

                                {
                                  instrument.inspector
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()
                                }

                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {
                                  instrument.inspector
                                }
                              </span>

                            </div>

                          ) : (

                            <span className="text-sm text-slate-400">
                              Not assigned
                            </span>

                          )}

                        </td>

                        {/* Next Verification */}

                        <td className="px-6 py-5">

                          <span
                            className={`text-sm font-semibold ${
                              instrument.status ===
                              "Expired"
                                ? "text-red-600"
                                : instrument.status ===
                                  "Pending Verification"
                                ? "text-orange-600"
                                : "text-slate-700"
                            }`}
                          >

                            {
                              instrument.nextVerification
                            }

                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <StatusBadge
                            status={
                              instrument.status
                            }
                          />

                        </td>

                        {/* Action */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              openDetails(
                                instrument
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >

                            <Eye size={16} />

                            View

                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >

                      <Scale
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-800">
                        No instruments found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or status filter.
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
          DETAILS MODAL
      ===================================== */}

      {selectedInstrument && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={
            closeDetails
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Instrument Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    selectedInstrument.id
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedInstrument.instrumentType
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeDetails
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>

            {/* BODY */}

            <div className="space-y-6 p-6">

              {/* STATUS */}

              <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <FileCheck2
                    size={20}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Verification Status
                  </span>

                </div>

                <StatusBadge
                  status={
                    selectedInstrument.status
                  }
                />

              </div>

              {/* INSTRUMENT INFORMATION */}

              <section>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Instrument Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <DetailBox
                    label="Instrument ID"
                    value={
                      selectedInstrument.id
                    }
                  />

                  <DetailBox
                    label="Instrument Type"
                    value={
                      selectedInstrument.instrumentType
                    }
                  />

                  <DetailBox
                    label="Manufacturer"
                    value={
                      selectedInstrument.manufacturer
                    }
                  />

                  <DetailBox
                    label="Model"
                    value={
                      selectedInstrument.model
                    }
                  />

                  <DetailBox
                    label="Serial Number"
                    value={
                      selectedInstrument.serialNumber
                    }
                  />

                  <DetailBox
                    label="Nominal Capacity"
                    value={
                      selectedInstrument.nominalCapacity
                    }
                  />

                </div>

              </section>

              {/* OWNERSHIP */}

              <section>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Ownership & Location
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <DetailBox
                    label="Merchant"
                    value={
                      selectedInstrument.merchant
                    }
                  />

                  <DetailBox
                    label="Location"
                    value={
                      selectedInstrument.location
                    }
                  />

                  <DetailBox
                    label="Registered On"
                    value={
                      selectedInstrument.registrationDate
                    }
                  />

                  <DetailBox
                    label="Assigned Inspector"
                    value={
                      selectedInstrument.inspector ||
                      "Not assigned"
                    }
                  />

                </div>

              </section>

              {/* VERIFICATION */}

              <section>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Verification Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <DetailBox
                    label="Last Verification"
                    value={
                      selectedInstrument.lastVerification
                    }
                  />

                  <DetailBox
                    label="Next Verification"
                    value={
                      selectedInstrument.nextVerification
                    }
                  />

                  <DetailBox
                    label="Certificate ID"
                    value={
                      selectedInstrument.certificateId ||
                      "No certificate"
                    }
                  />

                </div>

              </section>

              {/* CERTIFICATE */}

              {selectedInstrument.certificateId && (

                <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-green-800">
                        Certificate Linked
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        {
                          selectedInstrument.certificateId
                        }
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* CLOSE */}

              <div className="flex justify-end border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={
                    closeDetails
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
   STATUS BADGE
========================================= */

function StatusBadge({
  status,
}: {
  status: InstrumentStatus;
}) {
  const styles: Record<
    InstrumentStatus,
    string
  > = {
    Verified:
      "bg-green-100 text-green-700",

    "Pending Verification":
      "bg-orange-100 text-orange-700",

    Expired:
      "bg-red-100 text-red-700",

    Rejected:
      "bg-slate-200 text-slate-700",
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
   REJECTED ICON
========================================= */

function ShieldXIcon() {
  return (
    <ShieldX
      size={22}
    />
  );
}

export default AdminInstruments;