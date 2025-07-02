// components/TippingScreen.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the props interface for clarity and type safety
interface TippingScreenProps {
  originalAmountSats: number; // The amount in sats from paydesk
  onTipSelected: (totalAmountSats: number) => void; // Callback to pass the final amount in sats
  onCancel: () => void; // Callback to go back or cancel
}

export const TippingScreen: React.FC<TippingScreenProps> = ({ originalAmountSats, onTipSelected, onCancel }) => {
  const [tipAmountSats, setTipAmountSats] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  // Example tip percentages and fixed amounts. Adjust as needed.
  const tipPercentages = [0.10, 0.15, 0.20]; // 10%, 15%, 20%
  const commonTipAmounts = [500, 1000, 2000]; // Example fixed tips in sats

  // Helper function to calculate the total amount including tip
  const calculateTotal = (tip: number) => originalAmountSats + tip;

  // Handler for percentage tip buttons
  const handlePercentageTip = (percentage: number) => {
    const calculatedTip = Math.round(originalAmountSats * percentage); // Round to nearest satoshi
    setTipAmountSats(calculatedTip);
    setCustomTip(''); // Clear custom input when a percentage is chosen
  };

  // Handler for fixed tip amount buttons
  const handleFixedTip = (fixedTip: number) => {
    setTipAmountSats(fixedTip);
    setCustomTip(''); // Clear custom input when a fixed tip is chosen
  };

  // Handler for custom tip input field
  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTip(e.target.value);
    const parsedTip = parseFloat(e.target.value);
    // Ensure parsedTip is a valid number before setting, round to nearest sat
    setTipAmountSats(isNaN(parsedTip) ? 0 : Math.round(parsedTip));
  };

  // Handler for confirming the selected tip
  const handleConfirmTip = () => {
    onTipSelected(calculateTotal(tipAmountSats));
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add a Tip</h2>
      <p className="text-lg mb-4 text-gray-700">Original Amount: {new Intl.NumberFormat().format(originalAmountSats)} SAT</p>

      {/* Tip Percentage Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        {tipPercentages.map((percentage) => (
          <Button
            key={percentage}
            onClick={() => handlePercentageTip(percentage)}
            className="min-w-[100px] flex-1 sm:flex-none" // Responsive sizing
            variant="outline" // Use outline variant for tip options
          >
            {percentage * 100}%
            <br />
            <span className="text-xs">({new Intl.NumberFormat().format(Math.round(originalAmountSats * percentage))} SAT)</span>
          </Button>
        ))}
      </div>

      {/* Common Fixed Tip Amount Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        {commonTipAmounts.map((amount) => (
          <Button
            key={amount}
            onClick={() => handleFixedTip(amount)}
            className="min-w-[100px] flex-1 sm:flex-none" // Responsive sizing
            variant="outline" // Use outline variant for tip options
          >
            {new Intl.NumberFormat().format(amount)} SAT
          </Button>
        ))}
      </div>

      {/* Custom Tip Input */}
      <div className="mb-4 w-full max-w-xs">
        <Input
          type="number"
          placeholder="Custom Tip (SAT)"
          value={customTip}
          onChange={handleCustomTipChange}
          className="text-center text-lg py-2" // Larger input
        />
      </div>

      {/* Display Tip Amount and Total */}
      <div className="text-xl font-semibold mb-2 text-gray-800">
        Tip Amount: {new Intl.NumberFormat().format(tipAmountSats)} SAT
      </div>

      <p className="text-2xl font-bold mb-6 text-blue-600">
        Total with Tip: {new Intl.NumberFormat().format(calculateTotal(tipAmountSats))} SAT
      </p>

      {/* Action Buttons */}
      <div className="flex space-x-4 w-full justify-center">
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          No Tip / Back
        </Button>
        <Button
          onClick={handleConfirmTip}
          disabled={calculateTotal(tipAmountSats) <= 0} // Disable if total is zero or less
          variant="success" // Use success variant for confirmation
          className="flex-1"
        >
          Confirm Payment
        </Button>
      </div>
    </div>
  );
};