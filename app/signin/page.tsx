"use client";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  CircleAlert,
  CircleCheck
} from "lucide-react";
import Link from "next/link";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [success, setSuccess] = useState("");
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
    };
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      newErrors.email = "Invalid email address";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSuccess("");
    if (validateForm()) {
      setSuccess("Login successful!");
      console.log(formData);
      setFormData({
        email: "",
        password: "",
        remember: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={28} />
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Sign in to continue to your account
            </p>
          </div>
          {success && (
            <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              <CircleCheck size={18} />
              {success}
            </div>
          )}
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-slate-50/70 text-slate-800 placeholder:text-slate-400 outline-none transition
                  ${
                    errors.email
                      ? "border-red-300 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  }`}
                />
              </div>

              {errors.email && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <CircleAlert size={15} />
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-11 pr-12 rounded-xl border bg-slate-50/70 text-slate-800 placeholder:text-slate-400 outline-none transition
                  ${
                    errors.password
                      ? "border-red-300 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <CircleAlert size={15} />
                  {errors.password}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />

                <span className="text-sm text-slate-600">
                  Remember me
                </span>
              </label>

              <span className="text-xs text-slate-400">
                Secure Login
              </span>
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-linear-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              Sign In
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
              >
                Google
              </button>

              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
              >
                GitHub
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-slate-500 mt-8">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;