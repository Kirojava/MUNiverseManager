import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Award } from "lucide-react";
import type { Sponsorship, InsertSponsorship, AppSettings } from "@shared/schema";
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

export default function Sponsorships() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: sponsorships, isLoading } = useQuery<Sponsorship[]>({ queryKey: ["/api/sponsorships"] });
  const { data: appSettings } = useQuery<AppSettings>({ queryKey: ["/api/app-settings"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertSponsorship) => apiRequest("POST", "/api/sponsorships", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      setOpen(false);
      toast({ title: "Sponsorship added successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertSponsorship>({
    sponsor: "",
    tier: "bronze",
    amount: 0,
    contact: "",
    email: "",
    phone: "",
    benefits: "",
    status: "pending",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const tiers = ["platinum", "gold", "silver", "bronze"];
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "default";
      case "gold": return "default";
      case "silver": return "secondary";
      case "bronze": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  const groupedByTier = sponsorships?.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = [];
    }
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsorship[]>) || {};

  const totalAmount = sponsorships?.reduce((sum, s) => sum + s.amount, 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Sponsorships</h1>
          <p className="text-muted-foreground">Manage sponsors and partnerships</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-sponsorship">
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Sponsorship</DialogTitle>
              <DialogDescription>Enter sponsor information and tier</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="sponsor">Sponsor Name</Label>
                  <Input
                    id="sponsor"
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    required
                    placeholder="e.g., ABC Corporation"
                    data-testid="input-sponsorship-name"
                  />
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                    <SelectTrigger data-testid="select-sponsorship-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount ({appSettings?.currencySymbol || "$"})</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    data-testid="input-sponsorship-amount"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                    data-testid="input-sponsorship-contact"
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
                    data-testid="input-sponsorship-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-sponsorship-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-sponsorship-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="benefits">Benefits Package</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits || ""}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  rows={4}
                  placeholder="Describe benefits and recognition included..."
                  data-testid="input-sponsorship-benefits"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-sponsorship">
                  {createMutation.isPending ? "Adding..." : "Add Sponsor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sponsorships?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appSettings?.currencySymbol || "$"}{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sponsorships?.filter(s => s.status === "confirmed").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading sponsorships...</div>
      ) : sponsorships?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No sponsorships added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tiers.filter(tier => groupedByTier[tier]?.length > 0).map((tier) => (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold capitalize">{tier} Tier</h2>
                <Badge variant="secondary" className="ml-2">{groupedByTier[tier]?.length || 0}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByTier[tier]?.map((sponsor) => (
                  <Card key={sponsor.id} className="hover-elevate" data-testid={`card-sponsorship-${sponsor.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">{sponsor.sponsor}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getTierColor(sponsor.tier)} className="capitalize">
                              {sponsor.tier}
                            </Badge>
                            <Badge variant={getStatusColor(sponsor.status)}>
                              {sponsor.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold text-primary">
                        {appSettings?.currencySymbol || "$"}{sponsor.amount.toLocaleString()}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Contact</p>
                          <p className="font-medium">{sponsor.contact}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate text-xs">{sponsor.email}</span>
                        </div>
                        {sponsor.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{sponsor.phone}</span>
                          </div>
                        )}
                      </div>
                      {sponsor.benefits && (
                        <div className="pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Benefits</p>
                          <p className="text-sm line-clamp-3">{sponsor.benefits}</p>
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
