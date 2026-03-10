import { useEffect } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'

interface TransactionStatusProps {
  hash: `0x${string}` | undefined
  isPending: boolean
  error: Error | null
  onConfirmed?: () => void
}

export function TransactionStatus({ hash, isPending, error, onConfirmed }: TransactionStatusProps) {
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  })

  useEffect(() => {
    if (isSuccess && onConfirmed) {
      onConfirmed()
    }
  }, [isSuccess, onConfirmed])

  if (!isPending && !hash && !error) return null

  if (error) {
    return (
      <div className="tx-status error">
        Error: {error.message.split('\n')[0]}
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="tx-status pending">
        지갑에서 트랜잭션을 확인해주세요...
      </div>
    )
  }

  if (isConfirming) {
    return (
      <div className="tx-status confirming">
        트랜잭션 확인 중...
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="tx-status success">
        트랜잭션 성공!
      </div>
    )
  }

  return null
}
