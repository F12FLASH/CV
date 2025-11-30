import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Lock, Smartphone, Globe, AlertTriangle, Shield as ShieldIcon } from "lucide-react";
import { useState } from "react";

export default function AdminSecurity() {
  const [recaptcha, setRecaptcha] = useState<'disabled' | 'local' | 'google' | 'cloudflare'>('google');
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [passwordExpiration, setPasswordExpiration] = useState(true);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Security Center</h1>
          <p className="text-muted-foreground">Monitor and configure security settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="border-green-500/50 bg-green-500/5">
             <CardContent className="pt-6 flex items-center gap-4">
               <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                 <Shield className="w-6 h-6" />
               </div>
               <div>
                 <div className="font-bold text-lg">System Secure</div>
                 <div className="text-sm text-muted-foreground">No threats detected</div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6 flex items-center gap-4">
               <div className="p-3 rounded-full bg-primary/20 text-primary">
                 <Lock className="w-6 h-6" />
               </div>
               <div>
                 <div className="font-bold text-lg">SSL Certificate</div>
                 <div className="text-sm text-muted-foreground">Valid until Dec 2025</div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6 flex items-center gap-4">
               <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
                 <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                 <div className="font-bold text-lg">2 Warnings</div>
                 <div className="text-sm text-muted-foreground">Check login attempts</div>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Manage how users log in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Two-Factor Authentication (2FA)</div>
                    <div className="text-sm text-muted-foreground">Secure account with mobile app</div>
                  </div>
                </div>
                <Switch checked={twoFaEnabled} onCheckedChange={setTwoFaEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Password Expiration</div>
                    <div className="text-sm text-muted-foreground">Force reset every 90 days</div>
                  </div>
                </div>
                <Switch checked={passwordExpiration} onCheckedChange={setPasswordExpiration} />
              </div>
              <Button variant="outline" className="w-full">Change Master Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>reCAPTCHA Protection</CardTitle>
              <CardDescription>Bot protection for forms and login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recaptcha" 
                    value="google"
                    checked={recaptcha === 'google'}
                    onChange={(e) => setRecaptcha(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Google reCAPTCHA v3</div>
                    <div className="text-xs text-muted-foreground">Invisible, no user interaction required</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recaptcha" 
                    value="cloudflare"
                    checked={recaptcha === 'cloudflare'}
                    onChange={(e) => setRecaptcha(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Cloudflare Turnstile</div>
                    <div className="text-xs text-muted-foreground">Privacy-first, works with adblockers</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recaptcha" 
                    value="local"
                    checked={recaptcha === 'local'}
                    onChange={(e) => setRecaptcha(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Local Verification</div>
                    <div className="text-xs text-muted-foreground">Server-side validation only</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="recaptcha" 
                    value="disabled"
                    checked={recaptcha === 'disabled'}
                    onChange={(e) => setRecaptcha(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Disabled</div>
                    <div className="text-xs text-muted-foreground">No protection enabled</div>
                  </div>
                </label>
              </div>
              {recaptcha !== 'disabled' && recaptcha !== 'local' && (
                <Button variant="outline" className="w-full">
                  Configure {recaptcha === 'google' ? 'Google' : 'Cloudflare'} Keys
                </Button>
              )}
              <Button variant="outline" className="w-full">Save Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Login attempts and sensitive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Login Success", ip: "192.168.1.1", loc: "Ho Chi Minh, VN", time: "Just now", status: "success" },
                  { action: "Settings Updated", ip: "192.168.1.1", loc: "Ho Chi Minh, VN", time: "2 hours ago", status: "success" },
                  { action: "Failed Login", ip: "14.23.55.12", loc: "Hanoi, VN", time: "5 hours ago", status: "failed" },
                  { action: "Backup Created", ip: "System", loc: "Server", time: "Yesterday", status: "success" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                       <div>
                         <div className="font-medium text-sm">{log.action}</div>
                         <div className="text-xs text-muted-foreground">{log.ip} • {log.loc}</div>
                       </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{log.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
