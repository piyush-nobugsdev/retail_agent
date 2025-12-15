import "./globals.css";

export const metadata = {
  title: "Retail AI Agent",
  description: "AI-driven retail assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
