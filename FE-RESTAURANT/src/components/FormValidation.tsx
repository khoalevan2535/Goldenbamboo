import React, { useState, useEffect } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { CheckCircle, XCircle, ExclamationTriangle } from 'react-bootstrap-icons';

// Validation rules type
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  strongPassword?: boolean;
};

// Field validation state
export interface FieldValidation {
  isValid: boolean;
  errors: string[];
  touched: boolean;
}

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [validations, setValidations] = useState<Record<keyof T, FieldValidation>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = (name: keyof T, value: any): FieldValidation => {
    const rules = validationRules[name];
    const errors: string[] = [];
    
    if (!rules) {
      return { isValid: true, errors: [], touched: false };
    }

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('Trường này là bắt buộc');
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return { 
        isValid: errors.length === 0, 
        errors, 
        touched: validations[name]?.touched || false 
      };
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Tối thiểu ${rules.minLength} ký tự`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Tối đa ${rules.maxLength} ký tự`);
      }
    }

    // Number range validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Giá trị tối thiểu là ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Giá trị tối đa là ${rules.max}`);
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push('Định dạng không hợp lệ');
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        errors.push('Email không hợp lệ');
      }
    }

    // Phone validation
    if (rules.phone && typeof value === 'string') {
      const phonePattern = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phonePattern.test(value.replace(/\s/g, ''))) {
        errors.push('Số điện thoại không hợp lệ');
      }
    }

    // Strong password validation
    if (rules.strongPassword && typeof value === 'string') {
      if (value.length < 8) {
        errors.push('Mật khẩu phải có ít nhất 8 ký tự');
      }
      if (!/(?=.*[a-z])/.test(value)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
      }
      if (!/(?=.*\d)/.test(value)) {
        errors.push('Mật khẩu phải có ít nhất 1 số');
      }
      if (!/(?=.*[@$!%*?&])/.test(value)) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      touched: validations[name]?.touched || false 
    };
  };

  // Update field value and validate
  const updateField = (name: keyof T, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    
    const fieldValidation = validateField(name, value);
    setValidations(prev => ({
      ...prev,
      [name]: { ...fieldValidation, touched: true }
    }));
  };

  // Mark field as touched
  const touchField = (name: keyof T) => {
    const fieldValidation = validateField(name, values[name]);
    setValidations(prev => ({
      ...prev,
      [name]: { ...fieldValidation, touched: true }
    }));
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newValidations: Record<keyof T, FieldValidation> = {} as any;
    let isFormValid = true;

    for (const name in validationRules) {
      const fieldValidation = validateField(name, values[name]);
      newValidations[name] = { ...fieldValidation, touched: true };
      if (!fieldValidation.isValid) {
        isFormValid = false;
      }
    }

    setValidations(newValidations);
    return isFormValid;
  };

  // Reset form
  const reset = () => {
    setValues(initialValues);
    setValidations({} as any);
    setIsSubmitting(false);
  };

  // Get form validation state
  const isFormValid = Object.values(validations).every(v => v.isValid) && 
                     Object.keys(validationRules).every(key => validations[key as keyof T]);

  return {
    values,
    validations,
    isSubmitting,
    isFormValid,
    updateField,
    touchField,
    validateAll,
    reset,
    setIsSubmitting
  };
};

// Validated Input Component
interface ValidatedInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  validation?: FieldValidation;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  name,
  type = 'text',
  placeholder,
  validation,
  value,
  onChange,
  onBlur,
  className = '',
  disabled = false,
  required = false
}) => {
  const isInvalid = validation?.touched && !validation?.isValid;
  const isValid = validation?.touched && validation?.isValid;

  return (
    <div className="mb-3">
      <Form.Control
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`${className} ${isInvalid ? 'is-invalid' : ''} ${isValid ? 'is-valid' : ''}`}
        disabled={disabled}
        required={required}
      />
      
      {validation?.touched && validation?.errors.length > 0 && (
        <div className="invalid-feedback d-block">
          {validation.errors.map((error, index) => (
            <div key={index} className="d-flex align-items-center">
              <XCircle className="me-1" size={14} />
              {error}
            </div>
          ))}
        </div>
      )}
      
      {validation?.touched && validation?.isValid && (
        <div className="valid-feedback d-block">
          <CheckCircle className="me-1" size={14} />
          Hợp lệ
        </div>
      )}
    </div>
  );
};

// Form Summary Component
interface ValidationSummaryProps {
  validations: Record<string, FieldValidation>;
  show?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validations,
  show = true
}) => {
  const allErrors = Object.values(validations)
    .filter(v => v.touched && !v.isValid)
    .flatMap(v => v.errors);

  if (!show || allErrors.length === 0) {
    return null;
  }

  return (
    <Alert variant="danger" className="mb-3">
      <Alert.Heading className="h6">
        <ExclamationTriangle className="me-2" />
        Vui lòng kiểm tra lại thông tin
      </Alert.Heading>
      <ul className="mb-0 ps-3">
        {allErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </Alert>
  );
};





