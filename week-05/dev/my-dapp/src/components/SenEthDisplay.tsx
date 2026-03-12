import React, { useState } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function SenEthDisplay() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  // 내 지갑 정보와 잔액 가져오기
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // ETH 전송을 위한 훅
  const {
    data: hash,
    isPending,
    error: sendError,
    sendTransaction
  } = useSendTransaction();

  // 트랜잭션이 블록에 포함될 때까지 기다리기 위한 훅
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) return;
    
    // 이더를 Wei 단위로 변환 후 전송 (ex. 0.1 ETH -> 100000000000000000 Wei)
    sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{marginTop: 0}}>이더(ETH) 전송하기</h2>

      {balanceData && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '4px', color: '#0369a1' }}>
          <strong>내 지갑 잔액:</strong> {Number(balanceData.formatted).toFixed(4)} {balanceData.symbol}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>받는 사람 (Address)</label>
          <input
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            disabled={isPending || isConfirming}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>송금할 금액 (ETH)</label>
          <input
            type="number"
            step="0.0001"
            placeholder="0.05"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            disabled={isPending || isConfirming}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming}
          style={{ 
            padding: '12px', 
            marginTop: '5px', 
            backgroundColor: (isPending || isConfirming) ? '#999' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer'
          }}
        >
          {isPending ? '지갑에서 승인 대기 중...' : isConfirming ? '전송 중 (채굴 대기)...' : '전송하기'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        {hash && (
          <div style={{ marginBottom: '10px' }}>
            <strong>트랜잭션 해시:</strong> {hash.slice(0, 10)}...{hash.slice(-8)}
          </div>
        )}
        {isConfirming && <div style={{ color: '#d97706' }}>⏳ 트랜잭션이 블록에 포함되기를 기다리는 중입니다...</div>}
        {isConfirmed && <div style={{ color: '#16a34a' }}>✅ 전송 완료! 트랜잭션이 성공적으로 처리되었습니다.</div>}
        {sendError && (
          <div style={{ color: '#dc2626' }}>
            ❌ 전송 실패: {((sendError as any).shortMessage || sendError.message)}
          </div>
        )}
      </div>
    </div>
  );
}
