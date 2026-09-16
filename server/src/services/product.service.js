import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { CRAFT_CATEGORIES } from '../config/constants.js';

export const INITIAL_PRODUCTS = [
  // 1. Scarves
  {
    _id: '66d000000000000000000001',
    title: 'Handmade Pure Merino Wool Scarf',
    slug: 'handmade-pure-merino-wool-scarf',
    description:
      'Individually hand-knitted by Gurjeet using classic long wooden needles. Features rich textured ribbing that traps body warmth while remaining breathable and gentle against delicate skin.',
    category: 'scarves',
    craftTechnique: 'Hand-Knitted',
    material: '100% Pure Merino Wool',
    price: 1899,
    stock: 2,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 4,
    dimensions: 'Length: 180cm, Width: 25cm',
    careInstructions: [
      'Gently hand wash in cool water with mild wool detergent',
      'Press gently between dry towels to remove moisture',
      'Lay flat to dry away from direct sunlight',
    ],
    availableColors: ['Oatmeal Beige', 'Forest Sage', 'Charcoal Heather'],
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_scarf_1',
        alt: 'Handmade Pure Merino Wool Scarf',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000004',
    title: 'Chunky Hand-Knitted Cable Scarf',
    slug: 'chunky-hand-knitted-cable-scarf',
    description:
      'Classic heritage cable knit scarf hand-crafted with double-ply wool yarn. Offers plush neck cushioning and timeless winter elegance.',
    category: 'scarves',
    craftTechnique: 'Hand-Knitted',
    material: '100% Himalayan Sheep Wool',
    price: 1499,
    stock: 3,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 3,
    dimensions: 'Length: 160cm, Width: 22cm',
    careInstructions: [
      'Hand wash only in lukewarm water with gentle wool shampoo',
      'Dry flat in shade, never tumble dry',
    ],
    availableColors: ['Natural Cream', 'Terracotta Red', 'Charcoal Grey'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_scarf_2',
        alt: 'Chunky Hand-Knitted Cable Scarf',
        isPrimary: true,
      },
    ],
  },

  // 2. Gloves
  {
    _id: '66d000000000000000000002',
    title: 'Cozy Honeycomb Knit Mittens',
    slug: 'cozy-honeycomb-knit-mittens',
    description:
      'Warm and snug hand-knitted mittens designed for cold winter mornings. Crafted with a thick honeycomb pattern that offers thermal insulation and cozy hand feel.',
    category: 'gloves',
    craftTechnique: 'Hand-Knitted',
    material: 'Blended Soft Wool & Alpaca Yarn',
    price: 899,
    stock: 4,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 2,
    dimensions: 'Standard Adult Hand Length: 22cm',
    careInstructions: [
      'Hand wash only in lukewarm water',
      'Do not wring or twist',
      'Dry flat in shade',
    ],
    availableColors: ['Warm Ivory', 'Terracotta', 'Slate Blue'],
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_gloves_1',
        alt: 'Cozy Honeycomb Knit Mittens',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000005',
    title: 'Hand-Knitted Woolen Winter Gloves',
    slug: 'hand-knitted-woolen-winter-gloves',
    description:
      'Snug, flexible woolen gloves individually crafted for natural finger dexterity and cozy warmth during everyday winter chores.',
    category: 'gloves',
    craftTechnique: 'Hand-Knitted',
    material: 'Soft Acrylic & Wool Blend',
    price: 799,
    stock: 2,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 2,
    dimensions: 'Adult Regular Fit',
    careInstructions: [
      'Gently hand wash in cool water',
      'Reshape fingers while damp and dry flat',
    ],
    availableColors: ['Warm Taupe', 'Navy Heather', 'Sandstone'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_gloves_2',
        alt: 'Hand-Knitted Woolen Winter Gloves',
        isPrimary: true,
      },
    ],
  },

  // 3. Caps & Beanies
  {
    _id: '66d000000000000000000003',
    title: 'Slouchy Crochet Wool Beanie',
    slug: 'slouchy-crochet-wool-beanie',
    description:
      'Hand-crocheted cap with relaxed silhouette and gentle rib fold. Breathable yet wind-resistant, perfect for daily autumn and winter wear.',
    category: 'beanies',
    craftTechnique: 'Crocheted',
    material: 'Natural Sheep Wool Blend',
    price: 799,
    stock: 3,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 2,
    dimensions: 'Circumference: 52-58cm (Stretchable fit)',
    careInstructions: [
      'Spot clean with cool water or hand wash gently',
      'Reshape while damp and dry flat',
    ],
    availableColors: ['Muted Terracotta', 'Sandstone Beige', 'Deep Olive'],
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_beanie_1',
        alt: 'Slouchy Crochet Wool Beanie',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000006',
    title: 'Textured Crochet Beanie Cap',
    slug: 'textured-crochet-beanie-cap',
    description:
      'Crocheted with a precision hook, creating deep structural stitches with exceptional warmth and a comfortable ribbed turn-up brim.',
    category: 'beanies',
    craftTechnique: 'Crocheted',
    material: 'Pure Australian Wool',
    price: 999,
    stock: 1,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 3,
    dimensions: 'Universal Adult Stretch Fit',
    careInstructions: [
      'Hand wash gently with wool detergent',
      'Lay flat to air dry',
    ],
    availableColors: ['Rust Terracotta', 'Mustard Honey', 'Cozy Cream'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_beanie_2',
        alt: 'Textured Crochet Beanie Cap',
        isPrimary: true,
      },
    ],
  },

  // 4. Mufflers
  {
    _id: '66d000000000000000000007',
    title: 'Classic Woolen Ribbed Muffler',
    slug: 'classic-woolen-ribbed-muffler',
    description:
      'Generous length neck muffler hand-knitted in subtle earthy tones. Designed for daily winter comfort and effortless wrapping.',
    category: 'mufflers',
    craftTechnique: 'Hand-Knitted',
    material: '100% Fine Highland Wool',
    price: 1599,
    stock: 2,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 5,
    dimensions: 'Length: 175cm, Width: 20cm',
    careInstructions: [
      'Hand wash gently in lukewarm water',
      'Dry flat on towel, reshape ribbing',
    ],
    availableColors: ['Heather Grey', 'Earthy Brown', 'Olive Sage'],
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_muffler_1',
        alt: 'Classic Woolen Ribbed Muffler',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000008',
    title: 'Handmade Herringbone Wool Muffler',
    slug: 'handmade-herringbone-wool-muffler',
    description:
      'Artisan crafted neckpiece with a subtle chevron herringbone stitch motif. Warm, dense, and lightweight on the collar.',
    category: 'mufflers',
    craftTechnique: 'Hand-Knitted',
    material: 'Merino & Lambswool Blend',
    price: 1749,
    stock: 1,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 4,
    dimensions: 'Length: 170cm, Width: 22cm',
    careInstructions: [
      'Gently wash in cool water',
      'Dry flat away from heating elements',
    ],
    availableColors: ['Walnut Tan', 'Muted Indigo', 'Oatmeal'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_muffler_2',
        alt: 'Handmade Herringbone Wool Muffler',
        isPrimary: true,
      },
    ],
  },

  // 5. Socks
  {
    _id: '66d000000000000000000009',
    title: 'Cozy Hand-Knitted Woolen Socks',
    slug: 'cozy-hand-knitted-woolen-socks',
    description:
      'Durable, warm woolen socks featuring reinforced heels and soft toe joins. Perfect for cold evenings and wooden floor comfort.',
    category: 'socks',
    craftTechnique: 'Hand-Knitted',
    material: 'Wool & Polyamide Blend for Durability',
    price: 699,
    stock: 5,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 2,
    dimensions: 'Stretchable Adult Free Size (Fits EU 37-43)',
    careInstructions: [
      'Hand wash or delicate cycle in mesh wash bag',
      'Do not tumble dry',
    ],
    availableColors: ['Oatmeal Speckle', 'Forest Fleck', 'Natural Cream'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_socks_1',
        alt: 'Cozy Hand-Knitted Woolen Socks',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000010',
    title: 'Thermal Winter Woolen Bed Socks',
    slug: 'thermal-winter-woolen-bed-socks',
    description:
      'Chunky gauge knitted lounge socks designed for maximum bedtime warmth and restful sleep during freezing nights.',
    category: 'socks',
    craftTechnique: 'Hand-Knitted',
    material: '100% Pure Warm Sheep Wool',
    price: 649,
    stock: 3,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 2,
    dimensions: 'Relaxed Fit Socks',
    careInstructions: [
      'Gentle hand wash only',
      'Air dry flat',
    ],
    availableColors: ['Cloud Grey', 'Soft Rose', 'Natural Wool'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_socks_2',
        alt: 'Thermal Winter Woolen Bed Socks',
        isPrimary: true,
      },
    ],
  },

  // 6. Other Woolen Handcrafts
  {
    _id: '66d000000000000000000011',
    title: 'Handmade Woolen Ear Warmer Headband',
    slug: 'handmade-woolen-ear-warmer-headband',
    description:
      'Knitted with a twist front knot using chunky soft wool yarn. Keeps ears protected while allowing high bun or ponytail hairstyles.',
    category: 'other',
    craftTechnique: 'Hand-Knitted',
    material: '100% Pure Wool',
    price: 549,
    stock: 3,
    isAvailable: true,
    isMadeToOrder: false,
    craftingLeadDays: 2,
    dimensions: 'Width: 10cm, Stretch Fit (50-58cm)',
    careInstructions: [
      'Spot clean or wash in cool water',
      'Lay flat to air dry',
    ],
    availableColors: ['Mustard Gold', 'Winter White', 'Soft Sage'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_other_1',
        alt: 'Handmade Woolen Ear Warmer Headband',
        isPrimary: true,
      },
    ],
  },
  {
    _id: '66d000000000000000000012',
    title: 'Crocheted Woolen Mug & Kettle Cozy Set',
    slug: 'crocheted-woolen-mug-kettle-cozy-set',
    description:
      'Charming handcrafted woolen sleeve set with wooden button fastenings. Keeps morning tea piping warm with handcrafted rustic aesthetic.',
    category: 'other',
    craftTechnique: 'Crocheted',
    material: 'Pure Wool & Natural Wood Buttons',
    price: 499,
    stock: 0,
    isAvailable: true,
    isMadeToOrder: true,
    craftingLeadDays: 3,
    dimensions: 'Fits standard 300ml - 400ml ceramic mugs',
    careInstructions: [
      'Spot clean recommended',
      'Remove wooden buttons before submerging in water',
    ],
    availableColors: ['Earth Terracotta', 'Sandstone Oatmeal'],
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
        publicId: 'seed_other_2',
        alt: 'Crocheted Woolen Mug & Kettle Cozy Set',
        isPrimary: true,
      },
    ],
  },
];

