'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';

const ERC20_TRANSFER_ABI = [{
  name: 'transfer',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  outputs: [{ name: '', type: 'bool' }],
}] as const;

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const RECIPIENT = (process.env.NEXT_PUBLIC_X402_WALLET || '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78') as `0x${string}`;
const USDC_AMOUNT = BigInt(39_000_000); // 39 USDC, 6 decimals

type PaymentStatus = 'initiating' | 'ready' | 'signing' | 'pending' | 'verifying' | 'confirmed' | 'error';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: `0x${string}` | undefined;
}

export default function USDCPaymentModal({ isOpen, onClose, walletAddress }: Props) {
  const [status, setStatus] = useState<PaymentStatus>('initiating');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState<'wrong-chain' | 'rejected' | 'insufficient' | 'reverted' | 'verify-failed' | 'generic'>('generic');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [facilitator, setFacilitator] = useState('');

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongChain = chainId !== base.id;

  const {
    writeContractAsync,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  const { isSuccess: isTxConfirmed, isError: isTxFailed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('initiating');
      setSessionId(null);
      setErrorMessage('');
      setErrorType('generic');
      setDownloadUrl('');
      setFacilitator('');
      resetWrite();
      initiatePayment();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-verify when tx confirms on-chain
  useEffect(() => {
    if (isTxConfirmed && txHash && sessionId && status === 'pending') {
      verifyPayment(txHash);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, txHash, sessionId, status]);

  // Handle tx revert
  useEffect(() => {
    if (isTxFailed && status === 'pending') {
      setStatus('error');
      setErrorMessage('Transaction reverted on-chain. The transfer may have failed due to insufficient USDC balance or allowance.');
      setErrorType('reverted');
    }
  }, [isTxFailed, status]);

  const initiatePayment = async () => {
    try {
      const response = await fetch('/api/payments/x402/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddress || null }),
      });

      const data = await response.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus('ready');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to initiate payment session.');
        setErrorType('generic');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Payment initiation failed. Please try again.');
      setErrorType('generic');
    }
  };

  const handlePay = useCallback(async () => {
    if (!sessionId) return;

    if (isWrongChain) {
      try {
        switchChain({ chainId: base.id });
      } catch {
        setStatus('error');
        setErrorMessage('Failed to switch to Base network. Please switch manually in your wallet.');
        setErrorType('wrong-chain');
      }
      return;
    }

    setStatus('signing');
    setErrorMessage('');

    try {
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [RECIPIENT, USDC_AMOUNT],
        chainId: base.id,
      });
      // txHash is set by the hook; move to pending
      setStatus('pending');
    } catch (err: unknown) {
      const error = err as { shortMessage?: string; name?: string };
      const message = error?.shortMessage || '';

      if (message.includes('User rejected') || error?.name === 'UserRejectedRequestError') {
        setStatus('error');
        setErrorMessage('Transaction cancelled. You can try again when ready.');
        setErrorType('rejected');
      } else if (message.includes('insufficient') || message.includes('exceeds balance')) {
        setStatus('error');
        setErrorMessage('Insufficient USDC balance. You need at least 39 USDC on Base.');
        setErrorType('insufficient');
      } else {
        setStatus('error');
        setErrorMessage(message || 'Transaction failed. Please try again.');
        setErrorType('generic');
      }
    }
  }, [sessionId, isWrongChain, switchChain, writeContractAsync]);

  const verifyPayment = async (hash: `0x${string}`) => {
    setStatus('verifying');

    try {
      const response = await fetch('/api/payments/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, txHash: hash }),
      });

      const data = await response.json();

      if (data.verified && data.downloadUrl) {
        setStatus('confirmed');
        setDownloadUrl(data.downloadUrl);
        setFacilitator(data.facilitator || '');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Payment verification failed. Please contact support.');
        setErrorType('verify-failed');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Verification request failed. Please try again.');
      setErrorType('verify-failed');
    }
  };

  const handleRetry = () => {
    if (errorType === 'verify-failed' && txHash && sessionId) {
      verifyPayment(txHash);
    } else if (errorType === 'reverted') {
      // Full restart
      resetWrite();
      setStatus('initiating');
      initiatePayment();
    } else {
      // rejected, insufficient, generic — just go back to ready
      setStatus('ready');
      setErrorMessage('');
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
      setTimeout(() => onClose(), 1000);
    }
  };

  if (!isOpen) return null;

  const truncatedHash = txHash
    ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
    : '';

  const retryLabel = errorType === 'verify-failed'
    ? 'Retry Verification'
    : errorType === 'reverted'
      ? 'Start Over'
      : errorType === 'wrong-chain'
        ? 'Switch to Base'
        : 'Try Again';

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full p-8 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-display text-2xl mb-8 text-gray-900">Pay with USDC</h2>

        {/* Initiating */}
        {status === 'initiating' && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Spinner />
            <p className="text-sm text-gray-400">Preparing payment...</p>
          </div>
        )}

        {/* Ready */}
        {status === 'ready' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Amount</label>
              <p className="text-2xl font-display text-gray-900">39.00 USDC</p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Network</label>
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded">Base</span>
            </div>

            {isWrongChain && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="text-xs text-amber-700">
                  You&apos;re connected to the wrong network. Please switch to Base to continue.
                </p>
              </div>
            )}

            <button
              onClick={handlePay}
              className="w-full bg-[#d4a853] hover:bg-[#c49a42] text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              {isWrongChain ? 'Switch to Base' : 'Pay $39 USDC'}
            </button>
          </div>
        )}

        {/* Signing */}
        {status === 'signing' && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Spinner />
            <p className="text-sm text-gray-400">Waiting for wallet approval...</p>
            <p className="text-xs text-gray-300">Confirm the transaction in your wallet</p>
          </div>
        )}

        {/* Pending */}
        {status === 'pending' && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Spinner />
            <p className="text-sm text-gray-400">Transaction submitted</p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d4a853] hover:text-[#c49a42] transition-colors"
              >
                {truncatedHash} ↗
              </a>
            )}
            <p className="text-xs text-gray-300">Waiting for on-chain confirmation...</p>
          </div>
        )}

        {/* Verifying */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Spinner />
            <p className="text-sm text-gray-400">Verifying with validators...</p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d4a853] hover:text-[#c49a42] transition-colors"
              >
                {truncatedHash} ↗
              </a>
            )}
          </div>
        )}

        {/* Confirmed */}
        {status === 'confirmed' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-lg p-5 text-center">
              <p className="text-green-600 font-medium mb-1">Payment Confirmed</p>
              {facilitator && (
                <p className="text-xs text-gray-400">Verified by: {facilitator}</p>
              )}
              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#d4a853] hover:text-[#c49a42] mt-2 inline-block"
                >
                  View transaction ↗
                </a>
              )}
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-[#d4a853] hover:bg-[#c49a42] text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              Download Your Manual
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-red-500 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-full bg-[#d4a853] hover:bg-[#c49a42] text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              {retryLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-6 w-6 text-[#d4a853]" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
