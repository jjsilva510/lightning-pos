// app/[lnaddress]/paydesk-client.tsx
'use client'; // This directive marks it as a Client Component

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // useRouter is for client components
import { ChevronLeft, Settings, X } from 'lucide-react';
import { useEffect } from 'react';

// Import your custom hooks and UI components
import { useNumpad } from '@/hooks/use-numpad';
import { useSettings } from '@/hooks/use-settings';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { useLightningAuth } from '@/hooks/use-lightning-auth';

import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/keyboard';
import { AvailableCurrencies } from '@/types/config';

// Define the props interface for this Client Component
interface PaydeskClientProps {
  lnaddress: string; // The lnaddress passed from the Server Component
}

export default function PaydeskClient({ lnaddress }: PaydeskClientProps) {
  const router = useRouter(); // useRouter is a client-side hook

  const { settings, getCurrencySymbol } = useSettings();
  const { convertCurrency } = useCurrencyConverter();
  // Ensure settings?.currency is handled as it can be undefined initially
  const numpadData = useNumpad(settings?.currency);
  const { login, validateLightningAddress, logout } = useLightningAuth();

  useEffect(() => {
    async function validateAndLogin() {
      // lnaddress is now a prop, so it's always available once the component renders.
      // No need for useParams or decodeURIComponent here as it's done in the server component.

      if (!lnaddress) { // Should technically not happen if generateStaticParams is correct
          router.push('/app'); // Redirect if for some reason lnaddress is empty
          return;
      }

      // `lnaddress` is already decoded from the server component
      const isValid = await validateLightningAddress(lnaddress);

      if (!isValid) {
        router.push('/app');
        return; // Important: return after push to prevent further execution
      }

      login(lnaddress);
    }

    validateAndLogin();
    // Depend on lnaddress. If lnaddress changes (e.g., through client-side routing),
    // this effect will re-run. For static exports, it'll run once per page load.
  }, [lnaddress, router, validateLightningAddress, login]); // Added dependencies for useEffect

  // Provide a default value for settings.currency if it's undefined
  const currentCurrency = settings?.currency || 'USD'; // Or your default currency
  const value = Number(numpadData.intAmount[numpadData.usedCurrency] || 0);
  const amountInSats = convertCurrency(value, currentCurrency as AvailableCurrencies, 'SAT');


  return (
    <div className='flex-1 flex flex-col w-full mx-auto h-full bg-[#0F0F0F]'>
      <header className='py-4 flex bg-background border-b shadow-sm'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-4'>
          <div className='flex items-center'>
            <h1 className='text-xl font-medium'>{'Pay to...'}</h1>
          </div>
          <Button size='icon' variant='outline' asChild>
            <Link href='/settings'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </header>

      <div className='flex-1 flex flex-col'>
        <div className='flex-1 flex flex-col justify-center items-center gap-2 px-4 bg-white border-b rounded-b-2xl'>
          <div className='flex items-center gap-4 w-full max-w-md min-h-20 mx-auto mt-4 p-5 bg-gray-100 border rounded-lg'>
            <div className='flex flex-col gap-0 w-full'>
              {/* lnaddress is directly available as a prop */}
              <p className='font-medium text-gray-800'>{lnaddress}</p>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center justify-center'>
            <div className='text-3xl'>
              {getCurrencySymbol()}
              <b>{new Intl.NumberFormat().format(numpadData.intAmount[numpadData.usedCurrency])}</b> {currentCurrency}
            </div>
            <div className='text-lg text-gray-600'>~ {new Intl.NumberFormat().format(amountInSats)} SAT</div>
          </div>
        </div>
        <div className='flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8'>
          <Button
            className='w-full'
            size='lg'
            variant='success'
            onClick={() => {
              const orderId = `order-${Date.now()}`; // Consider how orderId is truly managed in a static app
              router.push(
                `/payment?currency=${currentCurrency}&&amount=${
                  numpadData.intAmount[numpadData.usedCurrency]
                }&lnaddress=${encodeURIComponent(lnaddress)}`, // Encode lnaddress for URL
              );
            }}
            disabled={numpadData.intAmount[numpadData.usedCurrency] === 0}
          >
            Confirm
          </Button>
          <Keyboard numpadData={numpadData} />
        </div>
      </div>
    </div>
  );
}