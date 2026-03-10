import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { foundry, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Counter DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [foundry, sepolia],
  transports: {
    [foundry.id]: http(),
    [sepolia.id]: http(),
  },
})
