/* eslint-disable no-console */
import { ec as starkEc, getAccountPath, getKeyPairFromPath } from "@toruslabs/starkware-crypto";
import { entropyToMnemonic } from "bip39";
import { privateToAddress } from "ethereumjs-util";

function isHexPrefixed(str: string): boolean {
  return (str || "").substring(0, 2) === "0x";
}

interface KeyPair {
  pubKey: string;
  privKey: string;
}
/**
 * @param privKey secp256k1 private key in hex format
 * @param layer layer is a string representing the operating layer (usually 'starkex').
 * @param application  application is a string representing the relevant application.
 * Serve as a domain separator between different applications
 * @param index index represents an index of the possible associated wallets derived from the seed.
 * @returns Calculates the stark key pair based on the layer, application and a given index.
 layer is a string representing the operating layer (usually 'starkex').
 */
export function getStarkHDAccount(privKey: string, layer: string, application: string, index: number): KeyPair {
  const privKeyBuffer = Buffer.from(privKey, "hex");
  if (privKeyBuffer.length !== 32) {
    throw new Error("Invalid entropy size");
  }
  const ethAddress = privateToAddress(privKeyBuffer).toString("hex");
  const sanitizedEthAddr = isHexPrefixed(ethAddress) ? ethAddress : `0x${ethAddress}`;
  const mnemonic = entropyToMnemonic(privKey);
  const accountPath = getAccountPath(layer, application, sanitizedEthAddr, index);
  const keyPair = getKeyPairFromPath(mnemonic, accountPath);
  return {
    pubKey: keyPair.getPublic("hex"),
    privKey: keyPair.getPrivate("hex"),
  };
}
/**
 * @param privateKey secp256k1 private key in hex format
 * @returns derives the stark key pair from stark friendly ec curve from provided hex private key
 */
export function getStarkKeyPair(privateKey: string): KeyPair {
  const keyPair = starkEc.keyFromPrivate(privateKey, "hex");
  return {
    pubKey: keyPair.getPublic("hex"),
    privKey: keyPair.getPrivate("hex"),
  };
}
