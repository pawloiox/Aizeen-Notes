"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically detects the #access_token in the URL 
    // and securely logs you in client-side.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Successfully logged in! Send the user back to the main app
        router.push('/'); 
      }
    });

    // Cleanup the listener when the component unmounts to prevent memory leaks
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <p>Authenticating your account... please wait.</p>
    </div>
  );
}