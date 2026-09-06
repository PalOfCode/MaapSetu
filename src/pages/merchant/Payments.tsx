import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  IndianRupee,
  Search,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PaymentStatus =
  | "Paid"
  | "Pending"
  | "Failed";

interface Payment {
  id: string;
  applicationId: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  status: PaymentStatus;
}

/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultPayments: Payment[] = [
  {
    id: "PAY-2026-001",
    applicationId: "APP-2024-00123",
    description: "Instrument Verification Fee",
    amount: 850,
    date: "28 Aug 2026",
    method: "UPI",
    status: "Paid",
  },
  {
    id: "PAY-2026-002",
    applicationId: "APP-2024-00124",
    description: "Re-verification Fee",
    amount: 1200,
    date: "29 Aug 2026",
    method: "Card",
    status: "Pending",
  },
  {
    id: "PAY-2026-003",
    applicationId: "APP-2024-00125",
    description: "Inspection Fee",
    amount: 950,
    date: "30 Aug 2026",
    method: "Net Banking",
    status: "Paid",
  },
  {
    id: "PAY-2026-004",
    applicationId: "APP-2024-00126",
    description: "Verification Fee",
    amount: 700,
    date: "30 Aug 2026",
    method: "UPI",
    status: "Failed",
  },
];

const PAYMENT_STORAGE = "merchantPayments";

/* =========================================================
   STORAGE
========================================================= */

function loadPayments(): Payment[] {
  try {
    const stored = localStorage.getItem(
      PAYMENT_STORAGE
    );

    if (!stored) {
      return defaultPayments;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return defaultPayments;
    }

    return parsed.map(
      (item: Partial<Payment>): Payment => ({
        id: String(item.id ?? ""),
        applicationId: String(
          item.applicationId ?? ""
        ),
        description: String(
          item.description ?? ""
        ),
        amount: Number(
          item.amount ?? 0
        ),
        date: String(
          item.date ?? ""
        ),
        method: String(
          item.method ?? ""
        ),
        status:
          item.status === "Paid" ||
          item.status === "Failed" ||
          item.status === "Pending"
            ? item.status
            : "Pending",
      })
    );
  } catch (error) {
    console.error(
      "Unable to load payments:",
      error
    );

    return defaultPayments;
  }
}

function savePayments(
  payments: Payment[]
) {
  try {
    localStorage.setItem(
      PAYMENT_STORAGE,
      JSON.stringify(payments)
    );
  } catch (error) {
    console.error(
      "Unable to save payments:",
      error
    );
  }
}

/* =========================================================
   MAIN
========================================================= */

