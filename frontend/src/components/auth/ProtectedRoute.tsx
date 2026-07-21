import type { ReactNode } from "react";

import { useAuth } from "../../context/AuthContext";

type Props = {
  children: ReactNode;
  unauthenticated: ReactNode;
};

export default function ProtectedRoute({ children, unauthenticated }: Props) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading...
      </div>
    );
  }

  return authenticated ? <>{children}</> : <>{unauthenticated}</>;
}
