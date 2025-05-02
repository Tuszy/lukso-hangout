import { create } from "zustand";
import { combine } from "zustand/middleware";

export enum Role {
  NONE,
  OWNER,
  VISITOR,
}

const useRole = create(
  combine(
    {
      role: Role.NONE,
      verified: false,
    },
    (set) => ({
      setRole: (role: Role) =>
        set((state) => {
          if (state.role === role) return state;
          return {
            ...state,
            role,
            verified: role === Role.NONE ? false : state.verified,
          };
        }),
      setVerified: (verified: boolean) =>
        set((state) => {
          if (state.verified === verified) return state;
          return { ...state, verified };
        }),
    })
  )
);

export const isNone = () => useRole.getState().role === Role.NONE;
export const isOwner = () => useRole.getState().role === Role.OWNER;
export const isVisitor = () => useRole.getState().role === Role.VISITOR;
export const isVerified = () => useRole.getState().verified;

export const isNotNone = () => !isNone();
export const isNotOwner = () => !isOwner();
export const isNotVisitor = () => !isVisitor();

export default useRole;
