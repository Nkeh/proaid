import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreHydration } from "@/components/providers/store-hydration";
import { HydrationGate } from "@/components/providers/hydration-gate";
import { DemoPanel } from "@/components/demo/demo-panel";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHydration />
      <HydrationGate>
        <TooltipProvider>
          {children}
          <DemoPanel />
        </TooltipProvider>
      </HydrationGate>
    </>
  );
}
