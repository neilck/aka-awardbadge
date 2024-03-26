import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const customGoogle = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user, account, profile }) => {
      // console.log(
      //   `jwt callback: ${JSON.stringify({ token, user, account, profile })}`
      // );
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      // console.log(
      //   `session callback: ${JSON.stringify({ session, user, token })}`
      // );
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
