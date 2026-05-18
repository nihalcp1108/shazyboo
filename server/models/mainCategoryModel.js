import mongoose from 'mongoose';

const mainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    icon: {
        type: String,
        default: '🎨'
    },
    image: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name before saving
mainCategorySchema.pre('save', function(next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const MainCategory = mongoose.model('MainCategory', mainCategorySchema);

export default MainCategory;