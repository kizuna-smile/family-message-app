import "./globals.css";

export const metadata = {
  title: "わが家トーク",
  description: "家族だけのメッセージ",
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef"
};

export default function RootLayout({ children }) {
  return <html lang="ja"><body>{children}</body></html>;
}
