import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-default-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-default-500 mb-6">The page you're looking for doesn't exist.</p>
      <Button as={Link} to="/" color="primary" startContent={<HomeIcon className="w-4 h-4" />}>
        Go Home
      </Button>
    </div>
  );
}