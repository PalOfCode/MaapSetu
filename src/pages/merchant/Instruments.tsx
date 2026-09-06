import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Scale,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type InstrumentStatus = "Verified" | "Pending" | "Failed";

interface Instrument {
  id: string;
  type: string;
  manufacturer: string;
  nominalValue: string;
  status: InstrumentStatus;
  validUntil: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}


interface InstrumentsResponse {
  success: boolean;
  message?: string;
  instruments?: Array<{
    id?: string | number;
    instrumentId?: string | number;
    instrumentCode?: string;
    instrument_code?: string;
    instrumentType?: string;
    instrument_type?: string;
    manufacturer?: string;
    capacity?: string | number;
    accuracy?: string | number;
    status?: string;
    validUntil?: string;
    valid_until?: string;
    nextVerificationDate?: string;
    next_verification_date?: string;
  }>;
}


function getToken(): string {
  return localStorage.getItem("almveToken") || "";
}

function mapInstrument(
  item: NonNullable<InstrumentsResponse["instruments"]>[number]
): Instrument {
  const rawStatus = String(
    item.status || ""
  ).toLowerCase();

  const status: InstrumentStatus =
    rawStatus.includes("fail") ||
    rawStatus.includes("reject")
      ? "Failed"
      : rawStatus.includes("verif")
      ? "Verified"
      : "Pending";

  const id = String(
    item.instrumentId ??
      item.instrumentCode ??
      item.instrument_code ??
      item.id ??
      ""
  );

  const instrumentType = String(
    item.instrumentType ??
      item.instrument_type ??
      "Instrument"
  );

  const manufacturer = String(
    item.manufacturer ||
      "Not Available"
  );

  const capacity =
    item.capacity !== undefined &&
    item.capacity !== null
      ? String(item.capacity)
      : "";

  const nominalValue =
    capacity
      ? capacity
      : "Not available";

  const validUntilRaw =
    item.validUntil ??
    item.valid_until ??
    item.nextVerificationDate ??
    item.next_verification_date ??
    "";

  let validUntil = "-";

  if (validUntilRaw) {
    const date = new Date(
      String(validUntilRaw)
    );

    validUntil = Number.isNaN(
      date.getTime()
    )
      ? String(validUntilRaw)
      : date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
  }

  return {
    id,
    type: instrumentType,
    manufacturer,
    nominalValue,
    status,
    validUntil,
  };
}

function Instruments() {
  const navigate = useNavigate();

  const [instruments, setInstruments] =
    useState<Instrument[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | InstrumentStatus>("All");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadInstruments = async () => {
      const token = getToken();

      if (!token) {
        setErrorMessage(
          "Authentication token not found. Please login again."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          "http://localhost:5000/api/instruments",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          (await response
            .json()
            .catch(() => null)) as
            | InstrumentsResponse
            | null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Unable to load instruments (${response.status}).`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load instruments."
          );
        }

        if (cancelled) {
          return;
        }

        const items =
          Array.isArray(
            data.instruments
          )
            ? data.instruments
                .map(mapInstrument)
                .filter(
                  (item) =>
                    item.id.length > 0
                )
            : [];

        setInstruments(items);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load merchant instruments:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load instruments."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInstruments();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInstruments =
    useMemo(() => {
      return instruments.filter(
        (instrument) => {
          const searchText =
            search.toLowerCase().trim();

          const matchesSearch =
            instrument.id
              .toLowerCase()
              .includes(searchText) ||
            instrument.type
              .toLowerCase()
              .includes(searchText) ||
            instrument.manufacturer
              .toLowerCase()
              .includes(searchText) ||
            instrument.nominalValue
              .toLowerCase()
              .includes(searchText);

          const matchesStatus =
            statusFilter === "All" ||
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

  const total = instruments.length;

  const verified =
    instruments.filter(
      (item) =>
        item.status === "Verified"
    ).length;

  const pending =
    instruments.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const failed =
    instruments.filter(
      (item) =>
        item.status === "Failed"
    ).length;

  const handleViewInstrument = (id: string) => {
    navigate(`/merchant/instruments/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Loading instruments from PostgreSQL...
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Merchant Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Instruments
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and monitor your registered weighing and measuring
            instruments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/merchant/register-instrument")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus size={19} />
          Register Instrument
        </button>
      </div>

      {/* ================= STATISTICS ================= */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <button
          type="button"
          onClick={() => setStatusFilter("All")}
          className="text-left"
        >
          <StatCard
            title="Total Instruments"
            value={String(total)}
            icon={<Scale size={22} />}
            iconClass="bg-cyan-100 text-cyan-600"
          />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Verified")}
          className="text-left"
        >
          <StatCard
            title="Verified"
            value={String(verified).padStart(2, "0")}
            icon={<CheckCircle size={22} />}
            iconClass="bg-green-100 text-green-600"
          />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Pending")}
          className="text-left"
        >
          <StatCard
            title="Pending"
            value={String(pending).padStart(2, "0")}
            icon={<Clock size={22} />}
            iconClass="bg-orange-100 text-orange-600"
          />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Failed")}
          className="text-left"
        >
          <StatCard
            title="Failed"
            value={String(failed).padStart(2, "0")}
            icon={<XCircle size={22} />}
            iconClass="bg-red-100 text-red-600"
          />
        </button>

      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}
        <div className="relative w-full max-w-md">

          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instrument..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">

          {(["All", "Verified", "Pending", "Failed"] as const).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  statusFilter === filter
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            )
          )}

        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Instruments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredInstruments.length} instrument
              {filteredInstruments.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Instrument ID
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Instrument Type
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Manufacturer
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Nominal Value
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Valid Until
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredInstruments.length > 0 ? (

                filteredInstruments.map((instrument) => (

                  <tr
                    key={instrument.id}
                    onClick={() => handleViewInstrument(instrument.id)}
                    className="cursor-pointer transition hover:bg-blue-50"
                  >

                    <td className="px-6 py-5">

                      <span className="font-semibold text-blue-600">
                        {instrument.id}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-sm text-slate-700">
                      {instrument.type}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {instrument.manufacturer}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {instrument.nominalValue}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={instrument.status} />
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {instrument.validUntil}
                    </td>

                    <td className="px-6 py-5">

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInstrument(instrument.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Search
                          size={25}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="text-lg font-semibold text-slate-800">
                        No instruments found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or filter.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                        }}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Clear Filters
                      </button>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

/* ============================= */
/* Statistics Card               */
/* ============================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: StatCardProps) {
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

/* ============================= */
/* Status Badge                  */
/* ============================= */

function StatusBadge({
  status,
}: {
  status: InstrumentStatus;
}) {
  const styles: Record<InstrumentStatus, string> = {
    Verified: "bg-green-100 text-green-700",
    Pending: "bg-orange-100 text-orange-700",
    Failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default Instruments;