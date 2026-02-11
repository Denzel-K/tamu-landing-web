import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGateModal } from "@/components/AuthGateModal";
import { Button } from "@/components/ui/button";
import MenuListWeb, { type MenuCategoryWeb } from "@/components/web/MenuListWeb";
import ReviewsWeb from "@/components/web/ReviewsWeb";
import InfoPanelWeb from "@/components/web/InfoPanelWeb";
import OrderReserveBarWeb from "@/components/web/OrderReserveBarWeb";
import RestaurantHeaderWeb from "@/components/web/RestaurantHeaderWeb";
import TabNavigationWeb from "@/components/web/TabNavigationWeb";
import { useCart } from "@/lib/cart/CartContext";
import FloatingCartWeb from "@/components/web/orders/FloatingCartWeb";
import AppHeaderWeb from "@/components/web/headers/AppHeaderWeb";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import mobileAuthService from "@/lib/auth/mobileAuthService";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Menu' | 'Reviews' | 'Info'>('Menu');
  const {
    initiator,
    preOrderEnabled,
    setTableNumber,
    setWaiterName,
    setRestaurantId,
    restaurantId: cartRestaurantId
  } = useCart();
  const showControls = initiator === 'order' || (initiator === 'reserve' && preOrderEnabled);

  // Sync QR context and restaurant ID
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const table = searchParams.get('table');
    const waiter = searchParams.get('waiter');
    if (table) setTableNumber(table);
    if (waiter) setWaiterName(waiter);

    if (id && id !== cartRestaurantId) {
      setRestaurantId(id);
    }
  }, [id, cartRestaurantId, setTableNumber, setWaiterName, setRestaurantId]);

  // Accept both mobile-style categorized menus and flat item arrays from API
  type RawMenuItem = {
    id?: string;
    name?: string;
    title?: string;
    price?: number;
    amount?: number;
    description?: string;
    desc?: string;
    image?: string;
    photoUrl?: string;
    images?: string[];
  };
  type RawMenuCategory = { category?: string; items?: RawMenuItem[] };

  // Normalize menu into categories expected by MenuListWeb
  const normalizedMenu = useMemo<MenuCategoryWeb[]>(() => {
    const raw = restaurant?.menu as unknown as (RawMenuItem | MenuCategoryWeb)[] | undefined;
    if (!Array.isArray(raw) || raw.length === 0) return [] as MenuCategoryWeb[];

    // Helper to map any menu item shape to the web component shape
    const mapItem = (it: RawMenuItem) => ({
      id: it?.id,
      name: it?.name ?? it?.title ?? '',
      price: Number(it?.price ?? it?.amount ?? 0),
      description: it?.description ?? it?.desc ?? undefined,
      image: it?.image ?? it?.photoUrl ?? (Array.isArray(it?.images) ? it.images[0] : undefined),
      photoUrl: it?.photoUrl,
      images: it?.images,
    });

    // Case 1: Already categorized e.g., [{ category, items: [...] }]
    const first = raw[0] as RawMenuItem | RawMenuCategory;
    const looksCategorized = typeof first === 'object' && first !== null && 'category' in (first as RawMenuCategory) && Array.isArray((first as RawMenuCategory).items);
    if (looksCategorized) {
      return (raw as RawMenuCategory[]).map((cat): MenuCategoryWeb => ({
        category: String(cat?.category ?? 'Menu'),
        items: Array.isArray(cat?.items) ? cat.items.map(mapItem) : [],
      }));
    }

    // Case 2: Flat list -> wrap in a single category
    return [{ category: 'Menu', items: (raw as RawMenuItem[]).map(mapItem) }];
  }, [restaurant?.menu]);

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
      } catch (e) {
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
      <AppHeaderWeb
        pageTitle={restaurant?.name || 'Restaurant'}
        pageSubtitle={restaurant?.cuisine || undefined}
        showBackButton={true}
        backTo="/discover"
        showAuthButtons={true}
      />
      {/* Scrollable content area */}
      <div
        className="container mx-auto px-6 py-10 flex-1"
        style={{ paddingBottom: 'calc(var(--order-bar-h, 96px) + 32px)' }}
      >
        <RestaurantHeaderWeb restaurant={restaurant} />
        <div className="flex items-center justify-between mb-4">
          <TabNavigationWeb tabs={["Menu", "Reviews", "Info"] as const} activeTab={activeTab} onChange={(t: 'Menu' | 'Reviews' | 'Info') => setActiveTab(t)} />
        </div>

        {/* Content */}
        {activeTab === 'Menu' && (
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuListWeb
                menu={normalizedMenu}
                restaurantId={restaurant.id}
                showControls={showControls}
                canReserve={!!restaurant.availableReservationTypes?.length}
              />
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
              <InfoPanelWeb restaurant={restaurant} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'Menu' && (
          <FloatingCartWeb restaurantId={restaurant.id} />
        )}
        <AuthGateModal open={false} onOpenChange={() => { }} />
      </div>

      {/* Sticky bottom bar - rendered at root level to sit at the viewport bottom */}
      {activeTab === 'Menu' && (
        <OrderReserveBarWeb
          restaurantId={restaurant.id}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
