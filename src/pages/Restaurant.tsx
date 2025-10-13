import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGateModal } from "@/components/AuthGateModal";
import MenuListWeb from "@/components/web/MenuListWeb";
import ReviewsWeb from "@/components/web/ReviewsWeb";
import InfoPanelWeb from "@/components/web/InfoPanelWeb";
import OrderReserveBarWeb from "@/components/web/OrderReserveBarWeb";
import RestaurantHeaderWeb from "@/components/web/RestaurantHeaderWeb";
import TabNavigationWeb from "@/components/web/TabNavigationWeb";
import { useCart } from "@/lib/cart/CartContext";
import FloatingCartWeb from "@/components/web/orders/FloatingCartWeb";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Menu' | 'Reviews' | 'Info'>('Menu');
  const { initiator, preOrderEnabled } = useCart();
  const showControls = initiator === 'order' || (initiator === 'reserve' && preOrderEnabled);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        if (!id) throw new Error("Missing restaurant id");
        const res = await getRestaurantById(id);
        if (!mounted) return;
        setRestaurant(res.restaurant);
      } catch (e: any) {
        if (!mounted) return; setError(e?.message || "Failed to load restaurant");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Order and Reservation actions are handled exclusively by OrderReserveBarWeb now.

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">Loading…</div>
    );
  }
  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3">{error || "Restaurant not found"}</div>
        <Link to="/discover" className="underline text-primary">Back to Discover</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scrollable content area */}
      <div
        className="container mx-auto px-6 py-10 flex-1"
        style={{ paddingBottom: 'calc(var(--order-bar-h, 96px) + 32px)' }}
      >
        <RestaurantHeaderWeb restaurant={restaurant} />
        <div className="flex items-center justify-between mb-4">
          <TabNavigationWeb tabs={["Menu","Reviews","Info"] as const} activeTab={activeTab} onChange={(t: 'Menu' | 'Reviews' | 'Info') => setActiveTab(t)} />
        </div>

        {/* Content */}
        {activeTab === 'Menu' && (
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuListWeb menu={restaurant.menu as any} restaurantId={restaurant.id} showControls={showControls} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'Reviews' && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsWeb restaurantId={restaurant.id} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'Info' && (
          <Card>
            <CardHeader>
              <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoPanelWeb restaurant={restaurant as any} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'Menu' && (
          <FloatingCartWeb restaurantId={restaurant.id} />
        )}
        <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>

      {/* Sticky bottom bar - rendered at root level to sit at the viewport bottom */}
      {activeTab === 'Menu' && (
        <OrderReserveBarWeb restaurantId={restaurant.id} />
      )}
    </div>
  );
}
