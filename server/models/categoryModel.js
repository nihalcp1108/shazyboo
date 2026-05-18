import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        public_id: String,
        url: String,
        alt: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    productCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name') || !this.slug) {
        const baseSlug = this.name
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        
        // Add ID to make it unique
        const randomStr = Math.random().toString(36).substring(2, 7);
        this.slug = `${baseSlug}-${randomStr}`;
    }
    next();
});

// Virtual for products
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    justOne: false
});

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ 
        category: this._id,
        isActive: true 
    });
    this.productCount = count;
    await this.save();
};

// Update timestamp before update
categorySchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;