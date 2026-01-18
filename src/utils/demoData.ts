// Comprehensive demo data for FarMaa platform

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'on_the_way' | 'delivered';
  deliveryTimeMinutes: number;
  createdAt: string;
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  otp?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  totalDeliveries: number;
  rating: number;
  status: 'available' | 'busy' | 'offline';
}

export interface BugReport {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  topProducts: Array<{ product: Product; sales: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  ordersByStatus: {
    pending: number;
    on_the_way: number;
    delivered: number;
  };
}

// Demo Products
export const demoProducts: Product[] = [
  // Vegetables
  {
    id: 'product:1',
    name: 'Fresh Tomatoes',
    price: 30,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0fdd?w=400',
    description: 'Farm fresh tomatoes, perfect for salads and cooking. Rich in vitamins and antioxidants.',
    stock: 150,
  },
  {
    id: 'product:2',
    name: 'Fresh Carrots',
    price: 25,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    description: 'Crunchy and sweet carrots, great for salads and juices.',
    stock: 120,
  },
  {
    id: 'product:3',
    name: 'Green Spinach',
    price: 15,
    unit: 'Bundle',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    description: 'Fresh green spinach leaves, packed with iron and nutrients.',
    stock: 80,
  },
  {
    id: 'product:4',
    name: 'Organic Potatoes',
    price: 17,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    description: 'Organic potatoes, perfect for all types of cooking.',
    stock: 200,
  },
  {
    id: 'product:5',
    name: 'Fresh Onions',
    price: 30,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
    description: 'High-quality onions, essential for every kitchen.',
    stock: 180,
  },
  {
    id: 'product:6',
    name: 'Bell Peppers',
    price: 80,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
    description: 'Colorful bell peppers, sweet and crunchy.',
    stock: 90,
  },
  {
    id: 'product:7',
    name: 'Fresh Cauliflower',
    price: 40,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1568584711271-82f0ca190a69?w=400',
    description: 'White cauliflower, fresh from local farms.',
    stock: 70,
  },
  {
    id: 'product:8',
    name: 'Green Broccoli',
    price: 60,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
    description: 'Fresh broccoli, rich in vitamins and minerals.',
    stock: 60,
  },

  // Fruits
  {
    id: 'product:9',
    name: 'Organic Apples',
    price: 120,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
    description: 'Crisp and sweet organic apples, perfect for snacking.',
    stock: 100,
  },
  {
    id: 'product:10',
    name: 'Fresh Bananas',
    price: 50,
    unit: 'dozen',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    description: 'Ripe and delicious bananas, rich in potassium.',
    stock: 150,
  },
  {
    id: 'product:11',
    name: 'Sweet Mangoes',
    price: 150,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
    description: 'Sweet and juicy mangoes, the king of fruits.',
    stock: 80,
  },
  {
    id: 'product:12',
    name: 'Fresh Oranges',
    price: 80,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400',
    description: 'Juicy oranges, packed with vitamin C.',
    stock: 120,
  },
  {
    id: 'product:13',
    name: 'Fresh Grapes',
    price: 100,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1599819177551-1f67a9b58e2f?w=400',
    description: 'Sweet seedless grapes, perfect for snacking.',
    stock: 90,
  },
  {
    id: 'product:14',
    name: 'Watermelons',
    price: 30,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l67?w=400',
    description: 'Juicy watermelons, perfect for summer.',
    stock: 50,
  },
  {
    id: 'product:15',
    name: 'Fresh Strawberries',
    price: 180,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    description: 'Sweet and fresh strawberries.',
    stock: 40,
  },

  // Dairy
  {
    id: 'product:16',
    name: 'Farm Fresh Milk',
    price: 60,
    unit: 'liter',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    description: 'Pure farm fresh milk, delivered daily.',
    stock: 100,
  },
  {
    id: 'product:17',
    name: 'Fresh Paneer',
    price: 300,
    unit: 'kg',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    description: 'Soft and fresh paneer, made from pure milk.',
    stock: 50,
  },
  {
    id: 'product:18',
    name: 'Homemade Butter',
    price: 400,
    unit: 'kg',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
    description: 'Pure homemade butter, made from fresh cream.',
    stock: 30,
  },
  {
    id: 'product:19',
    name: 'Fresh Curd',
    price: 50,
    unit: 'kg',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
    description: 'Fresh and creamy curd, perfect for daily use.',
    stock: 80,
  },

  // Grains & Pulses
  {
    id: 'product:20',
    name: 'Organic Rice',
    price: 80,
    unit: 'kg',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    description: 'Premium quality organic rice.',
    stock: 200,
  },
  {
    id: 'product:21',
    name: 'Wheat Flour',
    price: 40,
    unit: 'kg',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    description: 'Freshly ground wheat flour.',
    stock: 150,
  },
  {
    id: 'product:22',
    name: 'Red Lentils',
    price: 90,
    unit: 'kg',
    category: 'Pulses',
    image: 'https://images.unsplash.com/photo-1589119908995-c6c6f4f3d0d7?w=400',
    description: 'Premium quality red lentils.',
    stock: 100,
  },
  {
    id: 'product:23',
    name: 'Chickpeas',
    price: 100,
    unit: 'kg',
    category: 'Pulses',
    image: 'https://images.unsplash.com/photo-1610097342567-bdf7b2f8d6ed?w=400',
    description: 'High-quality chickpeas, rich in protein.',
    stock: 120,
  },
  {
    id: 'product:24',
    name: 'Green Moong Dal',
    price: 110,
    unit: 'kg',
    category: 'Pulses',
    image: 'https://images.unsplash.com/photo-1599459183200-59c7687a0275?w=400',
    description: 'Fresh green moong dal.',
    stock: 90,
  },

  // Herbs & Spices
  {
    id: 'product:25',
    name: 'Fresh Coriander',
    price: 20,
    unit: 'bunch',
    category: 'Herbs',
    image: 'https://images.unsplash.com/photo-1599718744028-68898d34c829?w=400',
    description: 'Fresh coriander leaves.',
    stock: 60,
  },
  {
    id: 'product:26',
    name: 'Fresh Mint',
    price: 15,
    unit: 'bunch',
    category: 'Herbs',
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400',
    description: 'Fresh mint leaves, aromatic and flavorful.',
    stock: 50,
  },
  {
    id: 'product:27',
    name: 'Organic Turmeric',
    price: 300,
    unit: 'kg',
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400',
    description: 'Pure organic turmeric powder.',
    stock: 40,
  },

  // Eggs & Poultry
  {
    id: 'product:28',
    name: 'Farm Fresh Eggs',
    price: 80,
    unit: 'dozen',
    category: 'Eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc1f3e9b53?w=400',
    description: 'Free-range farm fresh eggs.',
    stock: 100,
  },
  {
    id: 'product:29',
    name: 'Organic Honey',
    price: 400,
    unit: 'kg',
    category: 'Others',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l67?w=400',
    description: 'Pure organic honey from local farms.',
    stock: 30,
  },
  {
    id: 'product:30',
    name: 'Fresh Mushrooms',
    price: 150,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1565009110956-3e25f648f78b?w=400',
    description: 'Fresh button mushrooms.',
    stock: 45,
  },
];

// Demo Orders
export const demoOrders: Order[] = [
  {
    id: 'order:1',
    userId: 'user:1',
    userName: 'Rahul Sharma',
    items: [
      { product: demoProducts[0], quantity: 2 },
      { product: demoProducts[1], quantity: 1 },
      { product: demoProducts[8], quantity: 3 },
    ],
    total: 520,
    status: 'delivered',
    deliveryTimeMinutes: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.6139,
      lng: 77.2090,
      address: '123 Green Valley, Sector 15, Delhi, 110001',
    },
    otp: '1234',
    deliveryPartnerId: 'delivery:1',
    deliveryPartnerName: 'Amit Kumar',
  },
  {
    id: 'order:2',
    userId: 'user:2',
    userName: 'Priya Patel',
    items: [
      { product: demoProducts[15], quantity: 2 },
      { product: demoProducts[16], quantity: 5 },
      { product: demoProducts[18], quantity: 1 },
    ],
    total: 620,
    status: 'on_the_way',
    deliveryTimeMinutes: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.6304,
      lng: 77.2177,
      address: '456 Sunrise Apartments, Connaught Place, Delhi, 110021',
    },
    otp: '5678',
    deliveryPartnerId: 'delivery:2',
    deliveryPartnerName: 'Vijay Singh',
  },
  {
    id: 'order:3',
    userId: 'user:3',
    userName: 'Anjali Verma',
    items: [
      { product: demoProducts[3], quantity: 5 },
      { product: demoProducts[4], quantity: 2 },
      { product: demoProducts[20], quantity: 10 },
    ],
    total: 1085,
    status: 'pending',
    deliveryTimeMinutes: 35,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.5355,
      lng: 77.3910,
      address: '789 Palm Gardens, Noida Sector 62, Noida, 201301',
    },
    otp: '9012',
  },
  {
    id: 'order:4',
    userId: 'user:4',
    userName: 'Suresh Reddy',
    items: [
      { product: demoProducts[9], quantity: 2 },
      { product: demoProducts[11], quantity: 3 },
      { product: demoProducts[14], quantity: 1 },
    ],
    total: 730,
    status: 'delivered',
    deliveryTimeMinutes: 40,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.4595,
      lng: 77.0266,
      address: '321 Silver Oak, Gurgaon Sector 29, Gurgaon, 122001',
    },
    otp: '3456',
    deliveryPartnerId: 'delivery:1',
    deliveryPartnerName: 'Amit Kumar',
  },
  {
    id: 'order:5',
    userId: 'user:5',
    userName: 'Neha Gupta',
    items: [
      { product: demoProducts[21], quantity: 5 },
      { product: demoProducts[22], quantity: 2 },
      { product: demoProducts[23], quantity: 2 },
    ],
    total: 580,
    status: 'delivered',
    deliveryTimeMinutes: 50,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.7041,
      lng: 77.1025,
      address: '654 Rose Villa, Model Town, Delhi, 110009',
    },
    otp: '7890',
    deliveryPartnerId: 'delivery:3',
    deliveryPartnerName: 'Ravi Yadav',
  },
  {
    id: 'order:6',
    userId: 'user:1',
    userName: 'Rahul Sharma',
    items: [
      { product: demoProducts[27], quantity: 12 },
      { product: demoProducts[0], quantity: 3 },
    ],
    total: 1080,
    status: 'on_the_way',
    deliveryTimeMinutes: 25,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.6139,
      lng: 77.2090,
      address: '123 Green Valley, Sector 15, Delhi, 110001',
    },
    otp: '2468',
    deliveryPartnerId: 'delivery:2',
    deliveryPartnerName: 'Vijay Singh',
  },
  {
    id: 'order:7',
    userId: 'user:6',
    userName: 'Karthik Iyer',
    items: [
      { product: demoProducts[5], quantity: 2 },
      { product: demoProducts[6], quantity: 2 },
      { product: demoProducts[7], quantity: 1 },
    ],
    total: 340,
    status: 'pending',
    deliveryTimeMinutes: 40,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.4089,
      lng: 77.3178,
      address: '987 Lotus Heights, Greater Noida, 201310',
    },
    otp: '1357',
  },
  {
    id: 'order:8',
    userId: 'user:2',
    userName: 'Priya Patel',
    items: [
      { product: demoProducts[12], quantity: 3 },
      { product: demoProducts[13], quantity: 2 },
    ],
    total: 440,
    status: 'delivered',
    deliveryTimeMinutes: 35,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: {
      lat: 28.6304,
      lng: 77.2177,
      address: '456 Sunrise Apartments, Connaught Place, Delhi, 110021',
    },
    otp: '9753',
    deliveryPartnerId: 'delivery:1',
    deliveryPartnerName: 'Amit Kumar',
  },
];

