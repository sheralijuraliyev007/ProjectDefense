import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Button, Chip, Spinner, Input } from '@heroui/react';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import positionRuleApi from '../../api/positionRuleApi';
import attributeApi from '../../api/attributeApi';

const DTYPE = {
  STRING: 1, TEXT: 2, IMAGE: 3, NUMERIC: 4, DATE: 5, PERIOD: 6, BOOLEAN: 7, ONE_OF_MANY: 8,
};

// Which operators make sense for which attribute type
const OPERATORS_BY_DTYPE = {
  [DTYPE.NUMERIC]: [
    { code: 1, label: '>' }, { code: 2, label: '<' },
    { code: 3, label: '≥' }, { code: 4, label: '≤' },
    { code: 5, label: '=' }, { code: 6, label: '≠' },
  ],
  [DTYPE.DATE]: [
    { code: 1, label: 'after' }, { code: 2, label: 'before' },
    { code: 5, label: 'on' }, { code: 6, label: 'not on' },
  ],
  [DTYPE.BOOLEAN]: [
    { code: 7, label: 'is true' }, { code: 8, label: 'is false' },
  ],
  [DTYPE.ONE_OF_MANY]: [
    { code: 5, label: 'is' }, { code: 6, label: 'is not' },
  ],
};

function emptyRule(attributeId, dtypeCode) {
  const firstOp = OPERATORS_BY_DTYPE[dtypeCode]?.[0]?.code ?? 5;
  return { attributeId, ruleCode: firstOp, valueNumeric: null, valueDate: null, valueBoolean: null, valueOptionId: null };
}

