import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { authService, User } from '@/utils/auth';
import { toast } from 'sonner';
import { Leaf, Truck, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'consumer',
  });

  const handleDemoLogin = (role: string) => {
    // Create a demo user without backend
    const demoUser: User = {
      id: `demo-${role}-${Date.now()}`,
      email: `demo-${role}@farmaa.com`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}`,
      role: role as any,
    };
    
    toast.success(`Logged in as ${demoUser.name}!`);
    onAuthSuccess(demoUser);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { session } = await authService.login(loginForm.email, loginForm.password);
      if (session) {
        const profile = await authService.getProfile(session.access_token);
        if (profile) {
          toast.success('Login successful!');
          onAuthSuccess(profile);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Invalid email or password. Try creating a new account or use demo mode.', {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password length
      if (signupForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await authService.signup(
        signupForm.email,
        signupForm.password,
        signupForm.name,
        signupForm.role
      );
      
      // Auto-login after signup
      const { session } = await authService.login(signupForm.email, signupForm.password);
      if (session) {
        const profile = await authService.getProfile(session.access_token);
        if (profile) {
          toast.success('Account created successfully!');
          onAuthSuccess(profile);
        }
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      const errorMessage = error.message || 'Signup failed. Please try again.';
      
      // If user already exists, suggest login
      if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
        toast.error('This email is already registered. Please login instead.', {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="shadow-md hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border border-gray-100 dark:border-gray-800">
        <CardHeader className="text-center space-y-6 pt-8">
          <div className="mx-auto bg-gradient-to-br from-green-600 to-green-700 rounded-full p-5 w-24 h-24 flex items-center justify-center shadow-lg">
            <Leaf className="h-12 w-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
              FarMaa
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Fresh from Farm to your Doorstep
            </CardDescription>
          </div>
          
          {/* Demo Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-left border border-blue-200 dark:border-blue-800/50">
            <p className="text-xs font-semibold mb-1.5 text-blue-700 dark:text-blue-300">Quick Start Demo:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Create an account or use demo mode with any email/password
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupForm.name}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a</Label>
                  <Select
                    value={signupForm.role}
                    onValueChange={(value) =>
                      setSignupForm({ ...signupForm, role: value })
                    }
                  >
                    <SelectTrigger id="signup-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Customer
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="delivery_partner">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Delivery Partner
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Demo Mode Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4 font-medium">
              Or try demo mode:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                onClick={() => handleDemoLogin('consumer')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Demo as Customer
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                onClick={() => handleDemoLogin('manager')}
              >
                <Leaf className="h-4 w-4 mr-2" />
                Demo as Manager
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                onClick={() => handleDemoLogin('delivery_partner')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Demo as Delivery Partner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2025 FarMaa - Connecting Farmers to Consumers</p>
      </div>
    </div>
  );
}