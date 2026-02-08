import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Online Store",
  description: "My Online Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}