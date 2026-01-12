import "./globals.css";

export const metadata = {
  title: "Black Rabbit",
  description: "Decision intelligence for teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Restored Global Header */}
        <header className="header">
          <div className="logo">BLACK RABBIT</div>
        </header>

        {/* Content goes here - FULL WIDTH (No container class) */}
        <main>{children}</main>
      </body>
    </html>
  );
}
