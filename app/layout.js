import "./globals.css";

export const metadata = {
  title: "わが家トーク",
  description: "家族だけのメッセージ"
};

export default function RootLayout({ children }) {
  return <html lang="ja"><body>{children}</body></html>;
}
