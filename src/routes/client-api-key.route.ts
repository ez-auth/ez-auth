import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

import { apiResponse } from "@/lib/api-utils/api-response";
import { isSuperadmin } from "@/lib/middlewares/is-superadmin.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import {
  createClientApiKeyResponseSchema,
  getClientApiKeyResponseSchema,
  listClientApiKeysResponseSchema,
} from "@/lib/openapi/schemas";
import {
  createClientApiKeyUsecase,
  deleteClientApiKeyUsecase,
  getClientApiKeyUsecase,
  getClientApiKeysUsecase,
  updateClientApiKeyUsecase,
} from "@/usecases/client-api-key";
import { ClientApiKeyType } from "@prisma/client";

const route = new Hono();
route.use("*", isSuperadmin);

const tags = ["Client API Keys"];

route.post(
  "/",
  baseDescribeRoute(
    {
      description: "Create a new client API key",
      tags,
    },
    createClientApiKeyResponseSchema,
  ),
  validator(
    "json",
    z.object({ name: z.string(), type: z.enum([ClientApiKeyType.Admin, ClientApiKeyType.Public]) }),
  ),
  async (c) => {
    const request = c.req.valid("json");

    const response = await createClientApiKeyUsecase.execute(request);

    return apiResponse(c, {
      data: response,
    });
  },
);

route.get(
  "/",
  baseDescribeRoute(
    {
      description: "Get all client API keys",
      tags,
    },
    listClientApiKeysResponseSchema,
  ),
  async (c) => {
    const clientApiKeys = await getClientApiKeysUsecase.execute();

    return apiResponse(c, {
      data: clientApiKeys,
    });
  },
);

route.get(
  "/:id",
  baseDescribeRoute(
    { description: "Get a client API key by ID", tags },
    getClientApiKeyResponseSchema,
  ),
  async (c) => {
    const id = c.req.param("id");
    const response = await getClientApiKeyUsecase.execute(id);

    return apiResponse(c, { data: response });
  },
);

route.put(
  "/:id",
  baseDescribeRoute({ description: "Update a client API key", tags }),
  validator(
    "json",
    z.object({
      name: z.string().optional(),
      type: z.enum([ClientApiKeyType.Admin, ClientApiKeyType.Public]).optional(),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json");

    await updateClientApiKeyUsecase.execute(id, input);

    return apiResponse(c);
  },
);

route.delete(
  "/:id",
  baseDescribeRoute({ description: "Delete a client API key", tags }),
  async (c) => {
    const id = c.req.param("id");
    await deleteClientApiKeyUsecase.execute(id);

    return apiResponse(c);
  },
);

export const clientApiKeyRoute = route;
