import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.BASE_URL || "https://vaultoftools.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin",
        "/account/",
        "/account",
        "/api/",
        "/auth/",
        "/login",
        "/submit",
        "/submit-review",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
