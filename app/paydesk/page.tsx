'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings } from 'lucide-react';
import React, { useState } from 'react'; // Import useState

import { useNumpad } from '@/hooks/use-numpad';
import { useSettings } from '@/hooks/use-settings';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';

import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';
import { AvailableCurrencies } from '@/types/config';
import { TippingScreen } from '@/components/TippingScreen'; // Import the TippingScreen component

type PaydeskStep = 'amount_entry' | 'tipping'; // Define steps for the paydesk flow

export default function PaydeskPage() {
  const router = useRouter();

  const { settings, getCurrencySymbol } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  const numpadData = useNumpad(settings?.currency);

  const [currentStep, setCurrentStep] = useState<PaydeskStep>('amount_entry');
  const [originalAmountSats, setOriginalAmountSats] = useState<number>(0);

  const value = Number(numpadData.intAmount[numpadData.usedCurrency] || 0);
  const amountInSats = convertCurrency(value, settings?.currency as AvailableCurrencies, 'SAT');

  const handleConfirmAmount = () => {
    if (amountInSats > 0) {
      setOriginalAmountSats(amountInSats);
      setCurrentStep('tipping'); // Move to the tipping screen
    }
  };

  const handleTipSelected = (totalAmountSats: number) => {
    console.log('Navigating to payment with totalAmountSats:', totalAmountSats);
    // When tip is confirmed, navigate to the payment page with the total amount
    router.push(
      `/payment?amountSats=${totalAmountSats}` // Pass amount in sats directly
      // You might also want to pass originalAmountSats if needed for display on payment page
    );
  };

  const handleCancelTipping = () => {
    setCurrentStep('amount_entry'); // Go back to amount entry
    // Optionally reset numpad data here if needed
    // numpadData.reset();
  };

  return (
    <div className='flex-1 flex flex-col w-full mx-auto h-full bg-[#0F0F0F]'>
      <header className='py-4 flex bg-background border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <Button className='mr-2' variant='outline' size='icon' asChild>
              <Link href='/app'>
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Back</span>
              </Link>
            </Button>
            <h1 className='text-xl font-medium'>{'Paydesk'}</h1>
          </div>
          <Button size='icon' variant='outline' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      {/* Conditional Rendering based on currentStep */}
      {currentStep === 'amount_entry' && (
        <div className='flex-1 flex flex-col'>
          <div className='flex-1 flex flex-col justify-center items-center gap-2 bg-white border-b rounded-b-2xl'>
            <div className='text-3xl'>
              {getCurrencySymbol()}
              <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {settings.currency}
            </div>
            <div className='text-lg text-gray-600'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
          </div>
          <div className='flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8'>
            <Button
              className='w-full'
              size='lg'
              variant='success'
              onClick={handleConfirmAmount} // Call our new handler
              disabled={numpadData.intAmount[numpadData.usedCurrency] === 0}
            >
              Confirm
            </Button>
            <Keyboard numpadData={numpadData} />
          </div>
        </div>
      )}

      {currentStep === 'tipping' && (
        <div className='flex-1 flex flex-col justify-center items-center'>
          <TippingScreen
            originalAmountSats={originalAmountSats}
            onTipSelected={handleTipSelected}
            onCancel={handleCancelTipping}
          />
        </div>
      )}
    </div>
  );
}