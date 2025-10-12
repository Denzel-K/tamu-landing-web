import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function RRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/restaurant/${encodeURIComponent(id)}`, { replace: true });
    } else {
      navigate(`/discover`, { replace: true });
    }
  }, [id, navigate]);

  return <div className="container mx-auto px-6 py-10">Redirecting…</div>;
}
