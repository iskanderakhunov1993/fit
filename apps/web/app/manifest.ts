import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ромашка",
    short_name: "Ромашка",
    description: "Твой цикл, твоя сила. Бережный ежедневный план для тела, движения и восстановления.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF8F5",
    theme_color: "#FBF8F5",
    lang: "ru",
    icons: [
      {
        src: "/mira-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
