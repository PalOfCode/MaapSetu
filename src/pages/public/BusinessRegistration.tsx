import React, {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type Step = 1 | 2 | 3;

interface BusinessForm {
  businessName: string;
  ownerName: string;
  businessType: string;
  registrationNumber: string;
  gstin: string;

  email: string;
  phone: string;

  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;

  username: string;
  password: string;
  confirmPassword: string;
}

/* =========================================
   COMPONENT
========================================= */

function BusinessRegistration() {
  const navigate = useNavigate();

  const [step, setStep] =
    useState<Step>(1);

  const [form, setForm] =
    useState<BusinessForm>({
      businessName: "",
      ownerName: "",
      businessType: "",
      registrationNumber: "",
      gstin: "",

      email: "",
      phone: "",

      address: "",
      city: "",
      district: "",
      state: "",
      pincode: "",

      username: "",
      password: "",
      confirmPassword: "",
    });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================
     INPUT HANDLER
  ========================================= */

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
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
     STEP 1 VALIDATION
  ========================================= */

  const validateStep1 = () => {
    if (
      !form.businessName.trim() ||
      !form.ownerName.trim() ||
      !form.businessType ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError(
        "Please complete all required business and contact details."
      );

      return false;
    }

    const phone =
      form.phone.replace(/\D/g, "");

    if (phone.length !== 10) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );

      return false;
    }

    return true;
  };

  /* =========================================
     STEP 2 VALIDATION
  ========================================= */

  const validateStep2 = () => {
    if (
      !form.address.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.state ||
      !form.pincode.trim()
    ) {
      setError(
        "Please complete all required address details."
      );

      return false;
    }

    const pin =
      form.pincode.replace(/\D/g, "");

    if (pin.length !== 6) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    return true;
  };

  /* =========================================
     STEP 3 VALIDATION
  ========================================= */

  const validateStep3 = () => {
    if (
      !form.username.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError(
        "Please complete all account details."
      );

      return false;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return false;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return false;
    }

    return true;
  };

  /* =========================================
     NEXT STEP
  ========================================= */

  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (!validateStep1()) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) {
        return;
      }

      setStep(3);
    }
  };

  /* =========================================
     PREVIOUS STEP
  ========================================= */

  const previousStep = () => {
    setError("");

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  };

  /* =========================================
     SUBMIT REGISTRATION
  ========================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      /* =======================================
         1. CREATE MERCHANT USER ACCOUNT
      ======================================= */

      const registerResponse =
        await fetch(
          "https://maapsetu-w1sf.onrender.com/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name:
                form.ownerName.trim(),
              email:
                form.email.trim().toLowerCase(),
              phone:
                form.phone.replace(
                  /\D/g,
                  ""
                ),
              password:
                form.password,
              role: "merchant",
            }),
          }
        );

      let registerData: {
        success?: boolean;
        message?: string;
        token?: string;
        user?: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string;
          role?: string;
        };
      } | null = null;

      try {
        registerData =
          await registerResponse.json();
      } catch {
        registerData = null;
      }

      if (
        !registerResponse.ok ||
        !registerData?.success ||
        !registerData.user?.id
      ) {
        throw new Error(
          registerData?.message ||
            "Unable to create merchant account."
        );
      }

      const userId =
        registerData.user.id;

      /* =======================================
         2. CREATE BUSINESS
      ======================================= */

      const businessResponse =
        await fetch(
          "https://maapsetu-w1sf.onrender.com/api/businesses",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...(registerData.token
                ? {
                    Authorization:
                      `Bearer ${registerData.token}`,
                  }
                : {}),
            },
            body: JSON.stringify({
              userId,

              businessName:
                form.businessName.trim(),

              businessType:
                form.businessType,

              ownerName:
                form.ownerName.trim(),

              registrationNumber:
                form.registrationNumber.trim(),

              gstNumber:
                form.gstin.trim(),

              phone:
                form.phone.replace(
                  /\D/g,
                  ""
                ),

              email:
                form.email.trim().toLowerCase(),

              address:
                form.address.trim(),

              city:
                form.city.trim(),

              district:
                form.district.trim(),

              state:
                form.state,

              pincode:
                form.pincode.replace(
                  /\D/g,
                  ""
                ),
            }),
          }
        );

      let businessData: {
        success?: boolean;
        message?: string;
        business?: {
          id?: number;
        };
      } | null = null;

      try {
        businessData =
          await businessResponse.json();
      } catch {
        businessData = null;
      }

      if (
        !businessResponse.ok ||
        !businessData?.success
      ) {
        throw new Error(
          businessData?.message ||
            "Account was created, but business registration failed."
        );
      }

      const businessId =
        businessData.business?.id
          ? `BUS-${String(
              businessData.business.id
            ).padStart(5, "0")}`
          : `BUS-${Date.now()}`;

      /* =======================================
         3. SAVE SESSION
      ======================================= */

      if (registerData.token) {
        localStorage.setItem(
          "almveToken",
          registerData.token
        );
      }

      localStorage.setItem(
        "almveUser",
        JSON.stringify(
          registerData.user
        )
      );

      localStorage.setItem(
        "almveRole",
        "Merchant"
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      /* =======================================
         4. LOCAL CACHE FOR EXISTING PAGES
      ======================================= */

      const registration = {
        businessId,

        userId,

        businessName:
          form.businessName,

        ownerName:
          form.ownerName,

        businessType:
          form.businessType,

        registrationNumber:
          form.registrationNumber,

        GSTIN:
          form.gstin,

        phone:
          form.phone,

        email:
          form.email,

        address:
          form.address,

        city:
          form.city,

        district:
          form.district,

        state:
          form.state,

        pincode:
          form.pincode,

        username:
          form.username,

        status:
          "Active",

        createdAt:
          new Date().toISOString(),
      };

      const existingBusinesses =
        (() => {
          try {
            const stored =
              localStorage.getItem(
                "almveBusinesses"
              );

            if (!stored) {
              return [];
            }

            const parsed =
              JSON.parse(stored);

            return Array.isArray(parsed)
              ? parsed
              : [];
          } catch {
            return [];
          }
        })();

      const businessExists =
        existingBusinesses.some(
          (item: {
            businessId?: string;
          }) =>
            item.businessId ===
            registration.businessId
        );

      const updatedBusinesses =
        businessExists
          ? existingBusinesses.map(
              (item: {
                businessId?: string;
              }) =>
                item.businessId ===
                registration.businessId
                  ? registration
                  : item
            )
          : [
              ...existingBusinesses,
              registration,
            ];

      localStorage.setItem(
        "almveBusinesses",
        JSON.stringify(
          updatedBusinesses
        )
      );

      localStorage.setItem(
        "almveBusinessRegistration",
        JSON.stringify(
          registration
        )
      );

      /* =======================================
         5. SUCCESS
      ======================================= */

      setSuccess(true);
    } catch (error) {
      console.error(
        "Business registration failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to complete registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     SUCCESS SCREEN
  ========================================= */

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f7fa]">

        <div className="flex min-h-screen">

          {/* =================================
              LEFT SUCCESS PANEL
          ================================= */}

          <div className="hidden w-[43%] bg-[#087F3E] px-10 py-10 text-white lg:flex lg:flex-col">

            <BrandHeader dark />

            <div className="my-auto max-w-md">

              <Badge>

                <Check size={15} />

                REGISTRATION COMPLETE

              </Badge>

              <h1 className="mt-8 text-5xl font-bold leading-tight">

                Your Business

                <span className="block">
                  Account is Ready
                </span>

              </h1>

              <p className="mt-6 text-lg leading-8 text-green-50">

                Your business registration has been
                submitted successfully. You can now
                continue to the Legal Metrology portal.

              </p>

              <div className="mt-10 space-y-5">

                <Feature
                  text="Business registration submitted"
                />

                <Feature
                  text="Secure digital verification"
                />

                <Feature
                  text="Access verification services"
                />

              </div>

            </div>

          </div>

          {/* =================================
              RIGHT SUCCESS PANEL
          ================================= */}

          <div className="flex flex-1 items-center justify-center bg-[#f5f7fa] px-5 py-10 sm:px-8 lg:px-12">

            <div className="w-full max-w-2xl">

              <div className="mb-8 lg:hidden">

                <BrandHeader />

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">

                  <CheckCircle2 size={34} />

                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-green-700">

                  Registration Submitted

                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">

                  Business Registration Successful

                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">

                  Your registration details have been
                  saved successfully and are awaiting
                  verification by the concerned authority.

                </p>

                <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">

                  <InfoRow
                    label="Business ID"
                    value={`BUS-${(
                      form.businessName || "NEW"
                    )
                      .replace(
                        /\s+/g,
                        "-"
                      )
                      .toUpperCase()}`}
                  />

                  <InfoRow
                    label="Business Name"
                    value={
                      form.businessName
                    }
                  />

                  <InfoRow
                    label="Owner"
                    value={
                      form.ownerName
                    }
                  />

                  <InfoRow
                    label="Business Type"
                    value={
                      form.businessType
                    }
                  />

                  <InfoRow
                    label="GSTIN"
                    value={
                      form.gstin
                    }
                  />

                  <InfoRow
                    label="Email"
                    value={
                      form.email
                    }
                  />

                  <InfoRow
                    label="Business Location"
                    value={`${form.city}, ${form.district}, ${form.state}`}
                  />

                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/login")
                    }
                    className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >

                    Go to Login

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/merchant/register-instrument"
                      )
                    }
                    className="flex-1 rounded-xl bg-[#087F3E] px-5 py-3 font-semibold text-white transition hover:bg-[#066A34]"
                  >

                    Register Instrument

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================
     MAIN PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-[#f4f6f9]">

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* =====================================
            LEFT PANEL
        ===================================== */}

        <div className="relative hidden w-[43%] overflow-hidden bg-[#087F3E] px-10 py-10 text-white lg:flex lg:flex-col">

          <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10" />

          <div className="absolute -right-12 top-36 h-64 w-64 rounded-full border border-white/10" />

          <div className="absolute -left-36 bottom-[-150px] h-96 w-96 rounded-full border border-white/10" />

          <div className="relative z-10">

            <BrandHeader dark />

          </div>

          <div className="relative z-10 my-auto max-w-md">

            <Badge>
              BUSINESS REGISTRATION
            </Badge>

            <h1 className="mt-8 text-5xl font-bold leading-[1.08]">

              Create your

              <span className="block">
                Business Account
              </span>

            </h1>

            <p className="mt-7 text-lg leading-8 text-green-50">

              Register your business and manage
              instruments, verification applications
              and digital certificates from one secure
              platform.

            </p>

            <div className="mt-10 space-y-5">

              <Feature
                text="Easy Registration"
                description="Simple and secure business onboarding"
              />

              <Feature
                text="Digital Verification"
                description="Apply and track verification online"
              />

              <Feature
                text="Digital Certificates"
                description="Access certificates anytime"
              />

            </div>

          </div>

        </div>

        {/* =====================================
            RIGHT PANEL
        ===================================== */}

        <div className="flex flex-1 justify-center overflow-y-auto bg-[#f5f7fa] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">

          <div className="w-full max-w-4xl">

            {/* Mobile Header */}

            <div className="mb-8 flex items-center justify-between lg:hidden">

              <BrandHeader />

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
              >

                <ArrowLeft size={20} />

              </button>

            </div>

            {/* =================================
                TITLE
            ================================= */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h2 className="text-3xl font-bold text-[#123558] sm:text-4xl">

                  Create Account

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Register your business in a few simple steps.

                </p>

              </div>

              <div className="text-sm text-slate-500">

                Already registered?

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="ml-2 font-bold text-[#087F3E] hover:underline"
                >

                  Sign In

                </button>

              </div>

            </div>

            {/* =================================
                STEPS
            ================================= */}

            <div className="mt-8">

              <div className="relative">

                <div className="absolute left-4 right-4 top-4 h-px bg-slate-300" />

                <div className="relative grid grid-cols-3">

                  <StepIndicator
                    number={1}
                    label="Business"
                    active={
                      step === 1
                    }
                    completed={
                      step > 1
                    }
                  />

                  <StepIndicator
                    number={2}
                    label="Address"
                    active={
                      step === 2
                    }
                    completed={
                      step > 2
                    }
                  />

                  <StepIndicator
                    number={3}
                    label="Account"
                    active={
                      step === 3
                    }
                    completed={false}
                  />

                </div>

              </div>

            </div>

            {/* =================================
                ERROR
            ================================= */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">

                {error}

              </div>
            )}

            {/* =================================
                FORM CARD
            ================================= */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* =================================
                  STEP 1
              ================================= */}

              {step === 1 && (

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    nextStep();
                  }}
                >

                  <FormHeader
                    step="STEP 01"
                    title="Business Information"
                    description="Enter your official business details."
                  />

                  <div className="grid grid-cols-1 gap-6 px-6 pb-6 sm:grid-cols-2 sm:px-10 sm:pb-8">

                    <FormInput
                      label="Business Name"
                      name="businessName"
                      value={
                        form.businessName
                      }
                      placeholder="Enter business name"
                      required
                      onChange={
                        handleChange
                      }
                    />

                    <FormInput
                      label="Owner Name"
                      name="ownerName"
                      value={
                        form.ownerName
                      }
                      placeholder="Enter owner name"
                      required
                      onChange={
                        handleChange
                      }
                    />

                    <FormSelect
                      label="Business Type"
                      name="businessType"
                      value={
                        form.businessType
                      }
                      required
                      options={[
                        "Retail",
                        "Industry",
                        "Service",
                        "Other",
                      ]}
                      onChange={
                        handleChange
                      }
                    />

                    <FormInput
                      label="Registration Number"
                      name="registrationNumber"
                      value={
                        form.registrationNumber
                      }
                      placeholder="Enter registration number"
                      onChange={
                        handleChange
                      }
                    />

                    <FormInput
                      label="GSTIN"
                      name="gstin"
                      value={
                        form.gstin
                      }
                      placeholder="Enter GSTIN if applicable"
                      onChange={
                        handleChange
                      }
                    />

                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={
                        form.email
                      }
                      placeholder="example@business.com"
                      required
                      icon={
                        <Mail size={17} />
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <FormInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={
                        form.phone
                      }
                      placeholder="10-digit mobile number"
                      required
                      icon={
                        <Phone size={17} />
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 sm:mx-10">

                    <ShieldCheck
                      size={17}
                      className="mt-0.5 shrink-0 text-[#087F3E]"
                    />

                    <p className="text-xs leading-5 text-slate-600">

                      Please ensure that business information
                      matches your official documents.

                    </p>

                  </div>

                  <FormFooter
                    showBack={false}
                    onBack={() => {}}
                    nextLabel="Continue"
                  />

                </form>

              )}

              {/* =================================
                  STEP 2
              ================================= */}

              {step === 2 && (

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    nextStep();
                  }}
                >

                  <FormHeader
                    step="STEP 02"
                    title="Business Address"
                    description="Provide the registered operating location."
                  />

                  <div className="space-y-6 px-6 pb-6 sm:px-10 sm:pb-8">

                    <div>

                      <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >

                        Complete Business Address

                        <span className="ml-1 text-red-500">
                          *
                        </span>

                      </label>

                      <div className="relative">

                        <MapPin
                          size={18}
                          className="absolute left-4 top-4 text-slate-400"
                        />

                        <textarea
                          id="address"
                          name="address"
                          value={
                            form.address
                          }
                          onChange={
                            handleChange
                          }
                          rows={4}
                          placeholder="Enter complete business address"
                          className="w-full resize-none rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#087F3E] focus:ring-4 focus:ring-green-100"
                        />

                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                      <FormInput
                        label="City"
                        name="city"
                        value={
                          form.city
                        }
                        placeholder="Enter city"
                        required
                        icon={
                          <MapPin size={17} />
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <FormInput
                        label="District"
                        name="district"
                        value={
                          form.district
                        }
                        placeholder="Enter district"
                        required
                        icon={
                          <MapPin size={17} />
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <FormSelect
                        label="State"
                        name="state"
                        value={
                          form.state
                        }
                        required
                        options={[
                          "Andhra Pradesh",
                          "Arunachal Pradesh",
                          "Assam",
                          "Bihar",
                          "Chhattisgarh",
                          "Delhi",
                          "Goa",
                          "Gujarat",
                          "Haryana",
                          "Himachal Pradesh",
                          "Jharkhand",
                          "Karnataka",
                          "Kerala",
                          "Madhya Pradesh",
                          "Maharashtra",
                          "Odisha",
                          "Punjab",
                          "Rajasthan",
                          "Tamil Nadu",
                          "Telangana",
                          "Uttar Pradesh",
                          "Uttarakhand",
                          "West Bengal",
                          "Other",
                        ]}
                        onChange={
                          handleChange
                        }
                      />

                      <FormInput
                        label="PIN Code"
                        name="pincode"
                        value={
                          form.pincode
                        }
                        placeholder="6-digit PIN code"
                        required
                        icon={
                          <MapPin size={17} />
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                      <div className="flex items-start gap-3">

                        <MapPin
                          size={18}
                          className="mt-0.5 text-[#087F3E]"
                        />

                        <p className="text-xs leading-5 text-slate-600">

                          Provide the registered business
                          address including city, district,
                          state and PIN code.

                        </p>

                      </div>

                    </div>

                  </div>

                  <FormFooter
                    showBack
                    onBack={
                      previousStep
                    }
                    nextLabel="Continue"
                  />

                </form>

              )}

              {/* =================================
                  STEP 3
              ================================= */}

              {step === 3 && (

                <form
                  onSubmit={
                    handleSubmit
                  }
                >

                  <FormHeader
                    step="STEP 03"
                    title="Create Account"
                    description="Set up secure login credentials."
                  />

                  <div className="space-y-6 px-6 pb-6 sm:px-10 sm:pb-8">

                    <FormInput
                      label="Username"
                      name="username"
                      value={
                        form.username
                      }
                      placeholder="Choose a username"
                      required
                      icon={
                        <User size={17} />
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                      <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        value={
                          form.password
                        }
                        placeholder="Minimum 6 characters"
                        required
                        icon={
                          <LockKeyhole
                            size={17}
                          />
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <FormInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={
                          form.confirmPassword
                        }
                        placeholder="Re-enter password"
                        required
                        icon={
                          <LockKeyhole
                            size={17}
                          />
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                      <div className="flex items-start gap-3">

                        <ShieldCheck
                          size={18}
                          className="mt-0.5 shrink-0 text-[#087F3E]"
                        />

                        <div>

                          <p className="text-sm font-semibold text-green-800">
                            Secure Account
                          </p>

                          <p className="mt-1 text-xs leading-5 text-green-700">

                            Use a strong password and
                            keep your account credentials
                            confidential.

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-10">

                    <button
                      type="button"
                      onClick={
                        previousStep
                      }
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >

                      <ArrowLeft size={17} />

                      Back

                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-[#087F3E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#066A34] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {isSubmitting
                        ? "Creating Account..."
                        : "Create Account"}

                      {!isSubmitting && (
                        <Check size={17} />
                      )}

                    </button>

                  </div>

                </form>

              )}

            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

              <LockKeyhole
                size={14}
              />

              Secure digital registration

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   BRAND HEADER
========================================= */

function BrandHeader({
  dark = false,
}: {
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          dark
            ? "bg-white text-[#087F3E]"
            : "bg-[#087F3E] text-white"
        }`}
      >

        <Scale size={27} />

      </div>

      <div>

        <p
          className={`text-lg font-bold ${
            dark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Legal Metrology
        </p>

        <p
          className={`text-xs ${
            dark
              ? "text-green-100"
              : "text-slate-500"
          }`}
        >
          Digital Verification Portal
        </p>

      </div>

    </div>
  );
}

/* =========================================
   BADGE
========================================= */

function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wider text-white">

      {children}

    </div>
  );
}

/* =========================================
   FEATURE
========================================= */

function Feature({
  text,
  description,
}: {
  text: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">

        <Check size={17} />

      </div>

      <div>

        <p className="font-semibold text-white">
          {text}
        </p>

        {description && (
          <p className="mt-0.5 text-xs text-green-100">
            {description}
          </p>
        )}

      </div>

    </div>
  );
}

/* =========================================
   STEP INDICATOR
========================================= */

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">

      <div
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
          completed
            ? "border-[#087F3E] bg-[#087F3E] text-white"
            : active
            ? "border-[#087F3E] bg-[#087F3E] text-white ring-4 ring-green-100"
            : "border-slate-300 bg-white text-slate-400"
        }`}
      >

        {completed ? (
          <Check size={15} />
        ) : (
          number
        )}

      </div>

      <p
        className={`mt-2 text-xs font-semibold ${
          active || completed
            ? "text-[#087F3E]"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

    </div>
  );
}

