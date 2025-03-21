import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [subtotal, setSubtotal] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [total, setTotal] = useState(0);
  const delivery_fee = 10.0;
  const currency = "$";

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("addresses");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    const saved = localStorage.getItem("selectedAddress");
    return saved ? JSON.parse(saved) : null;
  });
// Inside ShopContextProvider
const addAddress = (newAddress) => {
  const updated = [...addresses, newAddress];
  setAddresses(updated);
  localStorage.setItem("addresses", JSON.stringify(updated));
};

const updateAddress = (index, updatedAddress) => {
  const updated = [...addresses];
  updated[index] = updatedAddress;
  setAddresses(updated);
  localStorage.setItem("addresses", JSON.stringify(updated));
};

const deleteAddress = (index) => {
  const updated = addresses.filter((_, i) => i !== index);
  setAddresses(updated);
  localStorage.setItem("addresses", JSON.stringify(updated));
};

const selectAddress = (addr) => {
  setSelectedAddress(addr);
  localStorage.setItem("selectedAddress", JSON.stringify(addr));
};

  const [search, setSearch] = useState("");

  axios.defaults.withCredentials = true;

  // 📦 Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all");
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  // 🛒 Fetch Cart
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cart");
      const items = {};

      res.data.forEach(({ product, size, quantity }) => {
        if (!items[product]) items[product] = {};
        items[product][size] = quantity;
      });

      setCartItems(items);
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  // 🔁 Sync cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  // 🔢 Auto-calculate totals
  useEffect(() => {
    let newSubtotal = 0;
    let newTotalCount = 0;

    Object.entries(cartItems).forEach(([productId, sizeMap]) => {
      const product = products.find((p) => p._id === productId);
      if (!product) return;

      Object.entries(sizeMap).forEach(([size, qty]) => {
        newSubtotal += product.price * qty;
        newTotalCount += qty;
      });
    });

    setSubtotal(newSubtotal);
    setTotalCount(newTotalCount);
    setTotal(newSubtotal + delivery_fee);
  }, [cartItems, products]);

  // 🔐 Auth
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Logged in successfully!");
  };

  const logout = () => {
    setUser(null);
    setCartItems({});
    localStorage.removeItem("user");
    toast.info("Logged out!");
  };

  // ➕ Cart Actions
  const addToCart = async (productId, size) => {
    try {
      await axios.post("http://localhost:5000/api/cart/add", { productId, size });
      fetchCart();
      toast.success("Item added to cart");
    } catch (err) {
      console.error("Error adding to cart", err);
      toast.error("Failed to add item");
    }
  };

  const updateQuantity = async (productId, size, newQty) => {
    try {
      await axios.put("http://localhost:5000/api/cart/update", {
        productId,
        size,
        quantity: newQty,
      });
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId,size) => {
    try {
      await axios.delete("http://localhost:5000/api/cart/remove", {
        data: { productId, size },
      });

     
     await fetchCart();
      toast.success("Item removed");
    } catch (err) {
      console.error("Error removing item", err);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:5000/api/cart/clear");
      setCartItems({});
      toast.info("Cart cleared");
    } catch (err) {
      console.error("Error clearing cart", err);
      toast.error("Failed to clear cart");
    }
  };
  const [lastOrder, setLastOrder] = useState(null);

  const getSingleProduct = async (productId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/products/getsingle', {
        productId,
      });
      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };
  
  
  const getUserOrders = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  };

  
  return (
    <ShopContext.Provider
      value={{
        products,
        getSingleProduct,
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        user,
        login,
        logout,
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        subtotal,
        totalCount,
        total,
        delivery_fee,
        currency,
        search,
        setSearch,
        fetchCart,

        addAddress,
        updateAddress,
        deleteAddress,
        selectAddress,
        lastOrder,
        setLastOrder,

        getUserOrders,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
  
};

export default ShopContextProvider;
