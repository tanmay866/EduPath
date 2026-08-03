import React from 'react';
import { Check, X } from 'lucide-react';
import { getPasswordRules } from '../../utils/passwordPolicy';

/**
 * Live checklist of the password rules the API enforces.
 *
 * Shown as the user types so the requirements are visible before submitting,
 * rather than surfacing as a rejection afterwards.
 *
 * @param {Object} props
 * @param {string} props.value - the password being typed
 * @param {boolean} [props.show] - render only once the field has focus or content
 */
const PasswordRequirements = ({ value = '', show = true }) => {
  if (!show) {
    return null;
  }

  const rules = getPasswordRules(value);

  return (
    <ul className="mt-2 space-y-1" aria-label="Password requirements">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center gap-2 text-xs transition-colors ${
            rule.met ? 'text-emerald-400' : 'text-gray-400'
          }`}
        >
          {rule.met ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <X size={14} className="text-gray-500" aria-hidden="true" />
          )}
          <span>{rule.label}</span>
          <span className="sr-only">{rule.met ? '(met)' : '(not met)'}</span>
        </li>
      ))}
    </ul>
  );
};

export default PasswordRequirements;
