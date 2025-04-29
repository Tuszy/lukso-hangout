export const blacklist = new Set<`0x${string}`>(
  [
    "0x39456Bcd4D450E55f851F97c30dF828A4e1f6C66", // Universal Page Name
    "0x5021E9ED50D8C71E3D74c0de7964342AAA1A0F62", // Platties
    "0x724d898ad60fe9c420fb0d7f51634477252dcee7", // QnA
    "0x2f5432B95c36C08dAbb2f501150578DCf1949800", // QnA
    "0x998fbf3ca73800dd5edcd990061b9c4164e92807", // Fellowship Connector
    "0x855bb3e40261a73dd4fc691fc024cc7d60794d00", // UniversalSwaps V1 Positions NFT-V1
    "0xbb63957fb86efe6527ce96d1ae030e9e59faf630", // DeBulls
  ].map((address) => address.toLowerCase() as `0x${string}`)
);
