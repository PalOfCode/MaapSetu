import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";

function InstrumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">

      <button
        onClick={() => navigate("/merchant/instruments")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Back to Instruments
      </button>

      <div className="max-w-4xl rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <CheckCircle size={25} />
          </div>

          <div>
            <p className="text-sm text-blue-600">
              Instrument Details
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              {id}
            </h1>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Instrument Type
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              Electronic Weighing Scale
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Manufacturer
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              Essae
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Nominal Value
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              30 kg
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Status
            </p>

            <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Verified
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Valid Until
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              28 Aug 2028
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default InstrumentDetails;