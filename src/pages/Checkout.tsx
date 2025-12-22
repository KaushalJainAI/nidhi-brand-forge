// // OrderCheckout.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const OrderCheckout = () => {
//   const [orderData, setOrderData] = useState({
//     shipping_address: '',
//     phone_number: '',
//     payment_method: 'COD',
//   });
//   const [couponCode, setCouponCode] = useState('');
//   const [cart, setCart] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const fetchCart = async () => {
//     try {
//       const response = await axios.get('/api/cart/', {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       setCart(response.data);
//     } catch (err) {
//       console.error('Error fetching cart:', err);
//       setError('Failed to load cart');
//     }
//   };

//   // Frontend calculation for display (backend will re-validate)
//   const calculateOrderSummary = () => {
//     if (!cart) return null;

//     const subtotal = cart.total_price;
    
//     // Note: This is just for display - backend will validate
//     // You can add client-side coupon preview logic here if needed
//     const discount = 0; // Frontend doesn't apply discount, just shows cart total
//     const discountedSubtotal = subtotal - discount;
//     const shipping = discountedSubtotal >= 500 ? 0 : 50;
//     const tax = (discountedSubtotal * 0.05).toFixed(2);
//     const total = (discountedSubtotal + shipping + parseFloat(tax)).toFixed(2);

//     return {
//       subtotal: subtotal.toFixed(2),
//       discount: discount.toFixed(2),
//       shipping: shipping.toFixed(2),
//       tax,
//       total,
//     };
//   };

//   const handlePlaceOrder = async () => {
//     // Validate form
//     if (!orderData.shipping_address || !orderData.phone_number) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     if (!cart || !cart.items || cart.items.length === 0) {
//       setError('Your cart is empty');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Prepare request data
//       const requestData = {
//         shipping_address: orderData.shipping_address,
//         phone_number: orderData.phone_number,
//         payment_method: orderData.payment_method,
//       };

//       // Add coupon code if provided
//       if (couponCode.trim()) {
//         requestData.coupon_code = couponCode.trim().toUpperCase();
//       }

//       // Place order - backend will validate everything
//       const response = await axios.post(
//         '/api/orders/',
//         requestData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       // Success
//       alert(`Order placed successfully! Order ID: ${response.data.id}`);
//       window.location.href = `/orders/${response.data.id}`;
      
//     } catch (err) {
//       // Handle errors from backend validation
//       const errorMessage = err.response?.data?.error || 
//                           err.response?.data?.message || 
//                           'Failed to place order. Please try again.';
//       setError(errorMessage);
      
//       console.error('Order creation failed:', err.response?.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const summary = calculateOrderSummary();

//   return (
//     <div className="order-checkout">
//       <h2>Checkout</h2>

//       {error && (
//         <div className="error-banner">
//           <p>{error}</p>
//         </div>
//       )}

//       {/* Shipping Details */}
//       <div className="order-form">
//         <h3>Shipping Details</h3>
//         <textarea
//           placeholder="Complete Shipping Address"
//           value={orderData.shipping_address}
//           onChange={(e) =>
//             setOrderData({ ...orderData, shipping_address: e.target.value })
//           }
//           rows="4"
//           required
//         />
//         <input
//           type="tel"
//           placeholder="Phone Number"
//           value={orderData.phone_number}
//           onChange={(e) =>
//             setOrderData({ ...orderData, phone_number: e.target.value })
//           }
//           required
//         />
//         <select
//           value={orderData.payment_method}
//           onChange={(e) =>
//             setOrderData({ ...orderData, payment_method: e.target.value })
//           }
//         >
//           <option value="COD">Cash on Delivery</option>
//           <option value="ONLINE">Online Payment</option>
//         </select>
//       </div>

//       {/* Coupon Code */}
//       <div className="coupon-section">
//         <h3>Have a Coupon Code?</h3>
//         <input
//           type="text"
//           placeholder="Enter coupon code (optional)"
//           value={couponCode}
//           onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//           maxLength="50"
//         />
//         <p className="coupon-note">
//           * Coupon will be validated when you place the order
//         </p>
//       </div>

//       {/* Order Summary */}
//       <div className="order-summary">
//         <h3>Order Summary</h3>
//         {summary && (
//           <>
//             <div className="summary-row">
//               <span>Subtotal:</span>
//               <span>₹{summary.subtotal}</span>
//             </div>
//             <div className="summary-row">
//               <span>Shipping:</span>
//               <span>₹{summary.shipping}</span>
//             </div>
//             <div className="summary-row">
//               <span>Tax (5%):</span>
//               <span>₹{summary.tax}</span>
//             </div>
//             <div className="summary-row total">
//               <span><strong>Estimated Total:</strong></span>
//               <span><strong>₹{summary.total}</strong></span>
//             </div>
//             {couponCode && (
//               <p className="discount-note">
//                 * Final amount may be lower if coupon is valid
//               </p>
//             )}
//           </>
//         )}
//       </div>

//       {/* Cart Items Preview */}
//       <div className="cart-items-preview">
//         <h3>Items in Cart ({cart?.items?.length || 0})</h3>
//         {cart?.items?.map((item) => (
//           <div key={item.id} className="cart-item">
//             <span>{item.product.name}</span>
//             <span>Qty: {item.quantity}</span>
//             <span>₹{(item.product.final_price * item.quantity).toFixed(2)}</span>
//           </div>
//         ))}
//       </div>

//       <button
//         className="place-order-btn"
//         onClick={handlePlaceOrder}
//         disabled={loading || !cart?.items?.length}
//       >
//         {loading ? 'Placing Order...' : 'Place Order'}
//       </button>
//     </div>
//   );
// };

// export default OrderCheckout;
