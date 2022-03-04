/** @type {import("next").NextConfig} */

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/graphql",
        destination: "http://localhost:8080/graphql",
      },
    ];
  },
};
