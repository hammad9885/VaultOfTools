"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  CircleAlert,
  CircleCheck,
  Link,
} from "lucide-react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const [success, setSuccess] = useState("");

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Remove error while typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // Validate Form
  const validateForm = () => {
    let valid = true;

    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
    };

    // Email Validation
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

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
      valid = false;
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Use uppercase, lowercase & number";
      valid = false;
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
      valid = false;
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
      valid = false;
    }

    // Terms
    if (!formData.terms) {
      newErrors.terms =
        "You must accept terms and conditions";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  // Submit
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccess("");

    if (validateForm()) {
      setSuccess("Account created successfully!");

      console.log(formData);

      // Reset Form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
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
              <UserPlus className="text-white" size={28} />
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Create Account
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Join and explore powerful AI tools
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

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
                  placeholder="Create a password"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full h-12 pl-11 pr-12 rounded-xl border bg-slate-50/70 text-slate-800 placeholder:text-slate-400 outline-none transition
                  ${
                    errors.confirmPassword
                      ? "border-red-300 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <CircleAlert size={15} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />

                <span className="text-sm text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <span className="text-sky-600 font-medium">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-sky-600 font-medium">
                    Privacy Policy
                  </span>
                </span>
              </label>

              {errors.terms && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <CircleAlert size={15} />
                  {errors.terms}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-linear-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;