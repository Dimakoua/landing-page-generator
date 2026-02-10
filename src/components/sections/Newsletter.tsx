import { useState } from 'react';
import { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  showGdpr?: boolean;
  gdprText?: string;
  actions?: {
    submit?: Action | Action[];
  };
  dispatcher?: ActionDispatcher;
}

export default function Newsletter({
  title = 'Stay Updated',
  subtitle = 'Get the latest news and updates delivered to your inbox.',
  placeholder = 'Enter your email address',
  buttonLabel = 'Subscribe',
  successMessage = 'Thank you for subscribing!',
  errorMessage = 'Please enter a valid email address.',
  showGdpr = false,
  gdprText = 'I agree to receive marketing communications and accept the privacy policy.',
  actions,
  dispatcher
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [gdprChecked, setGdprChecked] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage(errorMessage);
      setMessageType('error');
      return;
    }

    if (showGdpr && !gdprChecked) {
      setMessage('Please accept the privacy policy to continue.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      if (actions?.submit && dispatcher) {
        const submitActions = Array.isArray(actions.submit) ? actions.submit : [actions.submit];
        for (const action of submitActions) {
          await dispatcher.dispatch(action);
        }
      }

      setMessage(successMessage);
      setMessageType('success');
      setEmail('');
      setGdprChecked(false);
    } catch {
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
            />
          </div>

          {showGdpr && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="gdpr"
                checked={gdprChecked}
                onChange={(e) => setGdprChecked(e.target.checked)}
                className="mt-1 w-4 h-4 text-[var(--color-primary)] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[var(--color-primary)] focus:ring-2"
              />
              <label htmlFor="gdpr" className="text-sm text-slate-600 dark:text-slate-400 text-left">
                {gdprText}
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Subscribing...' : buttonLabel}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </section>
  );
}