let memoryProducts = [...INITIAL_PRODUCTS];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate URL-friendly slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
};

/**
 * Retrieve products with filtering, search, availability, and sorting
 */
export const getProducts = async ({
  category,
  search,
  minPrice,
  maxPrice,
  availability,
  featured,
  sort,
  page = 1,
  limit = 20,
}) => {
  const query = {};

  // 1. Category filter
  if (typeof category === 'string' && category && category !== 'all') {
    query.category = category.trim().toLowerCase();
  }

  // 2. Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
  }

  // 3. Search filter with ReDoS defense (escape regex metacharacters and limit length)
  if (typeof search === 'string' && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { material: { $regex: escaped, $options: 'i' } },
      { craftTechnique: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } },
    ];
  }

  // 4. Featured filter
  if (featured === true || featured === 'true') {
    query.isFeatured = true;
  }

  // 5. Availability filter (Available, Limited, Made to Order, Unavailable)
  if (availability && availability !== 'all') {
    const avail = availability.toLowerCase();
    if (avail === 'available' || avail === 'in_stock') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    } else if (avail === 'limited') {
      query.isAvailable = true;
      query.stock = { $gt: 0, $lte: 2 };
    } else if (avail === 'made_to_order' || avail === 'custom') {
      query.isMadeToOrder = true;
    } else if (avail === 'unavailable' || avail === 'out_of_stock') {
      query.$or = [
        { isAvailable: false },
        { stock: 0, isMadeToOrder: false },
      ];
    }
  }

  // 6. Sorting options
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };
  if (sort === 'featured') sortOption = { isFeatured: -1, createdAt: -1 };

  if (isDbConnected()) {
    try {
      const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await Product.countDocuments(query);
      return { products, total, page: Number(page), limit: Number(limit) };
    } catch (err) {
      console.warn('MongoDB products query failed, using in-memory store:', err.message);
    }
  }

  // Memory fallback filter
  let filtered = [...memoryProducts];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category.toLowerCase());
  }

  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        (p.craftTechnique && p.craftTechnique.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (featured === true || featured === 'true') {
    filtered = filtered.filter((p) => p.isFeatured === true);
  }

  if (availability && availability !== 'all') {
    const avail = availability.toLowerCase();
    if (avail === 'available' || avail === 'in_stock') {
      filtered = filtered.filter((p) => p.isAvailable && p.stock > 0);
    } else if (avail === 'limited') {
      filtered = filtered.filter((p) => p.isAvailable && p.stock > 0 && p.stock <= 2);
    } else if (avail === 'made_to_order' || avail === 'custom') {
      filtered = filtered.filter((p) => p.isMadeToOrder);
    } else if (avail === 'unavailable' || avail === 'out_of_stock') {
      filtered = filtered.filter((p) => !p.isAvailable || (p.stock === 0 && !p.isMadeToOrder));
    }
  }

  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'featured') filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return {
    products: filtered,
    total: filtered.length,
    page: Number(page),
    limit: Number(limit),
  };
};

