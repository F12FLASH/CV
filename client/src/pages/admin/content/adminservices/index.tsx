import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "./hooks";
import { ServiceCard, ServiceComparisonTable, ServiceForm, DeleteServiceDialog } from "./components";
import type { Service, ServiceFormData } from "./types";

export default function AdminServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: services = [], isLoading } = useServices();

  const handleFormClose = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const createMutation = useCreateService(handleFormClose);
  const updateMutation = useUpdateService(handleFormClose);
  const deleteMutation = useDeleteService(() => setDeleteId(null));

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
    } else {
      setEditingService(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ServiceFormData, isEditing: boolean) => {
    if (isEditing && editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">Manage services and pricing</p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-create-service">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No services yet</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" /> Create first service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <ServiceComparisonTable services={services} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .sort((a, b) => a.order - b.order)
                .map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          </>
        )}
      </div>

      <ServiceForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
          else setIsDialogOpen(open);
        }}
        editingService={editingService}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      <DeleteServiceDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
