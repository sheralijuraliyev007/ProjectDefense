import { Spinner } from '@heroui/react';

export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        <Spinner size="lg" />
      </div>
    );
  }
  return <Spinner size="md" />;
}