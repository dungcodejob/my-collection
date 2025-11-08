import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * URL Validator - Best Practices Implementation
 *
 * Features:
 * - Validates URL format using native URL API
 * - Supports protocol validation (http, https, ftp, etc.)
 * - Validates domain structure
 * - Optional: Require specific protocols
 * - Optional: Require HTTPS only
 * - Provides detailed error messages
 * - Type-safe and reusable
 */

/**
 * URL Validator Options
 */
export type UrlValidatorOptions = {
  /**
   * Allowed protocols (e.g., ['http', 'https'])
   * If not specified, all protocols are allowed
   */
  allowedProtocols?: string[];

  /**
   * Require HTTPS protocol only
   * @default false
   */
  requireHttps?: boolean;

  /**
   * Allow localhost URLs
   * @default true
   */
  allowLocalhost?: boolean;

  /**
   * Allow IP addresses
   * @default true
   */
  allowIpAddress?: boolean;

  /**
   * Require top-level domain (e.g., .com, .org)
   * @default false
   */
  requireTld?: boolean;
};

/**
 * Default validator options
 */
const DEFAULT_OPTIONS: UrlValidatorOptions = {
  allowedProtocols: undefined,
  requireHttps: false,
  allowLocalhost: true,
  allowIpAddress: true,
  requireTld: false,
};

/**
 * URL Validator Factory Function
 *
 * Creates a validator function that checks if the control's value is a valid URL.
 *
 * @param options - Optional configuration for URL validation
 * @returns ValidatorFn - Angular validator function
 *
 * @example
 * // Basic usage - any valid URL
 * const control = new FormControl('', urlValidator());
 *
 * @example
 * // Require HTTPS only
 * const control = new FormControl('', urlValidator({ requireHttps: true }));
 *
 * @example
 * // Allow only specific protocols
 * const control = new FormControl('', urlValidator({
 *   allowedProtocols: ['http', 'https']
 * }));
 *
 * @example
 * // Strict validation - no localhost, require TLD
 * const control = new FormControl('', urlValidator({
 *   allowLocalhost: false,
 *   requireTld: true
 * }));
 */
export function urlValidator(options?: UrlValidatorOptions): ValidatorFn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (control: AbstractControl): ValidationErrors | null => {
    // Empty value is valid (use Validators.required for required fields)
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();

    // Empty after trim
    if (!value) {
      return null;
    }

    try {
      // Parse URL using native URL API
      const url = new URL(value);

      // Validate protocol
      const protocol = url.protocol.replace(":", "");

      // Check if HTTPS is required
      if (config.requireHttps && protocol !== "https") {
        return {
          urlInvalid: {
            value,
            reason: "HTTPS protocol is required",
            protocol,
          },
        };
      }

      // Check allowed protocols
      if (config.allowedProtocols && !config.allowedProtocols.includes(protocol)) {
        return {
          urlInvalid: {
            value,
            reason: `Protocol '${protocol}' is not allowed`,
            protocol,
            allowedProtocols: config.allowedProtocols,
          },
        };
      }

      // Validate hostname
      const hostname = url.hostname.toLowerCase();

      // Check localhost
      if (!config.allowLocalhost && isLocalhost(hostname)) {
        return {
          urlInvalid: {
            value,
            reason: "Localhost URLs are not allowed",
            hostname,
          },
        };
      }

      // Check IP address
      if (!config.allowIpAddress && isIpAddress(hostname)) {
        return {
          urlInvalid: {
            value,
            reason: "IP address URLs are not allowed",
            hostname,
          },
        };
      }

      // Check TLD requirement
      if (config.requireTld && !hasTld(hostname) && !isLocalhost(hostname)) {
        return {
          urlInvalid: {
            value,
            reason: "URL must have a top-level domain (e.g., .com, .org)",
            hostname,
          },
        };
      }

      // URL is valid
      return null;
    } catch (error) {
      // Invalid URL format
      return {
        urlInvalid: {
          value,
          reason: "Invalid URL format",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  };
}

/**
 * Simple URL Validator (most common use case)
 *
 * Validates that the control's value is a valid HTTP/HTTPS URL.
 *
 * @example
 * const control = new FormControl('', simpleUrlValidator());
 */
export function simpleUrlValidator(): ValidatorFn {
  return urlValidator({
    allowedProtocols: ["http", "https"],
    requireTld: false,
    allowLocalhost: true,
  });
}

/**
 * Strict URL Validator
 *
 * Validates that the control's value is a valid HTTPS URL with a TLD.
 * Does not allow localhost or IP addresses.
 *
 * @example
 * const control = new FormControl('', strictUrlValidator());
 */
export function strictUrlValidator(): ValidatorFn {
  return urlValidator({
    requireHttps: true,
    allowLocalhost: false,
    allowIpAddress: false,
    requireTld: true,
  });
}

/**
 * HTTP/HTTPS URL Validator
 *
 * Validates that the control's value is a valid HTTP or HTTPS URL.
 *
 * @example
 * const control = new FormControl('', httpUrlValidator());
 */
export function httpUrlValidator(): ValidatorFn {
  return urlValidator({
    allowedProtocols: ["http", "https"],
  });
}

/**
 * HTTPS Only URL Validator
 *
 * Validates that the control's value is a valid HTTPS URL only.
 *
 * @example
 * const control = new FormControl('', httpsUrlValidator());
 */
export function httpsUrlValidator(): ValidatorFn {
  return urlValidator({
    requireHttps: true,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if hostname is localhost
 */
function isLocalhost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("localhost:") ||
    hostname.startsWith("127.0.0.1:") ||
    hostname.startsWith("[::1]")
  );
}

/**
 * Check if hostname is an IP address (IPv4 or IPv6)
 */
function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;

  // Remove port if present
  const host = hostname.split(":")[0];

  return ipv4Pattern.test(host) || ipv6Pattern.test(host) || hostname.startsWith("[");
}

/**
 * Check if hostname has a top-level domain
 */
function hasTld(hostname: string): boolean {
  // Remove port if present
  const host = hostname.split(":")[0];

  // Check if it has at least one dot and the TLD is not empty
  const parts = host.split(".");

  if (parts.length < 2) {
    return false;
  }

  // Last part should be the TLD (at least 2 characters)
  const tld = parts[parts.length - 1];
  return tld.length >= 2;
}
