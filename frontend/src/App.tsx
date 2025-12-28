import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Roast from "./pages/Roast";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import ExtensionAuth from "./pages/ExtensionAuth";
import ExtensionAuthSuccess from "./pages/ExtensionAuthSuccess";
import ExtensionInstructions from "./pages/ExtensionInstructions";
import NotFound from "./pages/NotFound";
import DevRoastDemo from "./pages/DevRoastDemo";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/roast" element={<Roast />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/extension-auth" element={<ExtensionAuth />} />
            <Route path="/extension-auth-success" element={<ExtensionAuthSuccess />} />
            <Route path="/extension-instructions" element={<ExtensionInstructions />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {import.meta.env.DEV && <Route path="/dev/roast" element={<DevRoastDemo />} />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
