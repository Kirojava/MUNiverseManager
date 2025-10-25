import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Calendar, DollarSign } from "lucide-react";
import type { Marketing, InsertMarketing } from "@shared/schema";
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
import { format } from "date-fns";

export default function Marketing() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: marketing, isLoading } = useQuery<Marketing[]>({ queryKey: ["/api/marketing"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertMarketing) => apiRequest("POST", "/api/marketing", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing"] });
      setOpen(false);
      toast({ title: "Campaign created successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertMarketing>({
    campaign: "",
    platform: "",
    reach: 0,
    status: "planning",
    startDate: null,
    endDate: null,
    budget: 0,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const platforms = ["Instagram", "Facebook", "Twitter", "LinkedIn", "Email", "Posters", "Website", "Other"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "active": return "default";
      case "planning": return "secondary";
      default: return "secondary";
    }
  };

  const totalReach = marketing?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
  const totalBudget = marketing?.reduce((sum, m) => sum + (m.budget || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Marketing & Outreach</h1>
          <p className="text-muted-foreground">Manage campaigns and track reach</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-marketing">
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
              <DialogDescription>Enter campaign details and strategy</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="campaign">Campaign Name</Label>
                  <Input
                    id="campaign"
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    required
                    placeholder="e.g., Social Media Launch"
                    data-testid="input-marketing-campaign"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger data-testid="select-marketing-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-marketing-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reach">Target Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    value={formData.reach || 0}
                    onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) || 0 })}
                    min="0"
                    data-testid="input-marketing-reach"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || 0}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                    min="0"
                    data-testid="input-marketing-budget"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
                    data-testid="input-marketing-start-date"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
                    data-testid="input-marketing-end-date"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Campaign Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Describe campaign strategy and objectives..."
                  data-testid="input-marketing-notes"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-marketing">
                  {createMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{marketing?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReach.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
      ) : marketing?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No marketing campaigns created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketing?.map((campaign) => (
            <Card key={campaign.id} className="hover-elevate" data-testid={`card-marketing-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{campaign.campaign}</CardTitle>
                    <Badge variant="outline" className="mt-2">{campaign.platform}</Badge>
                  </div>
                  <Badge variant={getStatusColor(campaign.status)} className="whitespace-nowrap">
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Reach</span>
                    </div>
                    <p className="text-lg font-semibold">{campaign.reach?.toLocaleString() || 0}</p>
                  </div>
                  {campaign.budget && campaign.budget > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Budget</span>
                      </div>
                      <p className="text-lg font-semibold">${campaign.budget.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {(campaign.startDate || campaign.endDate) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t">
                    <Calendar className="h-3 w-3" />
                    {campaign.startDate && <span>{format(new Date(campaign.startDate), "MMM d")}</span>}
                    {campaign.startDate && campaign.endDate && <span>-</span>}
                    {campaign.endDate && <span>{format(new Date(campaign.endDate), "MMM d, yyyy")}</span>}
                  </div>
                )}
                {campaign.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-3">{campaign.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
