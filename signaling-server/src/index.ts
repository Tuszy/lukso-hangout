import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  getProfileData,
  JSON_RPC_PROVIDER,
  LUKSO_MAINNET_CHAIN_ID,
  ProfileData,
} from "./getProfileData";
import { abi as LSP0ERC725AccountABI } from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";
import { Contract, hashMessage, Interface } from "ethers";
import { SiweMessage } from "siwe";

const peerMapping: Record<string, Peer> = {};
const socketMapping: Record<string, Socket> = {};

export type Peer = {
  id: string;
  address: `0x${string}`;
  data?: ProfileData;
  verified: boolean;
  chainId: number;
};

const port = parseInt(process.env.PORT ?? "") || 8888;

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const LSP0ERC725AccountABIInterface = new Interface(LSP0ERC725AccountABI);

io.on("connection", (client) => {
  console.log("connected", client.id);
  socketMapping[client.id] = client;

  let visitor = client.handshake.query.visitor as `0x${string}` | null;
  const owner = client.handshake.query.owner as `0x${string}`;
  let chainId = parseInt(client.handshake.query.chainId as string);
  if (!chainId || isNaN(chainId)) {
    chainId = LUKSO_MAINNET_CHAIN_ID;
  }

  client.on("disconnect", () => {
    console.log("disconnected", client.id, visitor);
    delete socketMapping[client.id];
    delete peerMapping[client.id];

    if (owner) {
      io.to(owner).emit("leave", client.id);
    }
  });

  if (!owner) {
    console.log("Reject: ", client.id, "Invalid query", client.handshake.query);
    delete socketMapping[client.id];
    client.disconnect();
    return;
  }

  client.on("join", async (data) => {
    const profileData = await getProfileData(visitor, chainId);
    if (client.id in peerMapping) return;
    client.join(owner);
    const peer = {
      ...data,
      data: profileData,
      id: client.id,
      address: visitor,
      verified: false,
      chainId,
    };
    peerMapping[client.id] = peer;
    client.to(owner).emit("join", peer);

    const peers = [...(io.of("/").adapter.rooms.get(owner) ?? [])]
      .map((peerId) => peerMapping[peerId])
      .filter(
        (peer) =>
          peer != null && peer.id !== client.id && peer.chainId === chainId
      );

    console.log("PEERS:", peers);
    client.emit("peers", peers);
  });

  client.on("buy", (assetId) => {
    io.to(owner).emit("buy", assetId);
  });

  client.on("verify", async (data) => {
    if (!data.message || !data.signature) return;
    const { signature, message } = data;
    const siweMessage = new SiweMessage(message);
    const nonce = client.id.replace(/[^a-zA-Z0-9]/g, "");
    if (siweMessage.nonce !== nonce) return;
    const hash = hashMessage(message);

    const up = new Contract(
      visitor as string,
      LSP0ERC725AccountABIInterface,
      JSON_RPC_PROVIDER[chainId]
    );

    if (await up.isValidSignature(hash, signature)) {
      peerMapping[client.id].verified = true;
      io.to(owner).emit("verified", client.id);
    }
  });

  client.on("offer", (targetId, offer) => {
    if (!socketMapping[targetId] || !peerMapping[client.id]) return;
    socketMapping[targetId].emit("offer", peerMapping[client.id], offer);
  });

  client.on("answer", (targetId, answer) => {
    if (!socketMapping[targetId] || !peerMapping[client.id]) return;
    socketMapping[targetId].emit("answer", peerMapping[client.id], answer);
  });

  client.on("ice candidate", (targetId, candidate) => {
    if (!socketMapping[targetId] || !peerMapping[client.id]) return;
    socketMapping[targetId].emit(
      "ice candidate",
      peerMapping[client.id],
      candidate
    );
  });
});

io.listen(port);
