import { useReadContract, useAccount } from 'wagmi'
import { counterAbi, counterAddress } from '../counter'

export function CounterDisplay() {
  const { isConnected } = useAccount()
  const { data, isLoading, isError, error } = useReadContract({
    address: counterAddress,
    abi: counterAbi,
    functionName: 'getCount',
    query: { enabled: isConnected },
  })

  if (!isConnected) {
    return (
      <div className="card">
        <p className="loading">지갑을 연결하세요</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card">
        <p className="loading">Loading...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="card">
        <p className="error-text">Error: {error?.message ?? 'Failed to read count'}</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="count">{data?.toString() ?? '—'}</div>
    </div>
  )
}
