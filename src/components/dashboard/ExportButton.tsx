'use client';

import { useState } from 'react';
import { Appointment, Folga } from '@/lib/types';
import { downloadCSV } from '@/lib/export';
import { colors } from '@/styles/design-tokens';
import { trackEventSafe } from '@/lib/analytics-tracking';
import { Download, ChevronDown } from 'lucide-react';

export interface ExportButtonProps {
  appointments: Appointment[];
  folgas?: Folga[];
}

export function ExportButton({ appointments }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExport, setLastExport] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Security constant
  const EXPORT_COOLDOWN = 2000; // 2 seconds between exports

  const handleExportCSV = () => {
    // Rate limiting
    const now = Date.now();
    if (now - lastExport < EXPORT_COOLDOWN) {
      const waitTime = Math.ceil((EXPORT_COOLDOWN - (now - lastExport)) / 1000);
      setErrorMessage(`Please wait ${waitTime} second(s) before exporting again`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setIsOpen(false);
      return;
    }

    setLastExport(now);
    downloadCSV(appointments);
    trackEventSafe('export_appointment', {
      count: appointments.length,
      timestamp: now,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all hover:opacity-90"
        style={{
          backgroundColor: colors['product-waypoint'],
          color: colors['inverse-ink'],
        }}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Error Toast */}
      {showError && (
        <div
          className="fixed top-4 right-4 px-4 py-3 rounded-md shadow-lg z-50 flex items-center gap-2"
          style={{
            backgroundColor: colors['semantic-error'],
            color: colors['inverse-ink'],
          }}
        >
          <span>{errorMessage}</span>
        </div>
      )}

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20"
            style={{
              backgroundColor: colors['surface-2'],
              border: `1px solid ${colors.hairline}`,
            }}
          >
            <div className="py-1">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: colors.ink,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors['surface-3'];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Export as CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
