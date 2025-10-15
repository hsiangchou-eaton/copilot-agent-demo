import "./globals.css";

export const metadata = {
  title: "Snake Game",
  description: "Classic Snake Game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
