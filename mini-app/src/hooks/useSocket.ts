import { io } from "socket.io-client";
import { SOCKET_IO_URL } from "../constants";
import { useEffect } from "react";
import useWorld from "../hooks/useWorld";
import { useUpProvider } from "../context/UpProvider";
import { ServerPeer, useServerConnection } from "./useServerConnection";

const STUN_SERVER_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
  ],
};

export const useSocket = () => {
  const upContext = useUpProvider();
  const socket = useServerConnection((state) => state.socket);
  const setSocket = useServerConnection((state) => state.setSocket);
  const addPeer = useServerConnection((state) => state.addPeer);
  const addServerPeer = useServerConnection((state) => state.addServerPeer);
  const addRemoteStreamToPeer = useServerConnection(
    (state) => state.addRemoteStreamToPeer
  );
  const addPeerConnectionAndChannel = useServerConnection(
    (state) => state.addPeerConnectionAndChannel
  );
  const removePeer = useServerConnection((state) => state.removePeer);
  const removeAllPeers = useServerConnection((state) => state.removeAllPeers);
  const addBoughtAssetById = useWorld((state) => state.addBoughtAssetById);

  useEffect(() => {
    if (socket === null || (socket?.hasListeners("connect") ?? false)) return;

    socket.on("connect", () => {
      console.log("SOCKET IO CONNECTED");
      socket?.emit("join");
    });

    socket.on("disconnect", () => {
      console.log("SOCKET IO DISCONNECTED");
      removeAllPeers();
    });

    socket.on("join", addServerPeer);

    socket.on("leave", removePeer);

    socket.on("peers", async (serverPeers: ServerPeer[]) => {
      for (const serverPeer of serverPeers) {
        const connection = new RTCPeerConnection(STUN_SERVER_CONFIG);

        connection.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket?.emit("ice candidate", serverPeer.id, candidate);
          }
        };

        connection.onnegotiationneeded = async () => {
          try {
            await connection.setLocalDescription();
            socket?.emit("offer", serverPeer.id, connection.localDescription);
          } catch (error) {
            console.error("Error on processing RTCPeer offer", error);
          }
        };

        connection.ontrack = ({ track, streams }) => {
          track.onunmute = () => {
            addRemoteStreamToPeer(serverPeer.id, streams[0]);
          };
          track.onmute = () => {
            addRemoteStreamToPeer(serverPeer.id, null);
          };
          track.onended = () => {
            addRemoteStreamToPeer(serverPeer.id, null);
          };
        };

        const channel = connection.createDataChannel("position", {
          negotiated: true,
          id: 0,
        });
        channel.onopen = () => console.log("DATA CHANNEL OPEN");
        channel.onmessage = ({ data }) => {
          const peer = useServerConnection.getState().peers[serverPeer.id];
          peer.position = JSON.parse(data);
        };

        const peer = {
          position: null,
          ...serverPeer,
          connection,
          remoteStream: null,
          channel,
          muted: false,
        };

        addPeer(peer);
      }
    });

    socket.on("buy", addBoughtAssetById);

    socket.on(
      "offer",
      async (serverPeer: ServerPeer, offer: RTCSessionDescriptionInit) => {
        let peer = useServerConnection.getState().peers[serverPeer.id];
        if (!peer) {
          peer = {
            position: null,
            ...serverPeer,
            connection: null,
            remoteStream: null,
            channel: null,
            muted: false,
          };

          addPeer(peer);
        }

        let connection = peer.connection;

        if (!connection) {
          connection = new RTCPeerConnection(STUN_SERVER_CONFIG);

          connection.onnegotiationneeded = async () => {
            if (!connection) return;
            try {
              await connection.setLocalDescription();
              socket?.emit("offer", serverPeer.id, connection.localDescription);
            } catch (error) {
              console.error("Error on processing RTCPeer offer", error);
            }
          };

          connection.onicecandidate = ({ candidate }) => {
            if (candidate) {
              socket?.emit("ice candidate", serverPeer.id, candidate);
            }
          };

          connection.ontrack = ({ track, streams }) => {
            track.onunmute = () => {
              addRemoteStreamToPeer(serverPeer.id, streams[0]);
            };
            track.onmute = () => {
              addRemoteStreamToPeer(serverPeer.id, null);
            };
            track.onended = () => {
              addRemoteStreamToPeer(serverPeer.id, null);
            };
          };

          const channel = connection.createDataChannel("position", {
            negotiated: true,
            id: 0,
          });
          channel.onopen = () => console.log("DATA CHANNEL OPEN");
          channel.onmessage = ({ data }) => {
            const peer = useServerConnection.getState().peers[serverPeer.id];
            peer.position = JSON.parse(data);
          };

          addPeerConnectionAndChannel(serverPeer.id, connection, channel);
        }

        try {
          await connection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          await connection.setLocalDescription();
          socket?.emit("answer", serverPeer.id, connection.localDescription);
        } catch (error) {
          console.error("Error on processing RTCPeer offer", error);
        }
      }
    );

    socket.on(
      "answer",
      async (serverPeer: ServerPeer, answer: RTCSessionDescriptionInit) => {
        const peer = useServerConnection.getState().peers[serverPeer.id];
        if (!peer || !peer.connection) return;

        try {
          await peer.connection?.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error("Error on processing RTCPeer answer", error);
        }
      }
    );

    socket.on(
      "ice candidate",
      async (
        serverPeer: ServerPeer,
        candidate: RTCIceCandidateInit | null | undefined
      ) => {
        const peer = useServerConnection.getState().peers[serverPeer.id];
        if (!peer || !peer.connection) return;

        try {
          await peer.connection?.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding received ice candidate", error);
        }
      }
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("buy");
      socket.off("join");
      socket.off("leave");
      socket.off("peers");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice candidate");
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    socket?.disconnect();
    if (!upContext.isConnected) {
      setSocket(null);
    } else {
      setSocket(
        io(SOCKET_IO_URL, {
          query: {
            visitor: upContext.visitor,
            owner: upContext.owner,
          },
        })
      );
    }
  }, [upContext.visitor]);

  return socket;
};
