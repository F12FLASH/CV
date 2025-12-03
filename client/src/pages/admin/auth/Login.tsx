import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, Shield, ArrowRight, ShieldCheck, Fingerprint, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { startAuthentication } from "@simplewebauthn/browser";

const loginBg = "/uploads/images/admin_login_background.png";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempSessionToken, setTempSessionToken] = useState("");
  const [hasBiometric, setHasBiometric] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const turnstileRef = useRef<HTMLDivElement>(null);

  const {
    isEnabled: captchaEnabled,
    isLoaded: captchaLoaded,
    captchaType,
    executeRecaptcha,
    renderTurnstile,
    honeypotFieldName,
    error: captchaError
  } = useRecaptcha({ formType: 'login', action: 'login' });

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include"
    })
    .then(res => {
      if (res.ok) {
        setLocation("/admin");
      }
    })
    .catch(() => {});
  }, [setLocation]);

  useEffect(() => {
    if (captchaType === 'cloudflare' && captchaLoaded && turnstileRef.current) {
      renderTurnstile('login-turnstile-container');
    }
  }, [captchaType, captchaLoaded, renderTurnstile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (honeypot) {
      return;
    }

    setIsLoading(true);
    
    try {
      let captchaToken: string | null = null;
      
      if (captchaEnabled) {
        captchaToken = await executeRecaptcha();
        if (captchaError) {
          toast({
            title: "Verification Failed",
            description: captchaError,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          username, 
          password,
          captchaToken,
          captchaType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          setTempSessionToken(data.tempToken || "");
          setHasBiometric(data.hasBiometric || false);
          setShow2FADialog(true);
        } else {
          setTimeout(() => {
            window.location.href = "/admin";
          }, 100);
        }
      } else {
        if (data.passwordExpired && data.userId) {
          toast({
            title: "Password Expired",
            description: "Your password has expired. Redirecting to reset...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = `/admin/force-password-reset?userId=${data.userId}`;
          }, 1500);
        } else {
          toast({
            title: "Login Failed",
            description: data.message || "Invalid credentials",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (twoFactorCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: twoFactorCode }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShow2FADialog(false);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 100);
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid code",
          variant: "destructive",
        });
        setTwoFactorCode("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const optionsRes = await fetch("/api/auth/webauthn/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: username }),
      });

      if (!optionsRes.ok) {
        throw new Error("Failed to get authentication options");
      }

      const options = await optionsRes.json();
      const credential = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/webauthn/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      if (verifyRes.ok) {
        setShow2FADialog(false);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 100);
      } else {
        const data = await verifyRes.json();
        toast({
          title: "Biometric Login Failed",
          description: data.message || "Authentication failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Biometric Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src={loginBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6 border-b border-white/5">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-2 ring-1 ring-primary/50">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Access</CardTitle>
            <CardDescription className="text-white/50">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                name={honeypotFieldName}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                aria-hidden="true"
              />

              <div className="space-y-2">
                <Label className="text-white/80">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input 
                    type="text" 
                    placeholder="admin" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all"
                    tabIndex={1}
                    required 
                    data-testid="input-username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label className="text-white/80">Password</Label>
                  <a href="/admin/forgot-password" className="text-xs text-primary hover:text-primary/80" tabIndex={3} data-testid="link-forgot-password">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all"
                    tabIndex={2}
                    required 
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors"
                    tabIndex={4}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {captchaType === 'cloudflare' && (
                <div 
                  id="login-turnstile-container" 
                  ref={turnstileRef}
                  className="flex justify-center"
                  data-testid="login-turnstile-container"
                />
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-2 group relative overflow-hidden"
                disabled={isLoading}
                data-testid="button-login"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Authenticating..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-2 justify-center pt-6 border-t border-white/5">
            {captchaEnabled && captchaType !== 'disabled' && (
              <div className="flex items-center gap-2 text-white/40">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs">
                  {captchaType === 'google' && 'Protected by reCAPTCHA'}
                  {captchaType === 'cloudflare' && 'Protected by Cloudflare'}
                  {captchaType === 'local' && 'Spam protection enabled'}
                </span>
              </div>
            )}
            <p className="text-xs text-white/30 text-center">
              Subject to Privacy Policy and Terms of Service.
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Enter the 6-digit code from your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                data-testid="input-2fa-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/5 border-white/20 text-white" />
                  <InputOTPSlot index={1} className="bg-white/5 border-white/20 text-white" />
                  <InputOTPSlot index={2} className="bg-white/5 border-white/20 text-white" />
                  <InputOTPSlot index={3} className="bg-white/5 border-white/20 text-white" />
                  <InputOTPSlot index={4} className="bg-white/5 border-white/20 text-white" />
                  <InputOTPSlot index={5} className="bg-white/5 border-white/20 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {hasBiometric && (
              <div className="text-center">
                <p className="text-sm text-white/40 mb-3">Or use your registered biometric</p>
                <Button
                  variant="outline"
                  onClick={handleBiometricLogin}
                  disabled={isLoading}
                  className="border-white/20 text-white/80"
                  data-testid="button-biometric-login"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Use Biometric
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShow2FADialog(false);
                setTwoFactorCode("");
              }}
              className="text-white/60"
              data-testid="button-cancel-2fa"
            >
              Cancel
            </Button>
            <Button
              onClick={handle2FAVerify}
              disabled={isLoading || twoFactorCode.length !== 6}
              className="bg-primary text-white"
              data-testid="button-verify-2fa"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