// Demo Customers
export const demoCustomers: Customer[] = [
  {
    id: 'user:1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    address: '123 Green Valley, Sector 15, Delhi, 110001',
    totalOrders: 12,
    totalSpent: 8450,
    joinedDate: '2024-06-15',
  },
  {
    id: 'user:2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43211',
    address: '456 Sunrise Apartments, Connaught Place, Delhi, 110021',
    totalOrders: 8,
    totalSpent: 5320,
    joinedDate: '2024-07-20',
  },
  {
    id: 'user:3',
    name: 'Anjali Verma',
    email: 'anjali.verma@example.com',
    phone: '+91 98765 43212',
    address: '789 Palm Gardens, Noida Sector 62, Noida, 201301',
    totalOrders: 15,
    totalSpent: 12890,
    joinedDate: '2024-05-10',
  },
  {
    id: 'user:4',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@example.com',
    phone: '+91 98765 43213',
    address: '321 Silver Oak, Gurgaon Sector 29, Gurgaon, 122001',
    totalOrders: 10,
    totalSpent: 7650,
    joinedDate: '2024-08-05',
  },
  {
    id: 'user:5',
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91 98765 43214',
    address: '654 Rose Villa, Model Town, Delhi, 110009',
    totalOrders: 6,
    totalSpent: 4230,
    joinedDate: '2024-09-12',
  },
  {
    id: 'user:6',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@example.com',
    phone: '+91 98765 43215',
    address: '987 Lotus Heights, Greater Noida, 201310',
    totalOrders: 4,
    totalSpent: 2890,
    joinedDate: '2024-10-18',
  },
];

