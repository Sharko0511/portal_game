import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TranslationSeed } from "@/components/TranslationSeed";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const PRELOAD_NS = ["common", "footer"];

async function fetchTranslations(lng: string, ns: string): Promise<Record<string, string>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language", lng)
    .eq("namespace", ns);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

type Props = { children: ReactNode; params: Promise<{ lng: string }> };

export default async function LngLayout({ children, params }: Props) {
  const { lng } = await params;

  const entries = await Promise.all(
    PRELOAD_NS.map(async (ns) => [`${lng}:${ns}`, await fetchTranslations(lng, ns)])
  );
  const seed = Object.fromEntries(entries) as Record<string, Record<string, string>>;

  return (
    <TranslationSeed seed={seed}>
      <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </TranslationSeed>
  );
}
