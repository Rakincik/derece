'use client';

import { useEffect, useRef } from 'react';
import useCartStore from '@/store/cartStore';

export default function CartSync() {
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    // Debounce the sync to avoid spamming the server on rapid cart changes
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          items: items.map(item => ({
            id: item.id,
            title: item.title || item.name,
            price: item.price,
            discountedPrice: item.discountedPrice,
            quantity: item.quantity,
            coverImage: item.coverImage || item.cover
          })),
          subtotal: getSubtotal()
        };

        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    }, 1500); // 1.5s debounce

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, getSubtotal]);

  // This is a headless component, it renders nothing
  return null;
}
