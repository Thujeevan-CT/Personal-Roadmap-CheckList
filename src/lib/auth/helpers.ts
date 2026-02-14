import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { errorResponse } from "@/lib/api/helpers";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return null;
  return {
    id: userId,
    email: session.user?.email ?? undefined,
    name: session.user?.name ?? undefined,
  };
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) {
    throw {
      response: errorResponse("UNAUTHORIZED", "Not authenticated", 401),
    };
  }
  return user;
}
