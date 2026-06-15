import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { courses } from "@/data/mockData";

const BASE_URL = "https://teologianaigreja.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/tutor", changefreq: "monthly", priority: "0.6" },
          { path: "/forum", changefreq: "weekly", priority: "0.5" },
          { path: "/groups", changefreq: "weekly", priority: "0.5" },
          { path: "/login", changefreq: "yearly", priority: "0.3" },
          { path: "/register", changefreq: "yearly", priority: "0.3" },
        ];

        // Dynamic course and lesson pages from data source
        for (const course of courses) {
          entries.push({
            path: `/course/${course.id}`,
            changefreq: "monthly",
            priority: "0.7",
          });
          for (const mod of course.modules) {
            for (const lesson of mod.lessons) {
              entries.push({
                path: `/course/${course.id}/lesson/${lesson.id}`,
                changefreq: "monthly",
                priority: "0.6",
              });
            }
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
