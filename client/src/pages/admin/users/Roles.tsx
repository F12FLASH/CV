import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  Eye, 
  Edit, 
  Trash,
  Plus,
  Save,
  Check,
  X
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
}

const allPermissions: Permission[] = [
  { id: "posts.view", name: "View Posts", description: "Can view all posts" },
  { id: "posts.create", name: "Create Posts", description: "Can create new posts" },
  { id: "posts.edit", name: "Edit Posts", description: "Can edit existing posts" },
  { id: "posts.delete", name: "Delete Posts", description: "Can delete posts" },
  { id: "projects.view", name: "View Projects", description: "Can view all projects" },
  { id: "projects.create", name: "Create Projects", description: "Can create new projects" },
  { id: "projects.edit", name: "Edit Projects", description: "Can edit existing projects" },
  { id: "projects.delete", name: "Delete Projects", description: "Can delete projects" },
  { id: "users.view", name: "View Users", description: "Can view user list" },
  { id: "users.create", name: "Create Users", description: "Can create new users" },
  { id: "users.edit", name: "Edit Users", description: "Can edit user accounts" },
  { id: "users.delete", name: "Delete Users", description: "Can delete user accounts" },
  { id: "settings.view", name: "View Settings", description: "Can view system settings" },
  { id: "settings.edit", name: "Edit Settings", description: "Can modify system settings" },
  { id: "media.upload", name: "Upload Media", description: "Can upload media files" },
  { id: "media.delete", name: "Delete Media", description: "Can delete media files" },
];

const defaultRoles: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full access to all features",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    permissions: allPermissions.map(p => p.id),
    userCount: 1,
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access with some restrictions",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    permissions: allPermissions.filter(p => !p.id.includes("delete")).map(p => p.id),
    userCount: 2,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Can create and edit content",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    permissions: ["posts.view", "posts.create", "posts.edit", "projects.view", "projects.create", "projects.edit", "media.upload"],
    userCount: 5,
  },
  {
    id: "subscriber",
    name: "Subscriber",
    description: "Basic read-only access",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    permissions: ["posts.view", "projects.view"],
    userCount: 150,
  },
];

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEditedPermissions([...role.permissions]);
  };

  const togglePermission = (permissionId: string) => {
    setEditedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles(roles.map(role =>
      role.id === selectedRole.id
        ? { ...role, permissions: editedPermissions }
        : role
    ));
    setSelectedRole({ ...selectedRole, permissions: editedPermissions });
  };

  const permissionGroups = {
    "Content": allPermissions.filter(p => p.id.startsWith("posts") || p.id.startsWith("projects")),
    "Users": allPermissions.filter(p => p.id.startsWith("users")),
    "Settings": allPermissions.filter(p => p.id.startsWith("settings")),
    "Media": allPermissions.filter(p => p.id.startsWith("media")),
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Roles
            </CardTitle>
            <CardDescription>
              Select a role to view and edit permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleRoleSelect(role)}
                  data-testid={`role-${role.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge className={role.color}>{role.name}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {role.userCount}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Permissions
                </CardTitle>
                <CardDescription>
                  {selectedRole
                    ? `Editing permissions for ${selectedRole.name}`
                    : "Select a role to view permissions"}
                </CardDescription>
              </div>
              {selectedRole && (
                <Button onClick={handleSavePermissions} data-testid="button-save-permissions">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-6">
                {Object.entries(permissionGroups).map(([group, permissions]) => (
                  <div key={group}>
                    <h4 className="font-medium mb-3">{group}</h4>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`permission-${permission.id}`}
                        >
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <Switch
                            checked={editedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                            disabled={selectedRole.id === "super-admin"}
                            data-testid={`switch-${permission.id}`}
                          />
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Role Selected</h3>
                <p className="text-muted-foreground">
                  Select a role from the list to view and edit its permissions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
