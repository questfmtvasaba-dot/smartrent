// Validation functions for form inputs and data

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

export function validatePhone(phone) {
    // Basic phone validation - adjust for specific country formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function validateNigerianPhone(phone) {
    const nigerianPhoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return nigerianPhoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function validatePrice(price) {
    return !isNaN(price) && price > 0;
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateMinLength(value, minLength) {
    return value && value.length >= minLength;
}

export function validateMaxLength(value, maxLength) {
    return value && value.length <= maxLength;
}

export function validateRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
}

export function validateInteger(value) {
    return Number.isInteger(Number(value)) && !isNaN(value);
}

export function validatePositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
}

export function validateNonNegativeNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
}

export function validateDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

export function validateFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date >= today;
}

export function validatePastDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date <= today;
}

export function validateFileType(file, allowedTypes) {
    if (!file) return false;
    return allowedTypes.includes(file.type);
}

export function validateFileSize(file, maxSizeInMB) {
    if (!file) return false;
    const maxSize = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSize;
}

export function validateImageDimensions(file, minWidth, minHeight) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            resolve(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            resolve(img.width >= minWidth && img.height >= minHeight);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
}

export function validateNIN(nin) {
    // Nigerian NIN validation (11 digits)
    const ninRegex = /^\d{11}$/;
    return ninRegex.test(nin);
}

export function validateBVN(bvn) {
    // Nigerian BVN validation (11 digits)
    const bvnRegex = /^\d{11}$/;
    return bvnRegex.test(bvn);
}

export function validateCoordinates(lat, lng) {
    const latValid = !isNaN(lat) && lat >= -90 && lat <= 90;
    const lngValid = !isNaN(lng) && lng >= -180 && lng <= 180;
    return latValid && lngValid;
}

export function validatePropertyType(type) {
    const validTypes = ['apartment', 'house', 'condo', 'studio', 'duplex', 'townhouse', 'villa'];
    return validTypes.includes(type);
}

export function validateAmenities(amenities) {
    if (!Array.isArray(amenities)) return false;
    
    const validAmenities = [
        'wifi', 'parking', 'pool', 'gym', 'ac', 'heating', 'laundry', 
        'security', 'furnished', 'pet-friendly', 'balcony', 'garden'
    ];
    
    return amenities.every(amenity => validAmenities.includes(amenity));
}

export function validateRole(role) {
    const validRoles = ['tenant', 'agent', 'landlord', 'admin'];
    return validRoles.includes(role);
}

export function validateBookingStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    return validStatuses.includes(status);
}

export function validatePaymentStatus(status) {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    return validStatuses.includes(status);
}

export class Validator {
    constructor() {
        this.errors = {};
        this.rules = {};
    }

    setRules(field, rules) {
        this.rules[field] = rules;
        return this;
    }

    validate(data) {
        this.errors = {};
        
        for (const [field, rules] of Object.entries(this.rules)) {
            const value = data[field];
            
            for (const rule of rules) {
                const { validator, message, params = [] } = rule;
                
                if (!validator(value, ...params)) {
                    if (!this.errors[field]) {
                        this.errors[field] = [];
                    }
                    this.errors[field].push(message);
                    break; // Stop at first error for each field
                }
            }
        }
        
        return this.isValid();
    }

    isValid() {
        return Object.keys(this.errors).length === 0;
    }

    getErrors() {
        return this.errors;
    }

    getFirstError(field) {
        return this.errors[field] ? this.errors[field][0] : null;
    }

    clearErrors() {
        this.errors = {};
    }

    // Predefined validation rules
    static required(message = 'This field is required') {
        return {
            validator: validateRequired,
            message
        };
    }

    static email(message = 'Please enter a valid email address') {
        return {
            validator: validateEmail,
            message
        };
    }

    static password(message = 'Password must be at least 8 characters with uppercase, lowercase, and number') {
        return {
            validator: validatePassword,
            message
        };
    }

    static minLength(min, message = null) {
        const defaultMessage = `Must be at least ${min} characters long`;
        return {
            validator: (value) => validateMinLength(value, min),
            message: message || defaultMessage
        };
    }

    static maxLength(max, message = null) {
        const defaultMessage = `Must be no more than ${max} characters long`;
        return {
            validator: (value) => validateMaxLength(value, max),
            message: message || defaultMessage
        };
    }

    static range(min, max, message = null) {
        const defaultMessage = `Must be between ${min} and ${max}`;
        return {
            validator: (value) => validateRange(value, min, max),
            message: message || defaultMessage
        };
    }

    static integer(message = 'Must be a whole number') {
        return {
            validator: validateInteger,
            message
        };
    }

    static positive(message = 'Must be a positive number') {
        return {
            validator: validatePositiveNumber,
            message
        };
    }
}

// Form validation helper
export function validateForm(formElement, validationRules) {
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);
    const validator = new Validator();

    for (const [field, rules] of Object.entries(validationRules)) {
        validator.setRules(field, rules);
    }

    const isValid = validator.validate(data);
    
    // Clear previous error styles
    formElement.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    formElement.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });

    if (!isValid) {
        const errors = validator.getErrors();
        
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message text-red-500 text-sm mt-1';
                errorElement.textContent = fieldErrors[0];
                
                input.parentNode.appendChild(errorElement);
            }
        }
    }

    return isValid;
}