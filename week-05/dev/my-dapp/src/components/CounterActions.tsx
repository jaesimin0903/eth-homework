import { useAccount, useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { counterAbi, counterAddress } from '../counter'
import { TransactionStatus } from './TransactionStatus'

export function CounterActions() {
  const { isConnected } = useAccount()
  const queryClient = useQueryClient()
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  const handleWrite = (functionName: 'increment' | 'decrement' | 'reset') => {
    reset()
    writeContract({
      address: counterAddress,
      abi: counterAbi,
      functionName,
    })
  }

  const handleConfirmed = () => {
    queryClient.invalidateQueries({ queryKey: ['readContract'] })
  }

  if (!isConnected) return null

  return (
    <div className="card">
      <div className="actions">
        <button
          className="btn-decrement"
          disabled={isPending}
          onClick={() => handleWrite('decrement')}
        >
          - Decrement
        </button>
        <button
          className="btn-increment"
          disabled={isPending}
          onClick={() => handleWrite('increment')}
        >
          + Increment
        </button>
        <button
          className="btn-reset"
          disabled={isPending}
          onClick={() => handleWrite('reset')}
        >
          Reset
        </button>
      </div>
      <TransactionStatus
        hash={hash}
        isPending={isPending}
        error={error}
        onConfirmed={handleConfirmed}
      />
    </div>
  )
}
