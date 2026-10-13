import { useState, useEffect, useCallback } from 'react';
import { getProducts, getInitialProductsFast } from '../services/productService';

export function useProducts() {
  const [products, setProducts] = useState(() => getInitialProductsFast());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts,
  };
}
