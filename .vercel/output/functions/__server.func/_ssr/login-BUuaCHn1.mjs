import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BqZHQrkq.mjs";
import { u as useAuth, a as useI18n } from "./router-Yc5lMt1t.mjs";
import { B as Button } from "./button-Dq7LlB-Y.mjs";
import { L as Label, I as Input } from "./label-C37PovNU.mjs";
import { l as logoUrl } from "./logo-DAzTNZeG.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { S as Sparkles, c as LoaderCircle, d as ChevronUp, e as ChevronDown, M as Mail, f as Lock, g as LogIn, L as LayoutDashboard } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./tz-CU05rO0J.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "./server-Dm1gvL4M.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__img.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./driver-emails.functions-CYCYga1W.mjs";
import "./createSsrRpc-Bob-CuPr.mjs";
import "../_libs/react-email__link.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-BhSPcRjB.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function getMediaUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = "https://pub-38b5d7ad707f4398a808e413bb3620c8.r2.dev";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const {
    t,
    lang,
    setLang
  } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = reactExports.useState(false);
  const [showEmailForm, setShowEmailForm] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [emailBusy, setEmailBusy] = reactExports.useState(false);
  const breadImgSrc = getMediaUrl("/kruh-bread.webp");
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const oauthError = hashParams.get("error_description") || queryParams.get("error_description") || hashParams.get("error") || queryParams.get("error");
      if (oauthError) {
        toast.error(`Prijava ni uspela: ${decodeURIComponent(oauthError.replace(/\+/g, " "))}`);
      }
    }
    if (!loading && user) navigate({
      to: "/planner"
    });
  }, [user, loading, navigate]);
  const handleGoogle = async () => {
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/planner`
      }
    });
    if (error) {
      toast.error(error.message ?? "Sign-in failed");
      setBusy(false);
    }
  };
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setEmailBusy(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        toast.error(error.message || (lang === "sl" ? "Napačno geslo ali e-pošta." : "Invalid credentials"));
        setEmailBusy(false);
        return;
      }
      toast.success(lang === "sl" ? "Uspešna prijava!" : "Signed in successfully!");
      navigate({
        to: "/planner"
      });
    } catch (err) {
      toast.error(err?.message || "Sign in error");
      setEmailBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col justify-between bg-gradient-to-b from-background via-secondary/30 to-background px-3 sm:px-4 py-4 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-4xl mx-auto flex justify-end items-center mb-3 sm:mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 p-1 bg-card/90 backdrop-blur border rounded-full shadow-xs text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLang("sl"), className: `px-2.5 py-1 rounded-full transition-all ${lang === "sl" ? "bg-primary text-primary-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground cursor-pointer"}`, children: "SL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLang("en"), className: `px-2.5 py-1 rounded-full transition-all ${lang === "en" ? "bg-primary text-primary-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground cursor-pointer"}`, children: "EN" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-4xl mx-auto bg-card border rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all my-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative md:col-span-5 lg:col-span-6 bg-[#f2e5d7] h-56 sm:h-72 md:h-full md:min-h-[480px] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: breadImgSrc, onError: (e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith("/kruh-bread.png")) {
          target.src = "/kruh-bread.png";
        }
      }, alt: "Kruh Življenja", className: "w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-7 lg:col-span-6 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4 sm:mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-secondary/50 border flex items-center justify-center p-2 shadow-xs shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "h-full w-full object-contain" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground", children: t("appName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-primary shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("bannerMotto") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-secondary/60 border text-[11px] sm:text-xs text-muted-foreground leading-relaxed italic", children: t("verseMatthew") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 sm:space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleGoogle, disabled: busy, size: "lg", className: "w-full font-bold shadow-sm h-11 sm:h-12 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-[0.99] cursor-pointer", children: [
            busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
            busy ? t("signingIn") : lang === "sl" ? "Nadaljuj z Google računom (Gmail)" : t("signInGoogle")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowEmailForm(!showEmailForm), className: "w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "sl" ? "Ali pa se prijavi z e-pošto in geslom" : "Or sign in with email and password" }),
              showEmailForm ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })
            ] }),
            showEmailForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEmailSignIn, className: "mt-2.5 p-3.5 sm:p-4 bg-secondary/50 rounded-2xl border space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-150", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: lang === "sl" ? "E-poštni naslov" : "Email Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "ime@domena.si", className: "pl-8 sm:pl-9 text-xs h-9 sm:h-10 bg-card" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: lang === "sl" ? "Geslo" : "Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "pl-8 sm:pl-9 text-xs h-9 sm:h-10 bg-card" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: emailBusy, className: "w-full text-xs font-bold h-9 mt-1", size: "sm", children: [
                emailBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-3.5 h-3.5 mr-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: emailBusy ? lang === "sl" ? "Preverjanje..." : "Checking..." : lang === "sl" ? "Prijava z e-pošto" : "Sign in with Email" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "w-full text-xs font-medium h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-3.5 w-3.5 mr-2 text-muted-foreground" }),
            t("dashboard")
          ] }) }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-4 sm:mt-6 mb-1 w-full max-w-2xl mx-auto text-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 mb-1 text-primary/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-6 bg-primary/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] sm:text-[11px] font-bold tracking-widest uppercase", children: lang === "sl" ? "Janez 6,35" : "John 6:35" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-6 bg-primary/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] sm:text-xs md:text-sm italic text-muted-foreground leading-relaxed", children: t("verseJohn") })
    ] })
  ] });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4 mr-2 shrink-0", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#fff", d: "M21.35 11.1H12v3.2h5.35c-.23 1.5-1.66 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.65 4.36 14.55 3.4 12 3.4 6.94 3.4 2.85 7.5 2.85 12.55s4.09 9.15 9.15 9.15c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.05-.15-1.5z" }) });
}
export {
  LoginPage as component
};
