import { useState, useCallback } from 'react';

export default function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const reset = useCallback(() => setPage(1), []);

  return { page, limit, meta, setMeta, setPage, reset };
}
