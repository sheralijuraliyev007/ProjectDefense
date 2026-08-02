import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import supportTicketApi from '../../api/supportTicketApi';

const PRIORITY_OPTIONS = [
  { value: 2, label: 'High' },
  { value: 1, label: 'Average' },
  { value: 0, label: 'Low' },
];

export default function SupportTicketModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const getPositionId = () => {
    const match = location.pathname.match(/\/positions\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await supportTicketApi.create({
        summary,
        priority,
        positionId: getPositionId(),
        pageLink: window.location.href,
      });
      setSuccess(true);
      setSummary('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create Support Ticket</h2>

        {success ? (
          <div>
            <p className="text-sm text-green-600 mb-4">Ticket submitted successfully.</p>
            <button onClick={handleClose} className="px-4 py-2 rounded bg-primary text-white">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Summary</label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded border text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-primary text-white text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}