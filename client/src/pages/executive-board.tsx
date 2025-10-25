import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Crown } from "lucide-react";
import type { ExecutiveBoard, InsertExecutiveBoard } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";

export default function ExecutiveBoard() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: board, isLoading } = useQuery<ExecutiveBoard[]>({ queryKey: ["/api/executive-board"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertExecutiveBoard) => apiRequest("POST", "/api/executive-board", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executive-board"] });
      setOpen(false);
      toast({ title: "Board member added successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertExecutiveBoard>({
    position: "",
    name: "",
    responsibilities: "",
    department: "",
    email: "",
    reportsTo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const positionHierarchy = [
    "Secretary General",
    "Deputy Secretary General",
    "Under Secretary General",
    "Director",
    "Deputy Director",
  ];

  const sortedBoard = board?.sort((a, b) => {
    const aIndex = positionHierarchy.indexOf(a.position);
    const bIndex = positionHierarchy.indexOf(b.position);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Executive Board</h1>
          <p className="text-muted-foreground">Leadership positions and responsibilities</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-executive">
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Executive Board Member</DialogTitle>
              <DialogDescription>Enter leadership position details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    placeholder="e.g., Secretary General"
                    data-testid="input-executive-position"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-executive-name"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department || ""}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Optional"
                    data-testid="input-executive-department"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-executive-email"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="reportsTo">Reports To</Label>
                  <Input
                    id="reportsTo"
                    value={formData.reportsTo || ""}
                    onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
                    placeholder="Optional - e.g., Secretary General"
                    data-testid="input-executive-reports-to"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  required
                  rows={5}
                  placeholder="Describe key responsibilities and duties..."
                  data-testid="input-executive-responsibilities"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-executive">
                  {createMutation.isPending ? "Adding..." : "Add Position"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading executive board...</div>
      ) : sortedBoard?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No executive board members added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedBoard?.map((member) => (
            <Card key={member.id} className="hover-elevate" data-testid={`card-executive-${member.id}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="default" className="w-fit mt-2">{member.position}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.department && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm">{member.department}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate text-xs">{member.email}</span>
                </div>
                {member.reportsTo && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reports To</p>
                    <p className="text-sm">{member.reportsTo}</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Responsibilities</p>
                  <p className="text-sm line-clamp-4">{member.responsibilities}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
