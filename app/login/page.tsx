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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="https://vcytoiebdpgakwlabcnw.supabase.co/storage/v1/object/public/public-images/AizeenLogo.png" 
            alt="Aizeen Logo" 
            width={64} 
            height={64} 
            className="object-contain mb-4" 
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Welcome to Notes
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Sign in to sync your notes across devices
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#fafafa',
                    brandAccent: '#f4f4f5',
                    brandButtonText: '#18181b',
                    defaultButtonBackground: '#27272a',
                    defaultButtonBackgroundHover: '#3f3f46',
                    defaultButtonBorder: '#3f3f46',
                    defaultButtonText: '#fafafa',
                    dividerBackground: '#3f3f46',
                    inputBackground: 'transparent',
                    inputBorder: '#3f3f46',
                    inputBorderHover: '#71717a',
                    inputBorderFocus: '#fafafa',
                    inputText: '#fafafa',
                    inputLabelText: '#a1a1aa',
                    inputPlaceholder: '#71717a',
                    messageText: '#a1a1aa',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#a1a1aa',
                    anchorTextHoverColor: '#fafafa',
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
            redirectTo={
              typeof window !== 'undefined' 
                ? `${window.location.origin}/auth/callback`
                : `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/auth/callback`
            }
          />
        </div>
      </motion.div>
    </div>
  );
}
