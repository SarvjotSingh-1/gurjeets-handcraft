import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiResponse } from './utils/ApiResponse.js';
import { ApiError } from './utils/ApiError.js';
import { errorHandler } from './middleware/error.middleware.js';
import {
  securityHeaders,
  sanitizeNoSql,
  createRateLimiter,
} from './middleware/security.middleware.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import customOrderRoutes from './routes/customOrder.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import contactRoutes from './routes/contact.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import cartRoutes from './routes/cart.routes.js';
import reviewRoutes from './routes/review.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../public/uploads');

const app = express();

// Disable Express technology fingerprinting
app.disable('x-powered-by');

// Serve uploaded product photos statically
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));
app.use('/api/v1/uploads', express.static(uploadsDir));

// Enforce standard HTTP security headers
app.use(securityHeaders);

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'https://gurjeets-handcraft.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

// Strict CORS verification: allow configured origins and vercel deployments
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.some((allowed) => {
          if (!allowed) return false;
          return origin === allowed || origin.replace(/\/$/, '') === allowed;
        }) ||
        origin.endsWith('.vercel.app') ||
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new ApiError(403, `CORS policy blocked access from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Root health & welcome endpoint for status verification
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    business: "Gurjeet's Handcraft",
    craft: 'Handmade Woolen Products (Crochet & Knit)',
    health: '/api/health',
    products: '/api/products',
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Strip NoSQL injection operators from bodies and queries
app.use(sanitizeNoSql);

// Rate Limiting Guards
const globalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests across the API. Please slow down.',
});
app.use('/api', globalApiLimiter);

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

const inquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many form submissions. Please wait a few moments before trying again.',
});
app.use('/api/contact', inquiryLimiter);
app.use('/api/custom-orders', inquiryLimiter);
app.use('/api/v1/contact', inquiryLimiter);
app.use('/api/v1/custom-orders', inquiryLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'online',
        business: "Gurjeet's Handcraft",
        craft: 'Handmade Woolen Products (Crochet & Knit)',
        timestamp: new Date().toISOString(),
      },
      'Artisan Backend API is running smoothly'
    )
  );
});

// Dynamic XML Sitemap for Search Engine Crawlers
const sitemapHandler = async (req, res) => {
  try {
    const { getProducts } = await import('./services/product.service.js');
    const { products } = await getProducts({ limit: 1000 });
    const siteUrl = process.env.CLIENT_URL || 'https://gurjeetshandcraft.com';
    const cleanSiteUrl = siteUrl.replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { loc: `${cleanSiteUrl}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${cleanSiteUrl}/shop`, priority: '0.9', changefreq: 'daily' },
      { loc: `${cleanSiteUrl}/custom-orders`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${cleanSiteUrl}/our-story`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/how-its-made`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/shipping-information`, priority: '0.4', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/returns-information`, priority: '0.4', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/privacy-policy`, priority: '0.3', changefreq: 'monthly' },
      { loc: `${cleanSiteUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${route.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p.slug) {
          const modDate = p.updatedAt
            ? new Date(p.updatedAt).toISOString().split('T')[0]
            : today;
          xml += `  <url>\n`;
          xml += `    <loc>${cleanSiteUrl}/product/${encodeURIComponent(p.slug)}</loc>\n`;
          xml += `    <lastmod>${modDate}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      });
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('Error generating sitemap');
  }
};

app.get('/sitemap.xml', sitemapHandler);
app.get('/api/sitemap.xml', sitemapHandler);

// Mount routes at both /api and /api/v1 for 100% full compatibility
const mountRoutes = (prefix) => {
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/custom-orders`, customOrderRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/contact`, contactRoutes);
  app.use(`${prefix}/upload`, uploadRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
};

mountRoutes('/api');
mountRoutes('/api/v1');
mountRoutes('');

// Global Error Handler
app.use(errorHandler);

export { app };
