import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

// Helper function to format WhatsApp message for guest orders with colors
const formatWhatsAppOrderMessageForGuest = (customerDetails, orderItems, priceSummary, orderId) => {
  const orderItemsText = orderItems.map((item, index) => {
    let itemDetails = `┌─ Item ${index + 1}
│ 📦 Product: ${item.name}
│ 🔢 Quantity: ${item.quantity}
│ 💰 Price: ₹${(item.price * item.quantity).toFixed(0)}`;
    
    if (item.selectedColor) {
      itemDetails += `
│ 🎨 Color: ${item.selectedColor}${item.selectedColorCode ? ` (${item.selectedColorCode})` : ''}
│ 💸 Color Extra: ₹${(item.selectedColorPrice || 0).toFixed(0)}`;
    }
    
    if (item.size && item.size !== 'Not specified') {
      itemDetails += `
│ 📏 Size: ${item.size}`;
    }
    
    itemDetails += `
└─────────────────`;
    
    return itemDetails;
  }).join('\n\n');

  const message = `*🛍️ NEW ORDER REQUEST - WhatsApp Confirmation*

*Order ID:* ${orderId}
*Order Type:* 🚶 Guest Checkout

━━━━━━━━━━━━━━━━━━━━
*👤 CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${customerDetails.fullName}
Phone: ${customerDetails.phone}
Email: ${customerDetails.email}
Address: ${customerDetails.address}
City: ${customerDetails.city}
State: ${customerDetails.state}
Pin Code: ${customerDetails.zipCode}

━━━━━━━━━━━━━━━━━━━━
*📦 ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━

${orderItemsText}

━━━━━━━━━━━━━━━━━━━━
*💰 PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${priceSummary.itemsPrice.toFixed(0)}
Shipping: ${priceSummary.shippingPrice === 0 ? 'FREE' : `₹${priceSummary.shippingPrice.toFixed(0)}`}
Discount: ₹${priceSummary.discountPrice.toFixed(0)}
━━━━━━━━━━━━━━━━━━━━
*TOTAL AMOUNT: ₹${priceSummary.totalPrice.toFixed(0)}*
━━━━━━━━━━━━━━━━━━━━

*💳 Payment Method:* Prepaid (WhatsApp Order)
*📅 Order Time:* ${new Date().toLocaleString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
})}

*✅ Please confirm this order by replying "CONFIRM"*
*❌ To cancel reply "CANCEL"*

Thank you for shopping with us! 🎀`;

  return message;
};

// Helper function to format WhatsApp message for registered users with colors
const formatWhatsAppOrderMessage = (user, shippingAddress, orderItems, priceSummary, orderId) => {
  const orderItemsText = orderItems.map((item, index) => {
    let itemDetails = `┌─ Item ${index + 1}
│ 📦 Product: ${item.name}
│ 🔢 Quantity: ${item.quantity}
│ 💰 Price: ₹${(item.price * item.quantity).toFixed(0)}`;
    
    if (item.selectedColor) {
      itemDetails += `
│ 🎨 Color: ${item.selectedColor}${item.selectedColorCode ? ` (${item.selectedColorCode})` : ''}
│ 💸 Color Extra: ₹${(item.selectedColorPrice || 0).toFixed(0)}`;
    }
    
    if (item.size && item.size !== 'Not specified') {
      itemDetails += `
│ 📏 Size: ${item.size}`;
    }
    
    itemDetails += `
└─────────────────`;
    
    return itemDetails;
  }).join('\n\n');

  const message = `*🛍️ NEW ORDER REQUEST - WhatsApp Confirmation*

*Order ID:* ${orderId}
*Order Type:* 👤 Registered User
*Customer Email:* ${user.email}

━━━━━━━━━━━━━━━━━━━━
*👤 CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${shippingAddress.fullName || user.name}
Phone: ${shippingAddress.phone || user.phone}
Email: ${shippingAddress.email || user.email}
Address: ${shippingAddress.address}
City: ${shippingAddress.city}
State: ${shippingAddress.state}
Pin Code: ${shippingAddress.zipCode}

━━━━━━━━━━━━━━━━━━━━
*📦 ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━

${orderItemsText}

━━━━━━━━━━━━━━━━━━━━
*💰 PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${priceSummary.itemsPrice.toFixed(0)}
Shipping: ${priceSummary.shippingPrice === 0 ? 'FREE' : `₹${priceSummary.shippingPrice.toFixed(0)}`}
Discount: ₹${priceSummary.discountPrice.toFixed(0)}
━━━━━━━━━━━━━━━━━━━━
*TOTAL AMOUNT: ₹${priceSummary.totalPrice.toFixed(0)}*
━━━━━━━━━━━━━━━━━━━━

*💳 Payment Method:* Prepaid (WhatsApp Order)
*📅 Order Time:* ${new Date().toLocaleString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
})}

*✅ Please confirm this order by replying "CONFIRM"*
*❌ To cancel reply "CANCEL"*

Thank you for shopping with us! 🎀`;

  return message;
};

