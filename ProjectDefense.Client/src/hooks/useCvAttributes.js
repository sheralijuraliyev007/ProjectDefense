import { useState, useEffect, useCallback, useRef } from 'react';
import cvApi from '../api/cvApi';
import { buildValuePayload } from './useProfileAttributes';
import userAttributeApi from '../api/userAttributeApi';

const AUTO_SAVE_INTERVAL_MS = 7000;

export function useCvAttributes(cvId) {
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  const [conflictIds, setConflictIds] = useState(new Set());
  const dirtyRef = useRef(new Map());

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cvApi.getAttributes(cvId);
      setAttributes(res.data.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [cvId]);

  useEffect(() => { load(); }, [load]);

  const markDirty = useCallback((attr, rawValue) => {
    dirtyRef.current.set(attr.attributeId, { attr, rawValue });
    setConflictIds((prev) => {
      if (!prev.has(attr.attributeId)) return prev;
      const next = new Set(prev);
      next.delete(attr.attributeId);
      return next;
    });
  }, []);

  const getPendingValue = useCallback((attributeId) => dirtyRef.current.get(attributeId)?.rawValue, []);

  const flushDirty = useCallback(async () => {
    if (dirtyRef.current.size === 0) return;
    const entries = Array.from(dirtyRef.current.entries());
    dirtyRef.current.clear();

    for (const [attributeId, { attr, rawValue }] of entries) {
      setSavingIds((prev) => new Set(prev).add(attributeId));
      try {
        const payload = buildValuePayload(attributeId, attr.dtypeCode, rawValue, attr.version);
        await userAttributeApi.setValue(payload);
      } catch (err) {
        if (err.response?.status === 409) {
          setConflictIds((prev) => new Set(prev).add(attributeId));
        }
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(attributeId);
          return next;
        });
      }
    }
    await load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(flushDirty, AUTO_SAVE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      flushDirty();
    };
  }, [flushDirty]);

  return { attributes, isLoading, savingIds, conflictIds, markDirty, getPendingValue };
}