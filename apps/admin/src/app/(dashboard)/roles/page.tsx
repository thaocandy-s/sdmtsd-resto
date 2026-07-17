"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/shared/hooks/use-auth-store";

interface Permission {
  id: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  permissions: Permission[];
  _count?: {
    users: number;
  };
}

const MODULES = [
  "users",
  "roles",
  "menu",
  "drink",
  "buffet",
  "beer-art",
  "challenge",
  "tourist",
  "faq",
  "reservation",
  "contact",
  "media",
  "seo",
  "settings",
];

const ACTIONS = ["create", "read", "update", "delete", "publish"];

export default function RolesPage() {
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    permissions: [] as { module: string; action: string }[],
  });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: Role[] }>("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      label: "",
      description: "",
      permissions: [],
    });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    if (role.name === "ADMIN") {
      alert("Cannot modify ADMIN role");
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      label: role.label,
      description: role.description || "",
      permissions: role.permissions.map((p) => ({
        module: p.module,
        action: p.action,
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.name === "ADMIN") {
      alert("Cannot delete ADMIN role");
      return;
    }
    if (!confirm(`Are you sure you want to delete the role "${role.label}"?`)) {
      return;
    }

    try {
      await api.delete(`/roles/${role.id}`);
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      alert("Failed to delete role");
    }
  };

  const togglePermission = (module: string, action: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.some((p) => p.module === module && p.action === action);
      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter(
            (p) => !(p.module === module && p.action === action)
          ),
        };
      }
      return {
        ...prev,
        permissions: [...prev.permissions, { module, action }],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, {
          label: formData.label,
          description: formData.description,
          permissions: formData.permissions,
        });
      } else {
        await api.post("/roles", formData);
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
      alert("Failed to save role");
    }
  };

  const canCreate = hasPermission("roles", "create");
  const canUpdate = hasPermission("roles", "update");
  const canDelete = hasPermission("roles", "delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-foreground-secondary">Manage roles and permissions</p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="bg-gold-500 hover:bg-gold-600 text-background font-semibold px-4 h-10 rounded-md transition-colors"
          >
            Add Role
          </button>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-foreground-secondary">Loading...</div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-8 text-foreground-secondary">
            No roles found
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="border border-border rounded-lg p-4 bg-background-secondary"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{role.label}</h3>
                  <p className="text-xs text-foreground-secondary">{role.name}</p>
                </div>
                <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-400 text-xs">
                  {role._count?.users || 0} users
                </span>
              </div>
              {role.description && (
                <p className="text-sm text-foreground-secondary mb-3">{role.description}</p>
              )}
              <div className="mb-3">
                <p className="text-xs text-foreground-secondary mb-1">
                  {role.permissions.length} permissions
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((p) => (
                    <span key={p.id} className="px-1.5 py-0.5 rounded bg-background text-xs">
                      {p.module}:{p.action}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="px-1.5 py-0.5 rounded bg-background text-xs">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {canUpdate && (
                  <button
                    onClick={() => handleEdit(role)}
                    disabled={role.name === "ADMIN"}
                    className="text-gold-400 hover:text-gold-300 text-sm disabled:opacity-50"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(role)}
                    disabled={role.name === "ADMIN"}
                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-background-secondary border border-border rounded-lg p-6 w-full max-w-2xl my-8 mx-4">
            <h2 className="text-xl font-bold mb-4">{editingRole ? "Edit Role" : "Add Role"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value.toUpperCase() })
                    }
                    required
                    disabled={!!editingRole}
                    placeholder="MANAGER"
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                    placeholder="Manager"
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Permissions Matrix */}
              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-background">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Module</th>
                        {ACTIONS.map((action) => (
                          <th key={action} className="text-center px-2 py-2 font-medium">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MODULES.map((module) => (
                        <tr key={module}>
                          <td className="px-3 py-2 text-foreground-secondary">{module}</td>
                          {ACTIONS.map((action) => (
                            <td key={action} className="text-center px-2 py-2">
                              <input
                                type="checkbox"
                                checked={formData.permissions.some(
                                  (p) => p.module === module && p.action === action
                                )}
                                onChange={() => togglePermission(module, action)}
                                className="rounded border-border"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  {editingRole ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
