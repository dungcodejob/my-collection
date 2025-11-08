import { FormControl } from "@angular/forms";
import {
  httpUrlValidator,
  httpsUrlValidator,
  simpleUrlValidator,
  strictUrlValidator,
  urlValidator,
} from "./url.validator";

describe("URL Validators", () => {
  describe("urlValidator (basic)", () => {
    it("should return null for valid HTTP URL", () => {
      const control = new FormControl("http://example.com");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return null for valid HTTPS URL", () => {
      const control = new FormControl("https://example.com");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return null for empty value", () => {
      const control = new FormControl("");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return null for null value", () => {
      const control = new FormControl(null);
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return error for invalid URL", () => {
      const control = new FormControl("not-a-url");
      const validator = urlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toBe("Invalid URL format");
    });

    it("should return null for URL with path", () => {
      const control = new FormControl("https://example.com/path/to/page");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return null for URL with query params", () => {
      const control = new FormControl("https://example.com?param=value");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should return null for URL with hash", () => {
      const control = new FormControl("https://example.com#section");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });
  });

  describe("urlValidator with requireHttps option", () => {
    it("should return null for HTTPS URL", () => {
      const control = new FormControl("https://example.com");
      const validator = urlValidator({ requireHttps: true });
      expect(validator(control)).toBeNull();
    });

    it("should return error for HTTP URL when HTTPS is required", () => {
      const control = new FormControl("http://example.com");
      const validator = urlValidator({ requireHttps: true });
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toBe("HTTPS protocol is required");
    });
  });

  describe("urlValidator with allowedProtocols option", () => {
    it("should return null for allowed protocol", () => {
      const control = new FormControl("https://example.com");
      const validator = urlValidator({ allowedProtocols: ["http", "https"] });
      expect(validator(control)).toBeNull();
    });

    it("should return error for disallowed protocol", () => {
      const control = new FormControl("ftp://example.com");
      const validator = urlValidator({ allowedProtocols: ["http", "https"] });
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toContain("not allowed");
    });
  });

  describe("urlValidator with allowLocalhost option", () => {
    it("should return null for localhost when allowed", () => {
      const control = new FormControl("http://localhost:3000");
      const validator = urlValidator({ allowLocalhost: true });
      expect(validator(control)).toBeNull();
    });

    it("should return error for localhost when not allowed", () => {
      const control = new FormControl("http://localhost:3000");
      const validator = urlValidator({ allowLocalhost: false });
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toBe("Localhost URLs are not allowed");
    });

    it("should return error for 127.0.0.1 when localhost not allowed", () => {
      const control = new FormControl("http://127.0.0.1:3000");
      const validator = urlValidator({ allowLocalhost: false });
      const result = validator(control);
      expect(result).not.toBeNull();
    });
  });

  describe("urlValidator with allowIpAddress option", () => {
    it("should return null for IP address when allowed", () => {
      const control = new FormControl("http://192.168.1.1");
      const validator = urlValidator({ allowIpAddress: true });
      expect(validator(control)).toBeNull();
    });

    it("should return error for IP address when not allowed", () => {
      const control = new FormControl("http://192.168.1.1");
      const validator = urlValidator({ allowIpAddress: false });
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toBe("IP address URLs are not allowed");
    });
  });

  describe("urlValidator with requireTld option", () => {
    it("should return null for URL with TLD", () => {
      const control = new FormControl("https://example.com");
      const validator = urlValidator({ requireTld: true });
      expect(validator(control)).toBeNull();
    });

    it("should return error for URL without TLD when required", () => {
      const control = new FormControl("https://example");
      const validator = urlValidator({ requireTld: true });
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
      expect(result?.["urlInvalid"].reason).toContain("top-level domain");
    });

    it("should return null for localhost even when TLD is required", () => {
      const control = new FormControl("http://localhost:3000");
      const validator = urlValidator({ requireTld: true, allowLocalhost: true });
      expect(validator(control)).toBeNull();
    });
  });

  describe("simpleUrlValidator", () => {
    it("should accept HTTP and HTTPS URLs", () => {
      const httpControl = new FormControl("http://example.com");
      const httpsControl = new FormControl("https://example.com");
      const validator = simpleUrlValidator();

      expect(validator(httpControl)).toBeNull();
      expect(validator(httpsControl)).toBeNull();
    });

    it("should reject FTP URLs", () => {
      const control = new FormControl("ftp://example.com");
      const validator = simpleUrlValidator();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
    });

    it("should accept localhost", () => {
      const control = new FormControl("http://localhost:3000");
      const validator = simpleUrlValidator();
      expect(validator(control)).toBeNull();
    });
  });

  describe("strictUrlValidator", () => {
    it("should accept HTTPS URLs with TLD", () => {
      const control = new FormControl("https://example.com");
      const validator = strictUrlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should reject HTTP URLs", () => {
      const control = new FormControl("http://example.com");
      const validator = strictUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
    });

    it("should reject localhost", () => {
      const control = new FormControl("https://localhost");
      const validator = strictUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
    });

    it("should reject IP addresses", () => {
      const control = new FormControl("https://192.168.1.1");
      const validator = strictUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
    });

    it("should reject URLs without TLD", () => {
      const control = new FormControl("https://example");
      const validator = strictUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
    });
  });

  describe("httpUrlValidator", () => {
    it("should accept HTTP URLs", () => {
      const control = new FormControl("http://example.com");
      const validator = httpUrlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should accept HTTPS URLs", () => {
      const control = new FormControl("https://example.com");
      const validator = httpUrlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should reject FTP URLs", () => {
      const control = new FormControl("ftp://example.com");
      const validator = httpUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
    });
  });

  describe("httpsUrlValidator", () => {
    it("should accept HTTPS URLs", () => {
      const control = new FormControl("https://example.com");
      const validator = httpsUrlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should reject HTTP URLs", () => {
      const control = new FormControl("http://example.com");
      const validator = httpsUrlValidator();
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.["urlInvalid"]).toBeDefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle URLs with subdomains", () => {
      const control = new FormControl("https://subdomain.example.com");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should handle URLs with ports", () => {
      const control = new FormControl("https://example.com:8080");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should handle URLs with authentication", () => {
      const control = new FormControl("https://user:pass@example.com");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should handle internationalized domain names", () => {
      const control = new FormControl("https://例え.jp");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should trim whitespace", () => {
      const control = new FormControl("  https://example.com  ");
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });

    it("should handle very long URLs", () => {
      const longPath = "a".repeat(1000);
      const control = new FormControl(`https://example.com/${longPath}`);
      const validator = urlValidator();
      expect(validator(control)).toBeNull();
    });
  });
});
