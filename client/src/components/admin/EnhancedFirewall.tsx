import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe, Shield, Ban, Plus, Trash2, Edit, Clock, AlertTriangle,
  Loader2, Filter, Activity, BarChart3, Server, Zap, RefreshCw,
  CheckCircle, XCircle, MapPin
} from "lucide-react";

interface FirewallRule {
  id: number;
  name: string;
  description?: string;
  ruleType: string;
  condition: string;
  value: string;
  action: string;
  priority: number;
  enabled: boolean;
  hitCount: number;
  lastHit?: string;
  expiresAt?: string;
  createdAt?: string;
}

interface GeoBlockingRule {
  id: number;
  countryCode: string;
  countryName: string;
  action: string;
  enabled: boolean;
  createdAt?: string;
}

interface RateLimitRule {
  id: number;
  name: string;
  path: string;
  method: string;
  maxRequests: number;
  windowSeconds: number;
  blockDuration: number;
  enabled: boolean;
  createdAt?: string;
}

interface UserAgentRule {
  id: number;
  name: string;
  pattern: string;
  matchType: string;
  action: string;
  category?: string;
  enabled: boolean;
  createdAt?: string;
}

interface BlockedRequest {
  id: number;
  ipAddress: string;
  path: string;
  method: string;
  reason: string;
  countryCode?: string;
  userAgent?: string;
  createdAt?: string;
}

interface IpRule {
  id: number;
  ipAddress: string;
  type: 'whitelist' | 'blacklist';
  createdAt?: string;
}

const COUNTRY_LIST = [
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'KP', name: 'North Korea' },
  { code: 'IR', name: 'Iran' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'TH', name: 'Thailand' },
  { code: 'EG', name: 'Egypt' },
  { code: 'RO', name: 'Romania' },
  { code: 'BD', name: 'Bangladesh' },
];

const USER_AGENT_PRESETS = [
  { name: 'Block Common Bots', pattern: 'bot|crawler|spider|scraper', matchType: 'regex', category: 'bot' },
  { name: 'Block curl/wget', pattern: 'curl|wget', matchType: 'regex', category: 'tool' },
  { name: 'Block Python Requests', pattern: 'python-requests|httpx', matchType: 'regex', category: 'tool' },
  { name: 'Block Headless Browsers', pattern: 'HeadlessChrome|PhantomJS', matchType: 'regex', category: 'automation' },
  { name: 'Block Empty User Agent', pattern: '^$', matchType: 'regex', category: 'suspicious' },
];

