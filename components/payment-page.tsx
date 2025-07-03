// components/payment-page.tsx
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react'; // <--- ADD useCallback
import { useSearchParams } from 'next/navigation';

import { usePOSData } from '@/hooks/use-pos-data';
import { useSettings } from '@/hooks/use-settings';
import { usePrint } from '@/hooks/use-print';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { usePayment } from '@/hooks/use-payment';

import { PaymentView } from '@/components/payment-view';
import { PaymentSuccess } from '@/components/payment-success';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { PrintOrder } from '@/types/print';
import { AvailableCurrencies } from '@/types/config';
import { PaymentError } from './payment/payment-error';

export function PaymentPage() {
  const searchParams = useSearchParams();

  const amountSatsParam = searchParams.get('amountSats');
  const parsedAmountSats = Number(amountSatsParam || '0');

  const lnaddress = searchParams.get('lnaddress');

  console.log('PaymentPage: Received amountSats from URL (parsed):', parsedAmountSats);

  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  
  console.log('DEBUG: Current currency setting from useSettings:', settings?.currency);

  const { products, cart, isLoading, error: errorPos, clearCart } = usePOSData();
  const { print } = usePrint();

  // WRAP handleCompletePayment IN useCallback
  const handleCompletePayment = useCallback(() => {
    if (parsedAmountSats > 0) {
      setPaymentStatus('success');

      const printOrder = {
        total: parsedAmountSats,
        currency: settings?.currency,
        totalSats: parsedAmountSats,
      };

      setPrintOrder(printOrder as any);
      print(printOrder as any);

      clearCart();
    }
  }, [parsedAmountSats, settings?.currency, print, clearCart]); // Add all dependencies

  // Payment hook: amountInSats from this hook can be number | null initially
  const { lightningInvoice, amountInSats, isGenerating, error, generatePayment, resetPayment } = usePayment({
    lnaddress: lnaddress as string,
    onComplete: handleCompletePayment,
  });

  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'pending' | 'success'>('selecting');
  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null);

  // Trigger payment generation
  useEffect(() => {
    if (parsedAmountSats > 0 && !isNaN(parsedAmountSats)) {
      generatePayment(parsedAmountSats, cart, products, true);
    }
  }, [parsedAmountSats, cart, products, generatePayment]);

  const retryGeneration = useCallback(() => { // Also wrap retryGeneration in useCallback
    resetPayment();
    generatePayment(parsedAmountSats, cart, products, true);
  }, [parsedAmountSats, cart, products, generatePayment, resetPayment]);


  // Auto-redirect or status update logic
  useEffect(() => {
    if (!isLoading && parsedAmountSats > 0 && !isNaN(parsedAmountSats) && paymentStatus === 'selecting') {
      setPaymentStatus('pending');
    }
  }, [isLoading, parsedAmountSats, paymentStatus]);

  if (error) {
    return (
      <div className='w-full h-full bg-[#0F0F0F]'>
        <PaymentError error={error} amount={parsedAmountSats} onRetry={retryGeneration} />
      </div>
    );
  }

  if (isLoading || isGenerating) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && errorPos) {
    return (
      <div className='w-full max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col items-center justify-center p-8'>
        <p className='text-red-500 text-center'>Error: {errorPos}</p>
        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>
          Try again
        </button>
      </div>
    );
  }

  return (
    <Suspense>
      <div className='w-full h-full bg-[#0F0F0F]'>
        {paymentStatus === 'pending' && (
          <PaymentView
            invoice={lightningInvoice as string}
            amount={parsedAmountSats}
            amountInSats={amountInSats ?? 0}
            isLoading={isGenerating}
            onManualConfirm={handleCompletePayment} // Already here from previous step
          />
        )}

        {paymentStatus === 'success' && (
          <PaymentSuccess amount={parsedAmountSats} printOrder={printOrder} />
        )}
      </div>
    </Suspense>
  );
}