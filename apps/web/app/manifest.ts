import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mira",
    short_name: "Mira",
    description: "Бережный ежедневный план для тела, движения и восстановления.",
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
