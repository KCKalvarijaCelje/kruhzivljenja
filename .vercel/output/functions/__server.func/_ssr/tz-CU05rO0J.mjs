import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as createMiddleware } from "./createMiddleware-BvN2ghIY.mjs";
import { a as getRequest } from "./server-Dm1gvL4M.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { H as Html } from "../_libs/react-email__html.mjs";
import { H as Head } from "../_libs/react-email__head.mjs";
import { P as Preview } from "../_libs/react-email__preview.mjs";
import { B as Body } from "../_libs/react-email__body.mjs";
import { C as Container } from "../_libs/react-email__container.mjs";
import { S as Section } from "../_libs/react-email__section.mjs";
import { I as Img } from "../_libs/react-email__img.mjs";
import { H as Heading } from "../_libs/react-email__heading.mjs";
import { T as Text } from "../_libs/react-email__text.mjs";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
        ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
      console.error(`[Supabase] ${message}`);
      throw new Response(message, { status: 500 });
    }
    const request = getRequest();
    if (!request?.headers) {
      throw new Response("Unauthorized: No request headers available", { status: 401 });
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new Response("Unauthorized: No authorization header provided", { status: 401 });
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new Response("Unauthorized: Only Bearer tokens are supported", { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Response("Unauthorized: No token provided", { status: 401 });
    }
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          storage: void 0,
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }
    if (!data.claims.sub) {
      throw new Response("Unauthorized: No user ID found in token", { status: 401 });
    }
    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims
      }
    });
  }
);
const DriverNotificationEmail = ({
  heading = "Obvestilo",
  body = "",
  footer = null,
  preview = "KRUH ŽIVLJENJA — obvestilo",
  brand = {}
}) => {
  const appName = brand.appName || "KRUH ŽIVLJENJA";
  const accent = brand.primaryColor || "#0a0a0a";
  const bodyLines = body.split("\n");
  const footerLines = (footer ?? brand.footerText ?? appName).split("\n");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "sl", dir: "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, { children: preview }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container, children: [
      brand.logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Img,
        {
          src: brand.logoUrl,
          alt: appName,
          height: "48",
          style: { height: 48, width: "auto" }
        }
      ) }) : null,
      brand.headerImageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { style: { marginBottom: 20 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Img,
        {
          src: brand.headerImageUrl,
          alt: "",
          width: "520",
          style: { width: "100%", maxWidth: 520, height: "auto", borderRadius: 6 }
        }
      ) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: { ...h1, color: accent }, children: heading }),
      bodyLines.map(
        (line, i) => line.trim() === "" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 12 } }, `b${i}`) : /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: text, children: line }, `b${i}`)
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 24 } }),
      footerLines.map(
        (line, i) => line.trim() === "" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 8 } }, `f${i}`) : /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footerStyle, children: line }, `f${i}`)
      )
    ] }) })
  ] });
};
const template = {
  component: DriverNotificationEmail,
  subject: (data) => data?.subject || "KRUH ŽIVLJENJA",
  displayName: "Driver notification",
  previewData: {
    subject: "Nov razpored prevoza — 2026-01-15",
    heading: "Nov razpored prevoza",
    body: "Pozdravljen Janez,\n\ndodeljen si kot voznik za prevzem hrane:\n\nDatum: 15. 1. 2026\nLokacija: Mercator Celje\nRazdeljevalec: Ana Novak\n\nHvala za tvojo pomoč!",
    footer: "Lep pozdrav,\nKruh življenja",
    preview: "Nova dodelitev za 15. 1. 2026"
  }
};
const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px 28px", maxWidth: "560px" };
const h1 = { fontSize: "22px", fontWeight: "bold", margin: "0 0 20px" };
const text = { fontSize: "14px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 8px" };
const footerStyle = { fontSize: "12px", color: "#71717a", lineHeight: "1.6", margin: "0 0 4px" };
const APP_TIMEZONE = "Europe/Ljubljana";
function formatAppDate(input) {
  const d = typeof input === "string" ? parseCalendarDate(input) : input;
  const parts = new Intl.DateTimeFormat("sl-SI", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  return `${day}. ${month}. ${year}`;
}
function formatAppTime(input = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("sl-SI", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(input);
}
function formatAppDateTime(input = /* @__PURE__ */ new Date()) {
  return `${formatAppDate(input)} ${formatAppTime(input)}`;
}
function parseCalendarDate(s) {
  const [y, m, d] = s.split("-").map((v) => parseInt(v, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
}
export {
  formatAppDate as a,
  formatAppDateTime as b,
  formatAppTime as f,
  requireSupabaseAuth as r,
  template as t
};
