import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  console.log("USER", user);
  console.log("LOADING", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleId !== 1 && user.roleId !== 2) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}