
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { apiService } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login({ email, password });
      
      // Store user info in localStorage for the app to use
      localStorage.setItem('currentUser', JSON.stringify({
        ...response.user,
        displayName: response.user.username
      }));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${response.user.username}!`,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Login Error:", error);
      let description = 'An unexpected error occurred. Please try again later.';
      if (error.message?.includes('credentials')) {
        description = 'Wrong email or password';
      }
      toast({
        title: 'Login Failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
       <div className="absolute top-4 left-4">
         <Button variant="outline" asChild>
            <Link href="/">Home</Link>
         </Button>
       </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Nihongo Mastery</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
           <div className="mt-4 text-center text-xs text-muted-foreground">
             <p>Demo accounts (use any email domain):</p>
             <p>user@email.com / pass: password</p>
             <p>admin@email.com / pass: adminpass</p>
             <p>studentA@email.com / pass: password</p>
             <p>studentB@email.com / pass: password</p>
           </div>
           <div className="mt-4 text-center text-sm">
             Don't have an account?{' '}
             <Link href="/register" className="text-primary hover:underline">
               Register here
             </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
