import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ChevronDown, ShieldCheck } from "lucide-react";

import {
  loginUser,
  requestPasswordReset,
  ROLES,
  ROLE_HOME,
  ROLE_SCOPE,
  type Role,
} from "../../ts/login/login";

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
    <div className="w-full h-screen bg-[#EEF1F5] relative overflow-hidden">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[500px] bg-[#E08D2C]/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-[500px] h-[400px] bg-[#1B3A5C]/10 rounded-full blur-[120px]" />

      <div className="flex h-screen w-full bg-[#F4F6F9]">
        {/* ================= LEFT — DISPATCH BOARD ================= */}
        <div className="hidden lg:block w-[55%] h-screen">
          <img
            src="/loginImage.png"
            alt="TransitOps"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ================= RIGHT — FORM ================= */}
        <div className="md:w-[55%] w-full flex items-center justify-center px-16">
          <div
            className="
        w-full
        max-w-md
        bg-white
        rounded-3xl
        shadow-2xl
        border
        border-gray-200
        p-10
    "
          >            <>
              {!forgotOpen ? (
                <div>
                  <h2 className="font-semibold text-2xl text-[#16212B] mb-1.5">
                    Sign in to your account
                  </h2>
                  <p className="text-[13.5px] text-[#5B6774] mb-7">
                    Enter your credentials to continue.
                  </p>

                  {error && (
                    <div className="flex items-start gap-2.5 bg-[#FCEEEE] border border-[#F3C6C6] text-[#9E2B2B] rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed mb-5 font-mono">
                      <span>⚠</span>
                      <div>
                        <b className="block font-sans font-semibold mb-0.5">
                          Sign-in failed
                        </b>
                        {error}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-[18px]">
                    <div>
                      <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#8A93A0] mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6AFB9]"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="raveen.k@transitops.in"
                          required
                          className="w-full pl-10 pr-3.5 py-3 bg-[#FAFBFC] border border-[#DDE2E8] rounded-[11px] text-sm outline-none focus:border-[#E08D2C] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#8A93A0] mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6AFB9]"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-11 py-3 bg-[#FAFBFC] border border-[#DDE2E8] rounded-[11px] text-sm outline-none focus:border-[#E08D2C] focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A93A0] hover:text-[#C77A1F] transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#8A93A0] mb-1.5">
                        Role (RBAC)
                      </label>
                      <div className="relative">
                        <ShieldCheck
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6AFB9]"
                        />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as Role)}
                          className="w-full pl-10 pr-9 py-3 bg-[#FAFBFC] border border-[#DDE2E8] rounded-[11px] text-sm outline-none focus:border-[#E08D2C] focus:bg-white transition-colors appearance-none cursor-pointer"
                        >
                          {ROLES.map((r: Role) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A93A0] pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[13px] pt-0.5">
                      <label className="flex items-center gap-2 text-[#5B6774] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-[15px] h-[15px] accent-[#E08D2C] cursor-pointer"
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotOpen(true)}
                        className="text-[#C77A1F] font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-[11px] bg-gradient-to-b from-[#E08D2C] to-[#C77A1F] text-white font-semibold text-[14.5px] shadow-[0_10px_20px_-8px_rgba(199,122,31,0.55)] hover:shadow-[0_14px_24px_-8px_rgba(199,122,31,0.6)] hover:-translate-y-px transition-all disabled:opacity-60 disabled:translate-y-0"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-6 text-[10.5px] uppercase text-[#8A93A0] font-mono">
                    <span className="flex-1 h-px bg-[#DDE2E8]" />
                    Access after login
                    <span className="flex-1 h-px bg-[#DDE2E8]" />
                  </div>

                  <div className="bg-[#F6F7F9] border border-[#DDE2E8] rounded-xl px-4 py-3.5">
                    <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#8A93A0] mb-2">
                      Scope by role
                    </div>
                    {ROLES.map((r: Role) => (
                      <div
                        key={r}
                        className="flex justify-between text-[12.5px] text-[#5B6774] py-1"
                      >
                        <span>{r}</span>
                        <b className="text-[#16212B] font-semibold">{ROLE_SCOPE[r]}</b>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold text-2xl text-[#16212B] mb-1.5">
                    Reset your password
                  </h2>
                  <p className="text-[13.5px] text-[#5B6774] mb-7">
                    We'll email you a link to reset it.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block font-mono text-[10.5px] uppercase tracking-wider text-[#8A93A0] mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6AFB9]"
                        />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Your registered email"
                          required
                          className="w-full pl-10 pr-3.5 py-3 bg-[#FAFBFC] border border-[#DDE2E8] rounded-[11px] text-sm outline-none focus:border-[#E08D2C] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotSending}
                      className="w-full py-3.5 rounded-[11px] bg-gradient-to-b from-[#E08D2C] to-[#C77A1F] text-white font-semibold text-[14.5px] shadow-[0_10px_20px_-8px_rgba(199,122,31,0.55)] disabled:opacity-60"
                    >
                      {forgotSending ? "Sending..." : "Send reset link"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="w-full text-center text-[13px] text-[#5B6774] hover:text-[#16212B] transition-colors"
                    >
                      ← Back to sign in
                    </button>
                  </form>
                </div>
              )}
            </>
          </div>
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