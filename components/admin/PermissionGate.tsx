import type { ReactNode } from "react";

type PermissionGateProps = {
  permissions: readonly string[];
  anyOf: readonly string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({ permissions, anyOf, children, fallback = null }: PermissionGateProps) {
  const allowed = anyOf.some((permission) => permissions.includes(permission));
  return allowed ? <>{children}</> : <>{fallback}</>;
}
