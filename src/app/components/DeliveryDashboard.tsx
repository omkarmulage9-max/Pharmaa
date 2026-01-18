import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { User, apiService } from '@/utils/auth';
import { demoOrders, isDemoMode } from '@/utils/demoData';
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Clock,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface DeliveryDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  deliveryTimeMinutes: number;
  createdAt: string;
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  otp?: string;
}

export function DeliveryDashboard({ user, onLogout }: DeliveryDashboardProps) {
  const { theme, setTheme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    // Use demo data in demo mode
    if (isDemoMode(user.id)) {
      setOrders(demoOrders);
      return;
    }
    
    try {
      const { orders } = await apiService.request('/orders/all');
      setOrders(orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handlePickupOrder = async (orderId: string) => {
    // In demo mode, simulate pickup
    if (isDemoMode(user.id)) {
      const updatedOrders = orders.map(o => 
        o.id === orderId ? { ...o, status: 'on_the_way' as const } : o
      );
      setOrders(updatedOrders);
      toast.success('Order picked up for delivery (Demo Mode)');
      return;
    }
    
    try {
      await apiService.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'on_the_way' }),
      });
      toast.success('Order picked up for delivery');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedOrder) return;

    // In demo mode, simulate OTP verification
    if (isDemoMode(user.id)) {
      if (otpInput === selectedOrder.otp) {
        const updatedOrders = orders.map(o => 
          o.id === selectedOrder.id ? { ...o, status: 'delivered' as const } : o
        );
        setOrders(updatedOrders);
        toast.success('Order delivered successfully! (Demo Mode)');
        setShowOTPDialog(false);
        setSelectedOrder(null);
        setOtpInput('');
      } else {
        toast.error('Invalid OTP');
      }
      return;
    }

    try {
      const { order } = await apiService.request(
        `/orders/${selectedOrder.id}/verify-otp`,
        {
          method: 'POST',
          body: JSON.stringify({ otp: otpInput }),
        }
      );

      toast.success('Order delivered successfully!');
      setShowOTPDialog(false);
      setSelectedOrder(null);
      setOtpInput('');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const onTheWayOrders = orders.filter((o) => o.status === 'on_the_way');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  Delivery Partner Dashboard
                </h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="destructive" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Pickups</CardTitle>
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">On The Way</CardTitle>
              <Truck className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{onTheWayOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered Today</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{deliveredOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              <Package className="h-4 w-4 mr-2" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="on_the_way">
              <Truck className="h-4 w-4 mr-2" />
              On The Way ({onTheWayOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              <CheckCircle className="h-4 w-4 mr-2" />
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.slice(-8)}
                        <Badge className="bg-blue-600">Pending Pickup</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4" />
                        Ordered {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.deliveryLocation?.address || 'Address not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-semibold">{order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-green-600">₹{order.total?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Est. Delivery Time</p>
                        <p className="font-semibold">{order.deliveryTimeMinutes} mins</p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handlePickupOrder(order.id)}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Pick Up Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No pending deliveries</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="on_the_way" className="space-y-4 mt-6">
            {onTheWayOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.slice(-8)}
                        <Badge className="bg-orange-600">On The Way</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4" />
                        Picked up {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.deliveryLocation?.address || 'Address not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-semibold">{order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-green-600">₹{order.total?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Customer OTP Required</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Ask the customer for their OTP to complete the delivery
                      </p>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOTPDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {onTheWayOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No active deliveries</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4 mt-6">
            {deliveredOrders.map((order) => (
              <Card key={order.id} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.slice(-8)}
                        <Badge className="bg-green-600">Delivered</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        Delivered {new Date(order.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-semibold">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-green-600">₹{order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {deliveredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No delivered orders yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Delivery OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm mb-2">
                Order #{selectedOrder?.id.slice(-8)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ask the customer for their 4-digit OTP to confirm delivery
              </p>
            </div>

            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={4}
                placeholder="1234"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleVerifyOTP}
                disabled={otpInput.length !== 4}
              >
                Verify & Complete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowOTPDialog(false);
                  setOtpInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}