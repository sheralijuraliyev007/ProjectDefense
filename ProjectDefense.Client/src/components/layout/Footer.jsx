import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SupportTicketModal from '../shared/SupportTicketModal';

export default function Footer() {
  const { t } = useTranslation();
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <footer className="border-t border-default-200 py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center gap-2 text-sm text-default-500">
        <p>CV Manager</p>
        <button
          onClick={() => setTicketOpen(true)}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create support ticket
        </button>
      </div>
      <SupportTicketModal isOpen={ticketOpen} onClose={() => setTicketOpen(false)} />
    </footer>
  );
}