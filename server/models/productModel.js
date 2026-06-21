import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true , "Please enter product description"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    costPrice: {
      type: Number,
      default: 0.0,
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
      required: [true, "Please select main category3"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select category"],
    },
    subCategory: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    colors: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        code: {
          type: String,
          default: '#000000',
        },
        image: {
          type: String,
          default: '',
        },
        stock: {
          type: Number,
          default: 0,
        },
        additionalPrice: {
          type: Number,
          default: 0,
        },
      },
    ],
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating cannot exceed 5"],
        set: (val) => Math.round(val * 10) / 10,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");

    const timestamp = Date.now().toString().slice(-4);
    this.slug = `${baseSlug}-${timestamp}`;
  }
  next();
});

// Generate SKU if not provided
productSchema.pre("save", async function (next) {
  if (!this.sku) {
    try {
      if (this.category) {
        const Category = mongoose.model("Category");
        const categoryDoc = await Category.findById(this.category);
        if (categoryDoc) {
          const categoryCode = categoryDoc.name.substring(0, 3).toUpperCase();
          const timestamp = Date.now().toString().slice(-6);
          this.sku = `${categoryCode}-${timestamp}`;
        } else {
          const timestamp = Date.now().toString().slice(-6);
          this.sku = `PROD-${timestamp}`;
        }
      } else {
        const timestamp = Date.now().toString().slice(-6);
        this.sku = `PROD-${timestamp}`;
      }
    } catch (error) {
      const timestamp = Date.now().toString().slice(-6);
      this.sku = `PROD-${timestamp}`;
    }
  }
  next();
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.discountPrice > 0 && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for final price
productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Virtual for populated category
productSchema.virtual("categoryInfo", {
  ref: "Category",
  localField: "category",
  foreignField: "_id",
  justOne: true,
});

// Virtual for populated main category
productSchema.virtual("mainCategoryInfo", {
  ref: "MainCategory",
  localField: "mainCategory",
  foreignField: "_id",
  justOne: true,
});

// Index for search
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;