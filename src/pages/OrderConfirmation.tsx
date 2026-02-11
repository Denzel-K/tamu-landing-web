import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchOrderById,
  cancelOrder,
  updateOrder,
  type WebOrder,
  type WebOrderItem,
} from "@/lib/api/orders";
import {
  fetchPaymentMethodsForRestaurant,
  fetchPaymentConfigForBusiness,
  type PaymentMethodsResponse,
  type PaymentConfigResponse,
} from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import ModifyOrderItemsModal from "@/components/web/orders/ModifyOrderItemsModal";
import { AlphaTesterModal } from "@/components/AlphaTesterModal";
import { ApkDownloadModal } from "@/components/ApkDownloadModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  connectSocket,
  type SocketConnectionState,
  type ClientSocket,
} from "@/lib/realtime/socketClient";
import AppHeaderWeb from "@/components/web/headers/AppHeaderWeb";
import {
  CheckCircle2,
  CreditCard,
  Edit2,
  Share2,
  Trash2,
  User,
  ImageIcon,
  Smartphone,
  Calendar,
  ChefHat,
  Wallet,
  Award,
  Download,
  FlaskConical,
  Apple,
  ArrowLeft,
  Store,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import appConfig from "@/config/app-config.json";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<WebOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse["config"] | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [showModify, setShowModify] = useState(false);
  const [showAlphaModal, setShowAlphaModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [connState, setConnState] = useState<SocketConnectionState>("idle");
  const socketRef = useRef<ClientSocket | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(id);
      setOrder(data?.order || null);
      const bizId = data?.order?.restaurant?.id || "";
      if (bizId) {
        try {
          const methods = await fetchPaymentMethodsForRestaurant(bizId);
          setPaymentMethods(methods);
        } catch (err) {
          console.error("Failed to fetch payment methods", err);
        }
        try {
          const pc = await fetchPaymentConfigForBusiness(bizId);
          setPaymentConfig(pc?.config || null);
        } catch (err) {
          console.error("Failed to fetch payment config", err);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load order";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime via Socket.IO with fallback polling
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setConnState("connecting");
        const socket = await connectSocket();
        if (!mounted) return;
        socketRef.current = socket;
        socket.on("connect", () => setConnState("connected"));
        socket.on("disconnect", () => setConnState("disconnected"));
        socket.on("connect_error", () => setConnState("error"));
        socket.emit("order:subscribe", { orderId: id });
        socket.on("order:status", (payload: { orderId: string; status: string }) => {
          if (payload?.orderId === id)
            setOrder((prev) => (prev ? { ...prev, status: payload.status } : prev));
        });
        socket.on("order:updated", (payload: { orderId: string; order: WebOrder }) => {
          if (payload?.orderId === id) setOrder(payload.order);
        });
      } catch (err) {
        console.error("Socket connection error", err);
        setConnState("error");
      }
    })();
    const interval = setInterval(() => {
      if (connState !== "connected") void load();
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
      if (socketRef.current) {
        try {
          socketRef.current.emit("order:unsubscribe", { orderId: id });
        } catch (err) {
          console.error("Failed to unsubscribe order", err);
        }
        try {
          socketRef.current.disconnect();
        } catch (err) {
          console.error("Failed to disconnect socket", err);
        }
        socketRef.current = null;
      }
    };
  }, [id, connState, load]);

  const handleModifyOrder = async (updatedItems: WebOrderItem[]) => {
    if (!id) return;
    try {
      await updateOrder(id, { items: updatedItems });
      toast({
        title: "Order updated",
        description: "Your order has been successfully modified.",
      });
      await load();
      setShowModify(false);
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
      throw e;
    }
  };

  const handleShare = async () => {
    const text = `My order ID is #${String(id).slice(-6).toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied!",
          description: "Order ID copied to clipboard",
        });
      } catch {
        toast({
          title: "Share failed",
          description: "Could not share order ID",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      if (id) await cancelOrder(id);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
      navigate("/discover");
    } catch (err) {
      toast({
        title: "Cancel failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (error || !order)
    return (
      <>
        <AppHeaderWeb pageTitle="Order Confirmation" showBackButton={true} backTo="/discover" />
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-2xl mx-auto border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-destructive text-lg font-semibold">
                  {error || "Order not found"}
                </div>
                <Button onClick={() => navigate("/discover")}>Return to Discover</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );

  const subtotal = order.items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );

  const statusColors = {
    pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    preparing: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    completed: "bg-green-500/20 text-green-700 border-green-500/30",
    cancelled: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  };

  return (
    <>
      <AppHeaderWeb
        pageTitle="Order Confirmation"
        pageSubtitle={order.restaurant?.name || undefined}
        showBackButton={true}
        backTo="/discover"
      />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Quick Navigation */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/restaurant/${encodeURIComponent(order.restaurant?.id || "")}`)}
            className="flex-1 gap-2"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">View</span> Restaurant
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/discover")}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Button>
        </div>

        {/* Order Status Card */}
        <Card className="mb-4 shadow-lg border-2 border-primary/10">
          <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-primary/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold mb-1">Order Placed</h1>
                <p className="text-sm text-muted-foreground mb-2">Live tracking enabled</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`${statusColors[order.status as keyof typeof statusColors] || statusColors.pending} font-bold border text-xs`}
                  >
                    {String(order.status || "pending").toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`font-semibold border text-xs ${
                      connState === "connected"
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                        connState === "connected" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {connState === "connected" ? "LIVE" : "SYNCING"}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleShare} className="shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
              <div>
                <span className="text-muted-foreground">Order ID: </span>
                <span className="font-mono font-bold text-primary">
                  #{String(id).slice(-6).toUpperCase()}
                </span>
              </div>
              {order.waiterName && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{order.waiterName}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            {/* Items */}
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shadow-sm border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                        x{item.quantity}
                      </Badge>
                      <span>Ksh {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="font-bold text-primary text-sm">
                    Ksh {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="font-bold">Total</span>
              <span className="text-xl font-black text-primary">Ksh {subtotal.toLocaleString()}</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!paymentMethods && order.restaurant?.id) {
                      const m = await fetchPaymentMethodsForRestaurant(order.restaurant.id);
                      setPaymentMethods(m);
                    }
                    if (!paymentConfig && order.restaurant?.id) {
                      const pc = await fetchPaymentConfigForBusiness(order.restaurant.id);
                      setPaymentConfig(pc?.config || null);
                    }
                    setShowPay(true);
                  }}
                  className="gap-1"
                >
                  <CreditCard className="h-3 w-3" />
                  Pay
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModify(true)}
                className="gap-1 border-blue-500/30 text-blue-600"
              >
                <Edit2 className="h-3 w-3" />
                Modify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="gap-1 border-red-500/30 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Promotion */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 shadow-lg overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-2">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Get More with the TAMU App</h2>
              <p className="text-sm text-muted-foreground">
                Experience the full TAMU ecosystem on your phone
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Events & Experiences</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <ChefHat className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Chef's Corner</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Digital Wallet</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center">Loyalty Program</span>
              </div>
            </div>

            <div className="space-y-2">
              {appConfig.isOfficial ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1 gap-2"
                    disabled={!appConfig.appleStoreLink}
                    onClick={() => window.open(appConfig.appleStoreLink, "_blank")}
                  >
                    <Apple className="h-4 w-4" />
                    App Store
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={!appConfig.playStoreLink}
                    onClick={() => window.open(appConfig.playStoreLink, "_blank")}
                  >
                    <Smartphone className="h-4 w-4" />
                    Google Play
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowAlphaModal(true)}
                >
                  <FlaskConical className="h-4 w-4" />
                  Join Alpha Testing
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                {appConfig.isOfficial
                  ? "Download now and unlock exclusive features"
                  : "Be among the first to experience the future of dining"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{
          serviceType: "order",
          referenceId: String(id || ""),
          amount: subtotal,
          businessId: String(order.restaurant?.id || ""),
          allowPayLater: true,
        }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={() => setShowPay(false)}
        onDeferCash={() => setShowPay(false)}
        onSubmittedManual={() => setShowPay(false)}
      />

      <ModifyOrderItemsModal
        visible={showModify}
        onClose={() => setShowModify(false)}
        order={{
          id,
          restaurantId: order.businessId || order.restaurant?.id,
          items: order.items,
        }}
        onSave={handleModifyOrder}
      />

      <AlphaTesterModal open={showAlphaModal} onOpenChange={setShowAlphaModal} />
      <ApkDownloadModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </>
  );
}
