import type { Context } from "hono";

export const generateState = (c: Context) => {
  return JSON.stringify({
    clientRedirectUrl: c.req.query("clientRedirectUrl"),
    key: Bun.randomUUIDv7("base64url"),
  });
};
