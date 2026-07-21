import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Tabs, Tab, Card, CardBody, Input, Chip, Spinner } from '@heroui/react';
import { UserIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import userAttributeApi from '../../api/userAttributeApi';
import attributeApi from '../../api/attributeApi';

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
    case DTYPE.ONE_OF_MANY:
      return { ...base, valueOptionId: rawValue ? Number(rawValue) : null };
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
    case DTYPE.BOOLEAN:
      return !!attr.valueBoolean;
    case DTYPE.ONE_OF_MANY:
      return attr.valueOptionId ?? '';
    default:
      return '';
  }
}

const AUTO_SAVE_INTERVAL_MS = 7000; // within the 5-10s window required by spec

const ConflictNote = () => (
  <p className="text-warning text-xs mt-1">This was changed elsewhere — refreshed from server.</p>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('me');
  const [myAttributes, setMyAttributes] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  const [conflictIds, setConflictIds] = useState(new Set());
  const [selectedAttrKeys, setSelectedAttrKeys] = useState(new Set());

  // attributeId -> { attr, rawValue } — tracks unsaved edits between auto-save ticks
  const dirtyRef = useRef(new Map());

  const loadMyAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userAttributeApi.getMine();
      setMyAttributes(res.data.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    await loadMyAttributes(); // pulls fresh values + current versions
  }, [loadMyAttributes]);

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
    await userAttributeApi.add(attributeId);
    await loadMyAttributes();
  };

  const handleRemoveSelected = async () => {
    const ids = Array.from(selectedAttrKeys).map(Number);
    await Promise.all(ids.map((id) => userAttributeApi.remove(id)));
    setSelectedAttrKeys(new Set());
    await loadMyAttributes();
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
      case DTYPE.ONE_OF_MANY:
        return (
          <Input
            key={`${attr.attributeId}-${attr.version}`}
            size="sm"
            variant="bordered"
            classNames={{ inputWrapper: inputClasses }}
            defaultValue={currentValue}
            placeholder="Option id"
            onChange={(e) => markDirty(attr, e.target.value)}
          />
        );
      case DTYPE.IMAGE:
        return (
          <div className="border-2 border-dashed border-default-300 rounded-lg px-4 py-3 text-center text-default-400 text-sm">
            Photo upload coming soon
          </div>
        );
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