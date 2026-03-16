"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminUsers,
  useToggleBan,
  useChangeRole,
  useDeleteUser,
} from "@/hooks/admin/useAdminUsers";
import Button from "@/components/Button";

export default function AdminUsers() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const usersQuery = useAdminUsers(page, searchQuery);
  const toggleBan = useToggleBan();
  const changeRole = useChangeRole();
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  }

  async function handleToggleBan(userId: string, isBanned: boolean) {
    await toggleBan.mutateAsync({ userId, isBanned });
  }

  async function handleChangeRole(userId: string, role: string) {
    await changeRole.mutateAsync({ userId, role });
  }

  async function handleDelete(userId: string, displayName: string) {
    if (!confirm(`Delete user "${displayName}"? This cannot be undone.`)) return;
    await deleteUser.mutateAsync(userId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
          />
          <Button type="submit">
            Search
          </Button>
        </form>
      </div>

      {usersQuery.isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Scores</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === profile?.id;
                  return (
                    <tr key={u.id} className="border-b border-gray-200/50">
                      <td className="px-4 py-3">{u.display_name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-gray-900">{u.role}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="rounded border border-border bg-card px-2 py-1 text-sm"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900">{u.score_count}</td>
                      <td className="px-4 py-3">
                        {u.is_banned ? (
                          <span className="text-red-600">Banned</span>
                        ) : (
                          <span className="text-green-700">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleToggleBan(u.id, u.is_banned)}
                              variant={u.is_banned ? "success-ghost" : "danger-ghost"}
                              size="sm"
                            >
                              {u.is_banned ? "Unban" : "Ban"}
                            </Button>
                            <Button
                              onClick={() => handleDelete(u.id, u.display_name)}
                              variant="danger-ghost"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                Prev
              </Button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
