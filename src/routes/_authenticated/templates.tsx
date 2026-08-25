import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplatesRedirect,
});

function TemplatesRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/admin", replace: true });
  }, [navigate]);

  return (
    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm">Preusmerjanje na Administracijo...</span>
    </div>
  );
}
