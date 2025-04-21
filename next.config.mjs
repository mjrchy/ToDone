/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
//   async rewrites() {
//     return [
//       {
//         source: "/:path*",
//         destination: "/",
//       },
//     ];
//   },
};

export default nextConfig;
