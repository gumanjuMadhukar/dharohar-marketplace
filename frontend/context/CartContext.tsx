"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("dharohar_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("dharohar_cart", JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      const updated = items.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
      saveCart(updated);
    } else {
      saveCart([...items, { id: product.id, product, quantity }]);
    }
  };

  const removeFromCart = (productId: number) => {
    saveCart(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(
        items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

