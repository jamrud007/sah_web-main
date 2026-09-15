// types/auth.ts
import type { User } from "./apiDef";

export type UserInfo = Omit<User, "is_active" | "role"> & {
  role: string;
  roles?: string[];
  isAllRole?: boolean;
};

export interface AuthState {
  userInfo: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
