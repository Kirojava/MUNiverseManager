import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, DollarSign } from "lucide-react";
import type { Logistics, InsertLogistics, AppSettings } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Logistics() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: logistics, isLoading } = useQuery<Logistics[]>({ queryKey: ["/api/logistics"] });
  const { data: appSettings } = useQuery<AppSettings>({ queryKey: ["/api/app-settings"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertLogistics) => apiRequest("POST", "/api/logistics", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logistics"] });
      setOpen(false);
      toast({ title: "Logistics item added successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertLogistics>({
    category: "venue",
    item: "",
    quantity: 1,
    status: "pending",
    vendor: "",
    cost: 0,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const categories = ["venue", "supplies", "catering", "transport", "equipment", "other"];
  
  const groupedByCategory = logistics?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Logistics[]>) || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "ordered": return "default";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  const totalCost = logistics?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Logistics</h1>
          <p className="text-muted-foreground">Manage venue, supplies, and resources</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-logistics">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Logistics Item</DialogTitle>
              <DialogDescription>Enter item details and requirements</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-logistics-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item">Item Name</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    required
                    data-testid="input-logistics-item"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    data-testid="input-logistics-quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-logistics-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor || ""}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    data-testid="input-logistics-vendor"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ({appSettings?.currencySymbol || "$"})</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost || 0}
                    onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    min="0"
                    data-testid="input-logistics-cost"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  data-testid="input-logistics-notes"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-logistics">
                  {createMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logistics?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appSettings?.currencySymbol || "$"}{totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {logistics?.filter(l => l.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading logistics...</div>
      ) : logistics?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No logistics items added yet</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={Object.keys(groupedByCategory)[0] || "venue"} className="w-full">
          <TabsList className="flex-wrap h-auto">
            {categories.filter(cat => groupedByCategory[cat]?.length > 0).map((category) => (
              <TabsTrigger key={category} value={category} data-testid={`tab-${category}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge variant="secondary" className="ml-2">{groupedByCategory[category]?.length || 0}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            groupedByCategory[category] && (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="space-y-3">
                  {groupedByCategory[category].map((item) => (
                    <Card key={item.id} className="hover-elevate" data-testid={`card-logistics-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Package className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium">{item.item}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>Qty: {item.quantity}</span>
                                {item.vendor && <span>• {item.vendor}</span>}
                                {item.cost && item.cost > 0 && (
                                  <span className="flex items-center gap-1">
                                    • {appSettings?.currencySymbol || "$"}{item.cost.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant={getStatusColor(item.status)} className="flex-shrink-0">
                            {item.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )
          ))}
        </Tabs>
      )}
    </div>
  );
}
