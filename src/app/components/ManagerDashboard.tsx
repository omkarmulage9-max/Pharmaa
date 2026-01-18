import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { User, apiService } from '@/utils/auth';
import { 
  demoProducts, 
  demoOrders, 
  demoBugReports, 
  demoAnalytics, 
  demoCustomers,
  isDemoMode,
  getProducts,
  saveProducts,
  updateProduct as updateProductInStorage,
  addProduct as addProductToStorage,
  deleteProduct as deleteProductFromStorage
} from '@/utils/demoData';
import {
  BarChart3,
  Package,
  Users,
  TrendingUp,
  LogOut,
  Plus,
  Edit,
  Trash2,
  FileText,
  ShoppingBag,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface ManagerDashboardProps {
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

export function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
  const { theme, setTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category: '',
    image: '',
    description: '',
    stock: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Use shared demo data in demo mode
    if (isDemoMode(user.id)) {
      setProducts(getProducts());
      setOrders(demoOrders);
      setBugs(demoBugReports);
      setAnalytics(demoAnalytics);
      return;
    }
    
    try {
      const [productsData, ordersData, bugsData, analyticsData] = await Promise.all([
        apiService.request('/products'),
        apiService.request('/orders/all'),
        apiService.request('/bugs'),
        apiService.request('/analytics'),
      ]);

      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
      setBugs(bugsData.bugs || []);
      setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAddProduct = async () => {
    // In demo mode, simulate adding/editing product and save to localStorage
    if (isDemoMode(user.id)) {
      const productData = {
        id: editingProduct?.id || `product:demo-${Date.now()}`,
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      if (editingProduct) {
        // Update existing product in localStorage
        updateProductInStorage(editingProduct.id, {
          name: productData.name,
          price: productData.price,
          unit: productData.unit,
          category: productData.category,
          image: productData.image,
          description: productData.description,
          stock: productData.stock,
        });
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id ? productData : p
        );
        setProducts(updatedProducts);
        toast.success('Product updated! Changes visible to all users.');
      } else {
        // Add new product to localStorage
        addProductToStorage(productData);
        setProducts([...products, productData]);
        toast.success('Product added! Visible to all users.');
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        unit: 'kg',
        category: '',
        image: '',
        description: '',
        stock: '',
      });
      return;
    }
    
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      if (editingProduct) {
        await apiService.request(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        toast.success('Product updated successfully');
      } else {
        await apiService.request('/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        toast.success('Product added successfully');
      }

      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        unit: 'kg',
        category: '',
        image: '',
        description: '',
        stock: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    // In demo mode, simulate deletion
    if (isDemoMode(user.id)) {
      deleteProductFromStorage(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully (Demo Mode)');
      return;
    }

    try {
      await apiService.request(`/products/${productId}`, {
        method: 'DELETE',
      });
      toast.success('Product deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      category: product.category,
      image: product.image,
      description: product.description,
      stock: product.stock.toString(),
    });
    setShowProductDialog(true);
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    // In demo mode, simulate cancellation
    if (isDemoMode(user.id)) {
      const updatedOrders = orders.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' as const } : o
      );
      setOrders(updatedOrders);
      toast.success('Order cancelled (Demo Mode)');
      return;
    }
    
    try {
      await apiService.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: reason,
        }),
      });
      toast.success('Order cancelled successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
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
            <div>
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">
                FarMaa Manager Dashboard
              </h1>
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
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
        <Tabs defaultValue="analytics">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="bugs">
              <FileText className="h-4 w-4 mr-2" />
              Bug Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                      ₹{analytics.totalRevenue?.toFixed(2) || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalOrders || 0}</div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalCustomers || 0}</div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                      {analytics.deliveredOrders || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Orders</CardTitle>
                  <CardDescription>{analytics?.pendingOrders || 0} orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">
                    {analytics?.pendingOrders || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>On The Way</CardTitle>
                  <CardDescription>{analytics?.onTheWayOrders || 0} orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600">
                    {analytics?.onTheWayOrders || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancelled</CardTitle>
                  <CardDescription>{analytics?.cancelledOrders || 0} orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600">
                    {analytics?.cancelledOrders || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    price: '',
                    unit: 'kg',
                    category: '',
                    image: '',
                    description: '',
                    stock: '',
                  });
                  setShowProductDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-semibold">₹{product.price}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Stock:</span>
                        <span className="font-semibold">{product.stock} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <Badge>{product.category}</Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="on_the_way">
                  On The Way ({onTheWayOrders.length})
                </TabsTrigger>
                <TabsTrigger value="delivered">
                  Delivered ({deliveredOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-600">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total:</span>
                          <span className="font-bold">₹{order.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Items:</span>
                          <span>{order.items?.length || 0}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Cancellation reason:');
                              if (reason) handleCancelOrder(order.id, reason);
                            }}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No pending orders
                  </div>
                )}
              </TabsContent>

              <TabsContent value="on_the_way" className="space-y-4">
                {onTheWayOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-orange-600">On The Way</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total:</span>
                        <span className="font-bold">₹{order.total?.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {onTheWayOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No orders on the way
                  </div>
                )}
              </TabsContent>

              <TabsContent value="delivered" className="space-y-4">
                {deliveredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-600">Delivered</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total:</span>
                        <span className="font-bold">₹{order.total?.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {deliveredOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No delivered orders
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="bugs">
            <h2 className="text-2xl font-bold mb-6">Bug Reports</h2>
            <div className="space-y-4">
              {bugs.map((bug) => (
                <Card key={bug.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>Bug Report #{bug.id.slice(-8)}</CardTitle>
                      <Badge>{bug.status}</Badge>
                    </div>
                    <CardDescription>
                      Reported on {new Date(bug.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bug.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {bugs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No bug reports
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  placeholder="e.g., Vegetables"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="40"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={productForm.unit}
                  onChange={(e) =>
                    setProductForm({ ...productForm, unit: e.target.value })
                  }
                  placeholder="kg"
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={productForm.image}
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleAddProduct}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowProductDialog(false);
                  setEditingProduct(null);
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