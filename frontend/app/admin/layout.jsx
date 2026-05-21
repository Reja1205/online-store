import AdminRouteGuard from "../components/auth/AdminRouteGuard";

export default function AdminLayout({ children }) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}
