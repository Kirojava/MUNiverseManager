import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Edit, Trash2, Sparkles, AlertCircle } from "lucide-react";
import type { AwardType, DelegateAward, Committee } from "@shared/schema";
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

export default function Awards() {
  const { toast } = useToast();
  const [isAwardTypeDialogOpen, setIsAwardTypeDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [editingAwardType, setEditingAwardType] = useState<AwardType | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<string>("");
  const [forceAssign, setForceAssign] = useState(false);

  const { data: awardTypes = [], isLoading: isLoadingAwardTypes } = useQuery<AwardType[]>({
    queryKey: ["/api/award-types"],
  });

  const { data: awards = [], isLoading: isLoadingAwards } = useQuery<DelegateAward[]>({
    queryKey: ["/api/delegate-awards"],
  });

  const { data: committees = [] } = useQuery<Committee[]>({
    queryKey: ["/api/committees"],
  });

  const committeeAwards = selectedCommittee
    ? awards.filter(award => award.committeeId === selectedCommittee)
    : [];

  const createAwardTypeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/award-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/award-types"] });
      setIsAwardTypeDialogOpen(false);
      toast({ title: "Award type created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create award type", variant: "destructive" });
    },
  });

  const updateAwardTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/award-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/award-types"] });
      setIsAwardTypeDialogOpen(false);
      setEditingAwardType(null);
      toast({ title: "Award type updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update award type", variant: "destructive" });
    },
  });

  const deleteAwardTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/award-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/award-types"] });
      toast({ title: "Award type deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete award type", variant: "destructive" });
    },
  });

  const autoAssignMutation = useMutation({
    mutationFn: async ({ committeeId, committeeName, force }: { committeeId: string; committeeName: string; force: boolean }) => {
      return await apiRequest("POST", "/api/delegate-awards/auto-assign", {
        committeeId,
        committeeName,
        assignedBy: "Executive Board",
        force,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegate-awards"] });
      setIsAutoAssignDialogOpen(false);
      setForceAssign(false);
      toast({ title: "Awards auto-assigned successfully" });
    },
    onError: (error: any) => {
      if (error.message?.includes("already exist")) {
        setForceAssign(true);
        toast({
          title: "Awards already exist",
          description: "Enable force mode to override existing awards",
          variant: "destructive",
        });
      } else {
        toast({ title: "Failed to auto-assign awards", variant: "destructive" });
      }
    },
  });

  const deleteAwardMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/delegate-awards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegate-awards"] });
      toast({ title: "Award deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete award", variant: "destructive" });
    },
  });

  const handleAwardTypeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      orderIndex: parseInt(formData.get("orderIndex") as string),
      isActive: 1,
    };

    if (editingAwardType) {
      updateAwardTypeMutation.mutate({ id: editingAwardType.id, data });
    } else {
      createAwardTypeMutation.mutate(data);
    }
  };

  const handleAutoAssign = () => {
    if (!selectedCommittee) return;
    const committee = committees.find(c => c.id === selectedCommittee);
    if (!committee) return;

    autoAssignMutation.mutate({
      committeeId: committee.id,
      committeeName: committee.name,
      force: forceAssign,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Awards Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage award types and assign awards to delegates
          </p>
        </div>
      </div>

      <Tabs defaultValue="award-types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="award-types" data-testid="tab-award-types">Award Types</TabsTrigger>
          <TabsTrigger value="delegate-awards" data-testid="tab-delegate-awards">Delegate Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="award-types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Award Types</CardTitle>
                  <CardDescription>
                    Manage the types of awards that can be given to delegates
                  </CardDescription>
                </div>
                <Dialog open={isAwardTypeDialogOpen} onOpenChange={setIsAwardTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingAwardType(null)} data-testid="button-add-award-type">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Award Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAwardType ? "Edit Award Type" : "Add Award Type"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAwardType ? "Update the award type details" : "Create a new award type"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAwardTypeSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingAwardType?.name}
                          required
                          data-testid="input-award-type-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingAwardType?.description || ""}
                          data-testid="input-award-type-description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="orderIndex">Display Order</Label>
                        <Input
                          id="orderIndex"
                          name="orderIndex"
                          type="number"
                          defaultValue={editingAwardType?.orderIndex ?? awardTypes.length}
                          required
                          data-testid="input-award-type-order"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAwardTypeDialogOpen(false);
                            setEditingAwardType(null);
                          }}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-award-type">
                          {editingAwardType ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAwardTypes ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : awardTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No award types yet. Create one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {awardTypes.map((awardType) => (
                      <TableRow key={awardType.id} data-testid={`row-award-type-${awardType.id}`}>
                        <TableCell className="font-medium">{awardType.name}</TableCell>
                        <TableCell>{awardType.description}</TableCell>
                        <TableCell>{awardType.orderIndex}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAwardType(awardType);
                              setIsAwardTypeDialogOpen(true);
                            }}
                            data-testid={`button-edit-award-type-${awardType.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAwardTypeMutation.mutate(awardType.id)}
                            data-testid={`button-delete-award-type-${awardType.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegate-awards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delegate Awards</CardTitle>
                  <CardDescription>
                    View and manage awards assigned to delegates by committee
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="committee">Select Committee</Label>
                  <Select value={selectedCommittee} onValueChange={setSelectedCommittee}>
                    <SelectTrigger id="committee" data-testid="select-committee">
                      <SelectValue placeholder="Select a committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {committees.map((committee) => (
                        <SelectItem key={committee.id} value={committee.id}>
                          {committee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCommittee && (
                  <div className="flex items-end gap-2">
                    <AlertDialog open={isAutoAssignDialogOpen} onOpenChange={setIsAutoAssignDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button data-testid="button-auto-assign">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Auto-Assign Awards
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Auto-Assign Awards</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will automatically assign awards to the top-performing delegates based on their evaluation scores.
                            {committeeAwards.length > 0 && (
                              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                      Awards already exist
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                      {committeeAwards.length} award(s) have already been assigned to this committee.
                                      Enable force mode to replace them with new auto-assignments.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id="force"
                                        checked={forceAssign}
                                        onChange={(e) => setForceAssign(e.target.checked)}
                                        className="rounded"
                                        data-testid="checkbox-force-assign"
                                      />
                                      <label htmlFor="force" className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Force override existing awards
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-auto-assign">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleAutoAssign} data-testid="button-confirm-auto-assign">
                            {forceAssign ? "Force Assign" : "Assign"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {selectedCommittee && (
                <div className="mt-6">
                  {isLoadingAwards ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : committeeAwards.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No awards assigned yet. Use auto-assign to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Award Type</TableHead>
                          <TableHead>Delegate</TableHead>
                          <TableHead>Assignment Method</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {committeeAwards.map((award) => (
                          <TableRow key={award.id} data-testid={`row-award-${award.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                {award.awardTypeName}
                              </div>
                            </TableCell>
                            <TableCell>{award.delegateName || "Not assigned"}</TableCell>
                            <TableCell>
                              {award.isAutoAssigned === 1 ? "Auto-assigned" : "Manual"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAwardMutation.mutate(award.id)}
                                data-testid={`button-delete-award-${award.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
