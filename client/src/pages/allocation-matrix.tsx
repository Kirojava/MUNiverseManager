import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Delegate, Committee, Portfolio } from "@shared/schema";
import { Grid3x3, User, Award } from "lucide-react";

export default function AllocationMatrix() {
  const { data: delegates } = useQuery<Delegate[]>({ queryKey: ["/api/delegates"] });
  const { data: committees } = useQuery<Committee[]>({ queryKey: ["/api/committees"] });
  const { data: portfolios } = useQuery<Portfolio[]>({ queryKey: ["/api/portfolios"] });

  const allocations = delegates?.map(delegate => {
    const committee = committees?.find(c => c.id === delegate.committeeId || c.name === delegate.committee);
    const portfolio = portfolios?.find(p => p.id === delegate.portfolioId || p.name === delegate.portfolio);
    
    return {
      id: delegate.id,
      delegateName: delegate.name,
      committeeName: committee?.name || delegate.committee || "N/A",
      portfolioName: portfolio?.name || delegate.portfolio || "N/A",
      school: delegate.school,
    };
  }) || [];

  const committeeGroups = allocations.reduce((acc, allocation) => {
    if (!acc[allocation.committeeName]) {
      acc[allocation.committeeName] = [];
    }
    acc[allocation.committeeName].push(allocation);
    return acc;
  }, {} as Record<string, typeof allocations>);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Grid3x3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Portfolio Allocation Matrix</h1>
          <p className="text-muted-foreground">View committee-portfolio-delegate assignments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(committeeGroups).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No allocations yet. Add delegates with committees and portfolios to see them here.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(committeeGroups).map(([committeeName, delegatesList]) => (
                <div key={committeeName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-sm px-3 py-1">
                      {committeeName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {delegatesList.length} {delegatesList.length === 1 ? 'delegate' : 'delegates'}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Delegate</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Portfolio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delegatesList.map((allocation) => (
                        <TableRow key={allocation.id} data-testid={`row-allocation-${allocation.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{allocation.delegateName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {allocation.school}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{allocation.portfolioName}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
