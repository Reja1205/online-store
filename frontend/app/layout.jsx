import "./globals.css";

export const metadata = {
  title: "Online Store",
  description: "My Online Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-100 text-gray-900 flex flex-col overflow-x-hidden">
        {/* Page container */}
        <div className="flex-1 w-full">
          {/* Main Content */}
          <main className="max-w-6xl mx-auto w-full px-4 pt-4 pb-6">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="w-full bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <p className="font-semibold text-lg">Buy with Confidence</p>
            <p className="text-sm opacity-80 mt-1">
              Secure Payments • Fast Delivery • Easy Returns
            </p>
            <p className="text-xs opacity-60 mt-3">
              © {new Date().getFullYear()} Online Store
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}