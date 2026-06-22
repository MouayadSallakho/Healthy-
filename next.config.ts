import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // The landing page ships with branded SVG placeholders in /public/images.
    // Next.js blocks SVG through the optimizer by default; allow it so the
    // placeholders render. When you swap in real raster photos (jpg/png/webp)
    // this flag is harmless, but you may remove it if you no longer ship SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow product photos served by the backend (Healthy Menu API). Product
    // image URLs are absolute, e.g. https://technosolutions.sy/.../storage/...
    // 127.0.0.1:8000 covers running the backend locally during development.
    remotePatterns: [
      { protocol: "https", hostname: "technosolutions.sy", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    ],
  },
};

export default nextConfig;
