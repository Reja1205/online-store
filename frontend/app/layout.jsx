
import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Online Store",
  description: "Ecommerce store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Global header on every page */}
        <Header />

        {/* Page container */}
        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          {children}
        </main>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Online Store
          </div>
        </footer>
      </body>
    </html>
  );
}