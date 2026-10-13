import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The site is bilingual, so a bare `/` has to choose a language. Chinese is
      // the default for this audience. Kept as a 302 so language detection can
      // be added later without browsers caching the old answer.
      { source: "/", destination: "/zh", permanent: false },

      // The first version of this site shipped unprefixed URLs. Keep those
      // shared links working instead of turning them into 404s.
      { source: "/courses", destination: "/zh/courses", permanent: false },
      { source: "/start-here", destination: "/zh/start-here", permanent: false },
      { source: "/modules/:slug", destination: "/zh/modules/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
