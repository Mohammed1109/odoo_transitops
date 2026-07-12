import { useState } from "react";
import { toast } from "sonner";
import {
    Eye,
    EyeOff,
    CheckCircle2,
    Circle,
    ChevronRight,
    ShieldCheck,
    UserPlus,
    Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Light navy + amber identity — matches the TransitOps login screen.
const transitOpsGradient = `
  radial-gradient(
    800px 600px at 85% 15%,
    rgba(224, 141, 44, 0.18),
    transparent 60%
  ),
  radial-gradient(
    700px 500px at 15% 85%,
    rgba(27, 58, 92, 0.22),
    transparent 60%
  ),
  linear-gradient(
    145deg,
    #0b1f33 0%,
    #1b3a5c 35%,
    #2e5478 65%,
    #eaf0f6 100%
  )
`;

// const ACCENT = "#E08D2C";
// const ACCENT_DARK = "#C77A1F";

/* ======================================================
   TYPES
====================================================== */
type SetupStep = 1 | 2;

interface Step1Form {
    username: string;
    password: string;
    confirmPassword: string;
}

interface Step2Form {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/* ======================================================
   LOADING OVERLAY
====================================================== */
const LoadingOverlay = ({ loading, message }: { loading: boolean; message?: string }) => {
    if (!loading) return null;
    return (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl gap-3">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-[#E08D2C]/20 border-t-[#E08D2C] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#E08D2C] animate-pulse" />
                </div>
            </div>
            {message && (
                <p className="text-sm text-[#C77A1F]/80 font-mono tracking-wider animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

/* ======================================================
   PASSWORD INPUT
====================================================== */
const PasswordInput = ({
    value,
    onChange,
    placeholder,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? "Enter password"}
                disabled={disabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-11
                   text-slate-800 placeholder-slate-400 text-sm
                   focus:outline-none focus:border-[#E08D2C]/50 focus:ring-1 focus:ring-[#E08D2C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            />
            <button
                type="button"
                onClick={() => setShow((p) => !p)}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E08D2C] transition-colors"
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
};

/* ======================================================
   FIELD
====================================================== */
const Field = ({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {label}
            {required && <span className="text-[#E08D2C] ml-1">*</span>}
        </label>
        {children}
    </div>
);

/* ======================================================
   TEXT INPUT
====================================================== */
const TextInput = ({
    value,
    onChange,
    placeholder,
    disabled,
    type = "text",
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
}) => (
    <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5
               text-slate-800 placeholder-slate-400 text-sm
               focus:outline-none focus:border-[#E08D2C]/50 focus:ring-1 focus:ring-[#E08D2C]/20
               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    />
);

/* ======================================================
   STEP 1 — RESET ROOT CREDENTIALS
====================================================== */
const Step1ResetCredentials = ({
    onNext,
    isLoading,
    setIsLoading,
    setLoadingMessage,
}: {
    onNext: () => void;
    isLoading: boolean;
    setIsLoading: (v: boolean) => void;
    setLoadingMessage: (v: string) => void;
}) => {
    const [form, setForm] = useState<Step1Form>({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (key: keyof Step1Form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.username.trim()) {
            toast.error("Username is required");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Resetting root credentials...");

        // design-only mock — swap for the real API call when wiring this up
        setTimeout(() => {
            toast.success("Root credentials updated successfully");
            setIsLoading(false);
            setLoadingMessage("");
            onNext();
        }, 900);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Root Username" required>
                <TextInput
                    value={form.username}
                    onChange={(v) => handleChange("username", v)}
                    placeholder="root"
                    disabled={isLoading}
                />
            </Field>

            <Field label="New Password" required>
                <PasswordInput
                    value={form.password}
                    onChange={(v) => handleChange("password", v)}
                    placeholder="Min. 6 characters"
                    disabled={isLoading}
                />
            </Field>

            <Field label="Confirm Password" required>
                <PasswordInput
                    value={form.confirmPassword}
                    onChange={(v) => handleChange("confirmPassword", v)}
                    placeholder="Repeat password"
                    disabled={isLoading}
                />
            </Field>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E08D2C] hover:bg-[#C77A1F]
                     text-white font-bold text-sm rounded-xl transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-[0_4px_14px_rgba(224,141,44,0.35)]"
                >
                    Continue
                    <ChevronRight size={16} />
                </button>
            </div>
        </form>
    );
};

/* ======================================================
   STEP 2 — CREATE LOCAL ADMIN
====================================================== */
const Step2CreateAdmin = ({
    onFinish,
    onBack,
    isLoading,
    setIsLoading,
    setLoadingMessage,
}: {
    onFinish: () => void;
    onBack: () => void;
    isLoading: boolean;
    setIsLoading: (v: boolean) => void;
    setLoadingMessage: (v: string) => void;
}) => {
    const [form, setForm] = useState<Step2Form>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const set = (key: keyof Step2Form, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.username.trim() || !form.email.trim()) {
            toast.error("Username and email are required");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Creating local admin...");

        // design-only mock — swap for the real API call when wiring this up
        setTimeout(() => {
            toast.success("Local admin created successfully");
            setIsLoading(false);
            setLoadingMessage("");
            onFinish();
        }, 900);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <Field label="Username" required>
                    <TextInput
                        value={form.username}
                        onChange={(v) => set("username", v)}
                        placeholder="admin"
                        disabled={isLoading}
                    />
                </Field>
                <Field label="Email Address" required>
                    <TextInput
                        value={form.email}
                        onChange={(v) => set("email", v)}
                        placeholder="admin@transitops.in"
                        type="email"
                        disabled={isLoading}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Password" required>
                    <PasswordInput
                        value={form.password}
                        onChange={(v) => set("password", v)}
                        placeholder="Min. 6 characters"
                        disabled={isLoading}
                    />
                </Field>
                <Field label="Confirm Password" required>
                    <PasswordInput
                        value={form.confirmPassword}
                        onChange={(v) => set("confirmPassword", v)}
                        placeholder="Repeat password"
                        disabled={isLoading}
                    />
                </Field>
            </div>

            <div className="flex justify-between pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:border-[#E08D2C]/40
                     text-slate-500 hover:text-slate-800 text-sm rounded-xl transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E08D2C] hover:bg-[#C77A1F]
                     text-white font-bold text-sm rounded-xl transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-[0_4px_14px_rgba(224,141,44,0.35)]"
                >
                    Finish Setup
                    <ChevronRight size={16} />
                </button>
            </div>
        </form>
    );
};

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function FirstTimeSetup() {
    const navigate = useNavigate();

    const [step, setStep] = useState<SetupStep>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const stepMeta = [
        { step: 1 as SetupStep, label: "Reset Credentials", sublabel: "Secure root account", icon: ShieldCheck },
        { step: 2 as SetupStep, label: "Create Admin", sublabel: "Local administrator", icon: UserPlus },
    ];

    const stepTitles: Record<SetupStep, { title: string; description: string }> = {
        1: {
            title: "Reset Root Credentials",
            description: "Set a new password for the root account. This ensures your deployment is secured before proceeding.",
        },
        2: {
            title: "Create Local Admin",
            description: "Create a dedicated local administrator account for day-to-day platform management.",
        },
    };

    const handleFinish = () => {
        setIsLoading(true);
        setLoadingMessage("Finalizing setup...");

        // design-only mock — swap for the real API call when wiring this up
        setTimeout(() => {
            toast.success("Setup complete! Redirecting to login...");
            setIsLoading(false);
            setLoadingMessage("");
            navigate("/login");
        }, 900);
    };

    return (
        <div
            className="min-h-screen flex overflow-hidden"
            style={{ background: transitOpsGradient }}
        >
            {/* =========================================================
                LEFT PANEL
            ========================================================= */}
            <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 border-r border-slate-200 bg-white relative overflow-hidden">
                {/* Subtle grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(224,141,44,1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(224,141,44,1) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Glow spots */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#E08D2C]/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#1B3A5C]/6 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col h-full px-10 py-12 gap-10">
                    {/* Brand */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-[#0B1F33] flex items-center justify-center
                                  shadow-[0_0_24px_rgba(224,141,44,0.35)]"
                            >
                                <Activity className="w-5 h-5 text-[#E08D2C]" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-black text-slate-800 tracking-tight">
                                Transit<span className="text-[#E08D2C]">Ops</span>
                            </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-[#E08D2C]/30 via-slate-200 to-transparent mt-1" />

                        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">
                            First-Time Setup
                        </p>
                    </div>

                    {/* Product headline */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-bold text-slate-800 leading-snug">
                            Smart Transport{" "}
                            <span className="text-[#E08D2C]">Operations</span>{" "}
                            Platform
                        </h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Secure the root account and create your first local admin.
                            Your progress is kept as you move between the two steps.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex flex-col gap-1 mt-auto">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">
                            Setup Progress
                        </p>

                        {stepMeta.map((s, i) => {
                            const isCompleted = step > s.step;
                            const isActive = step === s.step;
                            const Icon = s.icon;

                            return (
                                <div key={s.step} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                                            ${isCompleted
                                                    ? "bg-[#E08D2C] shadow-[0_0_16px_rgba(224,141,44,0.4)]"
                                                    : isActive
                                                        ? "bg-[#E08D2C]/10 border border-[#E08D2C]/40"
                                                        : "bg-slate-100 border border-slate-200"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                                            ) : (
                                                <Icon className={`w-4 h-4 ${isActive ? "text-[#E08D2C]" : "text-slate-400"}`} />
                                            )}
                                        </div>

                                        {i < stepMeta.length - 1 && (
                                            <div
                                                className={`w-px h-8 mt-1 transition-all duration-300 ${isCompleted ? "bg-[#E08D2C]/40" : "bg-slate-200"
                                                    }`}
                                            />
                                        )}
                                    </div>

                                    <div className="pt-1 pb-8">
                                        <p className={`text-sm font-semibold transition-colors duration-200 ${isActive ? "text-slate-800" : isCompleted ? "text-[#C77A1F]" : "text-slate-400"
                                            }`}>
                                            {s.label}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">{s.sublabel}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer note */}
                    <div className="border-t border-slate-200 pt-6">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Need help?{" "}
                            <a href="#" className="text-[#E08D2C]/80 hover:text-[#E08D2C] transition-colors">
                                View documentation
                            </a>{" "}
                            or contact your system administrator.
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================================
                RIGHT PANEL
            ========================================================= */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 xl:p-16 overflow-y-auto relative">
                {/* Mobile brand header */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0B1F33] flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#E08D2C]" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-black text-white">
                        Transit<span className="text-[#E08D2C]">Ops</span>
                    </span>
                </div>

                {/* Mobile step pills */}
                <div className="lg:hidden absolute top-6 right-6 flex items-center gap-1.5">
                    {stepMeta.map((s) => (
                        <div
                            key={s.step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${step === s.step ? "w-6 bg-[#E08D2C]" : "w-3 bg-white/50"
                                }`}
                        />
                    ))}
                </div>

                {/* Wizard card */}
                <div className="w-full max-w-[560px]">
                    {/* Step counter */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
                            <Circle className="w-2 h-2 text-[#E08D2C] fill-[#E08D2C]" />
                            <span className="text-xs font-semibold text-white font-mono">
                                STEP {step} OF 2
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div
                        className="relative bg-white border border-slate-200 rounded-2xl p-6 overflow-hidden
                          shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]"
                    >
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E08D2C]/50 to-transparent" />

                        <LoadingOverlay loading={isLoading} message={loadingMessage} />

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                {(() => {
                                    const Icon = stepMeta[step - 1].icon;
                                    return (
                                        <div className="w-10 h-10 rounded-xl bg-[#0B1F33] flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-[#E08D2C]" />
                                        </div>
                                    );
                                })()}
                                <h1 className="text-xl font-bold text-slate-800">
                                    {stepTitles[step].title}
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed pl-[52px]">
                                {stepTitles[step].description}
                            </p>
                        </div>

                        {/* Step content */}
                        {step === 1 && (
                            <Step1ResetCredentials
                                onNext={() => setStep(2)}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                setLoadingMessage={setLoadingMessage}
                            />
                        )}
                        {step === 2 && (
                            <Step2CreateAdmin
                                onFinish={handleFinish}
                                onBack={() => setStep(1)}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                setLoadingMessage={setLoadingMessage}
                            />
                        )}
                    </div>

                    {/* Bottom note */}
                    <p className="text-center text-xs text-white/80 mt-6">
                        Progress is kept locally.{" "}
                        <span className="text-white">Refresh safely.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}