import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGateModal } from "@/components/AuthGateModal";
import { Button } from "@/components/ui/button";
import MenuListWeb from "@/components/web/MenuListWeb";
import ReviewsWeb from "@/components/web/ReviewsWeb";
import InfoPanelWeb from "@/components/web/InfoPanelWeb";
import OrderReserveBarWeb from "@/components/web/OrderReserveBarWeb";
import RestaurantHeaderWeb from "@/components/web/RestaurantHeaderWeb";
import TabNavigationWeb from "@/components/web/TabNavigationWeb";
import { useCart } from "@/lib/cart/CartContext";
import FloatingCartWeb from "@/components/web/orders/FloatingCartWeb";
import AuthModalWeb from "@/components/auth/AuthModalWeb";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import mobileAuthService from "@/lib/auth/mobileAuthService";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitial, setAuthInitial] = useState<"signin" | "signup">("signup");
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());
  const [userName, setUserName] = useState<string | null>(authLocal.getUser()?.firstName ? `${authLocal.getUser()?.firstName} ${authLocal.getUser()?.lastName || ''}`.trim() : null);
  const [userEmail, setUserEmail] = useState<string | null>(authLocal.getUser()?.email || null);
  const [activeTab, setActiveTab] = useState<'Menu' | 'Reviews' | 'Info'>('Menu');
  const { initiator, preOrderEnabled } = useCart();
  const showControls = initiator === 'order' || (initiator === 'reserve' && preOrderEnabled);

  useEffect(() => {
    const unsubLogin = authBus.subscribe('login', () => {
      setIsAuthed(true);
      const u = authLocal.getUser();
      setUserName(u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : null);
      setUserEmail(u?.email || null);
    });
    const unsubLogout = authBus.subscribe('logout', () => {
      setIsAuthed(false);
      setUserName(null);
      setUserEmail(null);
    });
    return () => { unsubLogin(); unsubLogout(); };
  }, []);

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
      {/* Sticky top header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/discover')} className="px-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="sr-only">Back</span>
            </Button>
            <div className="text-sm font-medium truncate">
              {restaurant?.name || 'Restaurant'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <Button variant="outline" size="sm" onClick={() => { setAuthInitial('signin'); setAuthOpen(true); }}>Sign in</Button>
                <Button size="sm" onClick={() => { setAuthInitial('signup'); setAuthOpen(true); }}>Sign up</Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold leading-tight truncate max-w-[200px] sm:max-w-[280px]">{userName || 'Account'}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]">{userEmail}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try { await mobileAuthService.logout(); } catch { /* noop */ }
                    navigate('/discover');
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
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
              <MenuListWeb menu={restaurant.menu} restaurantId={restaurant.id} showControls={showControls} />
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
        <AuthGateModal open={false} onOpenChange={() => {}} />
        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} initialView={authInitial} onAuthed={() => { /* success handled inside modal */ }} />
      </div>

      {/* Sticky bottom bar - rendered at root level to sit at the viewport bottom */}
      {activeTab === 'Menu' && (
        <OrderReserveBarWeb restaurantId={restaurant.id} />
      )}
    </div>
  );
}
