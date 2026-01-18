import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { User, apiService } from '@/utils/auth';
import { demoProducts, demoOrders, isDemoMode, getDemoOrdersForUser, getProducts, addOrder as saveOrder } from '@/utils/demoData';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  ShoppingCart,
  Heart,
  Package,
  User as UserIcon,
  LogOut,
  Home,
  Sun,
  Moon,
  Search,
  Plus,
  Minus,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface ConsumerDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  description: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
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

export function ConsumerDashboard({ user, onLogout }: ConsumerDashboardProps) {
  const { theme, setTheme } = useTheme();
  const [currentTab, setCurrentTab] = useState('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '123 Main Street, City',
    lat: 28.6139,
    lng: 77.2090,
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    // Use shared demo data in demo mode
    if (isDemoMode(user.id)) {
      setProducts(getProducts());
      return;
    }
    
    try {
      const { products } = await apiService.request('/products');
      setProducts(products || getProducts());
    } catch (error) {
      // Use shared demo data if server fails
      setProducts(getProducts());
    }
  };

  const loadOrders = async () => {
    // Use demo data in demo mode
    if (isDemoMode(user.id)) {
      setOrders(getDemoOrdersForUser(user.id));
      return;
    }
    
    try {
      const { orders } = await apiService.request('/orders');
      setOrders(orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleLike = (productId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedItems(newLiked);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    // In demo mode, create a mock order
    if (isDemoMode(user.id)) {
      const mockOrder = {
        id: `order:demo-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        items: cart,
        total: cartTotal,
        status: 'pending' as const,
        deliveryTimeMinutes: 30,
        createdAt: new Date().toISOString(),
        deliveryLocation: deliveryAddress,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
      };
      
      toast.success(`Order placed! Your OTP: ${mockOrder.otp}`);
      setOrders([mockOrder, ...orders]);
      setCart([]);
      setShowCheckout(false);
      return;
    }
    
    try {
      const orderData = {
        items: cart,
        total: cartTotal,
        deliveryLocation: deliveryAddress,
      };

      const { order } = await apiService.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      toast.success(`Order placed! Your OTP: ${order.otp}`);
      setCart([]);
      setShowCheckout(false);
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  const submitFeedback = async () => {
    // In demo mode, just show success
    if (isDemoMode(user.id)) {
      toast.success('Thank you for your feedback! (Demo Mode)');
      setShowFeedback(false);
      setFeedbackForm({ rating: 5, comment: '' });
      return;
    }
    
    try {
      await apiService.request('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          orderId: feedbackOrder?.id,
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        }),
      });

      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
      setFeedbackForm({ rating: 5, comment: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const likedProducts = products.filter((product) => likedItems.has(product.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 rounded-full p-2">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">FarMaa</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Farm Fresh Deliveries</p>
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

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Your cart is empty</div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <Card key={item.product.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex gap-3">
                              <ImageWithFallback
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.product.name}</h4>
                                <p className="text-sm text-gray-500">₹{item.product.price}/{item.product.unit}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFromCart(item.product.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {cart.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-green-600">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setShowCheckout(true)}
                      >
                        Checkout
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentTab('liked')}
              >
                <Heart className={likedItems.size > 0 ? 'fill-red-500 text-red-500' : ''} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentTab('orders')}
              >
                <Package className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentTab('profile')}
              >
                <UserIcon className="h-5 w-5" />
              </Button>
              
              <div className="hidden sm:block">
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentTab === 'home' && (
          <div>
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-green-600 via-green-600 to-green-700 rounded-2xl p-8 md:p-12 mb-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Fresh from Farm to Your Table</h1>
                <p className="text-lg md:text-xl mb-8 text-green-50 leading-relaxed">
                  Get the freshest produce delivered directly from local farms. No middlemen, just quality.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg hover:bg-white/25 transition-colors">
                    <div className="text-3xl font-bold mb-1">{products.length}+</div>
                    <div className="text-sm text-green-50 font-medium">Fresh Products</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg hover:bg-white/25 transition-colors">
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-sm text-green-50 font-medium">Organic</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg hover:bg-white/25 transition-colors">
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-sm text-green-50 font-medium">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for fruits, vegetables, dairy..."
                  className="pl-10 h-12 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shop by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from(new Set(products.map(p => p.category))).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchQuery(category)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700 active:scale-95"
                  >
                    <div className="text-3xl mb-2">
                      {category === 'Vegetables' && '🥬'}
                      {category === 'Fruits' && '🍎'}
                      {category === 'Dairy' && '🥛'}
                      {category === 'Grains' && '🌾'}
                      {category === 'Pulses' && '🫘'}
                      {category === 'Herbs' && '🌿'}
                      {category === 'Spices' && '🌶️'}
                      {category === 'Eggs' && '🥚'}
                      {category === 'Others' && '🍯'}
                    </div>
                    <div className="font-semibold text-sm">{category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured/All Products */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 group">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setSelectedProduct(product)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        onClick={() => toggleLike(product.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            likedItems.has(product.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </Button>
                      <Badge className="absolute bottom-2 left-2 bg-green-600 text-white font-medium shadow-md">
                        {product.category}
                      </Badge>
                      {product.stock < 20 && (
                        <Badge className="absolute top-2 left-2 bg-orange-600 text-white font-medium shadow-md">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-500">₹{product.price}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No products found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'liked' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Liked Items</h2>
              {likedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No liked items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-bold text-green-600">
                          ₹{product.price}/{product.unit}
                        </span>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          order.status === 'delivered'
                            ? 'bg-green-600'
                            : order.status === 'cancelled'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} x {item.quantity}
                          </span>
                          <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="text-sm text-gray-500">Total: </span>
                        <span className="font-bold text-green-600">₹{order.total?.toFixed(2)}</span>
                      </div>
                      {order.status === 'delivered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFeedbackOrder(order);
                            setShowFeedback(true);
                          }}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Give Feedback
                        </Button>
                      )}
                    </div>
                    {order.deliveryTimeMinutes && (
                      <p className="text-sm text-gray-500 mt-2">
                        Estimated delivery: {order.deliveryTimeMinutes} minutes
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={user.name} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user.email} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input value="Customer" readOnly />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Contact Us</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+91 1234567890</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>support@farmaa.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>123 Farm Street, Agriculture City, India</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-500 mb-2">FSSAI License: 12345678901234</p>
                </div>
                <div className="sm:hidden">
                  <Button variant="destructive" className="w-full" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <div>
              <ImageWithFallback
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedProduct.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    ₹{selectedProduct.price}
                  </span>
                  <span className="text-gray-500">/{selectedProduct.unit}</span>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Delivery Address</Label>
              <Textarea
                value={deliveryAddress.address}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, address: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-600">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={placeOrder}>
              Place Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= feedbackForm.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comments</Label>
              <Textarea
                value={feedbackForm.comment}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, comment: e.target.value })
                }
                rows={4}
                placeholder="Tell us about your experience..."
              />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={submitFeedback}>
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}