// @desc    Create order (Supports both guest and logged-in users)
// @route   POST /api/orders
// @access  Public (Guest checkout allowed)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  // Validate required fields
  if (!items || items.length === 0) {
    throw new ErrorResponse('No items in order', 400);
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone) {
    throw new ErrorResponse('Please provide complete shipping information', 400);
  }

  let itemsPrice = 0;
  const orderItems = [];

  // Process each item
  for (const cartItem of items) {
    const product = await Product.findById(cartItem.productId || cartItem.product);

    // Check if product exists and is active
    if (!product || !product.isActive) {
      throw new ErrorResponse(
        `Product "${cartItem.name || 'Unknown'}" is no longer available`,
        400
      );
    }

    // Check stock based on color selection
    let availableStock = product.stock;
    let selectedColorInfo = null;
    
    if (cartItem.selectedColor && product.colors && product.colors.length > 0) {
      selectedColorInfo = product.colors.find(c => c.name === cartItem.selectedColor);
      if (selectedColorInfo) {
        availableStock = selectedColorInfo.stock;
      }
    }
    
    if (availableStock < cartItem.quantity) {
      throw new ErrorResponse(
        `Insufficient stock for "${product.name}"${selectedColorInfo ? ` in ${selectedColorInfo.name}` : ''}. Available: ${availableStock}`,
        400
      );
    }

    // Calculate item total
    const basePrice = cartItem.originalPrice || product.price;
    const colorPrice = cartItem.selectedColorPrice || cartItem.colorAdditionalPrice || 0;
    const finalPrice = basePrice + colorPrice;
    const itemPrice = finalPrice * cartItem.quantity;
    itemsPrice += itemPrice;

    // Add to order items with color info
    orderItems.push({
      product: product._id,
      name: product.name,
      price: finalPrice,
      originalPrice: basePrice,
      quantity: cartItem.quantity,
      selectedColor: cartItem.selectedColor || null,
      selectedColorName: cartItem.selectedColorName || cartItem.selectedColor || null,
      selectedColorCode: cartItem.selectedColorCode || null,
      selectedColorPrice: colorPrice,
      image: cartItem.image || product.images?.[0]?.url || 'No image available',
      size: cartItem.size || product.size || product.variant?.size || 'Not specified'
    });

    // Reduce product stock based on color
    if (selectedColorInfo) {
      selectedColorInfo.stock -= cartItem.quantity;
      await product.save();
    } else {
      product.stock -= cartItem.quantity;
      product.sold = (product.sold || 0) + cartItem.quantity;
      await product.save();
    }
  }

  // Calculate prices
  const taxPrice = 0; // Tax removed as per request
  const shippingPrice = itemsPrice >= 3000 ? 0 : 50; // Free shipping above ₹3000
  const discountPrice = 0;
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountPrice;

  // Generate order ID
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Determine if this is a guest order
  const isGuestOrder = !req.user;
  
  // Format WhatsApp message based on user type with colors included
  const whatsappMessage = req.user 
    ? formatWhatsAppOrderMessage(
        req.user,
        shippingAddress,
        orderItems,
        { itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice, notes },
        orderId
      )
    : formatWhatsAppOrderMessageForGuest(
        shippingAddress,
        orderItems,
        { itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice, notes },
        orderId
      );

  // Create order
  const order = await Order.create({
    orderId,
    user: req.user?._id || null,
    isGuestOrder: isGuestOrder,
    items: orderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country || 'India'
    },
    paymentInfo: {
      method: paymentMethod || 'cod',
      status: 'pending'
    },
    priceSummary: {
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice
    },
    notes: {
      customerNote: notes || ''
    },
    whatsappMessage,
    orderStatus: 'pending'
  });

  // Send email notifications
  const customerEmail = req.user?.email || order.shippingAddress.email;
  if (customerEmail) {
    try {
      await sendEmail({
        email: customerEmail,
        subject: `✨ Order Confirmed! - ${order.orderId}`,
        html: emailTemplates.orderConfirmation(order)
      });
    } catch (emailError) {
      console.error('Customer email notification failed:', emailError);
    }
  }

  // Notify Admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'shazyboo.info@gmail.com';
  if (adminEmail) {
    try {
      await sendEmail({
        email: adminEmail,
        subject: `🛍️ New Order Received! - ${order.orderId}`,
        html: emailTemplates.adminOrderNotification(order)
      });
    } catch (adminError) {
      console.error('Admin notification failed:', adminError);
    }
  }

  // WhatsApp number (you can make this configurable)
  const whatsappNumber = '9567161716';

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      _id: order._id,
      orderId: order.orderId,
      isGuestOrder: order.isGuestOrder,
      whatsappMessage,
      whatsappNumber,
      whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
      totalPrice: order.priceSummary.totalPrice
    }
  });
});

