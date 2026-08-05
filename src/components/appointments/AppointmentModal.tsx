'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types';
import { colors } from '@/styles/design-tokens';
import { trackEventSafe } from '@/lib/analytics-tracking';
import { X } from 'lucide-react';

export interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
  }) => void;
  initialData?: Appointment;
  mode?: 'create' | 'edit';
}

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = 'create'
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  });
  const [error, setError] = useState('');

  // Populate form when initialData changes
  useEffect(() => {
    if (isOpen) {
      trackEventSafe('appointment_modal_open', {
        mode: mode,
      });
    }
    if (initialData && mode === 'edit') {
      setFormData({
        startDate: initialData.startDate,
        startTime: initialData.startTime,
        endDate: initialData.endDate,
        endTime: initialData.endTime,
        description: initialData.description,
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        description: '',
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      onSubmit(formData);
      trackEventSafe('appointment_saved', {
        mode: mode,
      });
      // Reset form only in create mode
      if (mode === 'create') {
        setFormData({
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          description: '',
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} entry`);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-lg shadow-2xl"
        style={{
          backgroundColor: colors['surface-1'],
          border: `1px solid ${colors.hairline}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.hairline }}>
          <h2 className="text-xl font-semibold" style={{ color: colors.ink }}>
            {mode === 'edit' ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:bg-opacity-80"
            style={{ color: colors['ink-muted'] }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="p-3 rounded-md text-sm"
              style={{
                backgroundColor: `${colors['semantic-error']}20`,
                border: `1px solid ${colors['semantic-error']}`,
                color: colors['semantic-error'],
              }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors['surface-2'],
                  border: `1px solid ${colors.hairline}`,
                  color: colors.ink,
                }}
              />
            </div>

            <div>
              <label htmlFor="start-time" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors['surface-2'],
                  border: `1px solid ${colors.hairline}`,
                  color: colors.ink,
                }}
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors['surface-2'],
                  border: `1px solid ${colors.hairline}`,
                  color: colors.ink,
                }}
              />
            </div>

            <div>
              <label htmlFor="end-time" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors['surface-2'],
                  border: `1px solid ${colors.hairline}`,
                  color: colors.ink,
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Meeting with client..."
              rows={3}
              className="w-full px-3 py-2 rounded-md resize-none"
              style={{
                backgroundColor: colors['surface-2'],
                border: `1px solid ${colors.hairline}`,
                color: colors.ink,
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-sm transition-all"
              style={{
                backgroundColor: colors['surface-2'],
                color: colors.ink,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: colors['product-terraform'],
                color: colors.ink,
              }}
            >
              {mode === 'edit' ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
