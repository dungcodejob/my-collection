/**
 * HTTP Utilities Library - NgRx Signals Integration
 * 
 * This module provides type-safe HTTP response handling utilities
 * specifically designed for NgRx Signals and modern Angular applications.
 * 
 * @category HTTP
 * @subcategory NgRx Signals
 * @version 2.0.0
 */

// ============================================================================
// CORE RESPONSE MAPPERS - NgRx Signals Integration
// ============================================================================
/**
 * @group Response Mappers
 * @description Core utilities for mapping HTTP responses to NgRx Signal actions
 */
export { mapToSuccessAction } from './map-to-success-action';
export { mapToErrorAction } from './map-to-error-action';
export { mapToValidationAction, type ValidationErrorPayload } from './map-to-validation-action';
export { mapToUploadProgressAction } from './map-to-upload-progress-action';

// ============================================================================
// COMPOSITE OPERATORS - Simplified API
// ============================================================================
/**
 * @group Composite Operators
 * @description High-level operators that combine multiple response handling scenarios
 */
export { mapHttpResponse } from './map-http-response';
export { handleHttpResponseForNgrx } from './handle-http-response-for-ngrx';

// ============================================================================
// SIDE EFFECT UTILITIES - Tap Operators
// ============================================================================
/**
 * @group Side Effects
 * @description Utilities for handling side effects without affecting the main data flow
 */
export { tapError } from './tap-error';
export { tapResponseData } from './tap-response-data';
export { tapUploadProgress } from './tap-upload-progress';
export { tapValidationErrors } from './tap-validation-errors';

// ============================================================================
// ADVANCED UTILITIES - Specialized Use Cases
// ============================================================================
/**
 * @group Advanced
 * @description Specialized utilities for complex scenarios
 */
export { withApiCall } from './with-api-call';

// ============================================================================
// EXAMPLES & DOCUMENTATION
// ============================================================================
/**
 * @group Examples
 * @description Code examples and usage patterns
 */
export * from './ngrx-examples';
export * from './typed-action-examples';

// ============================================================================
// LEGACY SUPPORT - Backward Compatibility
// ============================================================================
/**
 * @group Legacy
 * @deprecated Use the new NgRx Signals operators instead
 * @description Legacy operators maintained for backward compatibility
 */
export { 
  catchHttpError, 
  catchValidationErrors, 
  tapUploadProgressForNgrx 
} from './ngrx-operators';