// @desc    Get my orders (for logged-in users)
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  // Automatically link orders placed with this email to this user account
  if (req.user && req.user.email) {
    await Order.updateMany(
      { 
        'shippingAddress.email': req.user.email, 
        user: { $in: [null, undefined] } 
      },
      { 
        $set: { 
          user: req.user.id,
          isGuestOrder: false 
        } 
      }
    );
  }

  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('items.product', 'name images');

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get order by ID (for both guest and logged-in users)
// @route   GET /api/orders/:id
// @access  Public (with order ID)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price')
    .populate('user', 'name email');

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Allow access if user is admin, order owner, or guest order
  if (req.user) {
    if (order.user?._id?.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ErrorResponse('Not authorized to access this order', 401);
    }
  }
  // Guest users can view their order if they have the ID (no additional check needed)

  res.json({
    success: true,
    data: order
  });
});

// @desc    Cancel order (for logged-in users)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Check if user owns order
  if (order.user?.toString() !== req.user.id) {
    throw new ErrorResponse('Not authorized to cancel this order', 401);
  }

  // Check if order can be cancelled
  if (!['pending', 'processing'].includes(order.orderStatus)) {
    throw new ErrorResponse(
      `Order cannot be cancelled in "${order.orderStatus}" status`,
      400
    );
  }

  // Restore product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Check if the item had a specific color
      if (item.selectedColor && product.colors && product.colors.length > 0) {
        const colorInfo = product.colors.find(c => c.name === item.selectedColor);
        if (colorInfo) {
          colorInfo.stock += item.quantity;
          await product.save();
        } else {
          product.stock += item.quantity;
          product.sold = Math.max(0, (product.sold || 0) - item.quantity);
          await product.save();
        }
      } else {
        product.stock += item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save();
      }
    }
  }

  // Update order status
  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();
  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Update order to delivered (admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const deliverOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  if (order.orderStatus !== 'shipped') {
    throw new ErrorResponse('Order must be shipped before delivery', 400);
  }

  order.orderStatus = 'delivered';
  order.deliveredAt = Date.now();
  await order.save();

  // Send delivery confirmation email if user exists
  if (order.user) {
    const user = await User.findById(order.user);
    if (user && user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Order Delivered - ShopEase',
          html: emailTemplates.orderStatusUpdate(order, 'delivered')
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }
  }

  res.json({
    success: true,
    message: 'Order marked as delivered',
    data: order
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Add filter for guest orders if needed
  if (req.query.guestOrders === 'true') {
    queryObj.isGuestOrder = true;
  } else if (req.query.guestOrders === 'false') {
    queryObj.isGuestOrder = false;
  }

  // Filter by color if specified
  if (req.query.color) {
    queryObj['items.selectedColor'] = { $regex: req.query.color, $options: 'i' };
  }

  let query = Order.find(queryObj)
    .populate('user', 'name email')
    .sort('-createdAt');

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Order.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  const orders = await query;

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    },
    data: orders
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, notes, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user', 'email name');

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  const validTransitions = {
    pending: ['confirmed', 'processing', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
    refunded: []
  };

  if (status) {
    if (!validTransitions[order.orderStatus]?.includes(status)) {
      throw new ErrorResponse(
        `Cannot change status from "${order.orderStatus}" to "${status}"`,
        400
      );
    }
    order.orderStatus = status;
  }
  
  if (status === 'shipped' && trackingNumber) {
    order.trackingInfo = {
      ...order.trackingInfo,
      trackingNumber,
      shippedDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }
  
  if (status === 'delivered') {
    order.deliveredAt = Date.now();
    if (order.trackingInfo) {
      order.trackingInfo.deliveredDate = new Date();
    }
  }
  
  if (status === 'cancelled') {
    order.cancelledAt = Date.now();
    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.selectedColor && product.colors && product.colors.length > 0) {
          const colorInfo = product.colors.find(c => c.name === item.selectedColor);
          if (colorInfo) {
            colorInfo.stock += item.quantity;
          }
        } else {
          product.stock += item.quantity;
        }
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save();
      }
    }
  }

  if (notes) {
    order.notes.adminNote = notes;
  }

  if (paymentStatus) {
    if (!order.paymentInfo) {
      order.paymentInfo = {};
    }
    order.paymentInfo.status = paymentStatus;
    if (paymentStatus === 'completed' && !order.paymentInfo.paymentDate) {
      order.paymentInfo.paymentDate = new Date();
    }
  }

  await order.save();

  // Send email notification
  const recipientEmail = order.user?.email || order.shippingAddress?.email;
  if (recipientEmail) {
    try {
      await sendEmail({
        email: recipientEmail,
        subject: `Order #${order.orderId} Status: ${status || order.orderStatus}`,
        html: emailTemplates.orderStatusUpdate(order, status || order.orderStatus)
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
  }

  // Generate WhatsApp Status URL
  const customerPhone = order.shippingAddress?.phone;
  let whatsappStatusUrl = null;
  if (customerPhone) {
    const statusMsg = `Hello ${order.shippingAddress.fullName},\n\nYour order #${order.orderId} status has been updated to: *${(status || order.orderStatus).toUpperCase()}*.\n\nThank you for shopping with ShazyBoo! 🎀`;
    whatsappStatusUrl = `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(statusMsg)}`;
  }

  res.json({
    success: true,
    message: `Order status updated to "${status || order.orderStatus}"`,
    data: order,
    whatsappStatusUrl
  });
});

// @desc    Process refund (admin)
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  if (order.orderStatus !== 'delivered') {
    throw new ErrorResponse('Only delivered orders can be refunded', 400);
  }

  order.orderStatus = 'refunded';
  order.paymentInfo.status = 'refunded';
  await order.save();

  // Send refund confirmation email if user exists
  if (order.user) {
    const user = await User.findById(order.user);
    if (user && user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Order Refund Processed - ShopEase',
          html: emailTemplates.orderStatusUpdate(order, 'refunded')
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }
  }

  res.json({
    success: true,
    message: 'Refund marked as processed',
    data: order
  });
});

