import { createContext, ReactNode, useContext } from "react";
import { useSocket } from "../hooks/useSocket";
import { Socket } from "socket.io-client";

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<Socket | null>(null);

export const useSocketProvider = () => useContext(SocketContext);

export function SocketProvider({ children }: SocketProviderProps) {
  const socket = useSocket();

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
