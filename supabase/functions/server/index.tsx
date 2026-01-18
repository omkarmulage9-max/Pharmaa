import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client helper
function getSupabaseClient(useServiceRole = false) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const key = useServiceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    : Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, key);
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to calculate delivery time (simulated)
function calculateDeliveryTime(customerLat: number, customerLng: number): number {
  // Darkstore location (example coordinates)
  const darkstoreLat = 28.6139;
  const darkstoreLng = 77.2090;
  
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (customerLat - darkstoreLat) * Math.PI / 180;
  const dLng = (customerLng - darkstoreLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(darkstoreLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Assume average speed of 30 km/h + 15 min buffer
  const timeInMinutes = Math.ceil((distance / 30) * 60) + 15;
  return timeInMinutes;
}

// Health check endpoint
app.get("/make-server-ee76f8f9/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup
app.post("/make-server-ee76f8f9/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const supabase = getSupabaseClient(true);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'consumer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store additional user data in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: role || 'consumer',
      createdAt: new Date().toISOString()
    });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-ee76f8f9/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Profile fetch error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-ee76f8f9/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);
    const updatedProfile = { ...currentProfile, ...updates };
    
    await kv.set(`user:${user.id}`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Product Routes
// List all products
app.get("/make-server-ee76f8f9/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.log('Products fetch error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Add product (manager only)
app.post("/make-server-ee76f8f9/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager') {
      return c.json({ error: 'Forbidden - Manager access required' }, 403);
    }
    
    const productData = await c.req.json();
    const productId = `product:${Date.now()}`;
    const product = {
      id: productId,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(productId, product);
    return c.json({ product });
  } catch (error) {
    console.log('Product creation error:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product (manager only)
app.put("/make-server-ee76f8f9/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager') {
      return c.json({ error: 'Forbidden - Manager access required' }, 403);
    }
    
    const productId = c.req.param('id');
    const updates = await c.req.json();
    const product = await kv.get(productId);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const updatedProduct = { ...product, ...updates };
    await kv.set(productId, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error) {
    console.log('Product update error:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product (manager only)
app.delete("/make-server-ee76f8f9/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager') {
      return c.json({ error: 'Forbidden - Manager access required' }, 403);
    }
    
    const productId = c.req.param('id');
    await kv.del(productId);
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Product deletion error:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Order Routes
// Create order
app.post("/make-server-ee76f8f9/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const orderData = await c.req.json();
    const orderId = `order:${Date.now()}`;
    const otp = generateOTP();
    
    // Calculate delivery time
    const deliveryTime = calculateDeliveryTime(
      orderData.deliveryLocation.lat,
      orderData.deliveryLocation.lng
    );
    
    const order = {
      id: orderId,
      userId: user.id,
      ...orderData,
      status: 'pending',
      otp,
      deliveryTimeMinutes: deliveryTime,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(orderId, order);
    return c.json({ order, otp }); // In production, OTP would be sent via SMS
  } catch (error) {
    console.log('Order creation error:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Get user orders
app.get("/make-server-ee76f8f9/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allOrders = await kv.getByPrefix('order:');
    const userOrders = allOrders.filter((order: any) => order.userId === user.id);
    
    return c.json({ orders: userOrders });
  } catch (error) {
    console.log('Orders fetch error:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get all orders (manager/delivery partner)
app.get("/make-server-ee76f8f9/orders/all", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager' && userProfile.role !== 'delivery_partner') {
      return c.json({ error: 'Forbidden - Manager or Delivery Partner access required' }, 403);
    }
    
    const orders = await kv.getByPrefix('order:');
    return c.json({ orders });
  } catch (error) {
    console.log('Orders fetch error:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Update order status
app.put("/make-server-ee76f8f9/orders/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const orderId = c.req.param('id');
    const updates = await c.req.json();
    const order = await kv.get(orderId);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const updatedOrder = { ...order, ...updates };
    await kv.set(orderId, updatedOrder);
    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log('Order update error:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// Verify OTP and complete delivery
app.post("/make-server-ee76f8f9/orders/:id/verify-otp", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const orderId = c.req.param('id');
    const { otp } = await c.req.json();
    const order = await kv.get(orderId);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    if (order.otp !== otp) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }
    
    const updatedOrder = {
      ...order,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    };
    
    await kv.set(orderId, updatedOrder);
    return c.json({ order: updatedOrder, message: 'Order delivered successfully' });
  } catch (error) {
    console.log('OTP verification error:', error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
});

// Submit feedback
app.post("/make-server-ee76f8f9/feedback", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const feedbackData = await c.req.json();
    const feedbackId = `feedback:${Date.now()}`;
    const feedback = {
      id: feedbackId,
      userId: user.id,
      ...feedbackData,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(feedbackId, feedback);
    return c.json({ feedback });
  } catch (error) {
    console.log('Feedback submission error:', error);
    return c.json({ error: 'Failed to submit feedback' }, 500);
  }
});

// Submit bug report
app.post("/make-server-ee76f8f9/bugs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const bugData = await c.req.json();
    const bugId = `bug:${Date.now()}`;
    const bug = {
      id: bugId,
      userId: user.id,
      ...bugData,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(bugId, bug);
    return c.json({ bug });
  } catch (error) {
    console.log('Bug report submission error:', error);
    return c.json({ error: 'Failed to submit bug report' }, 500);
  }
});

// Get all bugs (manager only)
app.get("/make-server-ee76f8f9/bugs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager') {
      return c.json({ error: 'Forbidden - Manager access required' }, 403);
    }
    
    const bugs = await kv.getByPrefix('bug:');
    return c.json({ bugs });
  } catch (error) {
    console.log('Bugs fetch error:', error);
    return c.json({ error: 'Failed to fetch bugs' }, 500);
  }
});

// Get analytics (manager only)
app.get("/make-server-ee76f8f9/analytics", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'manager') {
      return c.json({ error: 'Forbidden - Manager access required' }, 403);
    }
    
    const orders = await kv.getByPrefix('order:');
    const users = await kv.getByPrefix('user:');
    
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
      deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
      cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      onTheWayOrders: orders.filter((o: any) => o.status === 'on_the_way').length,
      totalCustomers: users.filter((u: any) => u.role === 'consumer').length,
    };
    
    return c.json({ analytics });
  } catch (error) {
    console.log('Analytics fetch error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

Deno.serve(app.fetch);