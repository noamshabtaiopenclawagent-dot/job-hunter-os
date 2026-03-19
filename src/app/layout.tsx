import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Hunter OS",
  description: "Autonomous job hunting platform — powered by AI Swarm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className} style={{ margin: 0, background: "#0f1117", color: "#e2e8f0", minHeight: "100vh" }}>
        <NavBar />
        <main style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
