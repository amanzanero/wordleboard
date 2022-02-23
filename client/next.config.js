/** @type {import("next").NextConfig} */

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: "http://localhost:8080/graphql",
      },
    ];
  },
};