function Payments() {
  const navigate =
    useNavigate();

  const [payments, setPayments] =
    useState<Payment[]>(
      loadPayments
    );

  const [search, setSearch] =
    useState("");

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredPayments =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) =>
          payment.id
            .toLowerCase()
            .includes(text) ||
          payment.applicationId
            .toLowerCase()
            .includes(text) ||
          payment.description
            .toLowerCase()
            .includes(text) ||
          payment.method
            .toLowerCase()
            .includes(text) ||
          payment.status
            .toLowerCase()
            .includes(text)
      );
    }, [payments, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalPaid =
    payments
      .filter(
        (payment) =>
          payment.status === "Paid"
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

  const pendingAmount =
    payments
      .filter(
        (payment) =>
          payment.status === "Pending"
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

  const failedAmount =
    payments
      .filter(
        (payment) =>
          payment.status === "Failed"
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

  const paidCount =
    payments.filter(
      (payment) =>
        payment.status === "Paid"
    ).length;

  const pendingCount =
    payments.filter(
      (payment) =>
        payment.status === "Pending"
    ).length;

  const failedCount =
    payments.filter(
      (payment) =>
        payment.status === "Failed"
    ).length;

  /* =======================================================
     BACK
  ======================================================= */

  const goBack = () => {
    navigate(
      "/merchant/dashboard"
    );
  };

  /* =======================================================
     COMPLETE PAYMENT
  ======================================================= */

  const completePayment = (
    paymentId: string
  ) => {
    const updatedPayments: Payment[] =
      payments.map(
        (payment): Payment => {
          if (
            payment.id !== paymentId
          ) {
            return payment;
          }

          return {
            ...payment,
            status:
              "Paid" as PaymentStatus,
            method:
              "Online Payment",
            date:
              new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ),
          };
        }
      );

    setPayments(
      updatedPayments
    );

    savePayments(
      updatedPayments
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* BACK */}

        <button
          type="button"
          onClick={goBack}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* HEADER */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-emerald-700">
            Merchant Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Payments
          </h1>

          <p className="mt-2 text-slate-500">
            View verification fees and manage your payments.
          </p>

        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString(
              "en-IN"
            )}`}
            icon={
              <IndianRupee size={22} />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Pending Amount"
            value={`₹${pendingAmount.toLocaleString(
              "en-IN"
            )}`}
            icon={
              <Clock3 size={22} />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Successful Payments"
            value={String(
              paidCount
            )}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Failed Payments"
            value={String(
              failedCount
            )}
            icon={
              <XCircle size={22} />
            }
            iconClass="bg-red-100 text-red-600"
          />

        </div>

        {/* OVERVIEW */}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <OverviewCard
            title="Paid Transactions"
            value={`₹${totalPaid.toLocaleString(
              "en-IN"
            )}`}
            description={`${paidCount} successful transaction${
              paidCount === 1
                ? ""
                : "s"
            }`}
            icon={
              <CheckCircle2
                size={21}
              />
            }
            className="border-green-200 bg-green-50 text-green-700"
          />

          <OverviewCard
            title="Pending Transactions"
            value={`₹${pendingAmount.toLocaleString(
              "en-IN"
            )}`}
            description={`${pendingCount} payment${
              pendingCount === 1
                ? ""
                : "s"
            } awaiting payment`}
            icon={
              <Clock3 size={21} />
            }
            className="border-orange-200 bg-orange-50 text-orange-700"
          />

          <OverviewCard
            title="Failed Transactions"
            value={`₹${failedAmount.toLocaleString(
              "en-IN"
            )}`}
            description={`${failedCount} failed payment${
              failedCount === 1
                ? ""
                : "s"
            }`}
            icon={
              <XCircle size={21} />
            }
            className="border-red-200 bg-red-50 text-red-700"
          />

        </div>

        {/* SEARCH */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative w-full max-w-xl">

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
              placeholder="Search payment ID, application or description..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />

          </div>

        </section>

        {/* TABLE */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Payment History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredPayments.length} payment
                  {filteredPayments.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  found
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">

                Total ₹
                {payments
                  .reduce(
                    (
                      sum,
                      payment
                    ) =>
                      sum +
                      payment.amount,
                    0
                  )
                  .toLocaleString(
                    "en-IN"
                  )}

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Payment ID
                  </TableHead>

                  <TableHead>
                    Application
                  </TableHead>

                  <TableHead>
                    Description
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Method
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

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <span className="font-bold text-emerald-700">
                          {
                            payment.id
                          }
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span className="text-sm font-semibold text-slate-700">
                          {
                            payment.applicationId
                          }
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                            <FileText
                              size={17}
                            />

                          </div>

                          <span className="text-sm font-medium text-slate-700">

                            {
                              payment.description
                            }

                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-1 font-bold text-slate-800">

                          <IndianRupee
                            size={15}
                          />

                          {payment.amount.toLocaleString(
                            "en-IN"
                          )}

                        </div>

                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {payment.date}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {payment.method}
                      </td>

                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            payment.status
                          }
                        />

                      </td>

                      <td className="px-6 py-5">

                        {payment.status ===
                        "Pending" ? (

                          <button
                            type="button"
                            onClick={() =>
                              completePayment(
                                payment.id
                              )
                            }
                            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                          >
                            Pay Now
                          </button>

                        ) : payment.status ===
                          "Failed" ? (

                          <button
                            type="button"
                            onClick={() =>
                              completePayment(
                                payment.id
                              )
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Retry
                          </button>

                        ) : (

                          <span className="text-sm font-semibold text-slate-400">
                            Completed
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

                {filteredPayments.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >

                      <Search
                        size={40}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-700">
                        No payments found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search term.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* NOTE */}

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

          <div className="flex items-start gap-3">

            <CreditCard
              size={21}
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div>

              <p className="text-sm font-bold text-emerald-900">
                Payment Information
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Payment data is currently stored locally
                for prototype testing. Online payment gateway
                integration will be connected with the backend.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

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

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  title,
  value,
  description,
  icon,
  className,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs opacity-75">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const config: Record<
    PaymentStatus,
    {
      className: string;
      icon: ReactNode;
    }
  > = {
    Paid: {
      className:
        "bg-green-100 text-green-700",
      icon: (
        <CheckCircle2 size={13} />
      ),
    },

    Pending: {
      className:
        "bg-orange-100 text-orange-700",
      icon: (
        <Clock3 size={13} />
      ),
    },

    Failed: {
      className:
        "bg-red-100 text-red-700",
      icon: (
        <XCircle size={13} />
      ),
    },
  };

  const item =
    config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${item.className}`}
    >

      {item.icon}

      {status}

    </span>
  );
}

export default Payments;