// @desc    Get sales statistics (admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getSalesStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, includeGuestOrders = 'true' } = req.query;

  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Option to exclude guest orders from stats
  if (includeGuestOrders === 'false') {
    matchStage.isGuestOrder = false;
  }

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$priceSummary.totalPrice' },
        averageOrderValue: { $avg: '$priceSummary.totalPrice' },
        guestOrders: { $sum: { $cond: ['$isGuestOrder', 1, 0] } },
        registeredOrders: { $sum: { $cond: ['$isGuestOrder', 0, 1] } }
      }
    }
  ]);

  const statusStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        revenue: { $sum: '$priceSummary.totalPrice' }
      }
    }
  ]);

  // Color popularity statistics
  const colorStats = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.selectedColor': { $ne: null } } },
    {
      $group: {
        _id: '$items.selectedColor',
        count: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        orderStatus: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$priceSummary.totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        guestOrders: 0,
        registeredOrders: 0
      },
      statusStats,
      colorStats,
      dailySales
    }
  });
});

// @desc    Update order tracking information (admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  order.trackingInfo = {
    ...order.trackingInfo,
    trackingNumber,
    carrier,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
  };

  if (order.orderStatus === 'processing' && trackingNumber) {
    order.orderStatus = 'shipped';
    order.trackingInfo.shippedDate = new Date();
  }

  await order.save();

  // Send shipping confirmation email if user exists
  if (order.user) {
    const user = await User.findById(order.user);
    if (user && user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Order Has Been Shipped! - ShopEase',
          html: emailTemplates.orderStatusUpdate(order, 'shipped')
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }
  }

  res.json({
    success: true,
    message: 'Tracking information updated',
    data: order
  });
});

// @desc    Get orders by color (admin)
// @route   GET /api/orders/by-color/:color
// @access  Private/Admin
export const getOrdersByColor = asyncHandler(async (req, res) => {
  const { color } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const query = {
    'items.selectedColor': { $regex: color, $options: 'i' }
  };

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    },
    data: orders
  });
});

// @desc    Get order statistics by color (admin)
// @route   GET /api/orders/color-stats
// @access  Private/Admin
export const getColorOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const colorStats = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.selectedColor': { $ne: null } } },
    {
      $group: {
        _id: {
          color: '$items.selectedColor',
          colorCode: '$items.selectedColorCode'
        },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        color: '$_id.color',
        colorCode: '$_id.colorCode',
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: { $size: '$orderCount' }
      }
    },
    { $sort: { totalQuantity: -1 } }
  ]);

  res.json({
    success: true,
    data: colorStats
  });
});

export default {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  deliverOrder,
  getOrders,
  updateOrderStatus,
  processRefund,
  getSalesStats,
  updateOrderTracking,
  getOrdersByColor,
  getColorOrderStats
};