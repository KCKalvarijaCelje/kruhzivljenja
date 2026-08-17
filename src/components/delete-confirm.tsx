import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

export type DeleteCheck = () => Promise<boolean>; // true => in use (must archive)
export type DeleteAction = (mode: "hard" | "soft") => Promise<void>;

export function DeleteConfirm({
  open,
  onOpenChange,
  title,
  checkInUse,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  checkInUse: DeleteCheck;
  onConfirm: DeleteAction;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [inUse, setInUse] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    checkInUse()
      .then((u) => setInUse(u))
      .finally(() => setLoading(false));
  }, [open]);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm(inUse ? "soft" : "hard");
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? t("confirmDelete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {loading
              ? t("checkingUsage")
              : inUse
                ? t("archiveInsteadWarning")
                : t("permanentDeleteWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || busy}
            onClick={(e) => {
              e.preventDefault();
              run();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {inUse ? t("archive") : t("deletePermanently")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
