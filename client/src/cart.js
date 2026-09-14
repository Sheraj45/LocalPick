const CART_KEY = "localPickCart";

const notifyCartUpdated = () => {
  window.dispatchEvent(new Event("localPickCartUpdated"));
};

export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);

    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Failed to read cart:", error);

    return [];
  }
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartUpdated();
};

export const addToCart = (product) => {
  const cart = getCart();

  const existingItem = cart.find((item) => item.productId === product._id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      capacity: product.capacity,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart(cart);

  return cart;
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();

  const item = cart.find((item) => item.productId === productId);

  if (!item) {
    return cart;
  }

  if (quantity <= 0) {
    const updatedCart = cart.filter((item) => item.productId !== productId);

    saveCart(updatedCart);

    return updatedCart;
  }

  item.quantity = quantity;

  saveCart(cart);

  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart();

  const updatedCart = cart.filter((item) => item.productId !== productId);

  saveCart(updatedCart);

  return updatedCart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  notifyCartUpdated();
};

export const getCartItemCount = () => {
  const cart = getCart();

  return cart.reduce((total, item) => total + item.quantity, 0);
};
