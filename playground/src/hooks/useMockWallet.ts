"use client";

import { useState, useCallback } from "react";

const DEFAULT_ADDRESS = "0x1234567890123456789012345678901234567890";

export function useMockWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);

  const connect = useCallback(async (): Promise<string> => {
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(
      "%c[Mock Wallet] Connected with address: " + DEFAULT_ADDRESS,
      "color: #4CAF50; font-weight: bold"
    );

    setIsConnected(true);
    setAddress(DEFAULT_ADDRESS);
    return DEFAULT_ADDRESS;
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(undefined);
    console.log("%c[Mock Wallet] Disconnected", "color: #f44336; font-weight: bold");
  }, []);

  const sign = useCallback(async (message: string): Promise<string> => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const signature = `0xmock_signature_${message.substring(0, 20)}`;
    console.log(
      "%c[Mock Wallet] Signed message",
      "color: #FF9800; font-weight: bold"
    );

    return signature;
  }, [isConnected]);

  // Callbacks formatted for PassportScoreWidget
  const connectWalletCallback = useCallback(async () => {
    return connect();
  }, [connect]);

  const generateSignatureCallback = useCallback(
    async (message: string) => {
      return sign(message);
    },
    [sign]
  );

  return {
    isConnected,
    address,
    connect,
    disconnect,
    sign,
    connectWalletCallback,
    generateSignatureCallback,
  };
}
