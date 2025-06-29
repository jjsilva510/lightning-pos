'use client';

import React, { useState } from 'react';
import {
  Zap,
  Store,
  Truck,
  User,
  Utensils,
  BarChart3,
  Lock,
  ArrowUpRight,
  Plus,
  Minus,
  BadgePercent,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// This is a Server Component, so we use `redirect` from `next/navigation`.
// It's part of the App Router's server-side utilities.
import { redirect } from 'next/navigation';
/*
interface FAQItem {
  question: string;
  answer: string;
}

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'available' | 'coming-soon';
}

const useCases: UseCase[] = [
  {
    icon: <Store />,
    title: 'Retail stores',
    description: 'Accept with zero complexity.',
  },
  {
    icon: <Truck />,
    title: 'Market vendors',
    description: 'Mobile-friendly solution for sellers.',
  },
  {
    icon: <User />,
    title: 'Professionals',
    description: 'Simple payment solution for independent.',
  },
  {
    icon: <Utensils />,
    title: 'Establishments',
    description: 'Seamless payments for dining.',
  },
];

const features: Feature[] = [
  {
    icon: <Store />,
    title: 'Shop',
    description: 'Manage your products directly in the app.',
    status: 'available',
  },
  {
    icon: <BarChart3 />,
    title: 'Paydesk',
    description: 'Advanced payment terminal functionality.',
    status: 'available',
  },
  {
    icon: <BarChart3 />,
    title: 'Analytics',
    description: 'Track your sales and payment.',
    status: 'coming-soon',
  },
  {
    icon: <Lock />,
    title: 'Synchronization',
    description: 'Connect multiple devices.',
    status: 'coming-soon',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is a Lightning Address?',
    answer: 'A <b>Lightning POS</b> is like an email. It’s a simple way to receive Bitcoin payments.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. You don’t need to install anything. <b>Lightning POS</b> is a web application that works directly in your browser.',
  },
  {
    question: 'Can I use it without technical knowledge?',
    answer: 'Absolutely. <b>Lightning POS</b> is designed to be ultra-simple.',
  },
  {
    question: 'What are the costs?',
    answer: '<b>Lightning POS</b> is completely free.',
  },
];
*/
export default function HomePage() {
  // Immediately redirect to the /login page
  redirect('/login');

  // This component will not render anything, as it redirects immediately.
  // A return statement is still technically needed, but unreachable due to redirect.
  return null;
}