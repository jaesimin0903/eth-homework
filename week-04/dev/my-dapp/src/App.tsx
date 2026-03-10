import '@rainbow-me/rainbowkit/styles.css'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import { CounterDisplay } from './components/CounterDisplay'
import { CounterActions } from './components/CounterActions'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="container">
            <h1>Counter DApp</h1>
            <ConnectButton />
            <CounterDisplay />
            <CounterActions />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
