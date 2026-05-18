import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    },
    selectedColor: {
        type: String,
        default: null
    },
    selectedColorName: {
        type: String,
        default: null
    },
    selectedColorCode: {
        type: String,
        default: null
    },
    selectedColorPrice: {
        type: Number,
        default: 0
    }
});

const priceSummarySchema = new mongoose.Schema({
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discountPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    isGuestOrder: {
        type: Boolean,
        default: false
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        }
    },
    paymentInfo: {
        method: {
            type: String,
            enum: ['cod', 'card', 'upi', 'whatsapp'],
            default: 'cod'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: {
            type: String,
            default: ''
        }
    },
    priceSummary: priceSummarySchema,
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    notes: {
        customerNote: {
            type: String,
            default: ''
        },
        adminNote: {
            type: String,
            default: ''
        }
    },
    whatsappMessage: {
        type: String,
        default: ''
    },
    trackingInfo: {
        trackingNumber: {
            type: String,
            default: ''
        },
        carrier: {
            type: String,
            default: ''
        },
        shippedDate: {
            type: Date
        },
        deliveredDate: {
            type: Date
        },
        estimatedDelivery: {
            type: Date
        }
    },
    cancelledAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ isGuestOrder: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for formatted order date
orderSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
});

// Method to check if order is cancellable
orderSchema.methods.isCancellable = function() {
    return ['pending', 'confirmed'].includes(this.orderStatus);
};

// Method to check if order is returnable
orderSchema.methods.isReturnable = function() {
    const daysSinceDelivery = (Date.now() - this.deliveredAt) / (1000 * 60 * 60 * 24);
    return this.orderStatus === 'delivered' && daysSinceDelivery <= 7;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;