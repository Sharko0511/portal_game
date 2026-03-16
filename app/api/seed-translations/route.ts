import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

const data = {
  en: {
    common: flatten({
      navigation: { home: "Home", blog: "Blog", audio: "Audio", games: "Games", leaderboard: "Leaderboard", profile: "Profile", admin: "Admin", login: "Login", register: "Register", logout: "Logout" },
      search: { placeholder: "Search..." },
      language: { en: "English", vi: "Vietnamese" },
    }),
    footer: flatten({
      about: { title: "About Us", description: "The Good Learning is a community platform where you can play games,<br />write blog posts, and connect with other players and writers." },
      copyright: "© 2026 The Good Learning. All rights reserved.",
      navigation: { home: "Home", blog: "Blog", audio: "Audio", games: "Games" },
      social: { follow: "Follow us", facebook: "Facebook", twitter: "Twitter", instagram: "Instagram", youtube: "YouTube" },
    }),
  },
  vi: {
    common: flatten({
      navigation: { home: "Trang chủ", blog: "Báo hay", audio: "Audio chất", games: "Games", leaderboard: "Bảng xếp hạng", profile: "Hồ sơ", admin: "Quản trị", login: "Đăng nhập", register: "Đăng ký", logout: "Đăng xuất" },
      search: { placeholder: "Tìm kiếm..." },
      language: { en: "Tiếng Anh", vi: "Tiếng Việt" },
    }),
    footer: flatten({
      about: { title: "Giới thiệu", description: "The Good Learning là nền tảng cộng đồng nơi bạn có thể chơi game,<br />viết blog và kết nối với những người chơi và tác giả khác." },
      copyright: "© 2026 The Good Learning. Bảo lưu mọi quyền.",
      navigation: { home: "Trang chủ", blog: "Báo hay", audio: "Audio chất", games: "Games" },
      social: { follow: "Theo dõi chúng tôi", facebook: "Facebook", twitter: "Twitter", instagram: "Instagram", youtube: "YouTube" },
    }),
  },
};

export async function GET() {
  const rows: { language: string; namespace: string; key: string; value: string }[] = [];

  for (const [language, namespaces] of Object.entries(data)) {
    for (const [namespace, keys] of Object.entries(namespaces)) {
      for (const [key, value] of Object.entries(keys)) {
        rows.push({ language, namespace, key, value });
      }
    }
  }

  const batchSize = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const { error } = await supabase
      .from("translations")
      .upsert(rows.slice(i, i + batchSize), { onConflict: "language,namespace,key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    total += rows.slice(i, i + batchSize).length;
  }

  return NextResponse.json({ ok: true, seeded: total });
}
