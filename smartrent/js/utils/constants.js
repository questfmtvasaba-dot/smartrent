// Application constants and configuration

export const APP_CONFIG = {
    name: 'SmartRent',
    version: '1.0.0',
    description: 'Real Estate & Rental Management Platform',
    supportEmail: 'support@smartrent.com',
    contactPhone: '+234 800 123 4567',
    address: '123 Property Street, Lagos, Nigeria'
};

export const USER_ROLES = {
    TENANT: 'tenant',
    AGENT: 'agent',
    LANDLORD: 'landlord',
    ADMIN: 'admin'
};

export const PROPERTY_TYPES = {
    APARTMENT: 'apartment',
    HOUSE: 'house',
    CONDO: 'condo',
    STUDIO: 'studio',
    DUPLEX: 'duplex',
    TOWNHOUSE: 'townhouse',
    VILLA: 'villa'
};

export const PROPERTY_STATUS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    UNAVAILABLE: 'unavailable'
};

export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

export const PAYMENT_METHODS = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    PAYSTACK: 'paystack',
    FLUTTERWAVE: 'flutterwave'
};

export const NOTIFICATION_TYPES = {
    SYSTEM: 'system',
    MESSAGE: 'message',
    BOOKING: 'booking',
    PAYMENT: 'payment',
    PROPERTY: 'property',
    SECURITY: 'security'
};

export const AMENITIES = [
    'wifi',
    'parking',
    'pool',
    'gym',
    'ac',
    'heating',
    'laundry',
    'security',
    'furnished',
    'pet-friendly',
    'balcony',
    'garden',
    'elevator',
    'doorman',
    'rooftop',
    'storage'
];

export const CURRENCIES = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    DATABASE: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATETIME: 'MMM DD, YYYY HH:mm'
};

export const FILE_CONFIG = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const GEO_CONFIG = {
    DEFAULT_LAT: 6.5244,
    DEFAULT_LNG: 3.3792,
    DEFAULT_ZOOM: 10,
    COUNTRY: 'Nigeria',
    DEFAULT_CITY: 'Lagos'
};

export const SEARCH_CONFIG = {
    RESULTS_PER_PAGE: 12,
    DEFAULT_SORT: 'newest',
    PRICE_RANGES: [
        { label: 'Under ₦500k', min: 0, max: 500000 },
        { label: '₦500k - ₦1M', min: 500000, max: 1000000 },
        { label: '₦1M - ₦2M', min: 1000000, max: 2000000 },
        { label: '₦2M - ₦5M', min: 2000000, max: 5000000 },
        { label: 'Over ₦5M', min: 5000000, max: null }
    ],
    BEDROOM_OPTIONS: [
        { label: 'Studio', value: 0 },
        { label: '1 Bed', value: 1 },
        { label: '2 Beds', value: 2 },
        { label: '3 Beds', value: 3 },
        { label: '4+ Beds', value: 4 }
    ]
};

export const VALIDATION_RULES = {
    EMAIL: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    PASSWORD: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    },
    PHONE: {
        required: true,
        pattern: /^(\+234|0)[789][01]\d{8}$/,
        message: 'Please enter a valid Nigerian phone number'
    },
    PRICE: {
        required: true,
        min: 1,
        message: 'Price must be a positive number'
    }
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/v1/token',
        SIGNUP: '/auth/v1/signup',
        LOGOUT: '/auth/v1/logout',
        RESET_PASSWORD: '/auth/v1/recover'
    },
    PROPERTIES: {
        LIST: '/rest/v1/properties',
        CREATE: '/rest/v1/properties',
        UPDATE: '/rest/v1/properties',
        DELETE: '/rest/v1/properties',
        IMAGES: '/storage/v1/object/property-images'
    },
    USERS: {
        PROFILES: '/rest/v1/profiles',
        PREFERENCES: '/rest/v1/user_preferences'
    },
    PAYMENTS: {
        INITIALIZE: '/rest/v1/payments',
        VERIFY: '/rest/v1/payments',
        HISTORY: '/rest/v1/payments'
    }
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
    FILE_TOO_LARGE: 'File is too large. Please choose a smaller file.',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.'
};

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    SIGNUP_SUCCESS: 'Account created successfully!',
    PROPERTY_CREATED: 'Property listed successfully!',
    PROPERTY_UPDATED: 'Property updated successfully!',
    PROPERTY_DELETED: 'Property deleted successfully!',
    BOOKING_CREATED: 'Booking request submitted successfully!',
    PAYMENT_SUCCESS: 'Payment completed successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!'
};

export const LOCAL_STORAGE_KEYS = {
    AUTH_TOKEN: 'smartrent_auth_token',
    USER_PROFILE: 'smartrent_user_profile',
    SEARCH_HISTORY: 'smartrent_search_history',
    FAVORITES: 'smartrent_favorites',
    PREFERENCES: 'smartrent_preferences'
};

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
    CHAT: true,
    PAYMENTS: true,
    ADVANCED_SEARCH: true,
    ANALYTICS: true,
    NOTIFICATIONS: true,
    DOCUMENT_UPLOAD: true
};

// Performance and UX constants
export const LOADING_DELAY = 300; // ms
export const DEBOUNCE_DELAY = 500; // ms
export const AUTO_SAVE_DELAY = 2000; // ms
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Export all constants as a single object for easy importing
export default {
    APP_CONFIG,
    USER_ROLES,
    PROPERTY_TYPES,
    PROPERTY_STATUS,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    NOTIFICATION_TYPES,
    AMENITIES,
    CURRENCIES,
    DATE_FORMATS,
    FILE_CONFIG,
    GEO_CONFIG,
    SEARCH_CONFIG,
    VALIDATION_RULES,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOCAL_STORAGE_KEYS,
    FEATURE_FLAGS
};