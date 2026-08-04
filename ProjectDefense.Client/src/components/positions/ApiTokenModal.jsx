import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import positionExportApi from '../../api/positionExportApi';

export default function ApiTokenModal({ isOpen, onClose, positionId }) {
  const { t } = useTranslation();
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const exportUrl = token
  ? `https://projectdefense.studentlifehelper.com/api/position/by-token/${token}`
  : '';

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await positionExportApi.generateToken(positionId);
      setToken(response.data.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to generate token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setToken(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{t('positions.apiToken', 'API Token')}</ModalHeader>
        <ModalBody>
          {token ? (
            <div className="space-y-3">
              <p className="text-default-500 text-sm">
                {t('positions.apiTokenHint', 'Use this token in Odoo to import this position\'s aggregated results.')}
              </p>
              <div className="bg-default-100 rounded-lg p-3 text-xs font-mono break-all">
                {token}
              </div>
              <div className="bg-default-100 rounded-lg p-3 text-xs font-mono break-all">
                {exportUrl}
              </div>
              <Button size="sm" variant="flat" onPress={handleCopy}>
                {copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy URL')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-default-500 text-sm">
                {t('positions.apiTokenExplain', 'Generate a token to expose this position\'s aggregated results via API.')}
              </p>
              {error && <p className="text-danger text-sm">{String(error)}</p>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>{t('common.close', 'Close')}</Button>
          {!token && (
            <Button color="primary" isLoading={isLoading} onPress={handleGenerate}>
              {t('positions.generateToken', 'Generate Token')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}