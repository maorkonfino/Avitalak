import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "אביטל אברמוב קונפינו | מיקרובליידינג, גבות, ריסים וציפורניים",
  description: "אומנית המתעסקת בטיפוח הציפורניים, הגבות והריסים. פרפקציוניסטית שלא מתפשרת על איכות, אסתטיקה וסטריליות.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>
        <SessionProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="bottom-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
