/**
 * Seed script — inserts default EN and VI translations into Supabase.
 * Run with: npx tsx scripts/seed-translations.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// ─── Translation data ────────────────────────────────────────────────────────

type Translations = Record<string, Record<string, string>>;

/** Flattens { "navigation": { "home": "Home" } } → { "navigation.home": "Home" } */
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

const data: Record<"en" | "vi", Translations> = {
  en: {
    common: flatten({
      navigation: {
        home: "Home",
        blog: "Blog",
        games: "Games",
        leaderboard: "Leaderboard",
        profile: "Profile",
        admin: "Admin",
        login: "Login",
        register: "Register",
        logout: "Logout",
      },
      search: {
        placeholder: "Search...",
      },
      language: {
        en: "English",
        vi: "Vietnamese",
      },
    }),

    homepage: flatten({
      hero: {
        title: "Play, Learn & Share",
        description:
          "A place to play games, share your ideas through blog posts,<br />and connect with others who love learning.",
        button: "Explore Blog",
      },
    }),

    homepage_features: flatten({
      title: "What can you do here?",
      subtitle: "Everything in one place.",
      blog: {
        title: "Blog",
        description:
          "Write and share articles with the community. Follow authors you like and get notified when they publish new posts.",
        button: "Go to Blog",
      },
      games: {
        title: "Games",
        description:
          "Play Snake, Pong, Breakout and more. Compete on the leaderboard and show off your best scores.",
        button: "Play Now",
      },
    }),

    footer: flatten({
      about: {
        title: "About Us",
        description:
          "Game Portal is a community platform where you can play games,<br />write blog posts, and connect with other players and writers.",
      },
      copyright: "2026© Game Portal",
      navigation: {
        blog: "Blog",
        games: "Games",
        leaderboard: "Leaderboard",
      },
      social: {
        follow: "Follow us",
        facebook: "Facebook",
        twitter: "Twitter",
        instagram: "Instagram",
        youtube: "YouTube",
      },
    }),

    blog: flatten({
      title: "Blog",
      new_post: "New Post",
      read_more: "Read more",
      no_posts: "No posts yet.",
      follow: "Follow",
      unfollow: "Unfollow",
      like: "Like",
      unlike: "Unlike",
      comment: "Comment",
      comments: "Comments",
      post_comment: "Post Comment",
      edit: "Edit",
      delete: "Delete",
      published: "Published",
      draft: "Draft",
      by: "by",
      form: {
        title: "Title",
        content: "Content",
        cover_image: "Cover Image",
        publish: "Publish",
        save_draft: "Save as Draft",
        update: "Update Post",
      },
    }),

    profile: flatten({
      title: "Profile",
      display_name: "Display Name",
      email: "Email",
      role: "Role",
      member_since: "Member since",
      save_changes: "Save Changes",
      saving: "Saving...",
      saved: "Profile updated!",
      save_error: "Failed to update profile",
      scores: {
        title: "My Scores",
        empty: "No scores yet. Go play some games!",
        rank: "#",
        game: "Game",
        score: "Score",
        date: "Date",
      },
      telegram: {
        title: "Telegram Notifications",
        description:
          "Link your Telegram account to receive a notification when authors you follow post new content.",
        connected: "Connected",
        connect: "Connect Telegram",
        disconnect: "Disconnect",
        connecting: "Generating link...",
        disconnecting: "Disconnecting...",
        pending_instruction:
          "Click the button below to open Telegram and send the link command to the bot. Once you do, this page will update automatically.",
        open_telegram: "Open Telegram & Link Account",
        manual_fallback: "Button not working? Open @gameportal_notify_bot in Telegram and send this command manually:",
      },
    }),

    auth: flatten({
      login: {
        title: "Login",
        email: "Email",
        password: "Password",
        submit: "Login",
        submitting: "Logging in...",
        no_account: "Don't have an account?",
        register_link: "Register",
        error: "Invalid email or password",
      },
      register: {
        title: "Register",
        display_name: "Display Name",
        email: "Email",
        password: "Password",
        submit: "Register",
        submitting: "Creating account...",
        have_account: "Already have an account?",
        login_link: "Login",
        error: "Failed to create account",
      },
    }),

    admin: flatten({
      title: "Admin Dashboard",
      nav: {
        stats: "Stats",
        users: "Users",
        games: "Games",
        scores: "Scores",
        config: "Config",
        translations: "Translations",
      },
      translations: {
        title: "Manage Translations",
        language: "Language",
        namespace: "Namespace",
        key: "Key",
        value: "Value",
        save: "Save",
        saved: "Saved",
        search_placeholder: "Search keys...",
        empty: "No translations found.",
        validation_empty: "Value cannot be empty.",
      },
    }),

    games: flatten({
      title: "Games",
      play: "Play",
      leaderboard: "Leaderboard",
      your_score: "Your Score",
      game_over: "Game Over",
      play_again: "Play Again",
      snake: { title: "Snake" },
      pong: { title: "Pong" },
      breakout: { title: "Breakout" },
    }),
  },

  vi: {
    common: flatten({
      navigation: {
        home: "Trang chủ",
        blog: "Blog",
        games: "Trò chơi",
        leaderboard: "Bảng xếp hạng",
        profile: "Hồ sơ",
        admin: "Quản trị",
        login: "Đăng nhập",
        register: "Đăng ký",
        logout: "Đăng xuất",
      },
      search: {
        placeholder: "Tìm kiếm...",
      },
      language: {
        en: "Tiếng Anh",
        vi: "Tiếng Việt",
      },
    }),

    homepage: flatten({
      hero: {
        title: "Chơi, Học & Chia Sẻ",
        description:
          "Nơi để chơi game, chia sẻ ý tưởng qua blog,<br />và kết nối với những người yêu thích học hỏi.",
        button: "Khám phá Blog",
      },
    }),

    homepage_features: flatten({
      title: "Bạn có thể làm gì ở đây?",
      subtitle: "Tất cả trong một nơi.",
      blog: {
        title: "Blog",
        description:
          "Viết và chia sẻ bài viết với cộng đồng. Theo dõi các tác giả yêu thích và nhận thông báo khi họ đăng bài mới.",
        button: "Đến Blog",
      },
      games: {
        title: "Trò chơi",
        description:
          "Chơi Snake, Pong, Breakout và nhiều hơn nữa. Cạnh tranh trên bảng xếp hạng và khoe điểm cao nhất của bạn.",
        button: "Chơi ngay",
      },
    }),

    footer: flatten({
      about: {
        title: "Về chúng tôi",
        description:
          "Game Portal là nền tảng cộng đồng nơi bạn có thể chơi game,<br />viết blog và kết nối với những người chơi và tác giả khác.",
      },
      copyright: "2026© Game Portal",
      navigation: {
        blog: "Blog",
        games: "Trò chơi",
        leaderboard: "Bảng xếp hạng",
      },
      social: {
        follow: "Theo dõi chúng tôi",
        facebook: "Facebook",
        twitter: "Twitter",
        instagram: "Instagram",
        youtube: "YouTube",
      },
    }),

    blog: flatten({
      title: "Blog",
      new_post: "Bài viết mới",
      read_more: "Xem thêm",
      no_posts: "Chưa có bài viết nào.",
      follow: "Theo dõi",
      unfollow: "Bỏ theo dõi",
      like: "Thích",
      unlike: "Bỏ thích",
      comment: "Bình luận",
      comments: "Bình luận",
      post_comment: "Đăng bình luận",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      published: "Đã đăng",
      draft: "Nháp",
      by: "bởi",
      form: {
        title: "Tiêu đề",
        content: "Nội dung",
        cover_image: "Ảnh bìa",
        publish: "Đăng bài",
        save_draft: "Lưu nháp",
        update: "Cập nhật bài viết",
      },
    }),

    profile: flatten({
      title: "Hồ sơ",
      display_name: "Tên hiển thị",
      email: "Email",
      role: "Vai trò",
      member_since: "Thành viên từ",
      save_changes: "Lưu thay đổi",
      saving: "Đang lưu...",
      saved: "Đã cập nhật hồ sơ!",
      save_error: "Cập nhật hồ sơ thất bại",
      scores: {
        title: "Điểm của tôi",
        empty: "Chưa có điểm nào. Hãy chơi game nào!",
        rank: "#",
        game: "Trò chơi",
        score: "Điểm",
        date: "Ngày",
      },
      telegram: {
        title: "Thông báo Telegram",
        description:
          "Liên kết tài khoản Telegram để nhận thông báo khi các tác giả bạn theo dõi đăng bài mới.",
        connected: "Đã kết nối",
        connect: "Kết nối Telegram",
        disconnect: "Ngắt kết nối",
        connecting: "Đang tạo liên kết...",
        disconnecting: "Đang ngắt kết nối...",
        pending_instruction:
          "Nhấn nút bên dưới để mở Telegram và gửi lệnh liên kết đến bot. Sau khi thực hiện, trang này sẽ tự động cập nhật.",
        open_telegram: "Mở Telegram & Liên kết tài khoản",
        manual_fallback: "Nút không hoạt động? Mở @gameportal_notify_bot trong Telegram và gửi lệnh này thủ công:",
      },
    }),

    auth: flatten({
      login: {
        title: "Đăng nhập",
        email: "Email",
        password: "Mật khẩu",
        submit: "Đăng nhập",
        submitting: "Đang đăng nhập...",
        no_account: "Chưa có tài khoản?",
        register_link: "Đăng ký",
        error: "Email hoặc mật khẩu không đúng",
      },
      register: {
        title: "Đăng ký",
        display_name: "Tên hiển thị",
        email: "Email",
        password: "Mật khẩu",
        submit: "Đăng ký",
        submitting: "Đang tạo tài khoản...",
        have_account: "Đã có tài khoản?",
        login_link: "Đăng nhập",
        error: "Tạo tài khoản thất bại",
      },
    }),

    admin: flatten({
      title: "Bảng điều khiển Admin",
      nav: {
        stats: "Thống kê",
        users: "Người dùng",
        games: "Trò chơi",
        scores: "Điểm số",
        config: "Cấu hình",
        translations: "Bản dịch",
      },
      translations: {
        title: "Quản lý bản dịch",
        language: "Ngôn ngữ",
        namespace: "Nhóm",
        key: "Khóa",
        value: "Giá trị",
        save: "Lưu",
        saved: "Đã lưu",
        search_placeholder: "Tìm khóa...",
        empty: "Không tìm thấy bản dịch.",
        validation_empty: "Giá trị không được để trống.",
      },
    }),

    games: flatten({
      title: "Trò chơi",
      play: "Chơi",
      leaderboard: "Bảng xếp hạng",
      your_score: "Điểm của bạn",
      game_over: "Trò chơi kết thúc",
      play_again: "Chơi lại",
      snake: { title: "Snake" },
      pong: { title: "Pong" },
      breakout: { title: "Breakout" },
    }),
  },
};

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
  const rows: { language: string; namespace: string; key: string; value: string }[] = [];

  for (const [language, namespaces] of Object.entries(data)) {
    for (const [namespace, keys] of Object.entries(namespaces)) {
      for (const [key, value] of Object.entries(keys)) {
        rows.push({ language, namespace, key, value });
      }
    }
  }

  console.log(`Seeding ${rows.length} translation rows...`);

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("translations")
      .upsert(batch, { onConflict: "language,namespace,key" });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`Batch ${i / batchSize + 1}/${Math.ceil(rows.length / batchSize)} done`);
  }

  console.log("Seed complete.");
}

seed();
