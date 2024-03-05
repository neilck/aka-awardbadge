/** @type {import('next').NextConfig} */
const nextConfig = {
  // ignore useSearchParams error, as pages are client rendered anyways
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverActions: {
      allowedOrigins: ["badges.akaprofiles.com"],
    },
  },

  async headers() {
    return [
      {
        // matching all  routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
