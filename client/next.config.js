/** @type {import("next").NextConfig} */

var apiHost =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://wordleboard-8e13e.ue.r.appspot.com";

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiHost}/api/:path*`,
      },
      {
        source: "/graphql",
        destination: `${apiHost}/graphql`,
      },
    ];
  },
};
