import React, { useEffect } from 'react';

export const CrossBrowserVerificationOptimizer = () => {
  useEffect(() => {
    // Enhanced CSS Grid and Flexbox fallbacks
    const addLayoutFallbacks = () => {
      const supportsGrid = CSS.supports('display', 'grid');
      const supportsFlex = CSS.supports('display', 'flex');
      
      if (!supportsGrid || !supportsFlex) {
        const fallbackStyles = document.createElement('style');
        fallbackStyles.textContent = `
          /* Flexbox fallbacks for older browsers */
          .flex { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: flex; }
          .flex-col { -webkit-flex-direction: column; -ms-flex-direction: column; flex-direction: column; }
          .items-center { -webkit-align-items: center; -ms-flex-align: center; align-items: center; }
          .justify-center { -webkit-justify-content: center; -ms-flex-pack: center; justify-content: center; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          
          /* Grid fallbacks */
          .grid { display: block; }
          .grid > * { margin-bottom: 1rem; }
          
          @media (min-width: 640px) {
            .sm\\:flex-row { -webkit-flex-direction: row; -ms-flex-direction: row; flex-direction: row; }
            .sm\\:w-auto { width: auto; }
            .grid { display: -ms-grid; display: grid; }
          }
        `;
        document.head.appendChild(fallbackStyles);
      }
    };

    // Enhanced form validation for cross-browser compatibility
    const enhanceFormValidation = () => {
      // Polyfill for HTML5 form validation in older browsers
      if (!document.createElement('input').checkValidity) {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', (e) => {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
              const htmlInput = input as HTMLInputElement;
              if (!htmlInput.value.trim()) {
                isValid = false;
                htmlInput.style.border = '2px solid #ef4444';
                
                // Show custom validation message
                const existingError = htmlInput.parentNode?.querySelector('.validation-error');
                if (!existingError) {
                  const errorMsg = document.createElement('div');
                  errorMsg.className = 'validation-error';
                  errorMsg.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
                  errorMsg.textContent = 'This field is required';
                  htmlInput.parentNode?.appendChild(errorMsg);
                }
              } else {
                htmlInput.style.border = '';
                const errorMsg = htmlInput.parentNode?.querySelector('.validation-error');
                if (errorMsg) {
                  errorMsg.remove();
                }
              }
            });
            
            if (!isValid) {
              e.preventDefault();
            }
          });
        });
      }
    };

    // File upload compatibility enhancements
    const enhanceFileUpload = () => {
      // Check for File API support
      if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        console.warn('File API not fully supported in this browser');
        
        // Add visual indicator for unsupported browsers
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          const warning = document.createElement('div');
          warning.style.cssText = 'color: #f59e0b; font-size: 0.875rem; margin-top: 0.25rem;';
          warning.textContent = 'File upload may have limited functionality in your browser';
          input.parentNode?.appendChild(warning);
        });
      }
      
      // Enhanced drag & drop with fallbacks
      const dropZones = document.querySelectorAll('[data-drop-zone]');
      dropZones.forEach(zone => {
        // Add click handler as fallback for drag & drop
        zone.addEventListener('click', () => {
          const fileInput = zone.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        });
        
        // Enhanced visual feedback
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
          zone.classList.remove('drag-over');
        });
      });
    };

    // Network connectivity enhancements
    const enhanceNetworkHandling = () => {
      // Monitor connection quality
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const updateConnectionStatus = () => {
          const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
          
          if (isSlowConnection) {
            // Add loading indicators and optimize for slow connections
            const buttons = document.querySelectorAll('button[type="submit"]');
            buttons.forEach(button => {
              const htmlButton = button as HTMLButtonElement;
              htmlButton.addEventListener('click', () => {
                if (!htmlButton.disabled) {
                  const loadingText = htmlButton.getAttribute('data-loading-text') || 'Loading...';
                  const originalText = htmlButton.textContent;
                  htmlButton.textContent = loadingText;
                  htmlButton.disabled = true;
                  
                  // Re-enable after reasonable timeout
                  setTimeout(() => {
                    htmlButton.textContent = originalText;
                    htmlButton.disabled = false;
                  }, 10000);
                }
              });
            });
          }
        };
        
        connection.addEventListener('change', updateConnectionStatus);
        updateConnectionStatus();
      }
    };

    // Enhanced accessibility for verification system
    const enhanceAccessibility = () => {
      // Add ARIA labels and descriptions
      const statusBadges = document.querySelectorAll('[data-verification-status]');
      statusBadges.forEach(badge => {
        const status = badge.getAttribute('data-verification-status');
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-live', 'polite');
        
        switch (status) {
          case 'pending':
            badge.setAttribute('aria-label', 'Verification status: pending review');
            break;
          case 'approved':
            badge.setAttribute('aria-label', 'Verification status: approved');
            break;
          case 'rejected':
            badge.setAttribute('aria-label', 'Verification status: rejected, please resubmit');
            break;
        }
      });
      
      // Enhance form accessibility
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input, index) => {
          if (!input.getAttribute('id')) {
            input.setAttribute('id', `form-input-${Date.now()}-${index}`);
          }
          
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (!label && input.getAttribute('placeholder')) {
            input.setAttribute('aria-label', input.getAttribute('placeholder') || '');
          }
        });
      });
    };

    // Initialize all enhancements
    addLayoutFallbacks();
    enhanceFormValidation();
    enhanceFileUpload();
    enhanceNetworkHandling();
    enhanceAccessibility();

    // Performance monitoring
    const monitorPerformance = () => {
      if ('performance' in window && 'measure' in performance) {
        performance.mark('verification-system-init');
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                  console.warn('Long task detected:', entry);
                }
              }
            });
            observer.observe({ entryTypes: ['longtask'] });
          } catch (e) {
            // PerformanceObserver not supported
            console.warn('Performance monitoring not available');
          }
        }
      }
    };

    monitorPerformance();

  }, []);

  return null;
};