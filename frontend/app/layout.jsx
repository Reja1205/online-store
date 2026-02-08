import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Online Store",
  description: "Simple e-commerce app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}