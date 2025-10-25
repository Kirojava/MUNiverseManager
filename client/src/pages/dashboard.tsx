import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Boxes, ListTodo, DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Delegate, Committee, Task, Sponsorship, Update } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: delegates } = useQuery<Delegate[]>({ queryKey: ["/api/delegates"] });
  const { data: committees } = useQuery<Committee[]>({ queryKey: ["/api/committees"] });
  const { data: tasks } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: sponsorships } = useQuery<Sponsorship[]>({ queryKey: ["/api/sponsorships"] });
  const { data: updates } = useQuery<Update[]>({ queryKey: ["/api/updates"] });

  const delegateCount = delegates?.length || 0;
  const committeeCount = committees?.length || 0;
  const pendingTasks = tasks?.filter(t => t.status === "pending").length || 0;
  const totalSponsorship = sponsorships?.reduce((sum, s) => sum + s.amount, 0) || 0;

  const stats = [
    {
      title: "Total Delegates",
      value: delegateCount,
      icon: Users,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Committees",
      value: committeeCount,
      icon: Boxes,
      change: "6 Active",
      trend: "neutral",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      icon: ListTodo,
      change: "Due this week",
      trend: pendingTasks > 5 ? "down" : "up",
    },
    {
      title: "Sponsorship Raised",
      value: `$${totalSponsorship.toLocaleString()}`,
      icon: DollarSign,
      change: "+28%",
      trend: "up",
    },
  ];

  const recentUpdates = updates?.slice(0, 5) || [];
  const upcomingTasks = tasks?.filter(t => t.status === "pending").slice(0, 5) || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your conference overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {stat.trend === "down" && <AlertCircle className="h-3 w-3 text-amber-500" />}
                <span className={stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-amber-500" : "text-muted-foreground"}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending tasks</p>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-md hover-elevate border"
                  data-testid={`card-task-${task.id}`}
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${
                    task.priority === "high" ? "bg-destructive" :
                    task.priority === "medium" ? "bg-amber-500" :
                    "bg-muted-foreground"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                  </div>
                  <Badge variant={
                    task.priority === "high" ? "destructive" :
                    task.priority === "medium" ? "default" :
                    "secondary"
                  } className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent updates</p>
            ) : (
              recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="p-3 rounded-md hover-elevate border"
                  data-testid={`card-update-${update.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{update.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {update.content}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {update.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{update.author}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
