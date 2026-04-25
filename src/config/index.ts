import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monad, monadTestnet } from 'wagmi/chains'
import { http } from 'wagmi'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const config = getDefaultConfig({
  appName: 'MOANTAP',
  projectId,
  chains: [monad, monadTestnet],
  transports: {
    [monad.id]: http('https://rpc.monad.xyz'),
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
  ssr: true,
})