/**
 * Retrieve single product by MongoDB ID, memory ID, or slug
 */
export const getProductByIdOrSlug = async (idOrSlug) => {
  if (isDbConnected()) {
    try {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        product = await Product.findById(idOrSlug);
      }
      if (!product) {
        product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
      }
      if (product) return product;
    } catch (err) {}
  }

  const product = memoryProducts.find(
    (p) => String(p._id) === String(idOrSlug) || p.slug === idOrSlug.toLowerCase()
  );

  if (!product) {
    throw new ApiError(404, `Product not found with identifier: ${idOrSlug}`);
  }

  return product;
};

/**
 * Create a new Product (Admin only)
 */
export const createProduct = async (productData) => {
  const { title, price, category, craftTechnique, material, description } = productData;

  if (!title?.trim()) throw new ApiError(400, 'Product title is required');
  if (!price || isNaN(price) || price < 0) throw new ApiError(400, 'Valid price is required');
  if (!category?.trim()) throw new ApiError(400, 'Product category is required');
  if (!material?.trim()) throw new ApiError(400, 'Material description is required');
  if (!description?.trim()) throw new ApiError(400, 'Description is required');

  const slug = productData.slug ? slugify(productData.slug) : slugify(title);

  const payload = {
    ...productData,
    title: title.trim(),
    slug,
    price: Number(price),
    category: category.toLowerCase().trim(),
    craftTechnique: craftTechnique || 'Hand-Knitted',
    material: material.trim(),
    description: description.trim(),
    stock: productData.stock !== undefined ? Number(productData.stock) : 1,
    isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true,
    isMadeToOrder: productData.isMadeToOrder !== undefined ? productData.isMadeToOrder : false,
    images:
      productData.images && productData.images.length > 0
        ? productData.images
        : [
            {
              url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
              publicId: 'default_wool',
              alt: title,
              isPrimary: true,
            },
          ],
  };

  if (isDbConnected()) {
    try {
      const created = await Product.create(payload);
      return created;
    } catch (err) {
      console.warn('MongoDB product create failed, using memory store:', err.message);
    }
  }

  const newProd = {
    _id: `prod_mem_${Date.now()}`,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryProducts.unshift(newProd);
  return newProd;
};

/**
 * Update an existing Product (Admin only)
 */
export const updateProduct = async (id, updateData) => {
  if (updateData.title && !updateData.slug) {
    updateData.slug = slugify(updateData.title);
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return updated;
    } catch (err) {}
  }

  const idx = memoryProducts.findIndex((p) => String(p._id) === String(id) || p.slug === id);
  if (idx === -1) {
    throw new ApiError(404, `Product not found with ID: ${id}`);
  }

  memoryProducts[idx] = {
    ...memoryProducts[idx],
    ...updateData,
    updatedAt: new Date(),
  };

  return memoryProducts[idx];
};

/**
 * Delete a Product (Admin only)
 */
export const deleteProduct = async (id) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (deleted) return deleted;
    } catch (err) {}
  }

  const idx = memoryProducts.findIndex((p) => String(p._id) === String(id) || p.slug === id);
  if (idx === -1) {
    throw new ApiError(404, `Product not found with ID: ${id}`);
  }

  const removed = memoryProducts.splice(idx, 1)[0];
  return removed;
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  return [
    { slug: 'all', name: 'All' },
    { slug: 'scarves', name: 'Scarves' },
    { slug: 'gloves', name: 'Gloves' },
    { slug: 'beanies', name: 'Caps & Beanies' },
    { slug: 'mufflers', name: 'Mufflers' },
    { slug: 'socks', name: 'Socks' },
    { slug: 'other', name: 'Other Woolen Handcrafts' },
  ];
};

/**
 * Ensure initial starter products exist in MongoDB
 */
export const ensureSeededProducts = async () => {
  if (isDbConnected()) {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('Seeding initial authentic handmade woolen products...');
        await Product.insertMany(INITIAL_PRODUCTS);
        console.log('Starter products seeded successfully.');
      }
    } catch (err) {
      console.warn('Could not seed starter products to MongoDB:', err.message);
    }
  }
};
