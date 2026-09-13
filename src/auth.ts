import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
};

export async function auth() {
  return null;
}

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string | null;
      isAdmin?: boolean;
    };
  }
}
