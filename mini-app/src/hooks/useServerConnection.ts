import { Socket } from "socket.io-client";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { Position, Rotation } from "./useWorld";

type ServerConnectionState = {
  socket: Socket | null;
  localStream: MediaStream | null;
  peers: Record<string, Peer>;
};

type ProfileImage = {
  url: string;
  width: number;
  height: number;
  ratio: number;
};

export type ProfileData = {
  name: string;
  img?: ProfileImage;
};

type PositionData = {
  position: Position;
  rotation: Rotation;
};

export type ServerPeer = {
  id: string;
  address: `0x${string}` | null;
  data?: ProfileData;
  verified: boolean;
  chainId: number;
};

export type Peer = ServerPeer & {
  connection: RTCPeerConnection | null;
  remoteStream: MediaStream | null;
  position: PositionData | null;
  channel: RTCDataChannel | null;
  muted: boolean;
};

export const useServerConnection = create(
  combine(
    {
      socket: null,
      localStream: null,
      peers: {},
    } as ServerConnectionState,
    (set) => ({
      setSocket: (socket: Socket | null) =>
        set((state) => {
          if (state.socket === socket) return state;
          Object.values(state.peers).forEach(closePeerRTCConnection);
          return {
            ...state,
            socket,
            peers: {},
            localStream: !socket ? null : state.localStream,
          };
        }),
      setLocalStream: (localStream: MediaStream | null) =>
        set((state) => {
          if (state.localStream === localStream) return state;
          if (state.localStream) {
            const tracks = state.localStream.getTracks();
            for (const track of tracks) {
              track.stop();
              state.localStream.removeTrack(track);
            }
            Object.values(state.peers).forEach((peer) => {
              const tracks = peer.connection?.getSenders() ?? [];
              for (const track of tracks) {
                peer.connection?.removeTrack(track);
              }
            });
          }

          if (localStream) {
            Object.values(state.peers).forEach((peer) => {
              if (peer.connection) {
                for (const track of localStream.getTracks()) {
                  peer.connection.addTrack(track, localStream);
                }
              }
            });
          }
          return { ...state, localStream };
        }),
      addServerPeers: (newPeers: ServerPeer[]) =>
        set((state) => {
          const peers = { ...state.peers };
          const chainId = parseInt(window.lukso.chainId);
          for (const serverPeer of newPeers) {
            if (
              serverPeer.id in state.peers ||
              serverPeer.chainId !== chainId
            ) {
              continue;
            }
            peers[serverPeer.id] = {
              position: null,
              ...serverPeer,
              connection: null,
              remoteStream: null,
              channel: null,
              muted: false,
            };
          }

          return {
            ...state,
            peers,
          };
        }),
      addServerPeer: (serverPeer: ServerPeer) =>
        set((state) => {
          const chainId = parseInt(window.lukso.chainId);
          if (serverPeer.id in state.peers || serverPeer.chainId !== chainId) {
            return state;
          }

          return {
            ...state,
            peers: {
              ...state.peers,
              [serverPeer.id]: {
                position: null,
                ...serverPeer,
                connection: null,
                remoteStream: null,
                channel: null,
                muted: false,
              },
            },
          };
        }),
      addPeer: (peer: Peer) =>
        set((state) => {
          const chainId = parseInt(window.lukso.chainId);
          if (state.peers[peer.id] === peer || peer.chainId !== chainId) {
            return state;
          }

          if (state.localStream && peer.connection) {
            for (const track of state.localStream.getTracks()) {
              peer.connection.addTrack(track, state.localStream);
            }
          }

          return {
            ...state,
            peers: {
              ...state.peers,
              [peer.id]: peer,
            },
          };
        }),
      removePeer: (id: string) =>
        set((state) => {
          if (id in state.peers) {
            closePeerRTCConnection(state.peers[id]);
          }
          const peers = {
            ...state.peers,
          };
          delete peers[id];
          return { ...state, peers };
        }),
      removeAllPeers: () =>
        set((state) => {
          Object.values(state.peers).forEach(closePeerRTCConnection);
          return { ...state, peers: {} };
        }),
      addPeerConnectionAndChannel: (
        id: string,
        connection: RTCPeerConnection,
        channel: RTCDataChannel
      ) =>
        set((state) => {
          if (!(id in state.peers)) return state;

          if (state.localStream) {
            for (const track of state.localStream.getTracks()) {
              connection.addTrack(track, state.localStream);
            }
          }

          return {
            ...state,
            peers: {
              ...state.peers,
              [id]: {
                ...state.peers[id],
                connection,
                channel,
              },
            },
          };
        }),
      addRemoteStreamToPeer: (id: string, remoteStream: MediaStream | null) =>
        set((state) => {
          if (!(id in state.peers)) return state;
          return {
            ...state,
            peers: {
              ...state.peers,
              [id]: { ...state.peers[id], remoteStream },
            },
          };
        }),
    })
  )
);

export const localVideoIsActive = () =>
  Boolean(useServerConnection.getState().localStream);

const closePeerRTCConnection = (peer: Peer | null) => {
  if (peer && peer.remoteStream) {
    const tracks = peer.remoteStream.getTracks();
    for (const track of tracks) {
      track.stop();
      peer.remoteStream.removeTrack(track);
    }
    peer?.connection?.close();
  }
};
