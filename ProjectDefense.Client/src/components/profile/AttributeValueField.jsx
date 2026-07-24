import { Input, Spinner } from '@heroui/react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { DTYPE, readValue } from '../../hooks/useProfileAttributes';

const inputClasses = 'border border-default-300 bg-content1 rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20';

function ConflictNote() {
  return <p className="text-warning text-xs mt-1">This was changed elsewhere — refreshed from server.</p>;
}

export default function AttributeValueField({
  attr,
  attributeMetaById,
  isSaving,
  hasConflict,
  imageError,
  pendingValue,
  onChange,
  onImageUpload,
}) {
  const { t } = useTranslation();
  const currentValue = readValue(attr);

  switch (attr.dtypeCode) {
    case DTYPE.BOOLEAN:
      return (
        <div>
          <label className="flex items-center gap-2 border border-default-300 bg-content1 rounded-lg px-3 py-2 w-fit cursor-pointer hover:border-primary/50">
            <input
              type="checkbox"
              key={`${attr.attributeId}-${attr.version}`}
              defaultChecked={currentValue}
              onChange={(e) => onChange(e.target.checked)}
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
            onChange={(e) => onChange(e.target.value)}
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
            onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
          />
          {hasConflict && <ConflictNote />}
        </div>
      );

    case DTYPE.ONE_OF_MANY: {
      const options = attributeMetaById.get(attr.attributeId)?.options ?? [];
      return (
        <div>
          <select
            key={`${attr.attributeId}-${attr.version}`}
            className="w-full p-2 rounded-lg border border-default-300 bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            defaultValue={currentValue}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">— Select —</option>
            {options.map((opt) => (
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
            {hasImage ? t('profile.replaceImage') : t('profile.uploadImage')}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(e.target.files?.[0])}
            />
            {isSaving && <Spinner size="sm" />}
          </label>
          {imageError && <p className="text-danger text-xs">{imageError}</p>}
          {hasConflict && <ConflictNote />}
        </div>
      );
    }

    case DTYPE.PERIOD: {
      const period = pendingValue ?? currentValue;
      return (
        <div className="flex gap-2 items-center">
          <Input
            key={`${attr.attributeId}-${attr.version}-start`}
            type="date"
            size="sm"
            variant="bordered"
            classNames={{ inputWrapper: inputClasses }}
            defaultValue={period.start}
            onChange={(e) => { if (e.target.value) onChange({ ...period, start: e.target.value }); }}
          />
          <span className="text-default-400 text-sm">to</span>
          <Input
            key={`${attr.attributeId}-${attr.version}-end`}
            type="date"
            size="sm"
            variant="bordered"
            classNames={{ inputWrapper: inputClasses }}
            defaultValue={period.end}
            onChange={(e) => { if (e.target.value) onChange({ ...period, end: e.target.value }); }}
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
            onChange={(e) => onChange(e.target.value)}
            endContent={isSaving && <Spinner size="sm" />}
          />
          {hasConflict && <ConflictNote />}
        </div>
      );
  }
}