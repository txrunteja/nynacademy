import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function ProtectedRoute() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: getSession,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
