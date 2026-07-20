import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';


export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmColor = 'danger',
  confirmText,
  cancelText,
}) {
  const { t } = useTranslation(); // You'll need to import this or pass as prop

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {cancelText || 'Cancel'}
          </Button>
          <Button color={confirmColor} onPress={onConfirm}>
            {confirmText || 'Confirm'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}