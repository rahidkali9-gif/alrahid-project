import { TriangleAlert as AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 rounded-lg p-2 ${
            danger ? 'bg-red-500/15 text-red-400' : 'bg-primary-500/15 text-primary-400'
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
