import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Card, CardBody, Input, Chip, Spinner, Button } from '@heroui/react';
import { UserIcon, InformationCircleIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import userAttributeApi from '../../api/userAttributeApi';
import attributeApi from '../../api/attributeApi';
import contentApi from '../../api/contentApi';

const DTYPE = {
  STRING: 1, TEXT: 2, IMAGE: 3, NUMERIC: 4, DATE: 5, PERIOD: 6, BOOLEAN: 7, ONE_OF_MANY: 8,
};

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

function readValue(attr) {
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

const AUTO_SAVE_INTERVAL_MS = 7000; // within the 5-10s window required by spec

const ConflictNote = () => (
  <p className="text-warning text-xs mt-1">This was changed elsewhere — refreshed from server.</p>
);

export default function ProfilePage() {
  const { userId: targetUserId } = useParams(); // undefined on /profile, set on /admin/users/:userId/profile

  const [activeTab, setActiveTab] = useState('me');
  const [myAttributes, setMyAttributes] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  const [conflictIds, setConflictIds] = useState(new Set());
  const [selectedAttrKeys, setSelectedAttrKeys] = useState(new Set());
  const [imageErrors, setImageErrors] = useState({}); // attributeId -> error message


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

  // Quick lookup: attributeId -> full attribute metadata (incl. options for One-of-Many)
  const attributeMetaById = useMemo(() => {
    const map = new Map();
    availableAttributes.forEach((a) => map.set(a.id, a));
    return map;
  }, [availableAttributes]);

  // Records a local edit; nothing is sent to the server until the next auto-save tick.
  const markDirty = useCallback((attr, rawValue) => {
    dirtyRef.current.set(attr.attributeId, { attr, rawValue });
    setConflictIds((prev) => {
      if (!prev.has(attr.attributeId)) return prev;
      const next = new Set(prev);
      next.delete(attr.attributeId);
      return next;
    });
  }, []);

  // Sends all pending edits, handles per-field 409 conflicts, then refreshes from server.
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
    await loadMyAttributes(); // pulls fresh values + current versions
  }, [loadMyAttributes, targetUserId]);

  useEffect(() => {
    const id = setInterval(flushDirty, AUTO_SAVE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      flushDirty(); // save any pending edits on unmount / tab switch away
    };
  }, [flushDirty]);

  const handleAddAttribute = async (attributeIdStr) => {
    const attributeId = Number(attributeIdStr);
    if (!attributeId) return;
    await userAttributeApi.add(attributeId, targetUserId);
    await loadMyAttributes();
  };

  const handleRemoveSelected = async () => {
    const ids = Array.from(selectedAttrKeys).map(Number);
    await Promise.all(ids.map((id) => userAttributeApi.remove(id, targetUserId)));
    setSelectedAttrKeys(new Set());
    await loadMyAttributes();
  };

  // Image upload is a discrete action (not continuous typing), so it saves immediately
  // rather than going through the dirty/auto-save batching used for text/number fields.
  const handleImageUpload = async (attr, file) => {
    if (!file) return;
    const attributeId = attr.attributeId;
    setImageErrors((prev) => ({ ...prev, [attributeId]: null }));
    setSavingIds((prev) => new Set(prev).add(attributeId));

    try {
      // 1. Ask our backend for a signed upload signature
      const sigRes = await contentApi.getUploadSignature();
      const sig = sigRes.data.data; // { signature, timestamp, apiKey, cloudName, folder }

      // 2. Upload the file directly to the cloud provider
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
      const uploadJson = await uploadRes.json(); // { public_id, secure_url, ... }

      // 3. Confirm with our backend so it persists a Content record
      const confirmRes = await contentApi.confirmUpload({
        publicId: uploadJson.public_id,
        originalFilename: file.name,
        mimeType: file.type,
      });
      const content = confirmRes.data.data; // ContentDto { id, secureUrl, width, height, sizeBytes }

      // 4. Immediately persist the value on this attribute (with optimistic-lock version)
      const payload = buildValuePayload(attributeId, DTYPE.IMAGE, content.id, attr.version);
      await userAttributeApi.setValue(payload, targetUserId);
      await loadMyAttributes();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictIds((prev) => new Set(prev).add(attributeId));
        await loadMyAttributes();
      } else {
        setImageErrors((prev) => ({
          ...prev,
          [attributeId]: err.message || 'Could not upload image.',
        }));
      }
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      });
    }
  };

  const renderValueInput = (attr) => {
    const currentValue = readValue(attr);
    const isSaving = savingIds.has(attr.attributeId);
    const hasConflict = conflictIds.has(attr.attributeId);
    const inputClasses = "border border-default-300 bg-content1 rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";

    switch (attr.dtypeCode) {
      case DTYPE.BOOLEAN:
        return (
          <div>
            <label className="flex items-center gap-2 border border-default-300 bg-content1 rounded-lg px-3 py-2 w-fit cursor-pointer hover:border-primary/50">
              <input
                type="checkbox"
                key={`${attr.attributeId}-${attr.version}`}
                defaultChecked={currentValue}
                onChange={(e) => markDirty(attr, e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">{currentValue ? 'Yes' : 'No'}</span>
              {isSaving && <Spinner size="sm" />}
            </label>
            {hasConflict && <ConflictNote />}
          </div>
        );
      case DTYPE.NUMERIC:
        return (
          <div>
            <Input
              key={`${attr.attributeId}-${attr.version}`}
              type="number"
              size="sm"
              variant="bordered"
              classNames={{ inputWrapper: inputClasses }}
              defaultValue={currentValue}
              onChange={(e) => markDirty(attr, e.target.value)}
              endContent={isSaving && <Spinner size="sm" />}
            />
            {hasConflict && <ConflictNote />}
          </div>
        );
      case DTYPE.DATE:
        return (
          <div>
            <Input
              key={`${attr.attributeId}-${attr.version}`}
              type="date"
              size="sm"
              variant="bordered"
              classNames={{ inputWrapper: inputClasses }}
              defaultValue={currentValue}
              onChange={(e) => markDirty(attr, e.target.value)}
            />
            {hasConflict && <ConflictNote />}
          </div>
        );
      case DTYPE.ONE_OF_MANY: {
        const meta = attributeMetaById.get(attr.attributeId);
        const attrOptions = meta?.options ?? [];
        return (
          <div>
            <select
              key={`${attr.attributeId}-${attr.version}`}
              className="w-full p-2 rounded-lg border border-default-300 bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              defaultValue={currentValue}
              onChange={(e) => markDirty(attr, e.target.value)}
            >
              <option value="">— Select —</option>
              {attrOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {isSaving && <Spinner size="sm" className="mt-1" />}
            {hasConflict && <ConflictNote />}
          </div>
        );
      }
      case DTYPE.IMAGE: {
        const hasImage = !!attr.valueContentId;
        const imgError = imageErrors[attr.attributeId];
        return (
          <div className="space-y-2">
            {hasImage && attr.valueContentUrl && (
              <img
                src={attr.valueContentUrl}
                alt={attr.attributeName}
                className="w-24 h-24 object-cover rounded-lg border border-default-300"
              />
            )}
            <label className="flex items-center gap-2 border-2 border-dashed border-default-300 rounded-lg px-4 py-3 text-center text-default-500 text-sm cursor-pointer hover:border-primary/50 w-fit">
              <PhotoIcon className="w-4 h-4" />
              {hasImage ? 'Replace image' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(attr, e.target.files?.[0])}
              />
              {isSaving && <Spinner size="sm" />}
            </label>
            {imgError && <p className="text-danger text-xs">{imgError}</p>}
            {hasConflict && <ConflictNote />}
          </div>
        );
      }
      case DTYPE.PERIOD: {
  const pending = dirtyRef.current.get(attr.attributeId)?.rawValue;
  const period = pending ?? currentValue; // prefer whatever's already staged, not just server value

  return (
    <div className="flex gap-2 items-center">
      <Input
        key={`${attr.attributeId}-${attr.version}-start`}
        type="date"
        size="sm"
        variant="bordered"
        classNames={{ inputWrapper: inputClasses }}
        defaultValue={period.start}
        onChange={(e) => {
          const latest = dirtyRef.current.get(attr.attributeId)?.rawValue ?? period;
          markDirty(attr, { ...latest, start: e.target.value });
        }}
      />
      <span className="text-default-400 text-sm">to</span>
      <Input
        key={`${attr.attributeId}-${attr.version}-end`}
        type="date"
        size="sm"
        variant="bordered"
        classNames={{ inputWrapper: inputClasses }}
        defaultValue={period.end}
        onChange={(e) => {
          const latest = dirtyRef.current.get(attr.attributeId)?.rawValue ?? period;
          markDirty(attr, { ...latest, end: e.target.value });
        }}
      />
      {isSaving && <Spinner size="sm" />}
      {hasConflict && <ConflictNote />}
    </div>
  );
}
      default:
        return (
          <div>
            <Input
              key={`${attr.attributeId}-${attr.version}`}
              size="sm"
              variant="bordered"
              classNames={{ inputWrapper: inputClasses }}
              defaultValue={currentValue}
              onChange={(e) => markDirty(attr, e.target.value)}
              endContent={isSaving && <Spinner size="sm" />}
            />
            {hasConflict && <ConflictNote />}
          </div>
        );
    }
  };

  const MeSection = () => (
    <div className="space-y-5 max-w-xl">
      {isLoading && <Spinner size="sm" />}
      {!isLoading && meAttributes.length === 0 && (
        <p className="text-default-500 text-sm">No profile fields yet.</p>
      )}
      {meAttributes.map((attr) => (
        <div key={attr.attributeId} className="border border-default-200 rounded-xl p-4 bg-content1">
          <label className="text-sm font-medium text-default-700 mb-2 block">{attr.attributeName}</label>
          {renderValueInput(attr)}
          {!attr.isFilled && <p className="text-danger text-xs mt-2">Not filled in</p>}
        </div>
      ))}
    </div>
  );

  const InfoSection = () => {
    const columns = [
      { key: 'attributeName', label: 'Name' },
      { key: 'value', label: 'Value', renderCell: (item) => renderValueInput(item) },
      {
        key: 'isFilled',
        label: '',
        renderCell: (item) => !item.isFilled && <Chip size="sm" color="danger" variant="flat">Empty</Chip>,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="border border-default-300 bg-content1 rounded-xl p-4">
          <label className="text-sm font-medium text-default-700 mb-2 block">Add an attribute to your profile</label>
          <div className="flex gap-2">
            <select
              id="add-attribute-select"
              className="flex-1 p-2 rounded-lg border border-default-300 bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              defaultValue=""
            >
              <option value="" disabled>Choose an attribute…</option>
              {addableAttributes.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const select = document.getElementById('add-attribute-select');
                if (select.value) {
                  handleAddAttribute(select.value);
                  select.value = '';
                }
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="border-b border-default-200 pb-3">
          <Toolbar
            actions={[
              {
                label: 'Remove',
                icon: <TrashIcon className="w-4 h-4" />,
                color: 'danger',
                variant: 'flat',
                requiresSelection: true,
                onClick: handleRemoveSelected,
              },
            ]}
            selectedCount={selectedAttrKeys.size}
          />
        </div>

        <DataTable
          columns={columns}
          data={infoAttributes}
          keyField="attributeId"
          selectedKeys={selectedAttrKeys}
          onSelectionChange={setSelectedAttrKeys}
          isLoading={isLoading}
          removeWrapper
          emptyContent="No attributes added yet. Use the picker above to add your first one."
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>

      {targetUserId && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 text-sm rounded-lg px-4 py-2">
          You're editing another user's profile as an administrator.
        </div>
      )}

      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="me" title={<div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Me</div>}>
          <Card><CardBody><MeSection /></CardBody></Card>
        </Tab>
        <Tab key="info" title={<div className="flex items-center gap-2"><InformationCircleIcon className="w-4 h-4" /> Info</div>}>
          <Card><CardBody><InfoSection /></CardBody></Card>
        </Tab>
      </Tabs>
    </div>
  );
}