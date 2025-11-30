import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdvancedSearch } from "@/components/admin/advanced-search";
import { Pagination } from "@/components/admin/pagination";
import { useState } from "react";
import { Plus, Clock, Eye, Edit, Trash, Calendar } from "lucide-react";

export default function AdminPostsEnhanced() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editorContent, setEditorContent] = useState("# Welcome\n\nStart writing...");
  const [activeTab, setActiveTab] = useState("published");

  const posts = [
    {
      id: 1,
      title: "Getting Started with React 19",
      category: "Development",
      status: "Published",
      date: "Mar 20, 2024",
      views: 1542,
      excerpt: "Learn the new features in React 19...",
      scheduled: false,
    },
    {
      id: 2,
      title: "Web Design Trends 2024",
      category: "Design",
      status: "Draft",
      date: "Mar 19, 2024",
      views: 0,
      excerpt: "Explore the latest design trends...",
      scheduled: false,
    },
    {
      id: 3,
      title: "Performance Optimization Tips",
      category: "Development",
      status: "Scheduled",
      date: "Mar 25, 2024",
      views: 0,
      excerpt: "Optimize your web app for speed...",
      scheduled: true,
    },
  ];

  const searchFilters = [
    {
      label: "Status",
      key: "status",
      options: ["Published", "Draft", "Scheduled", "Archived"],
    },
    {
      label: "Category",
      key: "category",
      options: ["Development", "Design", "Business", "Other"],
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        <AdvancedSearch onSearch={() => {}} filters={searchFilters} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-4">
            {posts
              .filter((p) => p.status === "Published")
              .map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold">{post.title}</h3>
                          <Badge>{post.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {post.excerpt}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {post.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Post Title" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Category" />
                  <Input placeholder="Tags (comma-separated)" />
                </div>
                <RichEditor
                  value={editorContent}
                  onChange={setEditorContent}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="SEO Title" />
                  <Input placeholder="SEO Keywords" />
                </div>
                <Input
                  placeholder="Meta Description"
                  className="col-span-2"
                />
                <div className="flex gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Schedule...</Button>
                  <Button className="bg-primary">Publish</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {posts
              .filter((p) => p.scheduled)
              .map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{post.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                          <Clock className="w-4 h-4" />
                          Scheduled for {post.date}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
