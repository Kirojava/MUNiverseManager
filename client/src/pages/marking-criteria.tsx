import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MarkingCriteria, InsertMarkingCriteria } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarkingCriteria() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<MarkingCriteria | null>(null);
  const [deletingCriteria, setDeletingCriteria] = useState<MarkingCriteria | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    maxPoints: 100,
    description: "",
    orderIndex: 0,
  });

  const { data: criteriaList, isLoading } = useQuery<MarkingCriteria[]>({
    queryKey: ["/api/marking-criteria"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMarkingCriteria) =>
      apiRequest("POST", "/api/marking-criteria", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marking-criteria"] });
      setIsAddOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Marking criteria created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create marking criteria",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMarkingCriteria> }) =>
      apiRequest("PATCH", `/api/marking-criteria/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marking-criteria"] });
      setEditingCriteria(null);
      resetForm();
      toast({
        title: "Success",
        description: "Marking criteria updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update marking criteria",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marking-criteria/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marking-criteria"] });
      setDeletingCriteria(null);
      toast({
        title: "Success",
        description: "Marking criteria deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete marking criteria",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      maxPoints: 100,
      description: "",
      orderIndex: criteriaList?.length || 0,
    });
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      maxPoints: 100,
      description: "",
      orderIndex: criteriaList?.length || 0,
    });
    setIsAddOpen(true);
  };

  const handleEdit = (criteria: MarkingCriteria) => {
    setFormData({
      name: criteria.name,
      maxPoints: criteria.maxPoints,
      description: criteria.description || "",
      orderIndex: criteria.orderIndex,
    });
    setEditingCriteria(criteria);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCriteria) {
      updateMutation.mutate({ id: editingCriteria.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingCriteria) {
      deleteMutation.mutate(deletingCriteria.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Settings className="h-8 w-8" />
            Marking Criteria Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure the evaluation criteria for delegate performance
          </p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-criteria">
          <Plus className="h-4 w-4 mr-2" />
          Add Criteria
        </Button>
      </div>

      <div className="grid gap-4">
        {criteriaList?.map((criteria) => (
          <Card key={criteria.id} data-testid={`card-criteria-${criteria.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl" data-testid={`text-criteria-name-${criteria.id}`}>
                    {criteria.name}
                  </CardTitle>
                  <CardDescription data-testid={`text-criteria-points-${criteria.id}`}>
                    Max Points: {criteria.maxPoints}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(criteria)}
                    data-testid={`button-edit-${criteria.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingCriteria(criteria)}
                    data-testid={`button-delete-${criteria.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {criteria.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground" data-testid={`text-criteria-description-${criteria.id}`}>
                  {criteria.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
        {criteriaList?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No marking criteria configured yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Add Criteria" to create your first criterion.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddOpen || editingCriteria !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setEditingCriteria(null);
          resetForm();
        }
      }}>
        <DialogContent data-testid="dialog-criteria-form">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCriteria ? "Edit Marking Criteria" : "Add Marking Criteria"}
              </DialogTitle>
              <DialogDescription>
                Configure the evaluation criteria for delegate performance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Criteria Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Research & Preparation"
                  required
                  data-testid="input-criteria-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPoints">Maximum Points *</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) || 0 })}
                  min={1}
                  max={1000}
                  required
                  data-testid="input-max-points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this criteria evaluates"
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderIndex">Display Order *</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  min={0}
                  required
                  data-testid="input-order-index"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first (0, 1, 2, ...)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCriteria(null);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save"
              >
                {editingCriteria ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingCriteria !== null} onOpenChange={(open) => {
        if (!open) setDeletingCriteria(null);
      }}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Marking Criteria</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCriteria?.name}"? This action cannot be undone.
              Existing evaluations using this criteria will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
