'use client';

import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="https://imgur.com/iJLXUgO.png" 
            alt="Aizeen Logo" 
            width={64} 
            height={64} 
            className="object-contain mb-4" 
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to Notes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Sign in to sync your notes across devices
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#18181b', // zinc-900
                    brandAccent: '#27272a', // zinc-800
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f4f4f5', // zinc-100
                    defaultButtonBackgroundHover: '#e4e4e7', // zinc-200
                    defaultButtonBorder: '#e4e4e7',
                    defaultButtonText: '#18181b',
                    dividerBackground: '#e4e4e7',
                    inputBackground: 'transparent',
                    inputBorder: '#e4e4e7',
                    inputBorderHover: '#a1a1aa',
                    inputBorderFocus: '#18181b',
                    inputText: '#18181b',
                    inputLabelText: '#52525b',
                    inputPlaceholder: '#a1a1aa',
                    messageText: '#52525b',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#52525b',
                    anchorTextHoverColor: '#18181b',
                  },
                  space: {
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '9999px',
                    buttonBorderRadius: '9999px',
                    inputBorderRadius: '9999px',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'font-medium shadow-sm transition-colors',
                input: 'transition-colors',
                label: 'font-medium text-sm mb-1.5',
              },
            }}
            providers={['google', 'github']}
            redirectTo={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`}
          />
        </div>
      </motion.div>
    </div>
  );
}
