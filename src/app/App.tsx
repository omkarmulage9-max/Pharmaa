import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';
import { AuthScreen } from '@/app/components/AuthScreen';
import { ConsumerDashboard } from '@/app/components/ConsumerDashboard';
import { ManagerDashboard } from '@/app/components/ManagerDashboard';
import { DeliveryDashboard } from '@/app/components/DeliveryDashboard';
import { authService, User } from '@/utils/auth';
import { supabase } from '@/utils/auth';
// import { axios } from 'axios'
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    authService.getSession().then((session) => {
      if (session) {
        setSession(session);
        authService.getProfile(session.access_token)
          .then((profile) => {
            setUser(profile);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Failed to get profile:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          const profile = await authService.getProfile(session.access_token);
          setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const userName = user?.name || 'User';
    await authService.logout();
    setUser(null);
    setSession(null);
    toast.success(`${userName} logged out successfully! You can now switch roles.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthScreen onAuthSuccess={(user) => setUser(user)} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {user.role === 'consumer' && (
          <ConsumerDashboard user={user} onLogout={handleLogout} />
        )}
        {user.role === 'manager' && (
          <ManagerDashboard user={user} onLogout={handleLogout} />
        )}
        {user.role === 'delivery_partner' && (
          <DeliveryDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}