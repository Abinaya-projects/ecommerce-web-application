import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface ReviewDoc {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface ProductDoc {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured?: boolean;
  createdAt: string;
  reviews?: ReviewDoc[];
}

export interface CartItemDoc {
  productId: string;
  quantity: number;
}

export interface CartDoc {
  _id: string;
  userId: string;
  items: CartItemDoc[];
  updatedAt: string;
}

export interface OrderItemDoc {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderDoc {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItemDoc[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'Cash on Delivery' | 'Demo Online Payment';
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  promoCode?: string;
  discountAmount?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistDoc {
  _id: string;
  userId: string;
  productIds: string[];
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  products: ProductDoc[];
  carts: CartDoc[];
  orders: OrderDoc[];
  wishlists: WishlistDoc[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Memory cache
let dbCache: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      if (dbCache && Array.isArray(dbCache.users) && Array.isArray(dbCache.products)) {
        if (!Array.isArray(dbCache.wishlists)) {
          dbCache.wishlists = [];
        }
        // Sync enhanced images & default reviews for seeded products
        const imageUpdates: Record<string, string> = {
          prod_005: '/src/assets/images/brass_task_lamp_1790146777247.jpg',
          prod_006: '/src/assets/images/incense_burner_1790146792103.jpg',
          prod_009: '/src/assets/images/leather_folio_1790146829207.jpg',
          prod_011: '/src/assets/images/dutch_oven_1790146844504.jpg',
        };
        let updated = false;

        const defaultReviewsSample: Record<string, ReviewDoc[]> = {
          prod_001: [
            {
              _id: 'rev_001_1',
              userId: 'user_customer_01',
              userName: 'Julian Hayes',
              rating: 5,
              title: 'Acoustic transparency & serene isolation',
              comment: 'The custom beryllium drivers deliver stunning instrument separation without fatiguing upper-mids. Headband ergonomics distribute weight evenly for multi-hour architectural drafting sessions.',
              createdAt: '2026-02-14T15:30:00Z',
            },
            {
              _id: 'rev_001_2',
              userId: 'user_rev_002',
              userName: 'Elena Vance',
              rating: 5,
              title: 'Superb craftsmanship and tactile buttons',
              comment: 'No plasticky creaks or loose tolerances. Tactile knurled controls respond instantly and the noise cancellation is whisper-quiet.',
              createdAt: '2026-02-28T11:20:00Z',
            },
            {
              _id: 'rev_001_3',
              userId: 'user_rev_003',
              userName: 'Marcus Thorne',
              rating: 4,
              title: 'Premium soundstage, solid battery life',
              comment: 'Battery genuinely hits ~38 hours on a single charge. Included braided audio cable is supple and tangle-free.',
              createdAt: '2026-03-05T09:45:00Z',
            },
          ],
          prod_002: [
            {
              _id: 'rev_002_1',
              userId: 'user_customer_01',
              userName: 'Julian Hayes',
              rating: 5,
              title: 'Thermal stability and tactile Mino stoneware',
              comment: 'The spiral internal ridges create an even flow rate that brings out floral notes in light-roast washed Ethiopians. The matte exterior glaze is a joy to touch every morning.',
              createdAt: '2026-02-18T08:15:00Z',
            },
            {
              _id: 'rev_002_2',
              userId: 'user_rev_004',
              userName: 'Kenji Takahashi',
              rating: 5,
              title: 'Flawless morning ritual artifact',
              comment: 'Paired with 600ml borosilicate carafe, pouring feels calibrated and deliberate. Looks gorgeous on open kitchen shelving.',
              createdAt: '2026-03-01T14:10:00Z',
            },
          ],
          prod_003: [
            {
              _id: 'rev_003_1',
              userId: 'user_customer_01',
              userName: 'Julian Hayes',
              rating: 5,
              title: 'Featherweight Grade-5 titanium case',
              comment: 'The matte brushed titanium finish doesn’t attract smudges. Chronograph pushers have a crisp mechanical click with zero wobble.',
              createdAt: '2026-02-22T16:00:00Z',
            },
            {
              _id: 'rev_003_2',
              userId: 'user_rev_005',
              userName: 'David Mercer',
              rating: 5,
              title: 'Exhibition sapphire back is breathtaking',
              comment: 'Seeing the column-wheel engage through the sapphire caseback reminds you of genuine mechanical horology. Kept +2s/day accuracy across two weeks.',
              createdAt: '2026-03-08T19:25:00Z',
            },
          ],
        };

        for (const p of dbCache.products) {
          if (imageUpdates[p._id] && p.image !== imageUpdates[p._id]) {
            p.image = imageUpdates[p._id];
            updated = true;
          }
          if (!Array.isArray(p.reviews) || p.reviews.length === 0) {
            if (defaultReviewsSample[p._id]) {
              p.reviews = [...defaultReviewsSample[p._id]];
            } else {
              p.reviews = [
                {
                  _id: `rev_${p._id}_1`,
                  userId: 'user_cust_arch',
                  userName: 'Soren Lindqvist',
                  rating: 5,
                  title: 'Exceptional material pedigree',
                  comment: `The finish on this ${p.name.toLowerCase()} exceeds expectations. Pure tactile quality and enduring aesthetics.`,
                  createdAt: '2026-02-25T10:00:00Z',
                },
                {
                  _id: `rev_${p._id}_2`,
                  userId: 'user_cust_arch2',
                  userName: 'Camille Dubois',
                  rating: 5,
                  title: 'Quiet luxury done right',
                  comment: 'Shipped in pristine condition with bespoke packaging. Fits seamlessly into our minimalist architectural studio.',
                  createdAt: '2026-03-02T13:40:00Z',
                },
              ];
            }
            const avg = p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length;
            p.rating = Number(avg.toFixed(1));
            p.numReviews = p.reviews.length;
            updated = true;
          }
        }
        if (updated) {
          fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
        }
        return dbCache;
      }
    } catch (err) {
      console.error('Error reading db.json, re-initializing...', err);
    }
  }

  const initialData: DatabaseSchema = {
    users: [],
    products: [],
    carts: [],
    orders: [],
    wishlists: [],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  dbCache = initialData;
  return dbCache;
}

function persistDb(): void {
  if (!dbCache) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function seedInitialData(force = false): Promise<void> {
  const db = ensureDbFile();

  if (!force && db.users.length > 0 && db.products.length >= 10) {
    return;
  }

  // Admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const adminUser: UserDoc = {
    _id: 'user_admin_01',
    name: 'Eleanor Vance (Admin)',
    email: 'admin@ecommerce.com',
    password: adminPasswordHash,
    role: 'ADMIN',
    createdAt: new Date('2026-01-01T10:00:00Z').toISOString(),
  };

  const demoUser: UserDoc = {
    _id: 'user_customer_01',
    name: 'Julian Hayes',
    email: 'user@ecommerce.com',
    password: userPasswordHash,
    role: 'USER',
    createdAt: new Date('2026-01-15T14:30:00Z').toISOString(),
  };

  db.users = [adminUser, demoUser];

  const sampleProducts: ProductDoc[] = [
    {
      _id: 'prod_001',
      name: 'Aura Studio Wireless Over-Ear Headphones',
      description: 'Custom 40mm beryllium acoustic drivers with adaptive hybrid active noise cancellation, aerospace-grade memory foam cushions, and 38-hour battery longevity.',
      price: 289,
      category: 'Audio & Acoustics',
      image: '/src/assets/images/product_audio_headphones_1790145772052.jpg',
      stock: 18,
      rating: 4.9,
      numReviews: 124,
      featured: true,
      createdAt: new Date('2026-02-01T09:00:00Z').toISOString(),
    },
    {
      _id: 'prod_002',
      name: 'Minimalist Ceramic Pour-Over Dripper Set',
      description: 'Handcrafted stoneware dripper with precision spiral internal ridges, paired with a heat-resistant 600ml borosilicate glass carafe for optimal thermal brewing stability.',
      price: 64,
      category: 'Coffee & Kitchen',
      image: '/src/assets/images/product_coffee_dripper_1790145784806.jpg',
      stock: 26,
      rating: 4.8,
      numReviews: 89,
      featured: true,
      createdAt: new Date('2026-02-05T11:20:00Z').toISOString(),
    },
    {
      _id: 'prod_003',
      name: 'Atelier Titanium Mechanical Chronograph',
      description: 'Brushed Grade-5 titanium case featuring sapphire crystal front and exhibition caseback, 28,800 vph automatic column-wheel chronograph movement with 54-hour power reserve.',
      price: 380,
      category: 'Timepieces',
      image: '/src/assets/images/product_chronograph_watch_1790145796963.jpg',
      stock: 9,
      rating: 4.9,
      numReviews: 52,
      featured: true,
      createdAt: new Date('2026-02-10T08:15:00Z').toISOString(),
    },
    {
      _id: 'prod_004',
      name: 'Solid Walnut Architectural Lounge Chair',
      description: 'Sustainably harvested American walnut sculpted through five-axis precision milling, finished with hand-rubbed organic oil and upholstered in high-durability Danish wool.',
      price: 620,
      category: 'Furniture & Living',
      image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
      stock: 7,
      rating: 5.0,
      numReviews: 31,
      featured: true,
      createdAt: new Date('2026-02-12T15:45:00Z').toISOString(),
    },
    {
      _id: 'prod_005',
      name: 'Architectural Brushed Brass Task Lamp',
      description: 'Counterbalanced weighted cantilever arm with seamless 2700K warm-spectrum LED dimming. Designed for glare-free surface illumination across executive desks.',
      price: 175,
      category: 'Lighting & Workspace',
      image: '/src/assets/images/brass_task_lamp_1790146777247.jpg',
      stock: 14,
      rating: 4.8,
      numReviews: 44,
      featured: false,
      createdAt: new Date('2026-02-15T12:00:00Z').toISOString(),
    },
    {
      _id: 'prod_006',
      name: 'Japanese Stoneware Incense Burner Vessel',
      description: 'Slip-cast refractory stoneware vessel with removable solid brass pin-holder. Accommodates standard Japanese bamboo and pressed charcoal sticks.',
      price: 42,
      category: 'Home Accents',
      image: '/src/assets/images/incense_burner_1790146792103.jpg',
      stock: 35,
      rating: 4.9,
      numReviews: 67,
      featured: false,
      createdAt: new Date('2026-02-18T10:30:00Z').toISOString(),
    },
    {
      _id: 'prod_007',
      name: 'Anodized 75% Custom Mechanical Keyboard',
      description: 'Gasket-mounted CNC aluminum enclosure, pre-lubed silent linear switches, hot-swappable PCB, and double-shot PBT keycaps with sound-dampening poron foam.',
      price: 220,
      category: 'Lighting & Workspace',
      image: '/src/assets/images/product_audio_headphones_1790145772052.jpg',
      stock: 12,
      rating: 4.9,
      numReviews: 95,
      featured: true,
      createdAt: new Date('2026-02-20T14:10:00Z').toISOString(),
    },
    {
      _id: 'prod_008',
      name: 'Fine Merino Wool Heavyweight Throw Blanket',
      description: 'Woven in Biella, Italy using 100% extrafine 19.5 micron merino wool. Double-faced weave in heathered granite grey with delicately fringed selvage edges.',
      price: 145,
      category: 'Furniture & Living',
      image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
      stock: 20,
      rating: 4.7,
      numReviews: 38,
      featured: false,
      createdAt: new Date('2026-02-22T16:00:00Z').toISOString(),
    },
    {
      _id: 'prod_009',
      name: 'Handmade Vegetable-Tanned Leather Folio',
      description: 'Full-grain Tuscan bridle leather tailored for 14-inch laptops, document notebooks, and stylus instruments. Develops a rich organic patina with daily handling.',
      price: 95,
      category: 'Accessories',
      image: '/src/assets/images/leather_folio_1790146829207.jpg',
      stock: 22,
      rating: 4.8,
      numReviews: 59,
      featured: false,
      createdAt: new Date('2026-02-25T11:00:00Z').toISOString(),
    },
    {
      _id: 'prod_010',
      name: 'Heavyweight 400 GSM French Terry Crewneck',
      description: 'Custom-knit combed organic cotton spun with tight loopback reverse fleece. Ribbed collar and double-needle reinforced cuffs for lasting structural drape.',
      price: 110,
      category: 'Apparel',
      image: '/src/assets/images/hero_ecommerce_showcase_1790145758681.jpg',
      stock: 19,
      rating: 4.7,
      numReviews: 41,
      featured: false,
      createdAt: new Date('2026-03-01T09:45:00Z').toISOString(),
    },
    {
      _id: 'prod_011',
      name: 'Cast Iron Dutch Oven with Matte Enamel',
      description: 'Heavy gauge cast iron core providing superior thermal inertia and moisture circulation. Compatible with induction, gas, and oven temperatures up to 500°F.',
      price: 160,
      category: 'Coffee & Kitchen',
      image: '/src/assets/images/dutch_oven_1790146844504.jpg',
      stock: 16,
      rating: 4.9,
      numReviews: 73,
      featured: false,
      createdAt: new Date('2026-03-05T13:20:00Z').toISOString(),
    },
    {
      _id: 'prod_012',
      name: 'Tactile Wireless Aluminum Volume Dial & Macropad',
      description: 'Precision knurled rotary encoder with stepped haptic detents and 3 assignable tactile mechanical switches for media, scrubbing, and desktop workflows.',
      price: 78,
      category: 'Lighting & Workspace',
      image: '/src/assets/images/product_audio_headphones_1790145772052.jpg',
      stock: 25,
      rating: 4.8,
      numReviews: 33,
      featured: false,
      createdAt: new Date('2026-03-08T15:00:00Z').toISOString(),
    },
  ];

  db.products = sampleProducts;

  // Sample order for demoUser to test order history and tracking immediately
  const sampleOrder: OrderDoc = {
    _id: 'ORD-78419',
    userId: demoUser._id,
    userName: demoUser.name,
    userEmail: demoUser.email,
    items: [
      {
        productId: 'prod_001',
        name: sampleProducts[0].name,
        price: sampleProducts[0].price,
        image: sampleProducts[0].image,
        quantity: 1,
      },
      {
        productId: 'prod_002',
        name: sampleProducts[1].name,
        price: sampleProducts[1].price,
        image: sampleProducts[1].image,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: 'Julian Hayes',
      email: 'user@ecommerce.com',
      phone: '+1 (555) 234-8901',
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'Portland',
      state: 'OR',
      pincode: '97201',
    },
    paymentMethod: 'Demo Online Payment',
    subtotal: 353,
    shippingFee: 0,
    totalAmount: 353,
    status: 'Processing',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  };

  db.orders = [sampleOrder];
  db.carts = [];
  db.wishlists = [
    {
      _id: 'wish_customer_01',
      userId: 'user_customer_01',
      productIds: ['prod_001', 'prod_003'],
      updatedAt: new Date().toISOString(),
    },
  ];

  persistDb();
  console.log('Database seeded with admin, demo user, 12 products, and initial sample order.');
}

// Database query interfaces mimicking Mongoose
export const db = {
  get schema() {
    return ensureDbFile();
  },

  users: {
    find: () => ensureDbFile().users,
    findById: (id: string) => ensureDbFile().users.find((u) => u._id === id) || null,
    findOne: (predicate: (u: UserDoc) => boolean) => ensureDbFile().users.find(predicate) || null,
    create: (user: Omit<UserDoc, '_id' | 'createdAt'> & Partial<Pick<UserDoc, '_id' | 'createdAt'>>) => {
      const dbInstance = ensureDbFile();
      const newDoc: UserDoc = {
        _id: user._id || generateId('usr'),
        name: user.name,
        email: user.email.toLowerCase().trim(),
        password: user.password,
        role: user.role || 'USER',
        createdAt: user.createdAt || new Date().toISOString(),
      };
      dbInstance.users.push(newDoc);
      persistDb();
      return newDoc;
    },
  },

  products: {
    find: (filter?: { category?: string; search?: string; sort?: string }) => {
      let list = [...ensureDbFile().products];

      if (filter?.category && filter.category !== 'All') {
        list = list.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
      }

      if (filter?.search) {
        const query = filter.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }

      if (filter?.sort) {
        switch (filter.sort) {
          case 'price_asc':
            list.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            list.sort((a, b) => b.price - a.price);
            break;
          case 'name_asc':
            list.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name_desc':
            list.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'rating':
            list.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
          default:
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }

      return list;
    },
    findById: (id: string) => ensureDbFile().products.find((p) => p._id === id) || null,
    create: (product: Omit<ProductDoc, '_id' | 'createdAt'> & Partial<Pick<ProductDoc, '_id' | 'createdAt'>>) => {
      const dbInstance = ensureDbFile();
      const newDoc: ProductDoc = {
        _id: product._id || generateId('prod'),
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        stock: Number(product.stock),
        rating: product.rating || 4.8,
        numReviews: product.numReviews || 0,
        featured: !!product.featured,
        createdAt: product.createdAt || new Date().toISOString(),
      };
      dbInstance.products.push(newDoc);
      persistDb();
      return newDoc;
    },
    findByIdAndUpdate: (id: string, update: Partial<ProductDoc>) => {
      const dbInstance = ensureDbFile();
      const index = dbInstance.products.findIndex((p) => p._id === id);
      if (index === -1) return null;
      dbInstance.products[index] = {
        ...dbInstance.products[index],
        ...update,
        price: update.price !== undefined ? Number(update.price) : dbInstance.products[index].price,
        stock: update.stock !== undefined ? Number(update.stock) : dbInstance.products[index].stock,
      };
      persistDb();
      return dbInstance.products[index];
    },
    findByIdAndDelete: (id: string) => {
      const dbInstance = ensureDbFile();
      const index = dbInstance.products.findIndex((p) => p._id === id);
      if (index === -1) return null;
      const [deleted] = dbInstance.products.splice(index, 1);
      persistDb();
      return deleted;
    },
    addReview: (
      productId: string,
      review: {
        userId: string;
        userName: string;
        rating: number;
        title?: string;
        comment: string;
      }
    ) => {
      const dbInstance = ensureDbFile();
      const product = dbInstance.products.find((p) => p._id === productId);
      if (!product) return null;

      if (!Array.isArray(product.reviews)) {
        product.reviews = [];
      }

      const existingIndex = product.reviews.findIndex((r) => r.userId === review.userId);
      const newReview: ReviewDoc = {
        _id: generateId('rev'),
        userId: review.userId,
        userName: review.userName,
        rating: Math.max(1, Math.min(5, Math.round(review.rating))),
        title: review.title ? review.title.trim() : undefined,
        comment: review.comment.trim(),
        createdAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        product.reviews[existingIndex] = newReview;
      } else {
        product.reviews.unshift(newReview);
      }

      const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = Number((totalRating / product.reviews.length).toFixed(1));
      product.numReviews = product.reviews.length;

      persistDb();
      return { product, review: newReview };
    },
  },

  carts: {
    findByUserId: (userId: string) => {
      const dbInstance = ensureDbFile();
      let cart = dbInstance.carts.find((c) => c.userId === userId);
      if (!cart) {
        cart = {
          _id: generateId('cart'),
          userId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        dbInstance.carts.push(cart);
        persistDb();
      }
      return cart;
    },
    saveCart: (cart: CartDoc) => {
      const dbInstance = ensureDbFile();
      const index = dbInstance.carts.findIndex((c) => c._id === cart._id || c.userId === cart.userId);
      cart.updatedAt = new Date().toISOString();
      if (index >= 0) {
        dbInstance.carts[index] = cart;
      } else {
        dbInstance.carts.push(cart);
      }
      persistDb();
      return cart;
    },
    clearCart: (userId: string) => {
      const dbInstance = ensureDbFile();
      const cart = dbInstance.carts.find((c) => c.userId === userId);
      if (cart) {
        cart.items = [];
        cart.updatedAt = new Date().toISOString();
        persistDb();
      }
    },
  },

  orders: {
    find: (filter?: { userId?: string }) => {
      const orders = [...ensureDbFile().orders];
      if (filter?.userId) {
        return orders
          .filter((o) => o.userId === filter.userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findById: (id: string) => ensureDbFile().orders.find((o) => o._id === id) || null,
    create: (order: Omit<OrderDoc, '_id' | 'createdAt' | 'updatedAt'>) => {
      const dbInstance = ensureDbFile();
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const newOrder: OrderDoc = {
        _id: `ORD-${randomDigits}`,
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbInstance.orders.push(newOrder);
      persistDb();
      return newOrder;
    },
    updateStatus: (id: string, status: OrderStatus) => {
      const dbInstance = ensureDbFile();
      const order = dbInstance.orders.find((o) => o._id === id);
      if (!order) return null;
      order.status = status;
      order.updatedAt = new Date().toISOString();
      persistDb();
      return order;
    },
  },

  wishlists: {
    findByUserId: (userId: string): WishlistDoc => {
      const dbInstance = ensureDbFile();
      let wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      if (!wishlist) {
        wishlist = {
          _id: generateId('wish'),
          userId,
          productIds: [],
          updatedAt: new Date().toISOString(),
        };
        dbInstance.wishlists.push(wishlist);
        persistDb();
      }
      return wishlist;
    },
    toggle: (userId: string, productId: string) => {
      const dbInstance = ensureDbFile();
      let wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      if (!wishlist) {
        wishlist = {
          _id: generateId('wish'),
          userId,
          productIds: [productId],
          updatedAt: new Date().toISOString(),
        };
        dbInstance.wishlists.push(wishlist);
        persistDb();
        return { inWishlist: true, productIds: wishlist.productIds };
      }

      const index = wishlist.productIds.indexOf(productId);
      let inWishlist = false;
      if (index >= 0) {
        wishlist.productIds.splice(index, 1);
        inWishlist = false;
      } else {
        wishlist.productIds.push(productId);
        inWishlist = true;
      }
      wishlist.updatedAt = new Date().toISOString();
      persistDb();
      return { inWishlist, productIds: wishlist.productIds };
    },
    add: (userId: string, productId: string): WishlistDoc => {
      const dbInstance = ensureDbFile();
      let wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      if (!wishlist) {
        wishlist = {
          _id: generateId('wish'),
          userId,
          productIds: [productId],
          updatedAt: new Date().toISOString(),
        };
        dbInstance.wishlists.push(wishlist);
      } else if (!wishlist.productIds.includes(productId)) {
        wishlist.productIds.push(productId);
        wishlist.updatedAt = new Date().toISOString();
      }
      persistDb();
      return wishlist;
    },
    remove: (userId: string, productId: string): WishlistDoc => {
      const dbInstance = ensureDbFile();
      let wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      if (wishlist) {
        wishlist.productIds = wishlist.productIds.filter((id) => id !== productId);
        wishlist.updatedAt = new Date().toISOString();
        persistDb();
      } else {
        wishlist = {
          _id: generateId('wish'),
          userId,
          productIds: [],
          updatedAt: new Date().toISOString(),
        };
        dbInstance.wishlists.push(wishlist);
        persistDb();
      }
      return wishlist;
    },
    clear: (userId: string): void => {
      const dbInstance = ensureDbFile();
      const wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      if (wishlist) {
        wishlist.productIds = [];
        wishlist.updatedAt = new Date().toISOString();
        persistDb();
      }
    },
    has: (userId: string, productId: string): boolean => {
      const dbInstance = ensureDbFile();
      const wishlist = dbInstance.wishlists.find((w) => w.userId === userId);
      return !!wishlist && wishlist.productIds.includes(productId);
    },
  },
};

// Auto seed immediately when loaded
seedInitialData().catch((e) => console.error('Seed error:', e));
