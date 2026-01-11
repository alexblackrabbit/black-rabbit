import "./globals.css";

export const metadata = {
  title: "Black Rabbit",
  description: "Decision intelligence for teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="logo">BLACK RABBIT</div>
        </header>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}
