import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SupportTicketModal from '../shared/SupportTicketModal';

export default function Footer() {
  const { t } = useTranslation();
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <footer className="border-t border-default-200 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-default-500">
        <p>CV Manager</p>
        <button
          onClick={() => setTicketOpen(true)}
          className="underline text-default-500 hover:text-default-700 mt-1"
        >
          Create support ticket
        </button>
      </div>
      <SupportTicketModal isOpen={ticketOpen} onClose={() => setTicketOpen(false)} />
    </footer>
  );
}