export default function PositionDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [position, setPosition] = useState(null);
  const [positionAttributes, setPositionAttributes] = useState([]); // AttributeDto[]
  const [allAttributes, setAllAttributes] = useState([]); // AttributeDto[] full library
  const [rules, setRules] = useState([]); // local editable rule rows
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAttrs, setIsSavingAttrs] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [posRes, attrsRes, libraryRes, rulesRes] = await Promise.all([
        positionApi.getById(id),
        positionApi.getAttributes(id),
        attributeApi.search({ page: 1, pageSize: 500 }),
        positionRuleApi.getRules(id),
      ]);
      setPosition(posRes.data.data);
      setPositionAttributes(attrsRes.data.data ?? []);
      setAllAttributes(libraryRes.data.data?.rows ?? []);
      setRules(
        (rulesRes.data.data ?? []).map((r) => ({
          attributeId: r.attributeId,
          ruleCode: r.ruleCode,
          valueNumeric: r.valueNumeric,
          valueDate: r.valueDate ? r.valueDate.slice(0, 10) : null,
          valueBoolean: r.valueBoolean,
          valueOptionId: r.valueOptionId,
        }))
      );
    } catch (err) {
      setError('Could not load this position.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const positionAttrIds = useMemo(() => new Set(positionAttributes.map((a) => a.id)), [positionAttributes]);
  const addableAttributes = useMemo(
    () => allAttributes.filter((a) => !positionAttrIds.has(a.id)),
    [allAttributes, positionAttrIds]
  );
  const attrById = useMemo(() => {
    const map = new Map();
    allAttributes.forEach((a) => map.set(a.id, a));
    return map;
  }, [allAttributes]);

  const handleAddAttribute = async (attributeIdStr) => {
    const attributeId = Number(attributeIdStr);
    if (!attributeId) return;
    const newIds = [...positionAttributes.map((a) => a.id), attributeId];
    setIsSavingAttrs(true);
    try {
      await positionApi.setAttributes(id, newIds);
      await loadAll();
    } finally {
      setIsSavingAttrs(false);
    }
  };

  const handleRemoveAttribute = async (attributeId) => {
    const newIds = positionAttributes.map((a) => a.id).filter((aid) => aid !== attributeId);
    setIsSavingAttrs(true);
    try {
      await positionApi.setAttributes(id, newIds);
      // Also drop any rules referencing this attribute, since it's no longer required
      setRules((prev) => prev.filter((r) => r.attributeId !== attributeId));
      await loadAll();
    } finally {
      setIsSavingAttrs(false);
    }
  };

  const handleAddRule = (attributeId) => {
    const attr = attrById.get(attributeId);
    if (!attr) return;
    setRules((prev) => [...prev, emptyRule(attributeId, attr.dtypeCode)]);
  };

  const updateRule = (index, patch) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRules = async () => {
    setIsSavingRules(true);
    setError('');
    try {
      const payload = rules.map((r) => ({
        attributeId: r.attributeId,
        ruleCode: r.ruleCode,
        valueNumeric: r.valueNumeric,
        valueDate: r.valueDate || null,
        valueBoolean: r.valueBoolean,
        valueOptionId: r.valueOptionId,
      }));
      await positionRuleApi.setRules(id, payload);
      await loadAll();
    } catch (err) {
      setError('Could not save access rules.');
    } finally {
      setIsSavingRules(false);
    }
  };

  const renderRuleValueInput = (rule, index) => {
    const attr = attrById.get(rule.attributeId);
    if (!attr) return null;

    switch (attr.dtypeCode) {
      case DTYPE.NUMERIC:
        return (
          <Input
            type="number" size="sm" variant="bordered" className="w-28"
            value={rule.valueNumeric ?? ''}
            onChange={(e) => updateRule(index, { valueNumeric: e.target.value === '' ? null : Number(e.target.value) })}
          />
        );
      case DTYPE.DATE:
        return (
          <Input
            type="date" size="sm" variant="bordered" className="w-40"
            value={rule.valueDate ?? ''}
            onChange={(e) => updateRule(index, { valueDate: e.target.value })}
          />
        );
      case DTYPE.BOOLEAN:
        return null; // "is true"/"is false" operator already encodes the value
      case DTYPE.ONE_OF_MANY:
        return (
          <select
            className="p-2 rounded-lg border border-default-300 bg-background text-sm"
            value={rule.valueOptionId ?? ''}
            onChange={(e) => updateRule(index, { valueOptionId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">— choose —</option>
            {(attr.options ?? []).map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        );
      default:
        return <span className="text-danger text-xs">Unsupported for rules</span>;
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (!position) return <div className="p-6 text-default-500">{error || 'Position not found.'}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button isIconOnly variant="light" onPress={() => navigate('/recruiter/positions')}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{position.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Chip size="sm" color={position.isPublic ? 'success' : 'warning'} variant="flat">
              {position.isPublic ? t('positions.public') : t('positions.restricted')}
            </Chip>
            <Chip size="sm" variant="flat">{position.statusName}</Chip>
          </div>
        </div>
      </div>

      <Card>
        <CardBody>
          <p className="text-default-600">{position.shortDescription}</p>
          <p className="text-xs text-default-400 mt-2">
            Basic info (title, description, public/restricted, max projects) is edited from the positions list.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h3 className="font-semibold">Required Attributes</h3>
          <div className="flex gap-2 flex-wrap">
            {positionAttributes.length === 0 && (
              <p className="text-default-400 text-sm">No attributes added yet.</p>
            )}
            {positionAttributes.map((attr) => (
              <Chip
                key={attr.id}
                variant="flat"
                color="primary"
                onClose={() => handleRemoveAttribute(attr.id)}
              >
                {attr.name}
              </Chip>
            ))}
          </div>
          <select
            className="p-2 rounded-lg border border-default-300 bg-background text-sm w-full sm:w-64"
            onChange={(e) => { handleAddAttribute(e.target.value); e.target.value = ''; }}
            defaultValue=""
            disabled={isSavingAttrs}
          >
            <option value="">Add an attribute…</option>
            {addableAttributes.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </CardBody>
      </Card>

      {!position.isPublic && (
        <Card>
          <CardBody className="space-y-4">
            <div>
              <h3 className="font-semibold">Access Rules</h3>
              <p className="text-xs text-default-400">
                A candidate must satisfy every rule below to see this restricted position.
                Rules can only reference attributes already added above.
              </p>
            </div>

            {positionAttributes.length === 0 && (
              <p className="text-default-400 text-sm">Add at least one attribute above before defining rules.</p>
            )}

            <div className="space-y-2">
              {rules.map((rule, index) => {
                const attr = attrById.get(rule.attributeId);
                const ops = OPERATORS_BY_DTYPE[attr?.dtypeCode] ?? [];
                return (
                  <div key={index} className="flex items-center gap-2 flex-wrap border border-default-200 rounded-lg p-2">
                    <span className="text-sm font-medium">{attr?.name ?? '—'}</span>
                    <select
                      className="p-1.5 rounded-lg border border-default-300 bg-background text-sm"
                      value={rule.ruleCode}
                      onChange={(e) => updateRule(index, { ruleCode: Number(e.target.value) })}
                    >
                      {ops.map((op) => (
                        <option key={op.code} value={op.code}>{op.label}</option>
                      ))}
                    </select>
                    {renderRuleValueInput(rule, index)}
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeRule(index)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {positionAttributes.length > 0 && (
              <select
                className="p-2 rounded-lg border border-default-300 bg-background text-sm w-full sm:w-64"
                onChange={(e) => { handleAddRule(Number(e.target.value)); e.target.value = ''; }}
                defaultValue=""
              >
                <option value="">Add a rule for…</option>
                {positionAttributes.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}

            {error && <p className="text-danger text-sm">{error}</p>}

            <div className="flex justify-end">
              <Button color="primary" isLoading={isSavingRules} onPress={handleSaveRules}>
                Save rules
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}