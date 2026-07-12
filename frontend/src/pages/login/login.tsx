import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ShieldCheck,
  Truck,
  ArrowRight,

  MapPin,
  TrendingUp,
  DollarSign,
} from "lucide-react";

import {
  loginUser,
  requestPasswordReset,
  ROLES,
  ROLE_HOME,
  ROLE_SCOPE,
  type Role,
} from "../../ts/login/login";


const FEATURES = [
  {
    title: "Real-time Insights",
    body: "Live dashboard and analytics for smarter decisions.",
    icon: TrendingUp,
  },
  {
    title: "Automated Compliance",
    body: "License alerts, maintenance schedules and safety monitoring.",
    icon: ShieldCheck,
  },
  {
    title: "Reduce Operational Costs",
    body: "Track fuel, expenses and performance to improve ROI.",
    icon: DollarSign,
  },
];

// Decorative pins scattered over the hero photo (purely visual)
const MAP_PINS = [
  { top: "42%", left: "38%" },
  { top: "56%", left: "58%" },
  { top: "72%", left: "18%" },
];

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Dispatcher");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await loginUser({ email, password, role, rememberMe });

      if (!res.success) {
        setError(res.message || "Invalid credentials.");
        return;
      }

      if (res.isFirstLogin) {
        navigate("/reset-password");
        return;
      }

      toast.success(`Signed in as ${res.role ?? role}`);
      navigate(ROLE_HOME[res.role ?? role]);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      setForgotSending(true);
      const res = await requestPasswordReset({ email: forgotEmail });
      if (res.success) {
        toast.success("Reset link sent — check your inbox.");
        setForgotOpen(false);
        setForgotEmail("");
      } else {
        toast.error(res.message || "Could not send reset email.");
      }
    } finally {
      setForgotSending(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white relative overflow-hidden flex">
      {/* ================= LEFT — BRAND / HERO ================= */}
      <div className="hidden lg:flex lg:w-[54%] h-screen relative flex-col justify-between overflow-hidden px-14 py-12 bg-[#0B0F1A]">
        {/* dusk highway photo */}
        <img
          src="/loginimage.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* wash so text stays legible over the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/70 to-[#160B2E]/60" />
        <div className="pointer-events-none absolute -top-24 -left-16 w-[420px] h-[420px] bg-[#6D5DFB]/25 rounded-full blur-[130px]" />

        {/* location pins over the photo, connected by a faint dashed trail */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-60"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
        >
          <path
            d="M 140 640 C 260 560, 300 500, 300 430 S 420 330, 460 260"
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeDasharray="6 10"
            className="animate-route-dash"
          />
        </svg>
        {MAP_PINS.map((p, i) => (
          <div
            key={i}
            className="absolute z-10 -translate-x-1/2 -translate-y-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
            style={{ top: p.top, left: p.left }}
          >
            <MapPin size={26} className="text-[#B7ACFF] fill-[#6D5DFB]/40" />
          </div>
        ))}

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#6D5DFB]/20 border border-[#8B7CFF]/40 flex items-center justify-center">
            <Truck size={18} className="text-[#B7ACFF]" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Transit<span className="text-[#B7ACFF]">Ops</span>
          </span>
        </div>

        {/* headline + features */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-white text-[38px] leading-[1.12] font-semibold tracking-tight mb-4">
            Smart Operations.
            <br />
            Stronger <span className="text-[#B7ACFF]">Fleet.</span>
          </h1>
          <p className="text-[#C8CBE0] text-[14.5px] leading-relaxed mb-9">
            Manage vehicles, drivers, trips, maintenance and expenses — all in
            one intelligent platform.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3.5 items-start">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#6D5DFB]/20 border border-[#8B7CFF]/30 flex items-center justify-center">
                  <f.icon size={16} className="text-[#B7ACFF]" />
                </div>
                <div>
                  <div className="text-white text-[13.5px] font-medium">
                    {f.title}
                  </div>
                  <div className="text-[#9DA1BE] text-[12.5px] leading-relaxed">
                    {f.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="relative z-10 flex items-center gap-2 text-[11.5px] text-[#9DA1BE]">
          <Lock size={12} className="text-[#8087A6]" />
          Secure &bull; Reliable &bull; Efficient
        </div>
      </div>

      {/* ================= RIGHT — FORM ================= */}
      <div className="w-full lg:w-[46%] h-screen flex items-center justify-center px-8 sm:px-16 bg-white relative">
        <div className="w-full max-w-md relative z-10">
          {!forgotOpen ? (
            <div>
              <h2 className="font-bold text-[30px] text-gray-900 mb-1.5 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-[14px] text-gray-500 mb-8">
                Sign in to continue to TransitOps
              </p>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed mb-5">
                  <span>⚠</span>
                  <div>
                    <b className="block font-semibold mb-0.5 text-red-700">
                      Sign-in failed
                    </b>
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[13.5px] font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7C6DFF] focus:ring-2 focus:ring-[#7C6DFF]/15 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13.5px] font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-[12.5px] font-medium text-[#7C6DFF] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7C6DFF] focus:ring-2 focus:ring-[#7C6DFF]/15 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13.5px] font-medium text-gray-700 mb-1.5">
                    Role (RBAC)
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full pl-10 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#7C6DFF] focus:ring-2 focus:ring-[#7C6DFF]/15 focus:bg-white transition-colors appearance-none cursor-pointer"
                    >
                      {ROLES.map((r: Role) => (
                        <option key={r} value={r}>
                          {r} &mdash; {ROLE_SCOPE[r]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[15px] h-[15px] accent-[#7C6DFF] cursor-pointer"
                  />
                  Remember me
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-b from-[#7C6DFF] to-[#5B4CE0] text-white font-semibold text-[14.5px] shadow-[0_10px_24px_-8px_rgba(108,93,251,0.45)] hover:shadow-[0_14px_28px_-8px_rgba(108,93,251,0.5)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>


              <div className="flex items-center gap-3.5 bg-[#F5F3FF] border border-[#E4E0FF] rounded-xl px-4 py-3.5 mt-6 relative overflow-hidden">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white border border-[#DCD6FF] flex items-center justify-center">
                  <ShieldCheck size={17} className="text-[#7C6DFF]" />
                </div>
                <div className="relative z-10">
                  <div className="text-[13px] font-semibold text-gray-900">
                    Secure Access
                  </div>
                  <div className="text-[12px] text-gray-500 leading-relaxed">
                    Your data is protected with enterprise-grade security and
                    role-based access control.
                  </div>
                </div>
                <ShieldCheck
                  size={90}
                  className="absolute -right-4 -bottom-4 text-[#7C6DFF]/10"
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-bold text-[28px] text-gray-900 mb-1.5 tracking-tight">
                Reset your password
              </h2>
              <p className="text-[13.5px] text-gray-500 mb-8">
                We'll email you a link to reset it.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-[13.5px] font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Your registered email"
                      required
                      className="w-full pl-10 pr-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7C6DFF] focus:ring-2 focus:ring-[#7C6DFF]/15 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotSending}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-b from-[#7C6DFF] to-[#5B4CE0] text-white font-semibold text-[14.5px] shadow-[0_10px_24px_-8px_rgba(108,93,251,0.45)] disabled:opacity-60"
                >
                  {forgotSending ? "Sending..." : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="w-full text-center text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* keyframes not expressible via Tailwind utility classes */}
      <style>{`
        @keyframes route-dash { to { stroke-dashoffset: -130; } }
        .animate-route-dash { animation: route-dash 3.2s linear infinite; }
      `}</style>
    </div>
  );
}