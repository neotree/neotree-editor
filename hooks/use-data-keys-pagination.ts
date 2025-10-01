import { useState, useCallback } from 'react';

export function useDataKeysPagination() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const updatePaginationMeta = useCallback((meta: { total: number; totalPages: number }) => {
    setTotal(meta.total);
    setTotalPages(meta.totalPages);
  }, []);

  return {
    page,
    limit,
    totalPages,
    total,
    handlePageChange,
    handleLimitChange,
    updatePaginationMeta,
  };
}