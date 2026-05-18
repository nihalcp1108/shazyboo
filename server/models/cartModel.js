import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total price virtual
cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
});

// Calculate total items virtual
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;