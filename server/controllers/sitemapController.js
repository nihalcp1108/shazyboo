import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import MainCategory from '../models/mainCategoryModel.js';

// The public site URL (frontend, not the API). Set SITE_URL in your
// environment variables in production — falls back to the live domain.
const SITE_URL = process.env.SITE_URL || 'https://shazyboo.com';

const escapeXml = (str = '') =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urlEntry = (loc, lastmod, changefreq, priority) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// @desc    Generate sitemap.xml dynamically from live DB data
// @route   GET /sitemap.xml
// @access  Public
export const getSitemap = asyncHandler(async (req, res) => {
  const [products, categories, mainCategories] = await Promise.all([
    Product.find({ isActive: true }).select('slug updatedAt').lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
    MainCategory.find({ isActive: true }).select('slug updatedAt').lean()
  ]);

  const staticPages = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/shop`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/categories`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.4' }
  ];

  let body = staticPages
    .map((p) => urlEntry(p.loc, null, p.changefreq, p.priority))
    .join('');

  body += mainCategories
    .map((mc) =>
      urlEntry(
        `${SITE_URL}/main-category/${mc.slug}`,
        mc.updatedAt,
        'weekly',
        '0.8'
      )
    )
    .join('');

  body += categories
    .map((c) =>
      urlEntry(`${SITE_URL}/categories/${c.slug}`, c.updatedAt, 'weekly', '0.8')
    )
    .join('');

  body += products
    .map((p) =>
      urlEntry(`${SITE_URL}/product/${p.slug}`, p.updatedAt, 'weekly', '0.7')
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// @desc    Serve robots.txt with a pointer to the dynamic sitemap
// @route   GET /robots.txt
// @access  Public
export const getRobotsTxt = asyncHandler(async (req, res) => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /verify-otp',
    'Disallow: /profile',
    'Disallow: /my-orders',
    'Disallow: /order-confirmation',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ];
  res.header('Content-Type', 'text/plain');
  res.send(lines.join('\n'));
});
