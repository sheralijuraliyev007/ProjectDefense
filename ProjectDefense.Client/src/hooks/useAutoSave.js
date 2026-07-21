import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useAutoSave(saveFn, data, options = {}) {
  const { delay = 7000, version = 0, enabled = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [conflict, setConflict] = useState(null);

  const currentVersion = useRef(version);
  const saveFnRef = useRef(saveFn);
  const isFirstRun = useRef(true);
  const lastSavedDataRef = useRef(data);

  useEffect(() => { saveFnRef.current = saveFn; }, [saveFn]);
  useEffect(() => { currentVersion.current = version; }, [version]);

  const debouncedData = useDebounce(data, delay);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      lastSavedDataRef.current = debouncedData;
      return;
    }
    if (!enabled) return;
    if (debouncedData === lastSavedDataRef.current) return;

    let cancelled = false;
    const doSave = async () => {
      setIsSaving(true);
      setConflict(null);
      try {
        const result = await saveFnRef.current(debouncedData, currentVersion.current);
        if (cancelled) return;
        currentVersion.current = result.newVersion;
        lastSavedDataRef.current = debouncedData;
        setLastSaved(new Date());
      } catch (error) {
        if (cancelled) return;
        if (error.response?.status === 409) {
          setConflict(error.response.data);
        }
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    };
    doSave();

    return () => { cancelled = true; };
  }, [debouncedData, enabled]);

  const resolveConflict = useCallback((resolution, serverData) => {
    if (resolution === 'theirs' && serverData) {
      currentVersion.current = serverData.version;
      lastSavedDataRef.current = serverData;
    }
    setConflict(null);
  }, []);

  return { isSaving, lastSaved, conflict, resolveConflict };
}