import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "@/components/AuthGateModal";
import { fetchMe } from "@/lib/api/auth";
import MenuListWeb from "@/components/web/MenuListWeb";
import ReviewsWeb from "@/components/web/ReviewsWeb";
import InfoPanelWeb from "@/components/web/InfoPanelWeb";
import OrderReserveBarWeb from "@/components/web/OrderReserveBarWeb";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Menu' | 'Reviews' | 'Info'>('Menu');

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

  const handleStartOrder = async () => {
    const me = await fetchMe();
    if (!me?.user?.id) {
      setAuthOpen(true);
      return;
    }
    navigate(`/orders/new?restaurantId=${encodeURIComponent(id || "")}`);
  };

  const handleStartReservation = async () => {
    const me = await fetchMe();
    if (!me?.user?.id) {
      setAuthOpen(true);
      return;
    }
    navigate(`/reservations/new?restaurantId=${encodeURIComponent(id || "")}`);
  };

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
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          {restaurant.cuisine && (
            <p className="text-muted-foreground">{restaurant.cuisine}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStartOrder}>Order</Button>
          <Button variant="outline" onClick={handleStartReservation}>Reserve</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-4 flex">
        {(['Menu','Reviews','Info'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Menu' && (
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuListWeb menu={restaurant.menu as any} />
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

      <div className="h-20" />
      <OrderReserveBarWeb restaurantId={restaurant.id} />
      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
