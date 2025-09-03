'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { apiService } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Basic account fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [jlptLevel, setJlptLevel] = useState('None');
  const [whyStudyJapanese, setWhyStudyJapanese] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Registration Failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Registration Failed',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Registration Failed',
        description: 'First name and last name are required',
        variant: 'destructive',
      });
      return;
    }

    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
      toast({
        title: 'Registration Failed',
        description: 'Age must be between 13 and 120',
        variant: 'destructive',
      });
      return;
    }

    if (!dateOfBirth) {
      toast({
        title: 'Registration Failed',
        description: 'Date of birth is required',
        variant: 'destructive',
      });
      return;
    }

    if (!whyStudyJapanese.trim()) {
      toast({
        title: 'Registration Failed',
        description: 'Please tell us why you want to study Japanese',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register({ 
        username, 
        email, 
        password,
        first_name: firstName,
        last_name: lastName,
        age: parseInt(age),
        date_of_birth: dateOfBirth,
        jlpt_level: jlptLevel as any,
        why_study_japanese: whyStudyJapanese,
      });
      
      // Store user info in localStorage for the app to use
      localStorage.setItem('currentUser', JSON.stringify({
        ...response.user,
        displayName: response.user.username
      }));
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${response.user.username}!`,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Registration Error:", error);
      let description = 'An unexpected error occurred. Please try again later.';
      if (error.message?.includes('email')) {
        description = 'Email is already taken';
      } else if (error.message?.includes('username')) {
        description = 'Username is already taken';
      }
      toast({
        title: 'Registration Failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 py-8">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Nihongo Mastery</CardTitle>
          <CardDescription>Create your account and tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="13"
                    max="120"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Japanese Learning Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Japanese Learning</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jlptLevel">Current JLPT Level</Label>
                  <Select value={jlptLevel} onValueChange={setJlptLevel} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your JLPT level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None (Beginner)</SelectItem>
                      <SelectItem value="N5">N5 (Basic)</SelectItem>
                      <SelectItem value="N4">N4 (Elementary)</SelectItem>
                      <SelectItem value="N3">N3 (Intermediate)</SelectItem>
                      <SelectItem value="N2">N2 (Pre-Advanced)</SelectItem>
                      <SelectItem value="N1">N1 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyStudyJapanese">Why do you want to study Japanese?</Label>
                  <Textarea
                    id="whyStudyJapanese"
                    placeholder="Tell us about your motivation for learning Japanese..."
                    value={whyStudyJapanese}
                    onChange={(e) => setWhyStudyJapanese(e.target.value)}
                    rows={3}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 