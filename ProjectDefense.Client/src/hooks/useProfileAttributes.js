import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import userAttributeApi from '../api/userAttributeApi';
import attributeApi from '../api/attributeApi';
import contentApi from '../api/contentApi';

export const DTYPE = {
  STRING: 1, TEXT: 2, IMAGE: 3, NUMERIC: 4, DATE: 5, PERIOD: 6, BOOLEAN: 7, ONE_OF_MANY: 8,
};

const AUTO_SAVE_INTERVAL_MS = 7000; 

function buildValuePayload(attributeId, dtypeCode, rawValue, version) {
  const base = { attributeId, version };
  switch (dtypeCode) {
    case DTYPE.STRING:
    case DTYPE.TEXT:
      return { ...base, valueGeneric: rawValue };
    case DTYPE.NUMERIC:
      return { ...base, valueNumeric: rawValue === '' ? null : Number(rawValue) };
    case DTYPE.DATE:
      return { ...base, valueDate: rawValue || null };
    case DTYPE.BOOLEAN:
      return { ...base, valueBoolean: !!rawValue };
    case DTYPE.PERIOD:
      return { ...base, valuePeriodStart: rawValue?.start || null, valuePeriodEnd: rawValue?.end || null };
    case DTYPE.ONE_OF_MANY:
      return { ...base, valueOptionId: rawValue ? Number(rawValue) : null };
    case DTYPE.IMAGE:
      return { ...base, valueContentId: rawValue ? Number(rawValue) : null };
    default:
      return base;
  }
}

export function readValue(attr) {
  switch (attr.dtypeCode) {
    case DTYPE.STRING:
    case DTYPE.TEXT:
      return attr.valueGeneric ?? '';
    case DTYPE.NUMERIC:
      return attr.valueNumeric ?? '';
    case DTYPE.DATE:
      return attr.valueDate ? attr.valueDate.slice(0, 10) : '';
    case DTYPE.PERIOD:
      return {
        start: attr.valuePeriodStart ? attr.valuePeriodStart.slice(0, 10) : '',
        end: attr.valuePeriodEnd ? attr.valuePeriodEnd.slice(0, 10) : '',
      };
    case DTYPE.BOOLEAN:
      return !!attr.valueBoolean;
    case DTYPE.ONE_OF_MANY:
      return attr.valueOptionId ?? '';
    case DTYPE.IMAGE:
      return attr.valueContentId ?? '';
    default:
      return '';
  }
}

export function useProfileAttributes(targetUserId) {
  const [myAttributes, setMyAttributes] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  const [conflictIds, setConflictIds] = useState(new Set());
  const [imageErrors, setImageErrors] = useState({});

  const dirtyRef = useRef(new Map());

  const loadMyAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userAttributeApi.getMine(targetUserId);
      setMyAttributes(res.data.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  const loadAvailableAttributes = useCallback(async () => {
    const res = await attributeApi.search({ page: 1, pageSize: 200 });
    setAvailableAttributes(res.data.data?.rows ?? []);
  }, []);

  useEffect(() => {
    loadMyAttributes();
    loadAvailableAttributes();
  }, [loadMyAttributes, loadAvailableAttributes]);

  const meAttributes = useMemo(() => myAttributes.filter((a) => !a.isRemovable), [myAttributes]);
  const infoAttributes = useMemo(() => myAttributes.filter((a) => a.isRemovable), [myAttributes]);
  const addableAttributes = useMemo(
    () => availableAttributes.filter((a) => !myAttributes.some((m) => m.attributeId === a.id)),
    [availableAttributes, myAttributes]
  );
  const attributeMetaById = useMemo(() => {
    const map = new Map();
    availableAttributes.forEach((a) => map.set(a.id, a));
    return map;
  }, [availableAttributes]);

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
        await userAttributeApi.setValue(payload, targetUserId);
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
    await loadMyAttributes();
  }, [loadMyAttributes, targetUserId]);

  useEffect(() => {
    const id = setInterval(flushDirty, AUTO_SAVE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      flushDirty(); 
    };
  }, [flushDirty]);

  const addAttribute = useCallback(async (attributeIdStr) => {
    const attributeId = Number(attributeIdStr);
    if (!attributeId) return;
    await userAttributeApi.add(attributeId, targetUserId);
    await loadMyAttributes();
  }, [targetUserId, loadMyAttributes]);

  const removeAttributes = useCallback(async (attributeIds) => {
    await Promise.all(attributeIds.map((id) => userAttributeApi.remove(id, targetUserId)));
    await loadMyAttributes();
  }, [targetUserId, loadMyAttributes]);

  const uploadImage = useCallback(async (attr, file) => {
    if (!file) return;
    const attributeId = attr.attributeId;
    setImageErrors((prev) => ({ ...prev, [attributeId]: null }));
    setSavingIds((prev) => new Set(prev).add(attributeId));

    try {
      const sigRes = await contentApi.getUploadSignature();
      const sig = sigRes.data.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      if (sig.folder) formData.append('folder', sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!uploadRes.ok) throw new Error('Upload to storage provider failed.');
      const uploadJson = await uploadRes.json();

      const confirmRes = await contentApi.confirmUpload({
        publicId: uploadJson.public_id,
        originalFilename: file.name,
        mimeType: file.type,
      });
      const content = confirmRes.data.data;

      const payload = buildValuePayload(attributeId, DTYPE.IMAGE, content.id, attr.version);
      await userAttributeApi.setValue(payload, targetUserId);
      await loadMyAttributes();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictIds((prev) => new Set(prev).add(attributeId));
        await loadMyAttributes();
      } else {
        setImageErrors((prev) => ({ ...prev, [attributeId]: err.message || 'Could not upload image.' }));
      }
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      });
    }
  }, [targetUserId, loadMyAttributes]);

  return {
    isLoading,
    meAttributes,
    infoAttributes,
    addableAttributes,
    attributeMetaById,
    savingIds,
    conflictIds,
    imageErrors,
    markDirty,
    getPendingValue,
    addAttribute,
    removeAttributes,
    uploadImage,
  };
}