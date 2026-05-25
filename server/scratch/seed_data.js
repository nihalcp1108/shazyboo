import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import MainCategory from '../models/mainCategoryModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.USE_LOCAL_DB === 'true' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(uri, {
      dbName: 'shazyboo',
    });
    console.log('✅ Connected to MongoDB');

    // Clean existing products & categories
    console.log('🧹 Cleaning old data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await MainCategory.deleteMany({});

    console.log('🌱 Seeding Main Categories...');
    const mc1 = await MainCategory.create({
      name: 'Clothing',
      slug: 'clothing',
      description: 'The most adorable and comfortable hoodies and tees.',
      icon: '👗',
      featured: true,
      isActive: true,
    });

    const mc2 = await MainCategory.create({
      name: 'Accessories',
      slug: 'accessories',
      description: 'Cute accessories to complete your look.',
      icon: '✨',
      featured: true,
      isActive: true,
    });

    console.log('🌱 Seeding Categories...');
    const cat1 = await Category.create({
      name: 'Hoodies',
      slug: 'hoodies',
      description: 'Cozy and oversized pastel hoodies.',
      isFeatured: true,
      isActive: true,
      order: 1,
      image: {
        public_id: 'hoodies_cat',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
        alt: 'Cozy Hoodies'
      }
    });

    const cat2 = await Category.create({
      name: 'Oversized T-Shirts',
      slug: 'oversized-tshirts',
      description: 'Drop-shoulder aesthetic tees.',
      isFeatured: true,
      isActive: true,
      order: 2,
      image: {
        public_id: 'tees_cat',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
        alt: 'Oversized T-Shirts'
      }
    });

    const cat3 = await Category.create({
      name: 'Keychains & Pins',
      slug: 'keychains-pins',
      description: 'Cute keychains and enamel pins.',
      isFeatured: true,
      isActive: true,
      order: 3,
      image: {
        public_id: 'keychains_cat',
        url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=60',
        alt: 'Keychains and Pins'
      }
    });

    // Update Main Categories with Subcategories references
    mc1.subCategories.push(cat1._id, cat2._id);
    await mc1.save();

    mc2.subCategories.push(cat3._id);
    await mc2.save();

    console.log('🌱 Seeding Products...');

    const p1 = await Product.create({
      name: 'Strawberry Dream Pastel Hoodie',
      description: 'Wrap yourself in the cozy, sweet warmth of our Strawberry Dream Pastel Hoodie! Featuring an adorable hand-designed strawberry embroidery, drop-shoulder long sleeves, and a premium double-lined hood. Perfect for lazy Sundays or cute day-outs.',
      shortDescription: 'Super soft, cute pink embroidered hoodie.',
      price: 1899,
      discountPrice: 1499,
      stock: 45,
      mainCategory: mc1._id,
      category: cat1._id,
      brand: 'ShazyBoo',
      isFeatured: true,
      isNewArrival: true,
      colors: [
        { name: 'Baby Pink', code: '#fbcfe8', stock: 25 },
        { name: 'Lilac', code: '#e9d5ff', stock: 20 }
      ],
      images: [
        {
          public_id: 'p1_img1',
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
          alt: 'Strawberry Dream Pink Hoodie',
          isDefault: true
        }
      ]
    });

    const p2 = await Product.create({
      name: 'Oversized Matcha Green Hoodie',
      description: 'Keep it cozy and earthy with the Oversized Matcha Green Hoodie. Crafted from a thick cotton fleece blend, it has a roomy fit with kangaroo pockets and rib-knit trims.',
      shortDescription: 'Warm oversized matcha green hoodie.',
      price: 1999,
      discountPrice: 1599,
      stock: 30,
      mainCategory: mc1._id,
      category: cat1._id,
      brand: 'ShazyBoo',
      isFeatured: true,
      isTrending: true,
      colors: [
        { name: 'Matcha Green', code: '#d9f99d', stock: 30 }
      ],
      images: [
        {
          public_id: 'p2_img1',
          url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
          alt: 'Matcha Green Hoodie',
          isDefault: true
        }
      ]
    });

    const p3 = await Product.create({
      name: 'Anime Aesthetic Drop Shoulder Tee',
      description: 'Make a statement with our premium graphic drop shoulder tee. Super breathable cotton fabric with high-quality screen printing that wont fade after washes.',
      shortDescription: 'Streetwear graphic tee with drop shoulder fit.',
      price: 999,
      discountPrice: 799,
      stock: 80,
      mainCategory: mc1._id,
      category: cat2._id,
      brand: 'ShazyBoo',
      isNewArrival: true,
      colors: [
        { name: 'Vintage Black', code: '#1f2937', stock: 40 },
        { name: 'Cloud White', code: '#f9fafb', stock: 40 }
      ],
      images: [
        {
          public_id: 'p3_img1',
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          alt: 'Anime Graphic Tee',
          isDefault: true
        }
      ]
    });

    const p4 = await Product.create({
      name: 'Cute Acrylic Bunny Keychain',
      description: 'Decorate your keys or bags with this ultra-adorable double-sided acrylic bunny keychain. Comes with a sturdy golden heart-shaped clasp.',
      shortDescription: 'Adorable double-sided acrylic bag charm.',
      price: 299,
      discountPrice: 249,
      stock: 120,
      mainCategory: mc2._id,
      category: cat3._id,
      brand: 'ShazyBoo',
      isFeatured: true,
      colors: [
        { name: 'Default', code: '#fdf2f8', stock: 120 }
      ],
      images: [
        {
          public_id: 'p4_img1',
          url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
          alt: 'Bunny Acrylic Keychain',
          isDefault: true
        }
      ]
    });

    // Update Category Product Counts
    await cat1.updateProductCount();
    await cat2.updateProductCount();
    await cat3.updateProductCount();

    console.log('✅ Seeding Completed successfully!');
    console.log(` - Main Categories: 2`);
    console.log(` - Categories (sub): 3`);
    console.log(` - Products: 4`);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
  }
}
seed();
