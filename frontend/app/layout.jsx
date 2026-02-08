import "./globals.css";

export const metadata = {
  title: "Online Store",
  description: "My Online Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6 mt-8">
          <p className="font-semibold text-lg">Buy with Confidence</p>
          <p className="text-sm opacity-80 mt-1">
            Secure Payments • Fast Delivery • Easy Returns
          </p>
          <p className="text-xs opacity-60 mt-3">
            © {new Date().getFullYear()} Online Store
          </p>
        </footer>
      </body>
    </html>
  );
}