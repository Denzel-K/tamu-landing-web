import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { connectSocket, type SocketConnectionState } from "@/lib/realtime/socketClient";
import AppHeaderWeb from "@/components/web/headers/AppHeaderWeb";
import { AlphaTesterModal } from "@/components/AlphaTesterModal";
import { ApkDownloadModal } from "@/components/ApkDownloadModal";
import {
  CheckCircle2,
  Share2,
  User,
  Calendar,
  ChefHat,
  Wallet,
  Award,
  Smartphone,
  Apple,
  FlaskConical,
  ArrowLeft,
  Store,
  Users,
  Clock,
} from "lucide-react";
import appConfig from "@/config/app-config.json";

// Placeholder type; wire to real reservation fetch if available later
interface ReservationItem {
  name: string;
  quantity: number;
  price?: number;
}
interface Reservation {
  id: string;
  restaurant?: { id: string; name?: string };
  type?: string;
  partySize?: number;
  date?: string;
  time?: string;
  status?: string;
  items?: ReservationItem[];
}

async function fetchReservationByIdWeb(id: string): Promise<Reservation | null> {
  try {
    const res = await fetch(`/api/reservations/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.reservation || null;
  } catch {
    return null;
  }
}

export default function ReservationConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connState, setConnState] = useState<SocketConnectionState>("idle");
  const [showAlphaModal, setShowAlphaModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReservationByIdWeb(id);
        if (!mounted) return;
        setReservation(r);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load reservation";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Realtime + polling fallback
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
        socket.emit("reservation:subscribe", { reservationId: id });
        socket.on(
          "reservation:status",
          (payload: { reservationId: string; status: string }) => {
            if (payload?.reservationId === id)
              setReservation((prev) =>
                prev ? { ...prev, status: payload.status } : prev
              );
          }
        );
        socket.on(
          "reservation:updated",
          (payload: { reservationId: string; reservation: Reservation }) => {
            if (payload?.reservationId === id) setReservation(payload.reservation);
          }
        );
      } catch {
        setConnState("error");
      }
    })();
    const interval = setInterval(async () => {
      if (connState !== "connected" && id) {
        try {
          const r = await fetchReservationByIdWeb(id);
          setReservation(r);
        } catch (e: any) {
          console.log(e.message);
        }
      }
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
      if (socketRef.current) {
        try {
          (socketRef.current as any).emit("reservation:unsubscribe", { reservationId: id });
        } catch (e: any) {
          console.log(e.message);
        }
        try {
          (socketRef.current as any).disconnect();
        } catch (e: any) {
          console.log(e.message);
        }
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleShare = async () => {
    const text = `My reservation ID is #${String(id).slice(-6).toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        console.log("Could not copy to clipboard");
      }
    }
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

  if (error || !reservation)
    return (
      <>
        <AppHeaderWeb pageTitle="Reservation Confirmation" showBackButton={true} backTo="/discover" />
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-2xl mx-auto border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-destructive text-lg font-semibold">
                  {error || "Reservation not found"}
                </div>
                <Button onClick={() => navigate("/discover")}>Return to Discover</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );

  const items = Array.isArray(reservation.items) ? reservation.items : [];
  const total = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );

  const statusColors = {
    pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    confirmed: "bg-green-500/20 text-green-700 border-green-500/30",
    cancelled: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  };

  return (
    <>
      <AppHeaderWeb
        pageTitle="Reservation Confirmation"
        pageSubtitle={reservation?.restaurant?.name || undefined}
        showBackButton={true}
        backTo="/discover"
      />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Quick Navigation */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/restaurant/${encodeURIComponent(reservation.restaurant?.id || "")}`)
            }
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

        {/* Reservation Status Card */}
        <Card className="mb-4 shadow-lg border-2 border-primary/10">
          <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-primary/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold mb-1">Reservation Placed</h1>
                <p className="text-sm text-muted-foreground mb-2">We've received your reservation</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`${
                      (statusColors as any)[reservation.status as keyof typeof statusColors] ||
                      statusColors.pending
                    } font-bold border text-xs`}
                  >
                    {String(reservation.status || "pending").toUpperCase()}
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
                <span className="text-muted-foreground">Reservation ID: </span>
                <span className="font-mono font-bold text-primary">
                  #{String(id).slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            {/* Reservation Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Party Size</div>
                  <div className="font-bold text-sm">{reservation.partySize || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <User className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div className="font-bold text-sm capitalize truncate">
                    {reservation.type || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-bold text-sm truncate">{reservation.date || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-bold text-sm truncate">{reservation.time || "-"}</div>
                </div>
              </div>
            </div>

            {/* Pre-ordered Items (if any) */}
            {items.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-muted-foreground">Pre-ordered Items</h3>
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          x{it.quantity}
                        </Badge>
                        <span className="text-sm font-medium">{it.name}</span>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        Ksh {((Number(it.price) || 0) * (Number(it.quantity) || 0)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="font-bold">Subtotal</span>
                  <span className="text-xl font-black text-primary">Ksh {total.toLocaleString()}</span>
                </div>
              </div>
            )}
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
      <AlphaTesterModal open={showAlphaModal} onOpenChange={setShowAlphaModal} />
      <ApkDownloadModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </>
  );
}
