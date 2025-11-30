import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash, Users } from "lucide-react";

export default function AdminRoles() {
  const roles = [
    { id: 1, name: "Super Admin", users: 1, permissions: 45, color: "bg-red-500" },
    { id: 2, name: "Admin", users: 3, permissions: 38, color: "bg-orange-500" },
    { id: 3, name: "Editor", users: 5, permissions: 20, color: "bg-blue-500" },
    { id: 4, name: "Subscriber", users: 128, permissions: 5, color: "bg-green-500" },
  ];

  const permissions = [
    { group: "Posts", items: ["Create", "Edit", "Delete", "Publish"] },
    { group: "Projects", items: ["Create", "Edit", "Delete", "View"] },
    { group: "Users", items: ["Create", "Edit", "Delete", "Manage Roles"] },
    { group: "Settings", items: ["View", "Edit", "Access Logs"] },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage user roles and access levels</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full ${role.color}`} />
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-bold">{role.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {role.users}
                  </div>
                  <Badge variant="secondary" className="text-xs">{role.permissions} perms</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-bold">Permission</th>
                    {roles.map((role) => (
                      <th key={role.id} className="text-center py-2 px-2">{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.flatMap((group) =>
                    group.items.map((item, idx) => (
                      <tr key={`${group.group}-${item}`} className="border-b last:border-0">
                        <td className="py-3 px-2">{idx === 0 ? <strong>{group.group}</strong> : null} {item}</td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center">
                            <Switch defaultChecked={role.id <= 2} />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
