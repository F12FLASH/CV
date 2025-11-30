import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Trash,
  ShoppingBag,
  DollarSign,
  Check,
  Image as ImageIcon,
  Move
} from "lucide-react";
import { useState } from "react";

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Services & Sales</h1>
            <p className="text-muted-foreground">Manage your service offerings and pricing packages</p>
          </div>
        </div>

        <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="services">Services Listing</TabsTrigger>
            <TabsTrigger value="packages">Pricing Packages</TabsTrigger>
          </TabsList>

          {/* Services Content */}
          <TabsContent value="services" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
               <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search services..." className="pl-9" />
               </div>
               <Button className="bg-primary gap-2">
                  <Plus className="w-4 h-4" /> Add Service
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { title: "Web Development", icon: "code", desc: "Full-stack web applications built with React & Node.js", price: "Starting at $1000" },
                 { title: "UI/UX Design", icon: "palette", desc: "Modern, user-centric interfaces and experiences", price: "Starting at $500" },
                 { title: "Mobile Apps", icon: "smartphone", desc: "Native and cross-platform mobile solutions", price: "Starting at $1500" },
               ].map((service, i) => (
                  <Card key={i} className="relative group hover:border-primary/50 transition-colors">
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreVertical className="w-4 h-4" />
                        </Button>
                     </div>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                           <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <ShoppingBag className="w-5 h-5" />
                           </div>
                           {service.title}
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{service.desc}</p>
                        <div className="flex items-center justify-between text-sm">
                           <span className="font-semibold">{service.price}</span>
                           <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8">Edit</Button>
                           </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border flex gap-2 overflow-x-auto pb-2">
                           {[1,2,3].map(n => (
                              <div key={n} className="w-16 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                 <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
          </TabsContent>

          {/* Packages Content */}
          <TabsContent value="packages" className="space-y-6 mt-6">
             <div className="flex justify-end">
               <Button className="bg-primary gap-2">
                  <Plus className="w-4 h-4" /> Create Package
               </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { name: "Basic", price: "$500", promo: "$450", features: ["Homepage Design", "Contact Form", "Mobile Responsive", "1 Month Support"] },
                  { name: "Pro", price: "$1200", promo: null, features: ["5 Pages", "CMS Integration", "SEO Optimization", "3 Months Support", "Payment Gateway"] },
                  { name: "Enterprise", price: "$3000", promo: "$2800", features: ["Custom Features", "Advanced Analytics", "Priority Support", "1 Year Maintenance", "Cloud Hosting"] },
               ].map((pkg, i) => (
                  <Card key={i} className={`relative ${i === 1 ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                     {i === 1 && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                     <CardHeader className="text-center">
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <div className="mt-2">
                           {pkg.promo ? (
                              <div className="flex flex-col items-center">
                                 <span className="text-sm text-muted-foreground line-through">{pkg.price}</span>
                                 <span className="text-3xl font-bold text-primary">{pkg.promo}</span>
                              </div>
                           ) : (
                              <span className="text-3xl font-bold">{pkg.price}</span>
                           )}
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <ul className="space-y-3">
                           {pkg.features.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                 <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                 <span>{f}</span>
                              </li>
                           ))}
                        </ul>
                        <Button className="w-full" variant={i === 1 ? "default" : "outline"}>
                           <Edit className="w-4 h-4 mr-2" /> Edit Package
                        </Button>
                        
                        <div className="pt-4 border-t border-border">
                           <p className="text-xs text-center text-muted-foreground mb-2">Payment Integration</p>
                           <div className="flex justify-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">Momo</Badge>
                              <Badge variant="secondary" className="text-[10px]">ZaloPay</Badge>
                              <Badge variant="secondary" className="text-[10px]">Bank</Badge>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}