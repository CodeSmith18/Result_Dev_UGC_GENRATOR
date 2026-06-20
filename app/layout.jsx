import "./globals.css";

export const metadata = {
  title: "UGC Studio",
  description: "Generate short UGC-style product videos from any URL."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
