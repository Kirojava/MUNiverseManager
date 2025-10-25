import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Award, Phone, Mail, School, Upload, Pencil, Trash2 } from "lucide-react";
import type { Delegate, InsertDelegate, DelegateEvaluation, Committee, Portfolio, MarkingCriteria } from "@shared/schema";
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
  const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);
  const [deletingDelegate, setDeletingDelegate] = useState<Delegate | null>(null);
  const { toast } = useToast();

  const { data: delegates, isLoading } = useQuery<Delegate[]>({ queryKey: ["/api/delegates"] });
  const { data: evaluations } = useQuery<DelegateEvaluation[]>({ queryKey: ["/api/evaluations"] });
  const { data: committees } = useQuery<Committee[]>({ queryKey: ["/api/committees"] });
  const { data: portfolios } = useQuery<Portfolio[]>({ queryKey: ["/api/portfolios"] });
  const { data: markingCriteria } = useQuery<MarkingCriteria[]>({ queryKey: ["/api/marking-criteria"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertDelegate) => apiRequest("POST", "/api/delegates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegates"] });
      setOpen(false);
      resetForm();
      toast({ title: "Delegate added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDelegate> }) =>
      apiRequest("PATCH", `/api/delegates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegates"] });
      setEditingDelegate(null);
      resetForm();
      toast({ title: "Delegate updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/delegates/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delegates"] });
      setDeletingDelegate(null);
      toast({ title: "Delegate deleted successfully" });
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

  const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({});
  const [evaluationData, setEvaluationData] = useState({
    comments: "",
    evaluatedBy: "Secretary General",
  });

  const initializeEvaluationScores = () => {
    if (!markingCriteria) return;
    const initialScores: Record<string, number> = {};
    markingCriteria.forEach((criteria) => {
      initialScores[criteria.id] = Math.floor(criteria.maxPoints / 2);
    });
    setEvaluationScores(initialScores);
  };

  const resetForm = () => {
    setFormData({
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDelegate) {
      updateMutation.mutate({ id: editingDelegate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (delegate: Delegate) => {
    setFormData({
      name: delegate.name,
      school: delegate.school,
      committeeId: delegate.committeeId || "",
      committee: delegate.committee,
      portfolioId: delegate.portfolioId || "",
      portfolio: delegate.portfolio,
      email: delegate.email,
      phone: delegate.phone || "",
      status: delegate.status,
      performanceScore: delegate.performanceScore || 0,
      notes: delegate.notes || "",
    });
    setEditingDelegate(delegate);
  };

  const handleDelete = () => {
    if (deletingDelegate) {
      deleteMutation.mutate(deletingDelegate.id);
    }
  };

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;

    const totalScore = Object.values(evaluationScores).reduce((sum, score) => sum + score, 0);
    const scores = JSON.stringify(evaluationScores);
    
    apiRequest("POST", "/api/evaluations", {
      delegateId: selectedDelegate.id,
      delegateName: selectedDelegate.name,
      committee: selectedDelegate.committee,
      scores,
      totalScore,
      comments: evaluationData.comments,
      evaluatedBy: evaluationData.evaluatedBy,
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
          <Dialog open={open || editingDelegate !== null} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(false);
              setEditingDelegate(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)} data-testid="button-add-delegate">
                <Plus className="h-4 w-4 mr-2" />
                Add Delegate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDelegate ? "Edit Delegate" : "Add New Delegate"}</DialogTitle>
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
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending} 
                  data-testid="button-submit-delegate"
                >
                  {editingDelegate ? (updateMutation.isPending ? "Updating..." : "Update Delegate") : (createMutation.isPending ? "Adding..." : "Add Delegate")}
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(delegate)}
                        data-testid={`button-edit-${delegate.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDeletingDelegate(delegate)}
                        data-testid={`button-delete-${delegate.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedDelegate(delegate);
                        initializeEvaluationScores();
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
              evaluations?.map((evaluation) => {
                const scores = JSON.parse(evaluation.scores) as Record<string, number>;
                return (
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
                        {markingCriteria?.map((criteria) => {
                          const score = scores[criteria.id] || 0;
                          const percentage = (score / criteria.maxPoints) * 100;
                          return (
                            <div key={criteria.id}>
                              <p className="text-xs text-muted-foreground mb-1">{criteria.name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{score}/{criteria.maxPoints}</span>
                              </div>
                            </div>
                          );
                        })}
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
                );
              })
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
              {markingCriteria && markingCriteria.length > 0 ? (
                markingCriteria.map((criteria) => (
                  <div key={criteria.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label>{criteria.name}</Label>
                        {criteria.description && (
                          <p className="text-xs text-muted-foreground mt-1">{criteria.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {evaluationScores[criteria.id] || 0}/{criteria.maxPoints}
                      </span>
                    </div>
                    <Slider
                      value={[evaluationScores[criteria.id] || 0]}
                      onValueChange={([value]) => setEvaluationScores({ ...evaluationScores, [criteria.id]: value })}
                      max={criteria.maxPoints}
                      step={1}
                      data-testid={`slider-${criteria.id}`}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No marking criteria configured.</p>
                  <p className="text-sm mt-2">Please configure marking criteria in the settings.</p>
                </div>
              )}
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

      <AlertDialog open={deletingDelegate !== null} onOpenChange={(open) => {
        if (!open) setDeletingDelegate(null);
      }}>
        <AlertDialogContent data-testid="dialog-delete-delegate">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delegate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDelegate?.name}"? This action cannot be undone.
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
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
