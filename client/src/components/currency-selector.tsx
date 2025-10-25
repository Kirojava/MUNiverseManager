import { useQuery, useMutation } from "@tanstack/react-query";
import { DollarSign, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppSettings } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export function CurrencySelector() {
  const { data: settings } = useQuery<AppSettings>({ queryKey: ["/api/app-settings"] });
  
  const updateMutation = useMutation({
    mutationFn: (data: { currency: string; currencySymbol: string }) => 
      apiRequest("PATCH", "/api/app-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/app-settings"] });
    },
  });

  const currentCurrency = settings?.currency || "USD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-currency-selector">
          <DollarSign className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => updateMutation.mutate({
              currency: currency.code,
              currencySymbol: currency.symbol,
            })}
            data-testid={`currency-${currency.code}`}
          >
            <span className="flex items-center gap-2 w-full">
              <span className="w-5">{currency.symbol}</span>
              <span className="flex-1">{currency.name}</span>
              {currentCurrency === currency.code && (
                <Check className="h-4 w-4" />
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
