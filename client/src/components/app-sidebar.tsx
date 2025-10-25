import {
  LayoutDashboard,
  Users,
  UserCog,
  Boxes,
  Globe,
  Grid3x3,
  Crown,
  ListTodo,
  Package,
  Megaphone,
  DollarSign,
  Bell,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Delegates",
    url: "/delegates",
    icon: Users,
  },
  {
    title: "Secretariat",
    url: "/secretariat",
    icon: UserCog,
  },
  {
    title: "Committees",
    url: "/committees",
    icon: Boxes,
  },
  {
    title: "Portfolios",
    url: "/portfolios",
    icon: Globe,
  },
  {
    title: "Allocation Matrix",
    url: "/allocation-matrix",
    icon: Grid3x3,
  },
  {
    title: "Executive Board",
    url: "/executive-board",
    icon: Crown,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Logistics",
    url: "/logistics",
    icon: Package,
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Megaphone,
  },
  {
    title: "Sponsorships",
    url: "/sponsorships",
    icon: DollarSign,
  },
  {
    title: "Updates",
    url: "/updates",
    icon: Bell,
  },
  {
    title: "Marking Criteria",
    url: "/marking-criteria",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold">MUN Manager</h2>
            <p className="text-xs text-muted-foreground">Conference 2025</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