/* =========================================
   FORM HEADER
========================================= */

function FormHeader({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 pb-6 pt-7 sm:px-10 sm:pt-9">

      <p className="text-xs font-bold tracking-[0.16em] text-[#087F3E]">
        {step}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-[#123558]">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================
   FORM INPUT
========================================= */

function FormInput({
  label,
  name,
  value,
  placeholder,
  required = false,
  type = "text",
  icon,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  icon?: ReactNode;
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

      <div className="relative">

        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

            {icon}

          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          className={`w-full rounded-xl border border-slate-300 bg-white py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#087F3E] focus:ring-4 focus:ring-green-100 ${
            icon
              ? "pl-11 pr-4"
              : "px-4"
          }`}
        />

      </div>

    </div>
  );
}

/* =========================================
   FORM SELECT
========================================= */

function FormSelect({
  label,
  name,
  value,
  required = false,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  options: string[];
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#087F3E] focus:ring-4 focus:ring-green-100"
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
   FORM FOOTER
========================================= */

function FormFooter({
  showBack,
  onBack,
  nextLabel,
}: {
  showBack: boolean;
  onBack: () => void;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-10">

      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >

          <ArrowLeft size={17} />

          Back

        </button>
      ) : (
        <div />
      )}

      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-[#087F3E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#066A34]"
      >

        {nextLabel}

        <ArrowRight size={17} />

      </button>

    </div>
  );
}

/* =========================================
   INFO ROW
========================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4 last:mb-0">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </p>

    </div>
  );
}

export default BusinessRegistration;