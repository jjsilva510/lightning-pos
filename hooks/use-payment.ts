// hooks/use-payment.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCurrencySymbolForPay } from '@/utils/currency-utils';
import { useSettings } from '@/hooks/use-settings';
import { useLightningAuth } from '@/hooks/use-lightning-auth';
import { extractPaymentHash } from '@/lib/lightning-utils';

// FIX: Ensure these imports match your actual utility functions
import { convertToSatoshis, generateLightningInvoice, verifyLightningPayment } from '@/lib/lightning-utils';

interface UsePaymentOptions {
  lnaddress: string;
  onComplete: () => void;
}

export type Product = {
  id: string;
  name: string;
  price: number;
};

const INTERVAL_MS = 3000; // 3 seconds

export const usePayment = ({ lnaddress, onComplete }: UsePaymentOptions) => {
  const [lightningInvoice, setLightningInvoice] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<string | null>(null);
  const [amountInSats, setAmountInSats] = useState<number | null>(null); // Keep as number | null for initial state
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { settings, getCurrencySymbol } = useSettings();
  const { lightningAddress, isAuthenticated } = useLightningAuth();

  const generatePayment = useCallback(
    // FIX: Add a new parameter `isAmountInSats` to indicate if `amount` is already in satoshis
    async (
      amount: number, // This 'amount' can now be either fiat or sats
      cart: { id: string; quantity: number }[] = [],
      products: Product[] = [],
      isAmountPreConvertedToSats: boolean = false // Defaults to false (meaning needs conversion)
    ) => {
      setIsGenerating(true);
      setError(null);
      setVerifyUrl(null);
      setPaymentHash(null);
      setAmountInSats(null); // Clear previous amount in sats

      if (!settings?.currency) { // Ensure settings.currency is available
        setError('Currency settings not loaded.');
        setIsGenerating(false);
        return;
      }

      if (!lightningAddress && !lnaddress) {
        setError('Lightning Address not configured');
        setIsGenerating(false);
        return;
      }

      try {
        let finalSatsAmount: number;

        if (isAmountPreConvertedToSats) {
          // If the amount is already in SATs, use it directly
          finalSatsAmount = amount;
          console.log(`Using pre-converted amount: ${finalSatsAmount} satoshis`);
        } else {
          // Otherwise, convert from fiat to satoshis
          console.log(`Converting ${amount} ${settings.currency} to satoshis...`);
          finalSatsAmount = await convertToSatoshis(amount, settings.currency);
          console.log(`Converted to ${finalSatsAmount} satoshis`);
        }

        setAmountInSats(finalSatsAmount); // Set the final calculated satoshi amount

        if (finalSatsAmount <= 0) {
          throw new Error('Cannot generate invoice for 0 or negative SATs.');
        }

        // 2. Generar el comentario con los detalles de los productos
        let comment = `Payment for ${getCurrencySymbolForPay(settings?.currency_paid || 'SAT')}${amount.toLocaleString()} ${settings.currency_paid}`;
        // If the original amount was already sats (from the tipping screen),
        // you might want to adjust the comment to reflect that, or pass the original fiat amount too.
        // For now, it will show the original "amount" parameter from the function.

        // 3. Generar factura Lightning usando LUD-16/LUD-21
        console.log(`Generating Lightning invoice for ${finalSatsAmount} sats...`);
        const invoiceData = await generateLightningInvoice(
          String(lnaddress ? lnaddress : lightningAddress),
          finalSatsAmount, // Use the final calculated satoshi amount
          comment,
        );

        setLightningInvoice(invoiceData.pr);

        // 4. Configurar verificación de pago si está disponible (LUD-21)
        if (invoiceData.verify) {
          setVerifyUrl(invoiceData.verify);
          const hash = extractPaymentHash(invoiceData.pr);
          setPaymentHash(hash);
          console.log('Payment verification enabled (LUD-21)');
        } else {
          console.log('Payment verification not available - manual confirmation required');
        }
      } catch (err) {
        console.error('Error generating payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate payment');
      } finally {
        setIsGenerating(false);
      }
    },
    // FIX: Update dependencies. Remove lightningInvoice, paymentHash, isGenerating from deps
    // as they are states managed within the useCallback, not external dependencies for its logic.
    // Add settings.currency, lightningAddress, lnaddress.
    [settings?.currency, lightningAddress, lnaddress, convertToSatoshis, getCurrencySymbol],
  );

  const resetPayment = useCallback(() => {
    setLightningInvoice(null);
    setVerifyUrl(null);
    setPaymentHash(null);
    setAmountInSats(null);
    setIsGenerating(true); // Should be true to indicate it's ready to generate again
    setError(null);
  }, []);

  useEffect(() => {
    if (!verifyUrl || !paymentHash) {
      return;
    }

    let interval: NodeJS.Timeout;
    let isActive = true;

    const checkPayment = async () => {
      if (!isActive) return;

      try {
        setError(null);

        const result = await verifyLightningPayment(verifyUrl, paymentHash);

        if (result.settled) {
          console.log('Payment confirmed!', result);
          if (isActive) {
            onComplete();
          }
          // FIX: Clear the interval and set isActive to false when settled
          if (interval) clearTimeout(interval);
          isActive = false;
          return; // Detener verificación
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        if (isActive) {
          setError(error instanceof Error ? error.message : 'Verification failed');
        }
      }

      // FIX: Only set timeout if not settled and still active
      if (isActive) {
        interval = setTimeout(checkPayment, INTERVAL_MS);
      }
    };

    // Iniciar verificación
    checkPayment();

    // Cleanup
    return () => {
      isActive = false;
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [verifyUrl, paymentHash, onComplete]);

  return {
    lightningInvoice,
    amountInSats,
    isGenerating,
    error,
    generatePayment,
    resetPayment,
  };
};