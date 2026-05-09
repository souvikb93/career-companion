import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);

export default function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const sendCode = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Code sent — check your inbox");
    setStep("code");
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate("/", { replace: true });
  };

  const signInGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGradientAnimation interactive />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-line rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-2 justify-center mb-6">
            <img src={logo} alt="Tracka logo" className="h-10 w-10" />
            <span className="logo-wordmark text-[28px] leading-none text-ink">tracka</span>
          </div>

          <h1 className="text-xl font-semibold text-ink text-center">
            {step === "email" ? "Sign in to tracka" : "Check your email"}
          </h1>
          <p className="text-sm text-ink-muted text-center mt-1 mb-6">
            {step === "email"
              ? "Enter your email — we'll send you a 6-digit code"
              : `We sent a code to ${email}`}
          </p>

          {step === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  autoFocus
                />
              </div>
              <Button
                onClick={sendCode}
                disabled={loading}
                className="w-full bg-ink text-white hover:bg-brand"
              >
                {loading ? "Sending…" : "Send code"}
              </Button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-line" />
                <span className="text-xs text-ink-muted">or</span>
                <div className="flex-1 h-px bg-line" />
              </div>

              <Button
                variant="outline"
                onClick={signInGoogle}
                disabled={loading}
                className="w-full"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full bg-ink text-white hover:bg-brand"
              >
                {loading ? "Verifying…" : "Verify & sign in"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => { setStep("email"); setCode(""); }}
                  className="text-ink-muted hover:text-ink"
                >
                  ← Use a different email
                </button>
                <button
                  onClick={sendCode}
                  disabled={loading}
                  className="text-ink-muted hover:text-ink"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
