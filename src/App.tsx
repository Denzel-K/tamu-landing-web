import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Discover from "./pages/Discover.tsx";
import Restaurant from "./pages/Restaurant.tsx";
import OrderNew from "./pages/OrderNew.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import ReservationNew from "./pages/ReservationNew.tsx";
import ReservationConfirmation from "./pages/ReservationConfirmation.tsx";
import Enter from "./pages/Enter.tsx";
import RRedirect from "./pages/R.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import ManageTesters from "./pages/ManageTesters.tsx";
import { CartProvider } from "@/lib/cart/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/orders/new" element={<OrderNew />} />
          <Route path="/orders/confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/reservations/new" element={<ReservationNew />} />
          <Route path="/reservations/confirmation/:id" element={<ReservationConfirmation />} />
          <Route path="/enter" element={<Enter />} />
          <Route path="/r/:id" element={<RRedirect />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/manage-testers" element={<ManageTesters />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
