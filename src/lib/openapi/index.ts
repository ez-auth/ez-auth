import { DescribeRouteOptions, describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { type Schema, z } from "zod";

import { ApiCode } from "@/lib/api-utils/api-code";

export const baseSchema = (schema: Schema) =>
  z.object({
    code: z.nativeEnum(ApiCode).default(ApiCode.Success),
    data: schema,
  });

export const baseOpenApiContent = (schema: Schema) => ({
  "application/json": {
    schema: resolver(baseSchema(schema)),
  },
});

export const baseOpenApiResponses = (schema?: Schema) => ({
  200: {
    description: "Successful",
    content: schema ? baseOpenApiContent(schema) : undefined,
  },
});

export const baseDescribeRoute = (specs: DescribeRouteOptions, schema?: Schema) =>
  describeRoute({
    ...specs,
    responses: baseOpenApiResponses(schema),
  });
