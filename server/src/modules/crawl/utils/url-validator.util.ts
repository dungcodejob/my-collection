import { URL } from 'url';

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  errorMessage?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
}

export class UrlValidator {
  private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];
  private static readonly BLOCKED_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
  ];
  private static readonly MAX_URL_LENGTH = 2048;

  /**
   * Validate and normalize URL
   */
  static validate(url: string): UrlValidationResult {
    try {
      // Basic length check
      if (!url || url.length === 0) {
        return {
          isValid: false,
          errorMessage: 'URL is required',
        };
      }

      if (url.length > this.MAX_URL_LENGTH) {
        return {
          isValid: false,
          errorMessage: `URL is too long (max ${this.MAX_URL_LENGTH} characters)`,
        };
      }

      // Add protocol if missing
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      // Parse URL
      const parsedUrl = new URL(normalizedUrl);

      // Validate protocol
      if (!this.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
        return {
          isValid: false,
          errorMessage: `Protocol '${parsedUrl.protocol}' is not allowed. Only HTTP and HTTPS are supported.`,
        };
      }

      // Validate hostname
      if (!parsedUrl.hostname) {
        return {
          isValid: false,
          errorMessage: 'Invalid hostname',
        };
      }

      // Check for blocked domains
      if (this.BLOCKED_DOMAINS.includes(parsedUrl.hostname.toLowerCase())) {
        return {
          isValid: false,
          errorMessage: 'Local and private URLs are not allowed',
        };
      }

      // Check for private IP ranges
      if (this.isPrivateIP(parsedUrl.hostname)) {
        return {
          isValid: false,
          errorMessage: 'Private IP addresses are not allowed',
        };
      }

      // Normalize URL (remove fragment, sort query params)
      const cleanUrl = this.normalizeUrl(parsedUrl);

      return {
        isValid: true,
        normalizedUrl: cleanUrl,
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Invalid URL format: ${error.message}`,
      };
    }
  }

  /**
   * Check if hostname is a private IP address
   */
  private static isPrivateIP(hostname: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);

    if (!match) {
      return false; // Not an IPv4 address
    }

    const [, a, b] = match.map(Number);

    // Check for private IP ranges
    return (
      a === 10 || // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a === 127 || // 127.0.0.0/8 (loopback)
      (a === 169 && b === 254) // 169.254.0.0/16 (link-local)
    );
  }

  /**
   * Normalize URL by removing fragments and sorting query parameters
   */
  private static normalizeUrl(parsedUrl: URL): string {
    // Remove fragment
    parsedUrl.hash = '';

    // Sort query parameters
    const searchParams = new URLSearchParams(parsedUrl.search);
    const sortedParams = new URLSearchParams();

    Array.from(searchParams.keys())
      .sort()
      .forEach((key) => {
        searchParams.getAll(key).forEach((value) => {
          sortedParams.append(key, value);
        });
      });

    parsedUrl.search = sortedParams.toString();

    return parsedUrl.toString();
  }

  /**
   * Extract domain from URL
   */
  static extractDomain(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Check if URL is accessible (basic format check)
   */
  static isAccessible(url: string): boolean {
    const validation = this.validate(url);
    return validation.isValid;
  }

  /**
   * Get URL without query parameters and fragment
   */
  static getBaseUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    } catch {
      return null;
    }
  }

  /**
   * Check if two URLs are the same (after normalization)
   */
  static areUrlsEqual(url1: string, url2: string): boolean {
    const validation1 = this.validate(url1);
    const validation2 = this.validate(url2);

    if (!validation1.isValid || !validation2.isValid) {
      return false;
    }

    return validation1.normalizedUrl === validation2.normalizedUrl;
  }

  /**
   * Validate multiple URLs
   */
  static validateBatch(urls: string[]): UrlValidationResult[] {
    return urls.map((url) => this.validate(url));
  }

  /**
   * Get valid URLs from a list
   */
  static getValidUrls(urls: string[]): string[] {
    return urls
      .map((url) => this.validate(url))
      .filter((result) => result.isValid)
      .map((result) => result.normalizedUrl!);
  }

  /**
   * Check if URL matches a pattern
   */
  static matchesPattern(url: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(url);
    } catch {
      return false;
    }
  }
}
