export const metadata = {
  title: "Black Rabbit",
  description: "Decision intelligence for teams"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
