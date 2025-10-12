import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRestaurantByEmail } from "@/lib/api/restaurants";

export default function Enter() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rid = sp.get("rid");
      const email = sp.get("email");
      try {
        if (rid) {
          navigate(`/restaurant/${encodeURIComponent(rid)}`, { replace: true });
          return;
        }
        if (email) {
          const res = await getRestaurantByEmail(email);
          const id = res?.restaurant?.id;
          if (id) {
            navigate(`/restaurant/${encodeURIComponent(id)}`, { replace: true });
            return;
          }
        }
        throw new Error("Invalid QR link. Missing or unknown restaurant.");
      } catch (e) {
        if (!mounted) return; const msg = e instanceof Error ? e.message : "Failed to process link"; setError(msg);
      }
    })();
    return () => { mounted = false; };
  }, [navigate, sp]);

  return (
    <div className="container mx-auto px-6 py-10">
      {error ? (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      ) : (
        <div>Processing…</div>
      )}
    </div>
  );
}
