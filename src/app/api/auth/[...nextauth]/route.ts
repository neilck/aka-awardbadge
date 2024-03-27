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
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
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
      // console.log(`jwt callback token: ${JSON.stringify(token)}`);
      // console.log(`jwt callback user: ${JSON.stringify(user)}`);
      // console.log(`jwt callback account: ${JSON.stringify(account)}`);
      // console.log(`jwt callback: ${JSON.stringify(profile)}`);
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      // console.log(`session callback session: ${JSON.stringify(session)}`);
      // console.log(`session callback user: ${JSON.stringify(user)}`);
      // console.log(`session callback token: ${JSON.stringify(token)}`);
      const anySession = session as any;
      anySession.accessToken = token.accessToken as string;
      return anySession;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
