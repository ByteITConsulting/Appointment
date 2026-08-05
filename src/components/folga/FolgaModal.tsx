'use client';

import { useState, useEffect } from 'react';
import { Folga } from '@/lib/types';
import { colors } from '@/styles/design-tokens';
import { trackEventSafe } from '@/lib/analytics-tracking';
import { X, Sunrise } from 'lucide-react';
import { calcTotalHours, applyLunchDeduction } from '@/lib/calculations';

export interface FolgaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
    hasLunchBreak?: boolean;
    lunchDuration?: number;
  }) => void;
  initialData?: Folga;
  mode?: 'create' | 'edit';
}

export function FolgaModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = 'create'
}: FolgaModalProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [calculatedHours, setCalculatedHours] = useState<number | null>(null);
  const [hasLunchBreak, setHasLunchBreak] = useState(false);
  const [lunchDuration, setLunchDuration] = useState(1);

  // Populate form when initialData changes
  useEffect(() => {
    if (isOpen) {
      trackEventSafe('folga_modal_open', {
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
      setHasLunchBreak(initialData.hasLunchBreak || false);
      setLunchDuration(initialData.lunchDuration || 1);
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        description: '',
      });
      setCalculatedHours(null);
      setHasLunchBreak(false);
      setLunchDuration(1);
    }
  }, [initialData, mode, isOpen]);

  // Calculate hours when dates/times change
  useEffect(() => {
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      try {
        const hours = calcTotalHours(formData.startDate, formData.startTime, formData.endDate, formData.endTime);
        setCalculatedHours(hours);
        setError('');
      } catch (err) {
        setCalculatedHours(null);
        setError(err instanceof Error ? err.message : 'Invalid date/time range');
      }
    } else {
      setCalculatedHours(null);
    }
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (calculatedHours === null || calculatedHours <= 0) {
        throw new Error('Please enter a valid time range');
      }
      
      onSubmit({
        ...formData,
        hasLunchBreak,
        lunchDuration,
      });
      trackEventSafe('folga_saved', {
        mode: mode,
        hours: calculatedHours,
        hasLunchBreak: hasLunchBreak,
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
        setCalculatedHours(null);
        setHasLunchBreak(false);
        setLunchDuration(1);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} time-off`);
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
          border: `1px solid ${colors['product-vault']}40`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.hairline }}>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: `${colors['product-vault']}20` }}
            >
              <Sunrise className="w-5 h-5" style={{ color: colors['product-vault'] }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: colors.ink }}>
              {mode === 'edit' ? 'Edit Time-Off (Folga)' : 'Add Time-Off (Folga)'}
            </h2>
          </div>
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

          {/* Calculated Hours Display */}
          {calculatedHours !== null && calculatedHours > 0 && (
            <div
              className="p-3 rounded-md text-sm font-medium"
              style={{
                backgroundColor: `${colors['product-vault']}15`,
                border: `1px solid ${colors['product-vault']}40`,
                color: colors['product-vault'],
              }}
            >
              {hasLunchBreak ? (
                <div className="space-y-1">
                  <div>Gross: {calculatedHours.toFixed(2)}h</div>
                  <div>Lunch: -{lunchDuration.toFixed(2)}h</div>
                  <div className="font-bold">Net: {applyLunchDeduction(calculatedHours, hasLunchBreak, lunchDuration).toFixed(2)}h</div>
                </div>
              ) : (
                <div>Duration: {calculatedHours.toFixed(2)} hours</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="folga-start-date" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                Start Date
              </label>
              <input
                id="folga-start-date"
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
              <label htmlFor="folga-start-time" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                Start Time
              </label>
              <input
                id="folga-start-time"
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
              <label htmlFor="folga-end-date" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                End Date
              </label>
              <input
                id="folga-end-date"
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
              <label htmlFor="folga-end-time" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
                End Time
              </label>
              <input
                id="folga-end-time"
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
            <label htmlFor="folga-description" className="block text-sm font-medium mb-1" style={{ color: colors['ink-muted'] }}>
              Description
            </label>
            <textarea
              id="folga-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Vacation, Doctor appointment, Personal day..."
              rows={3}
              className="w-full px-3 py-2 rounded-md resize-none"
              style={{
                backgroundColor: colors['surface-2'],
                border: `1px solid ${colors.hairline}`,
                color: colors.ink,
              }}
            />
          </div>

          {/* Lunch Break Controls */}
          {calculatedHours !== null && calculatedHours >= 8 && (
            <div className="border-t pt-4" style={{ borderColor: colors.hairline }}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has-lunch-break"
                    checked={hasLunchBreak}
                    onChange={(e) => setHasLunchBreak(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: colors['product-vault'] }}
                  />
                  <label htmlFor="has-lunch-break" className="text-sm font-medium" style={{ color: colors.ink }}>
                    Deduct lunch break
                  </label>
                </div>

                {hasLunchBreak && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors['ink-muted'] }}>
                      Lunch duration
                    </label>
                    <div className="flex gap-3">
                      {[0.5, 1, 1.5].map((duration) => (
                        <label
                          key={duration}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="lunch-duration"
                            value={duration}
                            checked={lunchDuration === duration}
                            onChange={() => setLunchDuration(duration)}
                            style={{ accentColor: colors['product-vault'] }}
                          />
                          <span className="text-sm" style={{ color: colors.ink }}>
                            {duration === 0.5 ? '30min' : duration === 1 ? '1h' : '1.5h'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: colors['surface-2'],
                color: colors['ink-muted'],
                border: `1px solid ${colors.hairline}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: colors['product-vault'],
                color: colors.canvas,
              }}
            >
              {mode === 'edit' ? 'Update Time-Off' : 'Add Time-Off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
