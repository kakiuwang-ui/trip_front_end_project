import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AiChatWidget from "./components/AiChatWidget";

export const metadata: Metadata = {
  title: "易宿酒店商户版",
  description: "易宿酒店综合管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <AiChatWidget />
      </body>
    </html>
  );
}
