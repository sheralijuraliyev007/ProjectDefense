import { useState, useEffect } from 'react';
import lookupApi from '../api/lookupApi';

function findByNameKeyword(rows, keyword) {
  return rows.find((r) => r.name?.toLowerCase().includes(keyword));
}

export function useCvStatusCodes() {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    lookupApi.cvStatuses().then((res) => setStatuses(res.data.data ?? []));
  }, []);

  return {
    draft: findByNameKeyword(statuses, 'draft')?.code,
    published: findByNameKeyword(statuses, 'published')?.code,
    statuses,
  };
}