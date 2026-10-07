import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#142c3e" };

export const metadata: Metadata = {
  title: "知域 ATLAS · AIDC、具身智能与机器学习",
  description: "面向专业人员的 AIDC、机器人与机器学习知识手册，含图解、建模案例、市场图表与每日联网产业情报。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
