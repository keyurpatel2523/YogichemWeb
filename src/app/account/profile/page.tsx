'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setUser, isAuthenticated } = useUserStore();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthday: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            birthday: data.birthday ? data.birthday.split('T')[0] : '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router, token]);

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!profile.firstName.trim()) errors.firstName = 'First name is required';
    if (!profile.lastName.trim()) errors.lastName = 'Last name is required';
    if (profile.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(profile.phone)) {
      errors.phone = 'Enter a valid phone number';
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswords = () => {
    const errors: Record<string, string> = {};
    if (!passwords.currentPassword) errors.currentPassword = 'Enter your current password';
    if (!passwords.newPassword) {
      errors.newPassword = 'Enter a new password';
    } else if (passwords.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (!passwords.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          birthday: profile.birthday || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setUser(data.user, data.token);
      toast({ title: 'Profile updated', description: 'Your details have been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = (error: string) =>
    `flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      error ? 'border-red-500 focus-visible:ring-red-400' : 'border-input'
    }`;

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Account
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-gray-600 text-sm">Manage your personal information</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-boots-blue" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">First name *</label>
                  <input
                    className={inputClass(profileErrors.firstName)}
                    value={profile.firstName}
                    onChange={(e) => {
                      setProfile({ ...profile, firstName: e.target.value });
                      if (profileErrors.firstName) setProfileErrors({ ...profileErrors, firstName: '' });
                    }}
                    placeholder="First name"
                  />
                  <FieldError msg={profileErrors.firstName} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Last name *</label>
                  <input
                    className={inputClass(profileErrors.lastName)}
                    value={profile.lastName}
                    onChange={(e) => {
                      setProfile({ ...profile, lastName: e.target.value });
                      if (profileErrors.lastName) setProfileErrors({ ...profileErrors, lastName: '' });
                    }}
                    placeholder="Last name"
                  />
                  <FieldError msg={profileErrors.lastName} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email address</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Phone number</label>
                <input
                  className={inputClass(profileErrors.phone)}
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                  }}
                  placeholder="+44 7700 900000"
                  type="tel"
                />
                <FieldError msg={profileErrors.phone} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date of birth</label>
                <input
                  className={inputClass('')}
                  type="date"
                  value={profile.birthday}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full">
                {savingProfile ? (
                  <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-boots-blue" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Current password *</label>
                <input
                  type="password"
                  className={inputClass(passwordErrors.currentPassword)}
                  value={passwords.currentPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                  }}
                  placeholder="Enter current password"
                />
                <FieldError msg={passwordErrors.currentPassword} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">New password *</label>
                <input
                  type="password"
                  className={inputClass(passwordErrors.newPassword)}
                  value={passwords.newPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }}
                  placeholder="At least 8 characters"
                />
                <FieldError msg={passwordErrors.newPassword} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Confirm new password *</label>
                <input
                  type="password"
                  className={inputClass(passwordErrors.confirmPassword)}
                  value={passwords.confirmPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }}
                  placeholder="Repeat new password"
                />
                <FieldError msg={passwordErrors.confirmPassword} />
              </div>

              <Button onClick={handleChangePassword} disabled={savingPassword} variant="outline" className="w-full">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
