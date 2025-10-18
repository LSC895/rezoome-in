import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export const useHybridAuth = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkLoaded) return;

    const syncAuth = async () => {
      if (!clerkUser) {
        // User logged out of Clerk, clear Supabase session
        await supabase.auth.signOut();
        setSupabaseSession(null);
        setSupabaseUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if we already have a Supabase session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession?.user?.email === clerkUser.primaryEmailAddress?.emailAddress) {
          // Session already exists and matches
          setSupabaseSession(existingSession);
          setSupabaseUser(existingSession.user);
          setIsLoading(false);
          return;
        }

        // Sync Clerk user with Supabase
        console.log('Syncing Clerk user with Supabase...');
        const { data, error: syncError } = await supabase.functions.invoke('sync-clerk-user', {
          body: {
            clerkUserId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
          }
        });

        if (syncError) {
          console.error('Sync error:', syncError);
          throw syncError;
        }

        if (data?.session) {
          // Set the session in Supabase client
          const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });

          if (setSessionError) {
            console.error('Set session error:', setSessionError);
            throw setSessionError;
          }

          setSupabaseSession(sessionData.session);
          setSupabaseUser(sessionData.user);
          console.log('Supabase session created successfully');
        }
      } catch (err) {
        console.error('Error syncing auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync authentication');
      } finally {
        setIsLoading(false);
      }
    };

    syncAuth();
  }, [clerkUser, clerkLoaded]);

  // Listen for Supabase auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    clerkUser,
    supabaseSession,
    supabaseUser,
    isAuthenticated: !!clerkUser && !!supabaseSession,
    isLoading: !clerkLoaded || isLoading,
    error
  };
};
