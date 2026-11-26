import {
  createDirectus,
  rest,
  staticToken,
  authentication,
  readMe,
  type DirectusClient,
  type RestClient,
  type AuthenticationClient,
  type StaticTokenClient,
} from "@directus/sdk";

export type DkitDirectusClient = DirectusClient<any> &
  RestClient<any> &
  Partial<AuthenticationClient<any>> &
  Partial<StaticTokenClient<any>>;

export function createTokenClient(
  url: string,
  token: string,
): DkitDirectusClient {
  return createDirectus(url).with(staticToken(token)).with(rest());
}

export function createAuthClient(url: string): DkitDirectusClient {
  return createDirectus(url).with(authentication("json")).with(rest());
}

export async function assertAdmin(client: DkitDirectusClient): Promise<void> {
  const me = await client.request(
    readMe({ fields: ["id", "email", "admin_access", "role"] }),
  );
  // admin_access may be on user or inferred; also accept if readMe succeeds for schema later
  if (me && typeof me === "object" && "admin_access" in me && me.admin_access === false) {
    throw new Error(
      "Connected user does not have admin access. Use an admin static token or admin credentials.",
    );
  }
}
