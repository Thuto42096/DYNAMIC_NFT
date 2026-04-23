import { BrowserProvider } from "ethers";
import { SIGN_IN_MESSAGE } from "./api";

export function hasWallet() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function connectWallet() {
  if (!hasWallet()) {
    throw new Error("No browser wallet detected. Install MetaMask.");
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No account returned from wallet.");
  }
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export async function signInMessage(signer) {
  return signer.signMessage(SIGN_IN_MESSAGE);
}

export function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
