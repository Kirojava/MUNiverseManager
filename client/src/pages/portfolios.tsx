import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Globe, Building2 } from "lucide-react";
import type { Portfolio, InsertPortfolio } from "@shared/schema";
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

export default function Portfolios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({ queryKey: ["/api/portfolios"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertPortfolio) => apiRequest("POST", "/api/portfolios", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      setOpen(false);
      toast({ title: "Portfolio added successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/portfolios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({ title: "Portfolio deleted successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertPortfolio>({
    name: "",
    type: "Country",
    isAvailable: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredPortfolios = portfolios?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const countries = filteredPortfolios.filter(p => p.type === "Country");
  const ngos = filteredPortfolios.filter(p => p.type === "NGO");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Portfolios</h1>
          <p className="text-muted-foreground">Manage countries and NGOs for committee assignments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-portfolio">
              <Plus className="h-4 w-4 mr-2" />
              Add Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Portfolio</DialogTitle>
              <DialogDescription>Create a new country or NGO portfolio</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., United States, WHO"
                  required
                  data-testid="input-portfolio-name"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger data-testid="select-portfolio-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Country">Country</SelectItem>
                    <SelectItem value="NGO">NGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-portfolio">
                  {createMutation.isPending ? "Adding..." : "Add Portfolio"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search portfolios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-portfolios"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading portfolios...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Countries</h2>
              <Badge variant="secondary">{countries.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {countries.map((portfolio) => (
                <Card key={portfolio.id} className="hover-elevate" data-testid={`card-portfolio-${portfolio.id}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{portfolio.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (confirm(`Delete ${portfolio.name}?`)) {
                          deleteMutation.mutate(portfolio.id);
                        }
                      }}
                      data-testid={`button-delete-portfolio-${portfolio.id}`}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">NGOs</h2>
              <Badge variant="secondary">{ngos.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ngos.map((portfolio) => (
                <Card key={portfolio.id} className="hover-elevate" data-testid={`card-portfolio-${portfolio.id}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{portfolio.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (confirm(`Delete ${portfolio.name}?`)) {
                          deleteMutation.mutate(portfolio.id);
                        }
                      }}
                      data-testid={`button-delete-portfolio-${portfolio.id}`}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
