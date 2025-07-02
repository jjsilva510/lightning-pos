// components/payment-page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
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
  // FIX: Ensure parsedAmountSats is a number, defaulting to 0 if null/undefined/cannot be parsed
  const parsedAmountSats = Number(amountSatsParam || '0'); // Convert and provide default '0' for Number()
  // You might also explicitly check for NaN if you need to handle that specifically, e.g.,
  // const parsedAmountSats = amountSatsParam ? Number(amountSatsParam) : 0;
  // if (isNaN(parsedAmountSats)) parsedAmountSats = 0; // If you expect non-numeric input to be 0

  const lnaddress = searchParams.get('lnaddress');

  // ADD THIS LOG: This confirms the value being used
  console.log('PaymentPage: Received amountSats from URL (parsed):', parsedAmountSats);

  const { settings } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const { products, cart, isLoading, error: errorPos, clearCart } = usePOSData();
  const { print } = usePrint();

  const handleCompletePayment = () => {
    // FIX: Use parsedAmountSats consistently for total
    if (parsedAmountSats > 0) {
      setPaymentStatus('success');

      const printOrder = {
        total: parsedAmountSats, // This is the total in SATs
        currency: settings?.currency, // This might be the original local currency
        totalSats: parsedAmountSats, // This is already in SATs
        // items: cartItems.map((item) => ({
        //   name: item?.product?.name,
        //   price: item?.product?.price,
        //   qty: item?.quantity,
        // })),
      };

      setPrintOrder(printOrder as any);
      print(printOrder as any);

      clearCart();
    }
  };

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
      // Now, this amount is already in satoshis, so tell the hook not to convert it again.
      generatePayment(parsedAmountSats, cart, products, true);
    }
  }, [parsedAmountSats, cart, products, generatePayment]);

  // THIS IS THE *ONLY* DECLARATION FOR retryGeneration THAT SHOULD BE PRESENT
  const retryGeneration = () => {
    resetPayment();
    // FIX: Ensure parsedAmountSats is passed as a number
    // It should also pass the 'true' flag here, as it's the retry for the same pre-converted amount
    generatePayment(parsedAmountSats, cart, products, true);
  };

  // Auto-redirect or status update logic
  useEffect(() => {
    if (!isLoading && parsedAmountSats > 0 && !isNaN(parsedAmountSats) && paymentStatus === 'selecting') {
      setPaymentStatus('pending');
    }
  }, [isLoading, parsedAmountSats, paymentStatus]);

  if (error) {
    return (
      <div className='w-full h-full bg-[#0F0F0F]'>
        {/* FIX: Ensure amount prop is always a number */}
        <PaymentError error={error} amount={parsedAmountSats} onRetry={retryGeneration} />
      </div>
    );
  }

  // Corrected placement for loading spinner return
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
            // FIX: Ensure amount and amountInSats props are always numbers
            // Use parsedAmountSats for the overall amount passed from the URL
            amount={parsedAmountSats}
            // Use amountInSats from the usePayment hook, providing a default 0 if null
            amountInSats={amountInSats ?? 0}
            isLoading={isGenerating}
          />
        )}

        {paymentStatus === 'success' && (
          // FIX: Ensure amount prop is always a number
          <PaymentSuccess amount={parsedAmountSats} printOrder={printOrder} />
        )}
      </div>
    </Suspense>
  );
}