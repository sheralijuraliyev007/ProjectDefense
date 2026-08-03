import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import crmApi from '../../api/crmApi';

export default function SyncToCrmModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ companyName: '', industry: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await crmApi.sync(form);
      setResult(response.data);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to sync to Salesforce.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setForm({ companyName: '', industry: '', phone: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{t('profile.syncToCrm', 'Sync to Salesforce CRM')}</ModalHeader>
        <ModalBody>
          {result ? (
            <div className="text-sm space-y-2">
              <p className="text-success-600 font-medium">Synced successfully.</p>
              <p>Account ID: <span className="font-mono">{result.salesforceAccountId}</span></p>
              <p>Contact ID: <span className="font-mono">{result.salesforceContactId}</span></p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-default-500 text-sm">
                This creates a linked Account and Contact for you in Salesforce.
              </p>
              <Input label={t('profile.companyName', 'Company Name')} value={form.companyName} onChange={handleChange('companyName')} placeholder="Optional — defaults to your name" />
              <Input label={t('profile.industry', 'Industry')} value={form.industry} onChange={handleChange('industry')} />
              <Input label={t('profile.phone', 'Phone')} value={form.phone} onChange={handleChange('phone')} />
              {error && <p className="text-danger text-sm">{String(error)}</p>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {result ? (
            <Button color="primary" onPress={handleClose}>{t('common.close', 'Close')}</Button>
          ) : (
            <>
              <Button variant="flat" onPress={handleClose}>{t('common.cancel', 'Cancel')}</Button>
              <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
                {t('profile.sync', 'Sync')}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}