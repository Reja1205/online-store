"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../../lib/api";

function roleBadgeClass(role) {
  return role === "admin"
    ? "bg-sky-100 text-sky-800 border-sky-200"
    : "bg-gray-100 text-gray-700 border-gray-200";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      router.push("/login");
      return null;
    }
    if (!data?.user || (data.user.role !== "admin" && data.user.role !== "superadmin")) {
      router.push("/profile");
      return null;
    }
    setMe(data.user);
    return data.user;
  }

  async function loadUsers(opts = {}) {
    setMsg("");
    setError("");
    setLoading(true);

    const searchQ = opts.q !== undefined ? opts.q : q;
    const role = opts.role !== undefined ? opts.role : roleFilter;
    const currentPage = opts.page !== undefined ? opts.page : page;

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: "50",
    });
    if (searchQ.trim()) params.set("q", searchQ.trim());
    if (role) params.set("role", role);

    const { res, data } = await apiJson(`/api/users?${params}`);
    setLoading(false);

    if (!res.ok) {
      setUsers([]);
      setError(data?.message || "Failed to load users");
      return;
    }

    setUsers(Array.isArray(data.users) ? data.users : []);
    setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
  }

  async function patchUser(id, body) {
    setMsg("");
    setError("");
    setBusyId(id);

    const { res, data } = await apiJson(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setBusyId("");

    if (!res.ok) {
      setError(data?.message || "Update failed");
      return false;
    }

    setMsg(data?.message || "User updated");
    await loadUsers();
    return true;
  }

  async function changeRole(user, nextRole) {
    if (user.role === nextRole) return;
    const label = nextRole === "admin" ? "promote to admin" : "set as customer";
    if (!confirm(`${label} for ${user.email}?`)) return;
    await patchUser(user.id, { role: nextRole });
  }

  async function editName(user) {
    const next = window.prompt("Edit display name", user.name || "");
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (trimmed === user.name) return;
    await patchUser(user.id, { name: trimmed });
  }

  async function removeUser(user) {
    if (!confirm(`Delete account for ${user.email}? Their orders stay in the system.`)) {
      return;
    }

    setMsg("");
    setError("");
    setBusyId(user.id);

    const { res, data } = await apiJson(`/api/users/${user.id}`, {
      method: "DELETE",
    });

    setBusyId("");

    if (!res.ok) {
      setError(data?.message || "Delete failed");
      return;
    }

    setMsg(data?.message || "User deleted");
    await loadUsers();
  }

  function applySearch(e) {
    e?.preventDefault();
    setPage(1);
    loadUsers({ page: 1, q, role: roleFilter });
  }

  useEffect(() => {
    (async () => {
      const user = await loadMe();
      if (user) await loadUsers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (me) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === "admin").length;
    const customers = users.filter((u) => u.role !== "admin").length;
    const withOrders = users.filter((u) => Number(u.orderCount) > 0).length;
    return {
      shown: users.length,
      total: pagination.total,
      admins,
      customers,
      withOrders,
    };
  }, [users, pagination.total]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Users
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-600 mt-1">
            View accounts, change roles, and remove users. Passwords are never shown.
          </p>
          {me?.email ? (
            <p className="text-xs text-gray-500 mt-2">
              Logged in as <span className="font-semibold">{me.email}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin">
            <button
              type="button"
              className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              ← Back Admin
            </button>
          </Link>
          <Link href="/">
            <button
              type="button"
              className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Home
            </button>
          </Link>
          <button
            type="button"
            onClick={() => loadUsers()}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Refresh
          </button>
        </div>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {msg}
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total users</p>
          <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Admins (this page)</p>
          <p className="text-2xl font-extrabold text-sky-700">{stats.admins}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Customers (this page)</p>
          <p className="text-2xl font-extrabold text-gray-900">{stats.customers}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">With orders (this page)</p>
          <p className="text-2xl font-extrabold text-indigo-700">{stats.withOrders}</p>
        </div>
      </div>

      <form
        onSubmit={applySearch}
        className="mt-6 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="flex-1 block">
          <span className="text-xs font-semibold text-gray-600">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or email"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="sm:w-40 block">
          <span className="text-xs font-semibold text-gray-600">Role</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
          >
            <option value="">All roles</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-gray-700">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-gray-700 font-medium">No users found.</p>
            <p className="text-sm text-gray-600 mt-1">Try clearing search or role filters.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = String(me?.id) === String(u.id);
                    const busy = busyId === u.id;
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{u.orderCount ?? 0}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => editName(u)}
                              className="rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                              Edit name
                            </button>
                            {u.role === "admin" ? (
                              <button
                                type="button"
                                disabled={busy || isSelf}
                                onClick={() => changeRole(u, "user")}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                              >
                                Demote
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => changeRole(u, "admin")}
                                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                              >
                                Make admin
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy || isSelf}
                              onClick={() => removeUser(u)}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden grid gap-3">
              {users.map((u) => {
                const isSelf = String(me?.id) === String(u.id);
                const busy = busyId === u.id;
                return (
                  <div key={u.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-600 break-all">{u.email}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {u.orderCount ?? 0} orders · joined {formatDate(u.createdAt)}
                      {isSelf ? " · you" : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => editName(u)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Edit name
                      </button>
                      {u.role === "admin" ? (
                        <button
                          type="button"
                          disabled={busy || isSelf}
                          onClick={() => changeRole(u, "user")}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 disabled:opacity-50"
                        >
                          Demote
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeRole(u, "admin")}
                          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 disabled:opacity-50"
                        >
                          Make admin
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy || isSelf}
                        onClick={() => removeUser(u)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.pages > 1 ? (
              <div className="mt-4 flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                >
                  Previous
                </button>
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} users)
                </p>
                <button
                  type="button"
                  disabled={page >= pagination.pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
