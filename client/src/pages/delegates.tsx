import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Award, Phone, Mail, School, Upload } from "lucide-react";
import type { Delegate, InsertDelegate, DelegateEvaluation, Committee, Portfolio } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function Delegates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const { toast } = useToast();

  const { data: delegates, isLoading } = useQuery<Delegate[]>({ queryKey: ["/api/delegates"] });
  const { data: evaluations } = useQuery<DelegateEvaluation[]>({ queryKey: ["/api/evaluations"] });
  const { data: committees } = useQuery<Committee[]>({ queryKey: ["/api/committees"] });
  const { data: portfolios } = useQuery<Portfolio[]>({ queryKey: ["/api/portfolios"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertDelegate) => apiRequest("POST", "/api/delegates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegates"] });
      setOpen(false);
      toast({ title: "Delegate added successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertDelegate>({
    name: "",
    school: "",
    committeeId: "",
    committee: "",
    portfolioId: "",
    portfolio: "",
    email: "",
    phone: "",
    status: "registered",
    performanceScore: 0,
    notes: "",
  });

  const [evaluationData, setEvaluationData] = useState({
    researchScore: 50,
    communicationScore: 50,
    diplomacyScore: 50,
    participationScore: 50,
    comments: "",
    evaluatedBy: "Secretary General",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;

    const totalScore = evaluationData.researchScore + evaluationData.communicationScore + 
                      evaluationData.diplomacyScore + evaluationData.participationScore;
    
    apiRequest("POST", "/api/evaluations", {
      delegateId: selectedDelegate.id,
      delegateName: selectedDelegate.name,
      committee: selectedDelegate.committee,
      ...evaluationData,
      totalScore,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      setEvaluationOpen(false);
      toast({ title: "Evaluation submitted successfully" });
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        if (row.name && row.email) {
          try {
            await apiRequest("POST", "/api/delegates", {
              name: row.name,
              school: row.school || "",
              committeeId: row.committeeid || "",
              committee: row.committee || "",
              portfolioId: row.portfolioid || "",
              portfolio: row.portfolio || "",
              email: row.email,
              phone: row.phone || "",
              status: row.status || "registered",
              performanceScore: 0,
              notes: row.notes || "",
            });
            imported++;
          } catch (error) {
            console.error('Failed to import row:', row, error);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/delegates"] });
      setImportOpen(false);
      toast({ 
        title: `Imported ${imported} delegate(s)`,
        description: "Successfully imported data from spreadsheet"
      });
    };

    reader.readAsText(file);
  };

  const filteredDelegates = delegates?.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.committee.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registered": return "secondary";
      case "confirmed": return "default";
      case "checked-in": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Delegates</h1>
          <p className="text-muted-foreground">Manage delegate registrations and performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-import-delegates">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Delegates from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: name, email, school, committee, portfolio, phone, status, notes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    data-testid="input-csv-file"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">CSV Format Example:</p>
                  <code className="block bg-muted p-2 rounded text-xs">
                    name,email,school,committee,portfolio,phone,status,notes
                    <br />
                    John Doe,john@example.com,XYZ School,UNSC,United States,+1234567890,registered,First time delegate
                  </code>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-delegate">
                <Plus className="h-4 w-4 mr-2" />
                Add Delegate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Delegate</DialogTitle>
              <DialogDescription>Enter delegate information</DialogDescription>
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
                    data-testid="input-delegate-name"
                  />
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    required
                    data-testid="input-delegate-school"
                  />
                </div>
                <div>
                  <Label htmlFor="committee">Committee</Label>
                  <Select 
                    value={formData.committeeId} 
                    onValueChange={(value) => {
                      const selectedCommittee = committees?.find(c => c.id === value);
                      setFormData({ 
                        ...formData, 
                        committeeId: value,
                        committee: selectedCommittee?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger data-testid="select-delegate-committee">
                      <SelectValue placeholder="Select committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {committees?.map((committee) => (
                        <SelectItem key={committee.id} value={committee.id}>
                          {committee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Select 
                    value={formData.portfolioId} 
                    onValueChange={(value) => {
                      const selectedPortfolio = portfolios?.find(p => p.id === value);
                      setFormData({ 
                        ...formData, 
                        portfolioId: value,
                        portfolio: selectedPortfolio?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger data-testid="select-delegate-portfolio">
                      <SelectValue placeholder="Select portfolio" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios
                        ?.filter(p => p.isAvailable === 1)
                        .map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>
                          {portfolio.name} ({portfolio.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-delegate-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-delegate-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-delegate-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  data-testid="input-delegate-notes"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-delegate">
                  {createMutation.isPending ? "Adding..." : "Add Delegate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-delegates">All Delegates</TabsTrigger>
          <TabsTrigger value="evaluations" data-testid="tab-evaluations">Evaluations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search delegates by name, school, or committee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-delegates"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading delegates...</div>
          ) : filteredDelegates.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  {searchTerm ? "No delegates found matching your search" : "No delegates registered yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDelegates.map((delegate) => (
                <Card key={delegate.id} className="hover-elevate" data-testid={`card-delegate-${delegate.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{delegate.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <School className="h-3 w-3" />
                          <span className="truncate">{delegate.school}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(delegate.status)} className="whitespace-nowrap">
                        {delegate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {delegate.committee}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{delegate.portfolio}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate text-xs">{delegate.email}</span>
                      </div>
                      {delegate.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{delegate.phone}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedDelegate(delegate);
                        setEvaluationOpen(true);
                      }}
                      data-testid={`button-evaluate-${delegate.id}`}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Evaluate Performance
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evaluations" className="mt-6">
          <div className="space-y-4">
            {evaluations?.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">No evaluations submitted yet</p>
                </CardContent>
              </Card>
            ) : (
              evaluations?.map((evaluation) => (
                <Card key={evaluation.id} data-testid={`card-evaluation-${evaluation.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle>{evaluation.delegateName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{evaluation.committee}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{evaluation.totalScore}</div>
                        <p className="text-xs text-muted-foreground">Total Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Research</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${evaluation.researchScore}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{evaluation.researchScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Communication</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${evaluation.communicationScore}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{evaluation.communicationScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Diplomacy</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${evaluation.diplomacyScore}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{evaluation.diplomacyScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Participation</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${evaluation.participationScore}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{evaluation.participationScore}</span>
                        </div>
                      </div>
                    </div>
                    {evaluation.comments && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Comments</p>
                        <p className="text-sm">{evaluation.comments}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <span>Evaluated by {evaluation.evaluatedBy}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={evaluationOpen} onOpenChange={setEvaluationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate Delegate Performance</DialogTitle>
            <DialogDescription>
              {selectedDelegate && `Evaluating ${selectedDelegate.name} - ${selectedDelegate.committee}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEvaluationSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Research & Preparation</Label>
                  <span className="text-sm font-medium">{evaluationData.researchScore}/100</span>
                </div>
                <Slider
                  value={[evaluationData.researchScore]}
                  onValueChange={([value]) => setEvaluationData({ ...evaluationData, researchScore: value })}
                  max={100}
                  step={1}
                  data-testid="slider-research"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Communication Skills</Label>
                  <span className="text-sm font-medium">{evaluationData.communicationScore}/100</span>
                </div>
                <Slider
                  value={[evaluationData.communicationScore]}
                  onValueChange={([value]) => setEvaluationData({ ...evaluationData, communicationScore: value })}
                  max={100}
                  step={1}
                  data-testid="slider-communication"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Diplomacy & Negotiation</Label>
                  <span className="text-sm font-medium">{evaluationData.diplomacyScore}/100</span>
                </div>
                <Slider
                  value={[evaluationData.diplomacyScore]}
                  onValueChange={([value]) => setEvaluationData({ ...evaluationData, diplomacyScore: value })}
                  max={100}
                  step={1}
                  data-testid="slider-diplomacy"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Participation & Engagement</Label>
                  <span className="text-sm font-medium">{evaluationData.participationScore}/100</span>
                </div>
                <Slider
                  value={[evaluationData.participationScore]}
                  onValueChange={([value]) => setEvaluationData({ ...evaluationData, participationScore: value })}
                  max={100}
                  step={1}
                  data-testid="slider-participation"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={evaluationData.comments}
                onChange={(e) => setEvaluationData({ ...evaluationData, comments: e.target.value })}
                rows={4}
                placeholder="Provide detailed feedback on the delegate's performance..."
                data-testid="input-evaluation-comments"
              />
            </div>
            <div>
              <Label htmlFor="evaluatedBy">Evaluated By</Label>
              <Input
                id="evaluatedBy"
                value={evaluationData.evaluatedBy}
                onChange={(e) => setEvaluationData({ ...evaluationData, evaluatedBy: e.target.value })}
                required
                data-testid="input-evaluated-by"
              />
            </div>
            <DialogFooter>
              <Button type="submit" data-testid="button-submit-evaluation">
                Submit Evaluation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