// Demo Delivery Partners
export const demoDeliveryPartners: DeliveryPartner[] = [
  {
    id: 'delivery:1',
    name: 'Amit Kumar',
    email: 'amit.kumar@farmaa.com',
    phone: '+91 98765 11111',
    vehicleType: 'Bike',
    totalDeliveries: 248,
    rating: 4.8,
    status: 'available',
  },
  {
    id: 'delivery:2',
    name: 'Vijay Singh',
    email: 'vijay.singh@farmaa.com',
    phone: '+91 98765 22222',
    vehicleType: 'Bike',
    totalDeliveries: 187,
    rating: 4.6,
    status: 'busy',
  },
  {
    id: 'delivery:3',
    name: 'Ravi Yadav',
    email: 'ravi.yadav@farmaa.com',
    phone: '+91 98765 33333',
    vehicleType: 'Van',
    totalDeliveries: 312,
    rating: 4.9,
    status: 'available',
  },
  {
    id: 'delivery:4',
    name: 'Mahesh Desai',
    email: 'mahesh.desai@farmaa.com',
    phone: '+91 98765 44444',
    vehicleType: 'Bike',
    totalDeliveries: 156,
    rating: 4.5,
    status: 'offline',
  },
];

// Demo Bug Reports
export const demoBugReports: BugReport[] = [
  {
    id: 'bug:1',
    userId: 'user:1',
    userName: 'Rahul Sharma',
    title: 'Cart not updating after adding items',
    description: 'When I add multiple items quickly to the cart, sometimes the count doesn\'t update properly.',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bug:2',
    userId: 'user:3',
    userName: 'Anjali Verma',
    title: 'Payment confirmation email not received',
    description: 'I placed an order yesterday but haven\'t received the confirmation email yet.',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bug:3',
    userId: 'user:5',
    userName: 'Neha Gupta',
    title: 'Product images loading slowly',
    description: 'Product images take a long time to load on the homepage.',
    priority: 'low',
    status: 'resolved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bug:4',
    userId: 'user:2',
    userName: 'Priya Patel',
    title: 'Unable to edit delivery address',
    description: 'The edit address button is not working in the profile section.',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bug:5',
    userId: 'user:4',
    userName: 'Suresh Reddy',
    title: 'Dark mode toggle not persistent',
    description: 'After refreshing the page, dark mode preference is lost.',
    priority: 'low',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo Feedback
export const demoFeedback: Feedback[] = [
  {
    id: 'feedback:1',
    orderId: 'order:1',
    userId: 'user:1',
    userName: 'Rahul Sharma',
    rating: 5,
    comment: 'Excellent quality products! Fresh vegetables delivered right on time. Very satisfied with the service.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback:2',
    orderId: 'order:4',
    userId: 'user:4',
    userName: 'Suresh Reddy',
    rating: 4,
    comment: 'Good experience overall. The mangoes were very sweet. Delivery was a bit delayed but the quality made up for it.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback:3',
    orderId: 'order:5',
    userId: 'user:5',
    userName: 'Neha Gupta',
    rating: 5,
    comment: 'Love the freshness! All grains and pulses were of premium quality. Will order again.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback:4',
    orderId: 'order:8',
    userId: 'user:2',
    userName: 'Priya Patel',
    rating: 4,
    comment: 'Fresh fruits as promised. The grapes were particularly good. Packaging could be better.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo Analytics
export const demoAnalytics: Analytics = {
  totalRevenue: 45680,
  totalOrders: 67,
  totalCustomers: 42,
  averageOrderValue: 682,
  customerRetentionRate: 68.5,
  topProducts: [
    { product: demoProducts[0], sales: 245 }, // Tomatoes
    { product: demoProducts[8], sales: 198 }, // Apples
    { product: demoProducts[15], sales: 176 }, // Milk
    { product: demoProducts[19], sales: 154 }, // Rice
    { product: demoProducts[27], sales: 142 }, // Eggs
  ],
  revenueByMonth: [
    { month: 'Jun', revenue: 4200 },
    { month: 'Jul', revenue: 5800 },
    { month: 'Aug', revenue: 7200 },
    { month: 'Sep', revenue: 8900 },
    { month: 'Oct', revenue: 9580 },
    { month: 'Nov', revenue: 10000 },
  ],
  ordersByStatus: {
    pending: 8,
    on_the_way: 12,
    delivered: 47,
  },
};

// Helper function to check if user is in demo mode
export const isDemoMode = (userId: string): boolean => {
  return userId.startsWith('demo-');
};

// Get orders for specific user in demo mode
export const getDemoOrdersForUser = (userId: string): Order[] => {
  if (userId.startsWith('demo-consumer')) {
    // Return orders for demo consumer
    return demoOrders.filter(order => ['order:1', 'order:6'].includes(order.id));
  }
  // For manager and delivery partner, return all orders
  return demoOrders;
};

// Get feedback for specific order
export const getDemoFeedbackForOrder = (orderId: string): Feedback | undefined => {
  return demoFeedback.find(f => f.orderId === orderId);
};

// LocalStorage keys for shared state
const PRODUCTS_STORAGE_KEY = 'farmaa_products';
const ORDERS_STORAGE_KEY = 'farmaa_orders';

// Product Management - Shared across all roles
export const getProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
  }
  // Return default demo products if nothing in storage
  return [...demoProducts];
};

export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

export const updateProduct = (productId: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
  }
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);
};

export const resetProducts = (): void => {
  saveProducts([...demoProducts]);
};

// Order Management - Shared across all roles
export const getOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
  }
  // Return default demo orders if nothing in storage
  return [...demoOrders];
};

export const saveOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
  }
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order); // Add to beginning
  saveOrders(orders);
};

export const updateOrder = (orderId: string, updates: Partial<Order>): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
  }
};

export const resetOrders = (): void => {
  saveOrders([...demoOrders]);
};