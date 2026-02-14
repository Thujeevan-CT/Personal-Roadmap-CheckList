import type { NextRequest } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number = 400
) {
  return Response.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function parseBody<T>(body: unknown): T {
  if (body === null || body === undefined) {
    throw { response: errorResponse("VALIDATION_ERROR", "Request body required", 400) };
  }
  return body as T;
}

export function getIdParam(request: NextRequest, param: string): string {
  const id = request.nextUrl.pathname.split("/").pop();
  if (!id || id === param) {
    throw { response: errorResponse("VALIDATION_ERROR", `Missing ${param}`, 400) };
  }
  return id;
}
