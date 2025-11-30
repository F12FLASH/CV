
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Edit, Trash, Search, Filter } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  status: "published" | "draft";
  featured: boolean;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: "John Doe",
      role: "CEO",
      company: "TechCorp",
      avatar: "",
      rating: 5,
      content: "Outstanding work! The website exceeded our expectations.",
      status: "published",
      featured: true
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Product Manager",
      company: "StartupXYZ",
      avatar: "",
      rating: 5,
      content: "Professional, creative, and delivered on time.",
      status: "published",
      featured: false
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({});

  const handleDelete = (id: number) => {
    if (confirm("Delete this testimonial?")) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  const toggleFeatured = (id: number) => {
    setTestimonials(testimonials.map(t => 
      t.id === id ? { ...t, featured: !t.featured } : t
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Testimonials</h1>
            <p className="text-muted-foreground">Manage customer reviews and feedback</p>
          </div>
          <Button className="bg-primary gap-2" onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4" /> Add Testimonial
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search testimonials..." className="pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              {testimonial.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500">Featured</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant={testimonial.status === "published" ? "default" : "secondary"}>
                    {testimonial.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(testimonial.id)}
                      className={testimonial.featured ? "text-yellow-500" : ""}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