export function EnhancedFirewall() {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("ip-rules");
  const [newWhitelistIp, setNewWhitelistIp] = useState("");
  const [newBlacklistIp, setNewBlacklistIp] = useState("");
  const [showFirewallRuleDialog, setShowFirewallRuleDialog] = useState(false);
  const [showGeoBlockDialog, setShowGeoBlockDialog] = useState(false);
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false);
  const [showUserAgentDialog, setShowUserAgentDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null);

  const [newFirewallRule, setNewFirewallRule] = useState({
    name: '',
    description: '',
    ruleType: 'ip',
    condition: 'equals',
    value: '',
    action: 'block',
    priority: 100,
    enabled: true
  });

  const [selectedCountry, setSelectedCountry] = useState('');
  const [geoAction, setGeoAction] = useState<'block' | 'challenge'>('block');

  const [newRateLimit, setNewRateLimit] = useState({
    name: '',
    path: '/api/*',
    method: '*',
    maxRequests: 100,
    windowSeconds: 60,
    blockDuration: 300
  });

  const [newUserAgent, setNewUserAgent] = useState({
    name: '',
    pattern: '',
    matchType: 'contains',
    action: 'block',
    category: ''
  });

  const { data: ipRules = [] } = useQuery<IpRule[]>({
    queryKey: ['/api/security/ip-rules']
  });

  const { data: firewallRules = [] } = useQuery<FirewallRule[]>({
    queryKey: ['/api/security/firewall-rules']
  });

  const { data: geoBlockingRules = [] } = useQuery<GeoBlockingRule[]>({
    queryKey: ['/api/security/geo-blocking']
  });

  const { data: rateLimitRules = [] } = useQuery<RateLimitRule[]>({
    queryKey: ['/api/security/rate-limit-rules']
  });

  const { data: userAgentRules = [] } = useQuery<UserAgentRule[]>({
    queryKey: ['/api/security/user-agent-rules']
  });

  const { data: blockedRequests = [] } = useQuery<BlockedRequest[]>({
    queryKey: ['/api/security/blocked-requests']
  });

  const { data: blockedStats } = useQuery<{
    total: number;
    byReason: { reason: string; count: number }[];
    byCountry: { country: string; count: number }[];
  }>({
    queryKey: ['/api/security/blocked-requests/stats']
  });

  const whitelistIps = ipRules.filter(r => r.type === 'whitelist');
  const blacklistIps = ipRules.filter(r => r.type === 'blacklist');

  const addIpRuleMutation = useMutation({
    mutationFn: (data: { ipAddress: string; type: 'whitelist' | 'blacklist' }) =>
      apiRequest('POST', '/api/security/ip-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/ip-rules'] });
      setNewWhitelistIp("");
      setNewBlacklistIp("");
      toast({ title: "IP rule added successfully" });
    },
    onError: () => toast({ title: "Failed to add IP rule", variant: "destructive" })
  });

  const deleteIpRuleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/security/ip-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/ip-rules'] });
      toast({ title: "IP rule removed" });
    }
  });

  const createFirewallRuleMutation = useMutation({
    mutationFn: (data: typeof newFirewallRule) =>
      apiRequest('POST', '/api/security/firewall-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/firewall-rules'] });
      setShowFirewallRuleDialog(false);
      setNewFirewallRule({ name: '', description: '', ruleType: 'ip', condition: 'equals', value: '', action: 'block', priority: 100, enabled: true });
      toast({ title: "Firewall rule created" });
    }
  });

  const updateFirewallRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FirewallRule> }) =>
      apiRequest('PATCH', `/api/security/firewall-rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/firewall-rules'] });
      toast({ title: "Rule updated" });
    }
  });

  const deleteFirewallRuleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/security/firewall-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/firewall-rules'] });
      toast({ title: "Rule deleted" });
    }
  });

  const createGeoBlockMutation = useMutation({
    mutationFn: (data: { countryCode: string; countryName: string; action: string }) =>
      apiRequest('POST', '/api/security/geo-blocking', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/geo-blocking'] });
      setShowGeoBlockDialog(false);
      setSelectedCountry('');
      toast({ title: "Country block rule added" });
    }
  });

  const deleteGeoBlockMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/security/geo-blocking/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/geo-blocking'] });
      toast({ title: "Country block removed" });
    }
  });

  const toggleGeoBlockMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiRequest('PATCH', `/api/security/geo-blocking/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/geo-blocking'] });
    }
  });

  const createRateLimitMutation = useMutation({
    mutationFn: (data: typeof newRateLimit) =>
      apiRequest('POST', '/api/security/rate-limit-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rate-limit-rules'] });
      setShowRateLimitDialog(false);
      setNewRateLimit({ name: '', path: '/api/*', method: '*', maxRequests: 100, windowSeconds: 60, blockDuration: 300 });
      toast({ title: "Rate limit rule created" });
    }
  });

  const deleteRateLimitMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/security/rate-limit-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rate-limit-rules'] });
      toast({ title: "Rate limit rule deleted" });
    }
  });

  const toggleRateLimitMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiRequest('PATCH', `/api/security/rate-limit-rules/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rate-limit-rules'] });
    }
  });

  const createUserAgentMutation = useMutation({
    mutationFn: (data: typeof newUserAgent) =>
      apiRequest('POST', '/api/security/user-agent-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/user-agent-rules'] });
      setShowUserAgentDialog(false);
      setNewUserAgent({ name: '', pattern: '', matchType: 'contains', action: 'block', category: '' });
      toast({ title: "User agent rule created" });
    }
  });

  const deleteUserAgentMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/security/user-agent-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/user-agent-rules'] });
      toast({ title: "User agent rule deleted" });
    }
  });

  const toggleUserAgentMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiRequest('PATCH', `/api/security/user-agent-rules/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/user-agent-rules'] });
    }
  });

  const validateIP = (ip: string) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;
    const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})(?:\/(?:12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="stat-card-blocked">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-blocked-count">{blockedStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-card-active-rules">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-active-rules">{firewallRules.filter(r => r.enabled).length}</p>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-card-geo-blocked">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-geo-blocked">{geoBlockingRules.filter(r => r.enabled).length}</p>
                <p className="text-xs text-muted-foreground">Countries Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-card-rate-limits">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-rate-limits">{rateLimitRules.filter(r => r.enabled).length}</p>
                <p className="text-xs text-muted-foreground">Rate Limits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="ip-rules" data-testid="tab-ip-rules">
            <Globe className="w-4 h-4 mr-1" /> IP Rules
          </TabsTrigger>
          <TabsTrigger value="custom-rules" data-testid="tab-custom-rules">
            <Filter className="w-4 h-4 mr-1" /> Custom Rules
          </TabsTrigger>
          <TabsTrigger value="geo-blocking" data-testid="tab-geo-blocking">
            <MapPin className="w-4 h-4 mr-1" /> Geo Blocking
          </TabsTrigger>
          <TabsTrigger value="rate-limits" data-testid="tab-rate-limits">
            <Zap className="w-4 h-4 mr-1" /> Rate Limits
          </TabsTrigger>
          <TabsTrigger value="user-agents" data-testid="tab-user-agents">
            <Server className="w-4 h-4 mr-1" /> User Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ip-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> IP Whitelist / Blacklist
              </CardTitle>
              <CardDescription>Control which IP addresses can access the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> IP Whitelist
                </h4>
                <div className="space-y-2 mb-3">
                  {whitelistIps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No whitelisted IPs</p>
                  ) : (
                    whitelistIps.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 border rounded bg-green-500/5 border-green-500/20">
                        <span className="text-sm font-mono">{rule.ipAddress}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteIpRuleMutation.mutate(rule.id)}
                          data-testid={`button-remove-whitelist-${rule.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add IP address (e.g., 192.168.1.1 or 10.0.0.0/8)"
                    value={newWhitelistIp}
                    onChange={(e) => setNewWhitelistIp(e.target.value)}
                    data-testid="input-whitelist-ip"
                  />
                  <Button
                    onClick={() => {
                      if (newWhitelistIp && validateIP(newWhitelistIp)) {
                        addIpRuleMutation.mutate({ ipAddress: newWhitelistIp, type: 'whitelist' });
                      } else {
                        toast({ title: "Invalid IP address format", variant: "destructive" });
                      }
                    }}
                    disabled={!newWhitelistIp || addIpRuleMutation.isPending}
                    data-testid="button-add-whitelist"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" /> IP Blacklist
                </h4>
                <div className="space-y-2 mb-3">
                  {blacklistIps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No blacklisted IPs</p>
                  ) : (
                    blacklistIps.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-2 border rounded bg-red-500/5 border-red-500/20">
                        <span className="text-sm font-mono">{rule.ipAddress}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteIpRuleMutation.mutate(rule.id)}
                          data-testid={`button-remove-blacklist-${rule.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add IP to block..."
                    value={newBlacklistIp}
                    onChange={(e) => setNewBlacklistIp(e.target.value)}
                    data-testid="input-blacklist-ip"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (newBlacklistIp && validateIP(newBlacklistIp)) {
                        addIpRuleMutation.mutate({ ipAddress: newBlacklistIp, type: 'blacklist' });
                      } else {
                        toast({ title: "Invalid IP address format", variant: "destructive" });
                      }
                    }}
                    disabled={!newBlacklistIp || addIpRuleMutation.isPending}
                    data-testid="button-add-blacklist"
                  >
                    <Ban className="w-4 h-4 mr-1" /> Block
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Custom Firewall Rules
                  </CardTitle>
                  <CardDescription>Create advanced rules based on multiple conditions</CardDescription>
                </div>
                <Button onClick={() => setShowFirewallRuleDialog(true)} data-testid="button-add-custom-rule">
                  <Plus className="w-4 h-4 mr-1" /> Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Hits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firewallRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No custom rules configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    firewallRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.ruleType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {rule.condition} {rule.value}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.action === 'block' ? 'destructive' : rule.action === 'allow' ? 'default' : 'secondary'}>
                            {rule.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>{rule.hitCount}</TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => updateFirewallRuleMutation.mutate({ id: rule.id, data: { enabled } })}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFirewallRuleMutation.mutate(rule.id)}
                              data-testid={`button-delete-rule-${rule.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo-blocking" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Geographic Blocking
                  </CardTitle>
                  <CardDescription>Block or challenge traffic from specific countries</CardDescription>
                </div>
                <Button onClick={() => setShowGeoBlockDialog(true)} data-testid="button-add-geo-block">
                  <Plus className="w-4 h-4 mr-1" /> Add Country
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {geoBlockingRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                    No countries blocked
                  </p>
                ) : (
                  geoBlockingRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        rule.enabled ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/50'
                      }`}
                      data-testid={`geo-block-card-${rule.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCountryFlag(rule.countryCode)}</span>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-country-name-${rule.id}`}>{rule.countryName}</p>
                          <p className="text-xs text-muted-foreground">{rule.countryCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.action === 'block' ? 'destructive' : 'secondary'}>
                          {rule.action}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => toggleGeoBlockMutation.mutate({ id: rule.id, enabled })}
                          data-testid={`switch-geo-block-${rule.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGeoBlockMutation.mutate(rule.id)}
                          data-testid={`button-delete-geo-block-${rule.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Rate Limiting Rules
                  </CardTitle>
                  <CardDescription>Configure per-endpoint request limits</CardDescription>
                </div>
                <Button onClick={() => setShowRateLimitDialog(true)} data-testid="button-add-rate-limit">
                  <Plus className="w-4 h-4 mr-1" /> Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Block Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimitRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No rate limit rules configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    rateLimitRules.map((rule) => (
                      <TableRow key={rule.id} data-testid={`row-rate-limit-${rule.id}`}>
                        <TableCell className="font-medium" data-testid={`text-rate-limit-name-${rule.id}`}>{rule.name}</TableCell>
                        <TableCell className="font-mono text-xs">{rule.path}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.method}</Badge>
                        </TableCell>
                        <TableCell>{rule.maxRequests} req</TableCell>
                        <TableCell>{rule.windowSeconds}s</TableCell>
                        <TableCell>{rule.blockDuration}s</TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRateLimitMutation.mutate({ id: rule.id, enabled })}
                            data-testid={`switch-rate-limit-${rule.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRateLimitMutation.mutate(rule.id)}
                            data-testid={`button-delete-rate-limit-${rule.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-agents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" /> User Agent Filtering
                  </CardTitle>
                  <CardDescription>Block requests based on User-Agent patterns</CardDescription>
                </div>
                <Button onClick={() => setShowUserAgentDialog(true)} data-testid="button-add-user-agent">
                  <Plus className="w-4 h-4 mr-1" /> Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Quick add presets:</span>
                {USER_AGENT_PRESETS.map((preset, index) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => createUserAgentMutation.mutate({
                      name: preset.name,
                      pattern: preset.pattern,
                      matchType: preset.matchType,
                      action: 'block',
                      category: preset.category
                    })}
                    disabled={createUserAgentMutation.isPending}
                    data-testid={`button-preset-${index}`}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Match Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAgentRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No user agent rules configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    userAgentRules.map((rule) => (
                      <TableRow key={rule.id} data-testid={`row-user-agent-${rule.id}`}>
                        <TableCell className="font-medium" data-testid={`text-user-agent-name-${rule.id}`}>{rule.name}</TableCell>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate">{rule.pattern}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.matchType}</Badge>
                        </TableCell>
                        <TableCell>{rule.category || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={rule.action === 'block' ? 'destructive' : 'secondary'}>
                            {rule.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleUserAgentMutation.mutate({ id: rule.id, enabled })}
                            data-testid={`switch-user-agent-${rule.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUserAgentMutation.mutate(rule.id)}
                            data-testid={`button-delete-user-agent-${rule.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" /> Recent Blocked Requests
          </CardTitle>
          <CardDescription>View the latest blocked requests and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No blocked requests
                  </TableCell>
                </TableRow>
              ) : (
                blockedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request.id} data-testid={`row-blocked-request-${request.id}`}>
                    <TableCell className="text-xs" data-testid={`text-blocked-time-${request.id}`}>
                      {request.createdAt ? new Date(request.createdAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs" data-testid={`text-blocked-ip-${request.id}`}>{request.ipAddress}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{request.path}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" data-testid={`badge-blocked-reason-${request.id}`}>{request.reason}</Badge>
                    </TableCell>
                    <TableCell>{request.countryCode || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showFirewallRuleDialog} onOpenChange={setShowFirewallRuleDialog}>
        <DialogContent data-testid="dialog-firewall-rule">
          <DialogHeader>
            <DialogTitle>Add Custom Firewall Rule</DialogTitle>
            <DialogDescription>Create a new firewall rule with custom conditions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={newFirewallRule.name}
                onChange={(e) => setNewFirewallRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Block suspicious paths"
                data-testid="input-rule-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newFirewallRule.description}
                onChange={(e) => setNewFirewallRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                data-testid="input-rule-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Rule Type</label>
                <Select value={newFirewallRule.ruleType} onValueChange={(v) => setNewFirewallRule(prev => ({ ...prev, ruleType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="path">URL Path</SelectItem>
                    <SelectItem value="header">HTTP Header</SelectItem>
                    <SelectItem value="query">Query String</SelectItem>
                    <SelectItem value="method">HTTP Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Condition</label>
                <Select value={newFirewallRule.condition} onValueChange={(v) => setNewFirewallRule(prev => ({ ...prev, condition: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="startsWith">Starts With</SelectItem>
                    <SelectItem value="endsWith">Ends With</SelectItem>
                    <SelectItem value="regex">Regex Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Value</label>
              <Input
                value={newFirewallRule.value}
                onChange={(e) => setNewFirewallRule(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value to match"
                data-testid="input-rule-value"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={newFirewallRule.action} onValueChange={(v) => setNewFirewallRule(prev => ({ ...prev, action: v }))}>
                  <SelectTrigger data-testid="select-rule-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="log">Log Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input
                  type="number"
                  value={newFirewallRule.priority}
                  onChange={(e) => setNewFirewallRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                  data-testid="input-rule-priority"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFirewallRuleDialog(false)} data-testid="button-cancel-rule">Cancel</Button>
            <Button
              onClick={() => createFirewallRuleMutation.mutate(newFirewallRule)}
              disabled={!newFirewallRule.name || !newFirewallRule.value || createFirewallRuleMutation.isPending}
              data-testid="button-create-rule"
            >
              {createFirewallRuleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGeoBlockDialog} onOpenChange={setShowGeoBlockDialog}>
        <DialogContent data-testid="dialog-geo-block">
          <DialogHeader>
            <DialogTitle>Add Country Block</DialogTitle>
            <DialogDescription>Block or challenge traffic from a specific country</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger data-testid="select-geo-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_LIST.filter(c => !geoBlockingRules.some(r => r.countryCode === c.code)).map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {getCountryFlag(country.code)} {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={geoAction} onValueChange={(v) => setGeoAction(v as 'block' | 'challenge')}>
                <SelectTrigger data-testid="select-geo-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block completely</SelectItem>
                  <SelectItem value="challenge">Show CAPTCHA challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGeoBlockDialog(false)} data-testid="button-cancel-geo">Cancel</Button>
            <Button
              onClick={() => {
                const country = COUNTRY_LIST.find(c => c.code === selectedCountry);
                if (country) {
                  createGeoBlockMutation.mutate({
                    countryCode: country.code,
                    countryName: country.name,
                    action: geoAction
                  });
                }
              }}
              disabled={!selectedCountry || createGeoBlockMutation.isPending}
              data-testid="button-add-geo-block"
            >
              {createGeoBlockMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRateLimitDialog} onOpenChange={setShowRateLimitDialog}>
        <DialogContent data-testid="dialog-rate-limit">
          <DialogHeader>
            <DialogTitle>Add Rate Limit Rule</DialogTitle>
            <DialogDescription>Configure rate limiting for specific endpoints</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={newRateLimit.name}
                onChange={(e) => setNewRateLimit(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Login API limit"
                data-testid="input-rate-limit-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Path Pattern</label>
              <Input
                value={newRateLimit.path}
                onChange={(e) => setNewRateLimit(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/api/auth/*"
                data-testid="input-rate-limit-path"
              />
            </div>
            <div>
              <label className="text-sm font-medium">HTTP Method</label>
              <Select value={newRateLimit.method} onValueChange={(v) => setNewRateLimit(prev => ({ ...prev, method: v }))}>
                <SelectTrigger data-testid="select-rate-limit-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">All Methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Max Requests</label>
                <Input
                  type="number"
                  value={newRateLimit.maxRequests}
                  onChange={(e) => setNewRateLimit(prev => ({ ...prev, maxRequests: parseInt(e.target.value) || 100 }))}
                  data-testid="input-rate-limit-max"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Window (seconds)</label>
                <Input
                  type="number"
                  value={newRateLimit.windowSeconds}
                  onChange={(e) => setNewRateLimit(prev => ({ ...prev, windowSeconds: parseInt(e.target.value) || 60 }))}
                  data-testid="input-rate-limit-window"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Block Duration (s)</label>
                <Input
                  type="number"
                  value={newRateLimit.blockDuration}
                  onChange={(e) => setNewRateLimit(prev => ({ ...prev, blockDuration: parseInt(e.target.value) || 300 }))}
                  data-testid="input-rate-limit-block-duration"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateLimitDialog(false)} data-testid="button-cancel-rate-limit">Cancel</Button>
            <Button
              onClick={() => createRateLimitMutation.mutate(newRateLimit)}
              disabled={!newRateLimit.name || !newRateLimit.path || createRateLimitMutation.isPending}
              data-testid="button-create-rate-limit"
            >
              {createRateLimitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserAgentDialog} onOpenChange={setShowUserAgentDialog}>
        <DialogContent data-testid="dialog-user-agent">
          <DialogHeader>
            <DialogTitle>Add User Agent Rule</DialogTitle>
            <DialogDescription>Block requests based on User-Agent header patterns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={newUserAgent.name}
                onChange={(e) => setNewUserAgent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Block scrapers"
                data-testid="input-user-agent-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pattern</label>
              <Input
                value={newUserAgent.pattern}
                onChange={(e) => setNewUserAgent(prev => ({ ...prev, pattern: e.target.value }))}
                placeholder="e.g., bot|crawler|spider"
                data-testid="input-user-agent-pattern"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Match Type</label>
                <Select value={newUserAgent.matchType} onValueChange={(v) => setNewUserAgent(prev => ({ ...prev, matchType: v }))}>
                  <SelectTrigger data-testid="select-user-agent-match-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={newUserAgent.action} onValueChange={(v) => setNewUserAgent(prev => ({ ...prev, action: v }))}>
                  <SelectTrigger data-testid="select-user-agent-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="log">Log Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Category (optional)</label>
              <Input
                value={newUserAgent.category}
                onChange={(e) => setNewUserAgent(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., bot, tool, automation"
                data-testid="input-user-agent-category"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserAgentDialog(false)} data-testid="button-cancel-user-agent">Cancel</Button>
            <Button
              onClick={() => createUserAgentMutation.mutate(newUserAgent)}
              disabled={!newUserAgent.name || !newUserAgent.pattern || createUserAgentMutation.isPending}
              data-testid="button-create-user-agent"
            >
              {createUserAgentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
