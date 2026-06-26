import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: '',
      couponDiscount: 0,
      couponDiscountType: 'PERCENTAGE', // PERCENTAGE or FIXED
      couponProductIds: [],

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }],
            isOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        const remainingItems = get().items.filter(item => item.id !== productId);
        set({ items: remainingItems });
        
        // If the coupon was restricted to certain products, check if any matching products are still in the cart
        const restrictedIds = get().couponProductIds;
        if (restrictedIds && restrictedIds.length > 0) {
          const hasRestrictedProductLeft = remainingItems.some(item => restrictedIds.includes(item.id));
          if (!hasRestrictedProductLeft) {
            get().removeCoupon();
          }
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], couponCode: '', couponDiscount: 0, couponDiscountType: 'PERCENTAGE', couponProductIds: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      applyCoupon: async (code) => {
        if (!code.trim()) return { success: false, message: 'Lütfen bir kod girin.' };
        
        try {
          const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
          const data = await res.json();
 
          if (res.ok) {
            // Check if restricted to specific products
            if (data.coupon.productIds && data.coupon.productIds.length > 0) {
              const items = get().items;
              const hasMatchingProduct = items.some(item => data.coupon.productIds.includes(item.id));
              if (!hasMatchingProduct) {
                const titles = data.coupon.restrictedProducts ? data.coupon.restrictedProducts.map(p => p.title).join(', ') : 'seçili ürünler';
                return { 
                  success: false, 
                  message: `Bu kupon sadece şu ürün(ler) için geçerlidir: ${titles}.` 
                };
              }
            }
 
            set({ 
              couponCode: data.coupon.code, 
              couponDiscount: data.coupon.discountValue,
              couponDiscountType: data.coupon.discountType,
              couponProductIds: data.coupon.productIds || []
            });
 
            const msg = data.coupon.discountType === 'PERCENTAGE'
              ? `%${data.coupon.discountValue} indirim uygulandı!`
              : `${data.coupon.discountValue} ₺ indirim uygulandı!`;
 
            return { success: true, message: msg };
          } else {
            return { success: false, message: data.error || 'Geçersiz kupon kodu.' };
          }
        } catch (error) {
          console.error('Kupon API hatası:', error);
          return { success: false, message: 'Kupon doğrulanırken hata oluştu.' };
        }
      },

      removeCoupon: () => {
        set({ couponCode: '', couponDiscount: 0, couponDiscountType: 'PERCENTAGE', couponProductIds: [] });
      },
 
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountedPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
 
      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const restrictedIds = get().couponProductIds;
 
        if (restrictedIds && restrictedIds.length > 0) {
          // Product-specific coupon: calculate discount ONLY for target matching products in cart
          const items = get().items;
          const matchingItems = items.filter(item => restrictedIds.includes(item.id));
          if (matchingItems.length === 0) return 0;
 
          const targetSubtotal = matchingItems.reduce((sum, item) => {
            const itemPrice = item.discountedPrice || item.price;
            return sum + itemPrice * item.quantity;
          }, 0);
 
          if (get().couponDiscountType === 'PERCENTAGE') {
            return (targetSubtotal * get().couponDiscount) / 100;
          } else {
            return Math.min(get().couponDiscount, targetSubtotal);
          }
        }
 
        // Global coupon
        if (get().couponDiscountType === 'PERCENTAGE') {
          return (subtotal * get().couponDiscount) / 100;
        } else {
          // Sabit TL indirimi toplam sepet tutarını aşamaz
          return Math.min(get().couponDiscount, subtotal);
        }
      },

      getTotal: () => {
        return Math.max(0, get().getSubtotal() - get().getDiscount());
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'dereceuzem-cart',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        couponDiscountType: state.couponDiscountType,
        couponProductIds: state.couponProductIds,
      }),
    }
  )
);

export default useCartStore;
