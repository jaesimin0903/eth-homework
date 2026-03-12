import '@rainbow-me/rainbowkit/styles.css'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { CounterDisplay } from './components/CounterDisplay'
import { CounterActions } from './components/CounterActions'
import CustomWalletButton from './components/CustomWalletButton'
import SenEthDisplay from './components/SenEthDisplay'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Counter DApp</h1>
            <CustomWalletButton />
            <SenEthDisplay />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
