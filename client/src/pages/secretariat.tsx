import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Building2 } from "lucide-react";
import type { Secretariat, InsertSecretariat } from "@shared/schema";
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

export default function Secretariat() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: secretariat, isLoading } = useQuery<Secretariat[]>({ queryKey: ["/api/secretariat"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertSecretariat) => apiRequest("POST", "/api/secretariat", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secretariat"] });
      setOpen(false);
      toast({ title: "Secretariat member added successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertSecretariat>({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    responsibilities: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const groupByDepartment = (members: Secretariat[]) => {
    const groups: Record<string, Secretariat[]> = {};
    members.forEach((member) => {
      if (!groups[member.department]) {
        groups[member.department] = [];
      }
      groups[member.department].push(member);
    });
    return groups;
  };

  const groupedMembers = secretariat ? groupByDepartment(secretariat) : {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Secretariat</h1>
          <p className="text-muted-foreground">Manage your secretariat team and positions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-secretariat">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Secretariat Member</DialogTitle>
              <DialogDescription>Enter team member information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-secretariat-name"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    placeholder="e.g., Secretary General, Deputy SG"
                    data-testid="input-secretariat-position"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="e.g., Core Team, Logistics"
                    data-testid="input-secretariat-department"
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
                    data-testid="input-secretariat-email"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-secretariat-phone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities || ""}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  rows={4}
                  placeholder="Describe key responsibilities and duties..."
                  data-testid="input-secretariat-responsibilities"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-secretariat">
                  {createMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading secretariat...</div>
      ) : Object.keys(groupedMembers).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No secretariat members added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMembers).map(([department, members]) => (
            <div key={department}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{department}</h2>
                <Badge variant="secondary" className="ml-2">{members.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <Card key={member.id} className="hover-elevate" data-testid={`card-secretariat-${member.id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge variant="default" className="w-fit mt-2">{member.position}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate text-xs">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{member.phone}</span>
                          </div>
                        )}
                      </div>
                      {member.responsibilities && (
                        <div className="pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Responsibilities</p>
                          <p className="text-sm line-clamp-3">{member.responsibilities}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
