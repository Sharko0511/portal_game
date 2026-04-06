export const NAMESPACE_INFO: Record<string, { pages: string; area: string }> = {
  common:            { pages: "All pages",          area: "Navigation bar"   },
  homepage:          { pages: "/ (Home)",            area: "Hero section"     },
  homepage_features: { pages: "/ (Home)",            area: "Features section" },
  footer:            { pages: "All pages",          area: "Footer"           },
  blog:              { pages: "/blog",              area: "Blog listing"     },
  blog_post:         { pages: "/blog/[slug]",       area: "Blog post"        },
  profile:           { pages: "/profile",           area: "User profile"     },
  auth:              { pages: "/login · /register", area: "Auth forms"       },
  admin:             { pages: "/admin/*",           area: "Admin panel"      },
  games:             { pages: "/games",             area: "Games page"       },
};

export const PROTECTED_LANGS = ["en", "vi"];
