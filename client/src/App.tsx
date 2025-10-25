import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/currency-selector";
import Dashboard from "@/pages/dashboard";
import Delegates from "@/pages/delegates";
import Secretariat from "@/pages/secretariat";
import Committees from "@/pages/committees";
import Portfolios from "@/pages/portfolios";
import AllocationMatrix from "@/pages/allocation-matrix";
import ExecutiveBoard from "@/pages/executive-board";
import Tasks from "@/pages/tasks";
import Logistics from "@/pages/logistics";
import Marketing from "@/pages/marketing";
import Sponsorships from "@/pages/sponsorships";
import Updates from "@/pages/updates";
import MarkingCriteria from "@/pages/marking-criteria";
import Awards from "@/pages/awards";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/delegates" component={Delegates} />
      <Route path="/secretariat" component={Secretariat} />
      <Route path="/committees" component={Committees} />
      <Route path="/portfolios" component={Portfolios} />
      <Route path="/allocation-matrix" component={AllocationMatrix} />
      <Route path="/executive-board" component={ExecutiveBoard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/logistics" component={Logistics} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/sponsorships" component={Sponsorships} />
      <Route path="/updates" component={Updates} />
      <Route path="/marking-criteria" component={MarkingCriteria} />
      <Route path="/awards" component={Awards} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties} defaultOpen={true}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <CurrencySelector />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
