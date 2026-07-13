"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AdminAccessSnapshot = {
  adminId: string | null;
  displayName: string | null;
  email: string | null;
  roleNames: string[];
  permissions: string[];
  resolved: boolean;
};

type AdminAccessProviderProps = {
  children: ReactNode;
  initialAdmin?: Partial<Omit<AdminAccessSnapshot, "resolved">> | null;
};

const EMPTY_ACCESS: AdminAccessSnapshot = {
  adminId: null,
  displayName: null,
  email: null,
  roleNames: [],
  permissions: [],
  resolved: false,
};

const AdminAccessContext = createContext<AdminAccessSnapshot>(EMPTY_ACCESS);

export function AdminAccessProvider({ children, initialAdmin }: AdminAccessProviderProps) {
  const hasInitialPermissions = Array.isArray(initialAdmin?.permissions);
  const [access, setAccess] = useState<AdminAccessSnapshot>(() => ({
    ...EMPTY_ACCESS,
    ...initialAdmin,
    roleNames: initialAdmin?.roleNames ?? [],
    permissions: initialAdmin?.permissions ?? [],
    resolved: hasInitialPermissions,
  }));

  useEffect(() => {
    if (hasInitialPermissions) return;

    const controller = new AbortController();

    async function loadAccess() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) {
          setAccess((current) => ({ ...current, resolved: true }));
          return;
        }

        const data = (await response.json()) as Partial<AdminAccessSnapshot>;
        setAccess({
          adminId: typeof data.adminId === "string" ? data.adminId : null,
          displayName: typeof data.displayName === "string" ? data.displayName : null,
          email: typeof data.email === "string" ? data.email : null,
          roleNames: Array.isArray(data.roleNames) ? data.roleNames : [],
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          resolved: true,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAccess((current) => ({ ...current, resolved: true }));
      }
    }

    void loadAccess();
    return () => controller.abort();
  }, [hasInitialPermissions]);

  const value = useMemo(() => access, [access]);
  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
