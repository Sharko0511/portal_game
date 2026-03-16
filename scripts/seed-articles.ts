/**
 * Seed script — inserts mock baohay + audiochat articles.
 * Run with: npx tsx scripts/seed-articles.ts
 *
 * Requires the admin user to already exist in profiles.
 * Posts are inserted as that admin so the public RLS policy applies.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(url, key);

// ── Find admin user ──────────────────────────────────────────

async function getAdminId(): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (error || !data) throw new Error("No admin user found. Create one first.");
  console.log(`Using admin: ${data.display_name} (${data.id})`);
  return data.id;
}

// ── Helpers ──────────────────────────────────────────────────

function slugify(title: string) {
  return (
    title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" +
    Date.now()
  );
}

function textBlock(text: string) {
  return {
    id: Math.random().toString(36).slice(2),
    type: "text",
    content: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    },
  };
}

function blocks(...texts: string[]) {
  return { type: "blocks", blocks: texts.map(textBlock) };
}

// ── Article data ─────────────────────────────────────────────

const ARTICLES = [
  // ── BAOHAY ──────────────────────────────────────────────────
  {
    category: "baohay",
    level: "C1",
    title: "The late-70s veteran who rides motorbike 1,300 km to Ho Chi Minh City for military parade",
    cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    cover_image_caption: "Veteran Tran Van Thanh with his belongings on the journey from Vinh City to Ho Chi Minh City.",
    reading_time: 15,
    audio_url: null,
    tags: ["history", "vietnam", "military"],
    word_count: 35000,
    event_encounters: 51,
    cards_count: 371,
    feedback_intro: "MercTrans is happy to have received positive feedback from the domestic community. These are all proof of our success in diversifying the game tastes of the Vietnamese people.",
    player_feedback: [
      { content: "From start to finish, I was thrilled by the accuracy and style of the translation in this game." },
      { content: "Very close translation, clearly represents the plot in the game, very familiar with the Vietnamese audience, and does not seem forced." },
    ],
    content: blocks(
      "Five days after departing from Nghe An, 76-year-old Tran Van Thanh had passed through 10 provinces, aiming to reach Ho Chi Minh City before April 30 in time to watch the military parade.",
      "On the afternoon of April 22, Mr. Thanh stopped by his daughter's house in Nha Trang City and took the opportunity to have his motorbike serviced. He continuously received phone calls from family members and even strangers from various provinces, offering support as he passed through.",
      "Mr. Thanh set off in the morning of April 17. At first, he told his family that he would \"take a coach to the South\" but secretly prepared his belongings: pots, pans, clothes, blankets, a portable stove, and a national flag before heading off on a motorbike.",
      "\"If they knew I was going to travel over 1,300 km, my family would definitely stop me, so I had to lie,\" he said.",
      "Mr. Thanh had once fought on the B5 battlefield (area around Route 9 and northern Quang Tri) during the resistance war against the US. This trip was a way for him to revisit the lands he had once passed through — a personal commemoration of 50 years of reunification — and to pay tribute to his fallen comrades from the old battlefield.",
    ),
  },
  {
    category: "baohay",
    level: "B1",
    title: "A commune in Dien Bien covered in white flowers",
    cover_image_url: "https://images.unsplash.com/photo-1596825205343-4f7fde6b3b5f?w=800&q=80",
    cover_image_caption: "White flowers bloom across the hillside commune in Dien Bien Province.",
    reading_time: 10,
    audio_url: null,
    tags: ["nature", "dien bien", "travel"],
    word_count: 12000,
    event_encounters: 24,
    cards_count: 180,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "Every spring, a small commune nestled in the mountains of Dien Bien Province transforms into a breathtaking sea of white. The plum blossoms, known locally as hoa mận, blanket the hillsides and create a landscape unlike anywhere else in Vietnam.",
      "Visitors from across the country make the journey to witness the spectacle, which typically peaks in late January and early February. The cool mountain air and misty mornings add to the ethereal atmosphere.",
      "Local families open their homes to guests, offering traditional meals and warm hospitality. The experience has become a cherished memory for many travelers who make the trek into the highlands.",
    ),
  },
  {
    category: "baohay",
    level: "B1",
    title: "A pagoda in Hai Phong resembling a \"miniature Japan\" captivates young visitors",
    cover_image_url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    cover_image_caption: "The pagoda's Japanese-inspired architecture draws visitors from across Vietnam.",
    reading_time: 10,
    audio_url: null,
    tags: ["travel", "hai phong", "architecture"],
    word_count: 10500,
    event_encounters: 18,
    cards_count: 150,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "Tucked away in a quiet corner of Hai Phong, a centuries-old pagoda has become one of the city's most photographed destinations. Its sweeping curved rooftiles, stone lanterns, and koi-filled ponds have earned it the nickname \"miniature Japan\" among locals.",
      "Young visitors flock to the site on weekends, drawn by its photogenic corridors and the sense of calm that washes over you the moment you step through the gate. Many dress in traditional áo dài or yukata-inspired outfits for photos.",
      "The pagoda dates back to the 17th century but underwent a major restoration in the early 1990s that gave it much of its current appearance. Local monks continue to maintain daily rituals and welcome visitors who wish to learn about the site's spiritual significance.",
    ),
  },
  {
    category: "baohay",
    level: "B2",
    title: "The city of Hai Phong 100 years ago",
    cover_image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    cover_image_caption: "An old postcard showing Hai Phong's colonial-era theatre, circa 1920.",
    reading_time: 10,
    audio_url: null,
    tags: ["history", "hai phong", "colonial era"],
    word_count: 18000,
    event_encounters: 32,
    cards_count: 240,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "Hai Phong was once a small fishing village along the Cam River, later developed by the French into a maritime-industrial city. At the end of the 19th century, Hai Phong belonged to Hai Duong province, rather than a feudal citadel like Hanoi or a large urban center like Hoi An.",
      "It was merely a small fishing village near the river mouth, rarely receiving attention from historians or travelers of the period. All of that changed when the French colonial administration identified the natural harbor as a strategic point for trade.",
      "Within decades, grand colonial buildings rose along the waterfront — a theatre modeled on the Paris Opéra, wide tree-lined boulevards, and a bustling port district that welcomed ships from across Asia and Europe.",
    ),
  },
  {
    category: "baohay",
    level: "C1",
    title: "The intelligence legend Pham Xuan An: the perfect spy",
    cover_image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    cover_image_caption: "A portrait of journalist and intelligence officer Pham Xuan An, Time Magazine.",
    reading_time: 15,
    audio_url: null,
    tags: ["history", "espionage", "vietnam war"],
    word_count: 42000,
    event_encounters: 67,
    cards_count: 420,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "On April 30, 1975, in the historic moment of the nation, Pham Xuan An, in his role as a veteran journalist for Time Magazine, witnessed firsthand as the tanks of the liberation army smashed through the gates of the Independence Palace, ending more than 20 years of the Vietnam War.",
      "Few knew that the famous reporter, highly valued by both the officials of the Republic of Vietnam and American advisors, was in fact a senior intelligence officer who had been feeding information to Hanoi throughout the conflict.",
      "His dual life — trusted confidant of generals and politicians by day, master spy by night — remains one of the most remarkable achievements in the history of intelligence operations.",
    ),
  },

  // ── AUDIOCHAT ───────────────────────────────────────────────
  {
    category: "audiochat",
    level: "B1",
    title: "Listening practice: A veteran's 1,300 km motorbike journey",
    cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    cover_image_caption: null,
    reading_time: 10,
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    tags: ["listening", "b1", "vietnam"],
    word_count: 8000,
    event_encounters: 15,
    cards_count: 95,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "In this listening exercise, you will hear an interview with a veteran who completed an extraordinary journey across Vietnam by motorbike. Pay attention to how the speaker describes distances, emotions, and motivations.",
      "Key vocabulary: traverse (vượt qua), province (tỉnh), commemoration (lễ kỷ niệm), tribute (tưởng niệm), battlefield (chiến trường).",
      "After listening, answer the comprehension questions below and practice retelling the story in your own words.",
    ),
  },
  {
    category: "audiochat",
    level: "B1",
    title: "Listening practice: Describing natural scenery in Vietnamese",
    cover_image_url: "https://images.unsplash.com/photo-1596825205343-4f7fde6b3b5f?w=800&q=80",
    cover_image_caption: null,
    reading_time: 10,
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    tags: ["listening", "b1", "nature"],
    word_count: 7500,
    event_encounters: 12,
    cards_count: 88,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "This audio lesson focuses on descriptive language for natural landscapes. You will hear a native speaker describe the white flower season in the northern highlands.",
      "Practice identifying adjectives, sensory words, and spatial prepositions as you listen.",
    ),
  },
  {
    category: "audiochat",
    level: "B2",
    title: "Audio lesson: Discussing historical architecture",
    cover_image_url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    cover_image_caption: null,
    reading_time: 10,
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    tags: ["listening", "b2", "architecture", "history"],
    word_count: 11000,
    event_encounters: 20,
    cards_count: 130,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "In this B2-level listening task, two speakers discuss the historical and architectural significance of a colonial-era building in Vietnam. Notice how they use hedging language, compare time periods, and express opinions.",
      "Focus vocabulary: facade (mặt tiền), restoration (phục hồi), heritage (di sản), symmetry (đối xứng), preservation (bảo tồn).",
    ),
  },
  {
    category: "audiochat",
    level: "C1",
    title: "Advanced listening: The art of intelligence — Pham Xuan An",
    cover_image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    cover_image_caption: null,
    reading_time: 10,
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    tags: ["listening", "c1", "history", "espionage"],
    word_count: 14000,
    event_encounters: 28,
    cards_count: 175,
    feedback_intro: null,
    player_feedback: [],
    content: blocks(
      "This advanced audio lesson features a documentary-style narration about Pham Xuan An, arguably the most successful intelligence operative of the Vietnam War era.",
      "At C1 level, focus on understanding implicit meaning, the speaker's tone, rhetorical questions, and the way complex ideas are structured across long spoken passages.",
    ),
  },
];

// ── Insert ───────────────────────────────────────────────────

async function seed() {
  const adminId = await getAdminId();

  let inserted = 0;
  let skipped = 0;

  for (const article of ARTICLES) {
    // Check if a post with this exact title already exists
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("title", article.title)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIP  "${article.title.slice(0, 60)}"`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("posts").insert({
      author_id: adminId,
      title: article.title,
      slug: slugify(article.title),
      content: article.content,
      cover_image_url: article.cover_image_url,
      cover_image_caption: article.cover_image_caption,
      published: true,
      category: article.category,
      level: article.level,
      audio_url: article.audio_url,
      reading_time: article.reading_time,
      tags: article.tags,
      word_count: article.word_count,
      event_encounters: article.event_encounters,
      cards_count: article.cards_count,
      feedback_intro: article.feedback_intro,
      player_feedback: article.player_feedback,
    });

    if (error) {
      console.error(`  ERROR "${article.title.slice(0, 60)}": ${error.message}`);
    } else {
      console.log(`  OK    "${article.title.slice(0, 60)}"`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped.`);
}

seed().catch(console.error);
