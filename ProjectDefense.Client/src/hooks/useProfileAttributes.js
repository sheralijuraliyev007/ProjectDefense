import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import cvApi from '../api/cvApi';
import attributeApi from '../api/attributeApi';
import contentApi from '../api/contentApi';
import { DTYPE, buildValuePayload } from './useProfileAttributes';
import userAttributeApi from '../api/userAttributeApi';

const AUTO_SAVE_INTERVAL_MS = 7000;

export function useCvAttributes(cvId) {
  const [attributes, setAttributes] = useState([]);
  const [attributeMeta, setAttributeMeta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  const [conflictIds, setConflictIds] = useState(new Set());
  const [imageErrors, setImageErrors] = useState({});
  const dirtyRef = useRef(new Map());

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cvApi.getAttributes(cvId);
      const rows = res.data.data ?? [];
      setAttributes(rows);

      const ids = rows.map((a) => a.attributeId);
      if (ids.length > 0) {
        const metaRes = await attributeApi.getByIds(ids);
        setAttributeMeta(metaRes.data.data ?? []);
      } else {
        setAttributeMeta([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cvId]);

  useEffect(() => { load(); }, [load]);

  const attributeMetaById = useMemo(() => {
    const map = new Map();
    attributeMeta.forEach((a) => map.set(a.id, a));
    return map;
  }, [attributeMeta]);

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
      await userAttributeApi.setValue(payload);
      await load();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictIds((prev) => new Set(prev).add(attributeId));
        await load();
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
  }, [load]);

  return {
    attributes,
    attributeMetaById,
    isLoading,
    savingIds,
    conflictIds,
    imageErrors,
    markDirty,
    getPendingValue,
    uploadImage,
  };
}