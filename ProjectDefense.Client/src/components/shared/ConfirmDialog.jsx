import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';


export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmColor = 'danger',
  confirmText,
  cancelText,
  error,
})  {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{message}</p>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>{cancelText || 'Cancel'}</Button>
          <Button color={confirmColor} onPress={onConfirm}>{confirmText || 'Confirm'}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}