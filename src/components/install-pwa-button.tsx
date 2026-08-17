import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Download } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPWAButton() {
  const { t } = useI18n();
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const installed = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    // Hide if already running standalone
    if (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) {
      setHidden(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (hidden || !evt) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await evt.prompt();
          await evt.userChoice;
        } finally {
          setEvt(null);
        }
      }}
    >
      <Download className="h-4 w-4 mr-1" />
      {t("installApp")}
    </Button>
  );
}
