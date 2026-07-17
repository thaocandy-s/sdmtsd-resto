"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/shared/hooks/use-auth-store";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: {
    id: string;
    name: string;
    label: string;
  };
}

interface Role {
  id: string;
  name: string;
  label: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const { hasPermission } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: "",
    isActive: true,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);

      const response = await api.get<{ data: User[]; meta: PaginationMeta }>(`/users?${params}`);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get<{ data: Role[] }>("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: roles[0]?.id || "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.role.id,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roleId: formData.roleId,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        await api.post("/users", formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user");
    }
  };

  const canCreate = hasPermission("users", "create");
  const canUpdate = hasPermission("users", "update");
  const canDelete = hasPermission("users", "delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-foreground-secondary">Manage system users</p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="bg-gold-500 hover:bg-gold-600 text-background font-semibold px-4 h-10 rounded-md transition-colors"
          >
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-secondary">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Name
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Email
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Role
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Last Login
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground-secondary">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-background-secondary/50">
                  <td className="px-4 py-3 text-sm">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-secondary">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-400 text-xs">
                      {user.role.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-secondary">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-gold-400 hover:text-gold-300 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground-secondary">
            Showing {(meta.page - 1) * meta.limit + 1} to{" "}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-secondary border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editingUser && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-md border border-border text-sm hover:bg-background-tertiary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-md bg-gold-500 hover:bg-gold-600 text-background font-semibold text-sm"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
