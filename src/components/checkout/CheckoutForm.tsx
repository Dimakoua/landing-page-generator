import React from 'react';
import type { ActionContext, Action } from '../../schemas/actions';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface FormConfig {
  id: string;
  fields: FormField[];
  submitButton: {
    label: string;
    onClick?: Action;
  };
}

interface CheckoutFormProps {
  title?: string;
  form: FormConfig;
  dispatcher?: ActionContext;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}

/**
 * CheckoutForm component - handles customer information and payment form
 */
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  title = 'Checkout',
  form,
  dispatcher,
  actions,
  state,
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dispatcher || !form.submitButton.onClick) return;

    // Dispatch the submit action
    dispatcher.dispatch(form.submitButton.onClick).catch(err =>
      console.error('Checkout form submission failed:', err)
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          {form.submitButton.label}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;