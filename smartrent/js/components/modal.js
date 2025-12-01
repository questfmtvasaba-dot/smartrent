import { showNotification } from '../utils/helpers.js';

export class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Date.now()}`;
        this.title = options.title || '';
        this.content = options.content || '';
        this.size = options.size || 'md'; // sm, md, lg, xl
        this.actions = options.actions || [];
        this.onClose = options.onClose || null;
        this.onOpen = options.onOpen || null;
    }

    show() {
        // Remove existing modal with same ID
        const existingModal = document.getElementById(this.id);
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = this.id;
        modal.className = 'modal fade-in';
        modal.innerHTML = this.render();

        document.body.appendChild(modal);
        this.setupEventListeners(modal);

        if (this.onOpen) {
            this.onOpen();
        }

        return modal;
    }

    hide() {
        const modal = document.getElementById(this.id);
        if (modal) {
            modal.remove();
            if (this.onClose) {
                this.onClose();
            }
        }
    }

    render() {
        const sizeClass = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl'
        }[this.size];

        return `
            <div class="modal-content ${sizeClass}">
                <div class="modal-header">
                    <h2 class="text-xl font-bold">${this.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    ${this.content}
                </div>
                
                ${this.actions.length > 0 ? `
                    <div class="modal-footer flex justify-end space-x-3 p-4 border-t">
                        ${this.actions.map(action => `
                            <button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'} ${action.danger ? 'btn-danger' : ''}"
                                    data-action="${action.id}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupEventListeners(modal) {
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.hide();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });

        // Action buttons
        this.actions.forEach(action => {
            const button = modal.querySelector(`[data-action="${action.id}"]`);
            if (button && action.handler) {
                button.addEventListener('click', () => {
                    action.handler();
                });
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    updateContent(newContent) {
        const modalBody = document.querySelector(`#${this.id} .modal-body`);
        if (modalBody) {
            modalBody.innerHTML = newContent;
        }
    }

    setTitle(newTitle) {
        const modalHeader = document.querySelector(`#${this.id} .modal-header h2`);
        if (modalHeader) {
            modalHeader.textContent = newTitle;
        }
    }
}

// Predefined modal types
export class ConfirmationModal extends Modal {
    constructor(options = {}) {
        super({
            title: options.title || 'Confirm Action',
            content: options.message || 'Are you sure you want to proceed?',
            size: 'sm',
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancel',
                    handler: () => this.hide()
                },
                {
                    id: 'confirm',
                    label: options.confirmText || 'Confirm',
                    primary: true,
                    danger: options.danger,
                    handler: options.onConfirm || (() => {})
                }
            ],
            ...options
        });
    }
}

export class LoadingModal extends Modal {
    constructor(options = {}) {
        super({
            title: options.title || 'Loading...',
            content: `
                <div class="text-center py-8">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p class="text-gray-600">${options.message || 'Please wait'}</p>
                </div>
            `,
            size: 'sm',
            actions: [],
            ...options
        });
    }
}

export class ErrorModal extends Modal {
    constructor(options = {}) {
        super({
            title: options.title || 'Error',
            content: `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <p class="text-gray-700">${options.message || 'An error occurred'}</p>
                    ${options.details ? `<p class="text-sm text-gray-500 mt-2">${options.details}</p>` : ''}
                </div>
            `,
            size: 'sm',
            actions: [
                {
                    id: 'close',
                    label: 'Close',
                    primary: true,
                    handler: () => this.hide()
                }
            ],
            ...options
        });
    }
}

export class SuccessModal extends Modal {
    constructor(options = {}) {
        super({
            title: options.title || 'Success',
            content: `
                <div class="text-center py-4">
                    <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                    <p class="text-gray-700">${options.message || 'Operation completed successfully'}</p>
                </div>
            `,
            size: 'sm',
            actions: [
                {
                    id: 'close',
                    label: 'Close',
                    primary: true,
                    handler: () => this.hide()
                }
            ],
            ...options
        });
    }
}

// Form modal for common forms
export class FormModal extends Modal {
    constructor(options = {}) {
        super({
            title: options.title || 'Form',
            content: options.formHTML || '',
            size: options.size || 'md',
            actions: [
                {
                    id: 'cancel',
                    label: 'Cancel',
                    handler: () => this.hide()
                },
                {
                    id: 'submit',
                    label: options.submitText || 'Submit',
                    primary: true,
                    handler: options.onSubmit || (() => {})
                }
            ],
            ...options
        });

        this.formId = options.formId || `form-${Date.now()}`;
    }

    render() {
        // Wrap content in a form if not already done
        if (!this.content.includes('<form')) {
            this.content = `
                <form id="${this.formId}">
                    ${this.content}
                </form>
            `;
        }

        return super.render();
    }

    getFormData() {
        const form = document.getElementById(this.formId);
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    validate() {
        const form = document.getElementById(this.formId);
        if (!form) return true;

        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }
        });

        return isValid;
    }
}