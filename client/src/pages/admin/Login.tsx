import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@assets/generated_images/admin_login_background.png";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        setLocation("/admin");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
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
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white/80">Password</Label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:bg-white/10 transition-all"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-2 group relative overflow-hidden"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Authenticating..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-6 border-t border-white/5">
             <p className="text-xs text-white/30 text-center">
               Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
             </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
