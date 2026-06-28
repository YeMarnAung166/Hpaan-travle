import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import Input from "./ui/Input";
import Button from "./ui/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { t } = useLanguage();
  const { toast } = useToast();
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!EMAIL_REGEX.test(email)) errs.email = "Invalid email format";
    if (mode !== "reset") {
      if (!password) errs.password = "Password is required";
      else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else onClose();
    } else if (mode === "reset") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
        toast({ type: 'success', message: 'Password reset email sent. Check your inbox.' });
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) setError(signUpError.message);
      else onClose();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });
    if (error) setError(error.message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 className="text-2xl font-serif font-bold text-text mb-4">
          {mode === "login" ? t("auth.login") : mode === "reset" ? (resetSent ? "Check Your Email" : "Reset Password") : t("auth.signup")}
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error text-error rounded-lg text-sm">
            {error}
          </div>
        )}
        {resetSent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📧</div>
            <p className="text-text-soft mb-4">We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.</p>
            <Button variant="outline" onClick={() => { setMode("login"); setResetSent(false); setError(""); }}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Input
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: null })); }}
              error={fieldErrors.email}
            />
            {mode !== "reset" && (
              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: null })); }}
                error={fieldErrors.password}
              />
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? t("auth.processing")
                : mode === "login"
                ? t("auth.login")
                : mode === "reset"
                ? "Send Reset Link"
                : t("auth.signup")}
            </Button>
          </form>
        )}

        {/* Forgot password / Divider / Social — only show if not resetSent */}
        {!resetSent && (
          <>
            {mode === "login" && (
              <div className="text-right mt-2">
                <button onClick={() => { setMode("reset"); setError(""); }} className="text-sm text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-neutral-dark px-3 text-text-soft font-medium">
                  or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                <span className="text-lg">🌐</span>
                <span>Continue with Google</span>
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-text-soft">
              {mode === "login" ? (
                <>
                  {t("auth.no_account")}{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    {t("auth.sign_up")}
                  </button>
                </>
              ) : mode === "reset" ? (
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Back to Login
                </button>
              ) : (
                <>
                  {t("auth.have_account")}{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    {t("auth.login_here")}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-soft hover:text-text transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}