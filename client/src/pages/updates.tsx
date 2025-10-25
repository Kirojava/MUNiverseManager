import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";
import type { Update, InsertUpdate } from "@shared/schema";
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
import { formatDistanceToNow } from "date-fns";

export default function Updates() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: updates, isLoading } = useQuery<Update[]>({ queryKey: ["/api/updates"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertUpdate) => apiRequest("POST", "/api/updates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
      setOpen(false);
      toast({ title: "Update posted successfully" });
    },
  });

  const [formData, setFormData] = useState<InsertUpdate>({
    title: "",
    content: "",
    category: "general",
    author: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const categories = ["general", "announcement", "change", "feature", "fix"];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "announcement": return "default";
      case "change": return "default";
      case "feature": return "default";
      case "fix": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Updates & Changelog</h1>
          <p className="text-muted-foreground">Track updates and communicate changes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-update">
              <Plus className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post New Update</DialogTitle>
              <DialogDescription>Share updates with your team</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Registration deadline extended"
                    data-testid="input-update-title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-update-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    placeholder="Your name"
                    data-testid="input-update-author"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  placeholder="Write your update here..."
                  data-testid="input-update-content"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-update">
                  {createMutation.isPending ? "Posting..." : "Post Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading updates...</div>
      ) : updates?.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No updates posted yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates?.map((update) => (
            <Card key={update.id} className="hover-elevate" data-testid={`card-update-${update.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl">{update.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{update.author}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getCategoryColor(update.category)} className="capitalize whitespace-nowrap">
                    {update.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{update.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
