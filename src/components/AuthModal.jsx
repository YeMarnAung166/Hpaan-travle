import { useState, useRef, useEffect, useCallback } from "react";
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
  const modalRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement;
    modalRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (prevFocus && prevFocus !== document.body) prevFocus.focus();
    };
  }, [isOpen, handleKeyDown]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
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
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
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