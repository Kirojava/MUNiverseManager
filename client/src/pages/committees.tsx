import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import type { Committee, InsertCommittee } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";

export default function Committees() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: committees, isLoading } = useQuery<Committee[]>({ queryKey: ["/api/committees"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertCommittee) => apiRequest("POST", "/api/committees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/committees"] });
      setOpen(false);
      toast({ title: "Committee created successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertCommittee>({
    name: "",
    topic: "",
    agenda: "",
    chairperson: "",
    viceChairperson: "",
    rapporteur: "",
    sessionCount: 0,
    status: "planning",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "secondary";
      case "active": return "default";
      case "completed": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Committees</h1>
          <p className="text-muted-foreground">Manage committees, agendas, and sessions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-committee">
              <Plus className="h-4 w-4 mr-2" />
              Add Committee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Committee</DialogTitle>
              <DialogDescription>Enter committee information and agenda</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Committee Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., United Nations Security Council"
                    data-testid="input-committee-name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                    placeholder="e.g., Conflict Resolution in Middle East"
                    data-testid="input-committee-topic"
                  />
                </div>
                <div>
                  <Label htmlFor="chairperson">Chairperson</Label>
                  <Input
                    id="chairperson"
                    value={formData.chairperson || ""}
                    onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                    data-testid="input-committee-chairperson"
                  />
                </div>
                <div>
                  <Label htmlFor="viceChairperson">Vice Chairperson</Label>
                  <Input
                    id="viceChairperson"
                    value={formData.viceChairperson || ""}
                    onChange={(e) => setFormData({ ...formData, viceChairperson: e.target.value })}
                    data-testid="input-committee-vice-chairperson"
                  />
                </div>
                <div>
                  <Label htmlFor="rapporteur">Rapporteur</Label>
                  <Input
                    id="rapporteur"
                    value={formData.rapporteur || ""}
                    onChange={(e) => setFormData({ ...formData, rapporteur: e.target.value })}
                    data-testid="input-committee-rapporteur"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-committee-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="agenda">Agenda</Label>
                <Textarea
                  id="agenda"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  required
                  rows={5}
                  placeholder="Enter detailed agenda for the committee sessions..."
                  data-testid="input-committee-agenda"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-committee">
                  {createMutation.isPending ? "Creating..." : "Create Committee"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading committees...</div>
      ) : committees?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No committees created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {committees?.map((committee) => (
            <Card key={committee.id} className="hover-elevate" data-testid={`card-committee-${committee.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{committee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{committee.topic}</p>
                  </div>
                  <Badge variant={getStatusColor(committee.status)} className="whitespace-nowrap">
                    {committee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Executive Board</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    {committee.chairperson && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Chair:</span>
                        <span>{committee.chairperson}</span>
                      </div>
                    )}
                    {committee.viceChairperson && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Vice:</span>
                        <span>{committee.viceChairperson}</span>
                      </div>
                    )}
                    {committee.rapporteur && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Rapporteur:</span>
                        <span>{committee.rapporteur}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Agenda</p>
                  <p className="text-sm line-clamp-4">{committee.agenda}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <span>Sessions: {committee.sessionCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
