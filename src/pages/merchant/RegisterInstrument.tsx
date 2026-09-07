import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Camera,
  CheckCircle,
  FileText,
  Save,
  Upload,
  X,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

interface FormState {
  instrumentId: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;

  capacity: string;
  accuracy: string;
  category: string;

  yearOfManufacture: string;
  purchaseDate: string;

  location: string;

  lastVerificationDate: string;
  nextVerificationDate: string;
}


/* =========================================
   INITIAL FORM
========================================= */

const initialForm: FormState = {
  instrumentId: "",
  instrumentType: "",
  manufacturer: "",
  model: "",
  serialNumber: "",

  capacity: "",
  accuracy: "",
  category: "",

  yearOfManufacture: "",
  purchaseDate: "",

  location: "",

  lastVerificationDate: "",
  nextVerificationDate: "",
};

/* =========================================
   COMPONENT
========================================= */

function RegisterInstrument() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(
      initialForm
    );

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [document, setDocument] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /* =========================================
     PHOTO UPLOAD
  ========================================= */

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 5 MB."
      );

      return;
    }

    setPhoto(file);

    const preview =
      URL.createObjectURL(file);

    setPhotoPreview(preview);

    setError("");
  };

  /* =========================================
     REMOVE PHOTO
  ========================================= */

  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setPhoto(null);
    setPhotoPreview("");
  };

  /* =========================================
     DOCUMENT UPLOAD
  ========================================= */

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please upload PDF, JPG, PNG or DOC/DOCX."
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Document size must be less than 10 MB."
      );

      return;
    }

    setDocument(file);

    setError("");
  };

  /* =========================================
     REMOVE DOCUMENT
  ========================================= */

  const removeDocument = () => {
    setDocument(null);
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = (): string => {
    if (
      !form.instrumentId.trim()
    ) {
      return (
        "Please enter Instrument ID."
      );
    }

    if (
      !form.instrumentType
    ) {
      return (
        "Please select Instrument Type."
      );
    }

    if (
      !form.manufacturer.trim()
    ) {
      return (
        "Please enter Manufacturer."
      );
    }

    if (
      !form.model.trim()
    ) {
      return (
        "Please enter Model."
      );
    }

    if (
      !form.serialNumber.trim()
    ) {
      return (
        "Please enter Serial Number."
      );
    }

    if (
      !form.capacity.trim()
    ) {
      return (
        "Please enter Capacity."
      );
    }

    if (
      !form.accuracy.trim()
    ) {
      return (
        "Please enter Accuracy."
      );
    }

    if (
      !form.category
    ) {
      return (
        "Please select Category."
      );
    }

    if (
      !form.yearOfManufacture
    ) {
      return (
        "Please select Year of Manufacture."
      );
    }

    if (
      !form.purchaseDate
    ) {
      return (
        "Please select Purchase Date."
      );
    }

    if (
      !form.location.trim()
    ) {
      return (
        "Please enter Location."
      );
    }

    const year =
      Number(
        form.yearOfManufacture
      );

    const currentYear =
      new Date().getFullYear();

    if (
      Number.isNaN(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      return (
        "Please enter a valid manufacturing year."
      );
    }

    return "";
  };

  /* =========================================
     AUTH TOKEN
  ========================================= */

  const getAuthToken = () => {
    return localStorage.getItem("almveToken") || "";
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const token = getAuthToken();

    if (!token) {
      setError(
        "Your session has expired. Please login again before registering an instrument."
      );

      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        "https://maapsetu-w1sf.onrender.com/api/instruments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            instrumentId:
              form.instrumentId.trim(),

            instrumentType:
              form.instrumentType,

            manufacturer:
              form.manufacturer.trim(),

            model:
              form.model.trim(),

            serialNumber:
              form.serialNumber.trim(),

            capacity:
              form.capacity.trim(),

            accuracy:
              form.accuracy.trim(),

            category:
              form.category,

            yearOfManufacture:
              Number(
                form.yearOfManufacture
              ),

            purchaseDate:
              form.purchaseDate,

            location:
              form.location.trim(),

            lastVerificationDate:
              form.lastVerificationDate ||
              null,

            nextVerificationDate:
              form.nextVerificationDate ||
              null,

            photoName:
              photo?.name || null,

            documentName:
              document?.name || null,
          }),
        }
      );

      let data: {
        success?: boolean;
        message?: string;
        instrument?: {
          id?: number;
          instrument_code?: string;
          application_number?: string;
        };
        application?: {
          application_number?: string;
          status?: string;
        };
      } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        setError(
          data?.message ||
            "Unable to register instrument. Please try again."
        );

        return;
      }

      /*
       * PostgreSQL is the source of truth.
       * Do not duplicate instrument/application data in localStorage.
       */

      setSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate(
          "/merchant/instruments"
        );
      }, 1200);
    } catch (submitError) {
      console.error(
        "Instrument registration error:",
        submitError
      );

      setError(
        "Cannot connect to the ALMVE server. Make sure the backend is running on port 5000."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     JSX
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-8 flex items-start gap-4">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/merchant/instruments"
              )
            }
            className="mt-7 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-green-50 hover:text-green-700 active:scale-95"
            aria-label="Back"
          >

            <ArrowLeft size={23} />

          </button>

          <div>

            <p className="text-sm font-semibold text-green-700">
              Merchant Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Register Instrument
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Register a weighing or measuring instrument for verification.
            </p>

          </div>

        </div>

        {/* =====================================
            SUCCESS
        ===================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">

            <CheckCircle
              size={22}
            />

            <div>

              <p className="font-semibold">
                Instrument registered successfully.
              </p>

              <p className="text-sm">
                Application created successfully. Redirecting...
              </p>

            </div>

          </div>
        )}

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

            <div className="flex items-center gap-3">

              <X size={21} />

              <p className="font-medium">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-2 transition hover:bg-red-100"
              aria-label="Close error"
            >

              <X size={18} />

            </button>

          </div>
        )}

        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >

          {/* =====================================
              INSTRUMENT INFORMATION
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">

                <ScaleIcon />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Instrument Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the details required for instrument registration.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Instrument ID */}

              <FormInput
                label="Instrument ID"
                name="instrumentId"
                value={
                  form.instrumentId
                }
                placeholder="Example: INS-005"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Instrument Type */}

              <FormSelect
                label="Instrument Type"
                name="instrumentType"
                value={
                  form.instrumentType
                }
                required
                options={[
                  "Electronic Weighing Scale",
                  "Platform Scale",
                  "Digital Weighing Machine",
                  "Counter Weighing Scale",
                  "Spring Balance",
                  "Measuring Instrument",
                ]}
                onChange={
                  handleInputChange
                }
              />

              {/* Manufacturer */}

              <FormInput
                label="Manufacturer"
                name="manufacturer"
                value={
                  form.manufacturer
                }
                placeholder="Example: Essae"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Model */}

              <FormInput
                label="Model"
                name="model"
                value={
                  form.model
                }
                placeholder="Example: DS-30"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Serial */}

              <FormInput
                label="Serial Number"
                name="serialNumber"
                value={
                  form.serialNumber
                }
                placeholder="Enter serial number"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Capacity */}

              <FormInput
                label="Capacity"
                name="capacity"
                value={
                  form.capacity
                }
                placeholder="Example: 30 kg"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Accuracy */}

              <FormInput
                label="Accuracy"
                name="accuracy"
                value={
                  form.accuracy
                }
                placeholder="Example: ±10 g"
                required
                onChange={
                  handleInputChange
                }
              />

              {/* Category */}

              <FormSelect
                label="Category"
                name="category"
                value={
                  form.category
                }
                required
                options={[
                  "Weighing Instrument",
                  "Measuring Instrument",
                  "Commercial Scale",
                  "Industrial Scale",
                  "Retail Scale",
                  "Other",
                ]}
                onChange={
                  handleInputChange
                }
              />

            </div>

          </section>

          {/* =====================================
              MANUFACTURING DETAILS
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8">

              <h2 className="text-xl font-bold text-slate-900">
                Manufacturing & Purchase Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide the manufacturing and purchase information.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Year */}

              <div>

                <label
                  htmlFor="yearOfManufacture"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >

                  Year of Manufacture

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <input
                  id="yearOfManufacture"
                  type="number"
                  name="yearOfManufacture"
                  value={
                    form.yearOfManufacture
                  }
                  min="1900"
                  max={
                    new Date().getFullYear()
                  }
                  placeholder="Example: 2025"
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />

              </div>

              {/* Purchase Date */}

              <div>

                <label
                  htmlFor="purchaseDate"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >

                  Purchase Date

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <input
                  id="purchaseDate"
                  type="date"
                  name="purchaseDate"
                  value={
                    form.purchaseDate
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>

          </section>

          {/* =====================================
              LOCATION
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">

                <MapPinIcon />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Instrument Location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Provide the location where the instrument is installed or operated.
                </p>

              </div>

            </div>

            <FormInput
              label="Location"
              name="location"
              value={
                form.location
              }
              placeholder="Example: Kolkata Warehouse"
              required
              onChange={
                handleInputChange
              }
            />

          </section>

          {/* =====================================
              VERIFICATION HISTORY
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8">

              <h2 className="text-xl font-bold text-slate-900">
                Verification Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Optional previous verification information.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>

                <label
                  htmlFor="lastVerificationDate"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Last Verification Date
                </label>

                <input
                  id="lastVerificationDate"
                  type="date"
                  name="lastVerificationDate"
                  value={
                    form.lastVerificationDate
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />

              </div>

              <div>

                <label
                  htmlFor="nextVerificationDate"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Next Verification Date
                </label>

                <input
                  id="nextVerificationDate"
                  type="date"
                  name="nextVerificationDate"
                  value={
                    form.nextVerificationDate
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>

          </section>

          {/* =====================================
              NAMEPLATE PHOTO
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-7 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">

                <Camera size={26} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Instrument Evidence
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload a clear photo of the instrument nameplate.
                </p>

              </div>

            </div>

            <input
              id="nameplate"
              type="file"
              accept="image/*"
              onChange={
                handlePhotoChange
              }
              className="hidden"
            />

            {!photo ? (

              <label
                htmlFor="nameplate"
                className="flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-green-400 hover:bg-green-50/30"
              >

                <Camera
                  size={42}
                  className="mb-5 text-slate-400"
                />

                <p className="text-lg font-semibold text-slate-800">
                  Upload Nameplate Photo
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  JPG, PNG or other image formats up to 5 MB
                </p>

                <span className="mt-6 flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-green-800">

                  <Camera size={18} />

                  Choose Photo

                </span>

              </label>

            ) : (

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Instrument nameplate"
                    className="mx-auto max-h-[350px] rounded-xl object-contain"
                  />
                )}

                <div className="mt-5 flex flex-col items-center gap-3">

                  <p className="font-semibold text-slate-800">
                    {photo.name}
                  </p>

                  <div className="flex gap-3">

                    <label
                      htmlFor="nameplate"
                      className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-50"
                    >
                      Change Photo
                    </label>

                    <button
                      type="button"
                      onClick={
                        removePhoto
                      }
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>

            )}

          </section>

          {/* =====================================
              DOCUMENTS
          ===================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-7 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">

                <FileText size={26} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Supporting Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload supporting documents related to the instrument.
                </p>

              </div>

            </div>

            <input
              id="supporting-document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={
                handleDocumentChange
              }
              className="hidden"
            />

            {!document ? (

              <label
                htmlFor="supporting-document"
                className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 transition hover:border-green-400 hover:bg-green-50/30"
              >

                <Upload
                  size={22}
                  className="text-slate-500"
                />

                <span className="font-semibold text-slate-700">
                  Upload Supporting Document
                </span>

              </label>

            ) : (

              <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">

                    <FileText
                      size={21}
                      className="text-green-700"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-slate-800">
                      {document.name}
                    </p>

                    <p className="text-sm text-green-700">
                      Document uploaded
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    removeDocument
                  }
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-100"
                  aria-label="Remove document"
                >

                  <X size={19} />

                </button>

              </div>

            )}

          </section>

          {/* =====================================
              SUBMIT
          ===================================== */}

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/merchant/instruments"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={success || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {success ? (
                <>
                  <CheckCircle
                    size={19}
                  />

                  Registered

                </>
              ) : isSubmitting ? (
                <>
                  <Save
                    size={19}
                    className="animate-pulse"
                  />

                  Registering...

                </>
              ) : (
                <>
                  <Save size={19} />

                  Register Instrument

                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =========================================
   FORM INPUT COMPONENT
========================================= */

function FormInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  type = "text",
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        autoComplete="off"
        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />

    </div>
  );
}

/* =========================================
   SELECT COMPONENT
========================================= */

function FormSelect({
  label,
  name,
  value,
  options,
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  required?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <select
        id={name}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      >

        <option value="">
          Select {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  );
}

/* =========================================
   SCALE ICON
========================================= */

function ScaleIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M12 3v18" />

      <path d="M5 6h14" />

      <path d="M5 6l-3 6a3 3 0 0 0 6 0L5 6Z" />

      <path d="M19 6l-3 6a3 3 0 0 0 6 0l-3-6Z" />

      <path d="M8 21h8" />

    </svg>
  );
}

/* =========================================
   MAP PIN ICON
========================================= */

function MapPinIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />

    </svg>
  );
}

export default RegisterInstrument;