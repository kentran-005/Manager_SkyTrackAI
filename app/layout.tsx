// import type { Metadata } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/lib/authContext";

// export const metadata: Metadata = {
//   title: "SkyTrack AI - Vietnam Flight Intelligence",
//   description: "Hệ thống quản lý và giám sát chuyến bay thông minh tích hợp AI",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="vi" data-scroll-behavior="smooth">
//       <body>
//         <AuthProvider> {/* Bọc AuthProvider ở đây */}
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "../lib/authContext";

export const metadata: Metadata = {
  title: "SkyTrack AI - Flight Tracking",
  description: "Real-time flight tracking system powered by SkyTrack AI. Monitor flights, airports, and airlines with live map visualization.",
  keywords: ["SkyTrack AI", "flight tracking", "real-time", "aviation", "live map"],
  authors: [{ name: "SkyTrack AI Team" }],
  // icons: {
  //   icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  // },
  openGraph: {
    title: "SkyTrack AI - Flight Tracking",
    description: "Real-time flight tracking system with live map visualization",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyTrack AI - Flight Tracking",
    description: "Real-time flight tracking system with live map visualization",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={
          {
            "--font-geist-sans": "'DM Sans', system-ui, sans-serif",
            "--font-geist-mono": "'IBM Plex Mono', ui-monospace, monospace",
          } as React.CSSProperties
        }
        className="antialiased bg-background text-foreground"
      >
        <AuthProvider> {/* Bọc AuthProvider ở đây */}
            {/* <Header /> */}
          {children}
          {/* <Footer /> */}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
