import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useNavigate, d as useRouterState, O as Outlet } from "./_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./_ssr/router-Yc5lMt1t.mjs";
import { A as AppShell } from "./_ssr/app-shell-DhFhc2j_.mjs";
import "./_libs/sonner.mjs";
import "./_libs/seroval.mjs";
import { c as LoaderCircle } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_ssr/client-BqZHQrkq.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/lovable.dev__webhooks-js.mjs";
import "./_libs/react-email__render.mjs";
import "./_libs/prettier.mjs";
import "./_libs/html-to-text.mjs";
import "./_libs/selderee__plugin-htmlparser2.mjs";
import "./_libs/selderee.mjs";
import "./_libs/parseley.mjs";
import "./_libs/leac.mjs";
import "./_libs/peberminta.mjs";
import "./_libs/domhandler.mjs";
import "./_libs/domelementtype.mjs";
import "./_libs/htmlparser2.mjs";
import "./_libs/entities.mjs";
import "./_libs/deepmerge.mjs";
import "./_libs/dom-serializer.mjs";
import "./_ssr/tz-CU05rO0J.mjs";
import "./_ssr/createMiddleware-BvN2ghIY.mjs";
import "./_ssr/server-Dm1gvL4M.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_libs/react-email__html.mjs";
import "./_libs/react-email__head.mjs";
import "./_libs/react-email__preview.mjs";
import "./_libs/react-email__body.mjs";
import "./_libs/react-email__container.mjs";
import "./_libs/react-email__section.mjs";
import "./_libs/react-email__img.mjs";
import "./_libs/react-email__heading.mjs";
import "./_libs/react-email__text.mjs";
import "./_libs/lovable.dev__email-js.mjs";
import "./_ssr/driver-emails.functions-CYCYga1W.mjs";
import "./_ssr/createSsrRpc-Bob-CuPr.mjs";
import "./_libs/react-email__link.mjs";
import "./_libs/react-email__button.mjs";
import "./_libs/radix-ui__react-dropdown-menu.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-menu.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_ssr/utils-BhSPcRjB.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
function AuthLayout() {
  const {
    user,
    loading,
    isAdmin,
    isApproved,
    approvalStatus
  } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const ADMIN_ONLY_PREFIXES = ["/people", "/recipients", "/templates", "/admin", "/email-queue", "/email-templates"];
  const isOnAdminRoute = ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isOnPlannerDetailRoute = pathname.startsWith("/planner/");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login",
      search: {
        redirect: pathname
      }
    });
    if (!loading && user && approvalStatus !== "unknown" && !isApproved) {
      navigate({
        to: "/pending-approval"
      });
    }
    if (!loading && user && isApproved && !isAdmin && (isOnAdminRoute || isOnPlannerDetailRoute)) {
      navigate({
        to: "/planner"
      });
    }
  }, [loading, user, isApproved, approvalStatus, isAdmin, isOnAdminRoute, isOnPlannerDetailRoute, navigate, pathname]);
  if (loading || !user || approvalStatus !== "unknown" && !isApproved || !isAdmin && (isOnAdminRoute || isOnPlannerDetailRoute)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AuthLayout as component
};
