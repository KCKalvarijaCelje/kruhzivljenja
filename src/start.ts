import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/lovable/")) {
    return next();
  }

  try {
    return await next();
  } catch (error: any) {
    if (
      error != null &&
      (error.isRedirect ||
        error.statusCode ||
        error.status ||
        (typeof error === "object" && ("to" in error || "headers" in error)))
    ) {
      throw error;
    }
    console.error("Uncaught server request error:", error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
