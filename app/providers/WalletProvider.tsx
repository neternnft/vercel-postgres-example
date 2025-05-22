'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { avalanche } from 'wagmi/chains';
import { http } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = '75a8d6457e30a6239cf7ec6b23de3e9c';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Glurbnok',
  projectId,
  chains: [avalanche],
  transports: {
    [avalanche.id]: http()
  }
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 