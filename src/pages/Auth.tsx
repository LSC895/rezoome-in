import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email' }).max(255),
  password: z.string().min(6, { message: 'Min 6 characters' }).max(128),
});

const Auth: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign in - Rezoome' : 'Create account - Rezoome';
  }, [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: 'Invalid input', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Confirm your email to finish sign up.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!' });
        navigate('/home');
      }
    } catch (err: any) {
      toast({ title: 'Auth error', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{mode === 'signin' ? 'Sign in to Rezoome' : 'Create your account'}</h1>

        <div className="flex gap-2 mb-6">
          <Button variant={mode === 'signin' ? 'default' : 'outline'} onClick={() => setMode('signin')} disabled={loading}>Sign in</Button>
          <Button variant={mode === 'signup' ? 'default' : 'outline'} onClick={() => setMode('signup')} disabled={loading}>Sign up</Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>
      </section>
    </main>
  );
};

export default Auth;
