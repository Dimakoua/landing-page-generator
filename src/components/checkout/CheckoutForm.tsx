import React from 'react';
import type { Action } from '../../schemas/actions';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import { validators } from '../../utils/validators';
import { masks } from '../../utils/masks';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validator?: string;
  mask?: string;
  placeholder?: string;
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
  dispatcher?: ActionDispatcher;
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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form data from state when component mounts or state changes
  React.useEffect(() => {
    if (state && state[form.id]) {
      const initialData = state[form.id] as Record<string, string>;
      console.log(`[CheckoutForm] Initializing from state[${form.id}]:`, initialData);
      setFormData(initialData);
    }
  }, [state, form.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Find the field to check for mask
    const field = form.fields.find(f => f.name === name);
    const maskedValue = field?.mask && masks[field.mask] ? masks[field.mask](value) : value;
    
    const newFormData = {
      ...formData,
      [name]: maskedValue,
    };
    setFormData(newFormData);
    
    // Store form data in global state so actions can access it
    if (dispatcher) {
      const setStateAction = {
        type: 'setState' as const,
        key: form.id,
        value: newFormData,
        merge: true
      };
      dispatcher.dispatch(setStateAction).catch(err =>
        console.error('Failed to store form data:', err)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dispatcher || !form.submitButton.onClick) return;

    // Validate fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    for (const field of form.fields) {
      if (field.validator && validators[field.validator]) {
        const error = validators[field.validator](formData[field.name] || '');
        if (error) {
          newErrors[field.name] = error;
          hasErrors = true;
        }
      }
    }
    setErrors(newErrors);
    if (hasErrors) return;

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
              placeholder={field.placeholder}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors[field.name] && (
              <span className="text-red-500 text-sm mt-1">{errors[field.name]}</span>
            )}
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