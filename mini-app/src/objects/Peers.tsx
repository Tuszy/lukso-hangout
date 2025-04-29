import { useServerConnection } from "../hooks/useServerConnection";
import { Peer } from "./Peer";

export const Peers = () => {
  const peers = useServerConnection((state) => state.peers);
  return Object.values(peers).map((peer) => <Peer key={peer.id} peer={peer} />);
};
