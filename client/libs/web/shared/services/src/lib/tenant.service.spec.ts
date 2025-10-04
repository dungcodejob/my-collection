import { TestBed } from "@angular/core/testing";
import { Tenant, TenantService } from "./tenant.service";

describe("TenantService", () => {
  let service: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantService);

    // Clear localStorage before each test
    localStorage.clear();

    // Mock window.location.hostname
    Object.defineProperty(window, "location", {
      value: {
        hostname: "localhost",
      },
      writable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("setTenant", () => {
    it("should set current tenant and store in localStorage", () => {
      const tenant: Tenant = {
        id: "tenant-123",
        slug: "test-tenant",
        name: "Test Tenant",
        isActive: true,
      };

      service.setTenant(tenant);

      expect(service.$currentTenant()).toEqual(tenant);
      expect(service.$tenantId()).toBe("tenant-123");
      expect(service.$tenantSlug()).toBe("test-tenant");
      expect(service.$isMultiTenant()).toBe(true);
      expect(localStorage.getItem("tenantId")).toBe("tenant-123");
      expect(localStorage.getItem("tenantSlug")).toBe("test-tenant");
    });
  });

  describe("clearTenant", () => {
    it("should clear current tenant and remove from localStorage", () => {
      const tenant: Tenant = {
        id: "tenant-123",
        slug: "test-tenant",
        name: "Test Tenant",
        isActive: true,
      };

      service.setTenant(tenant);
      service.clearTenant();

      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
      expect(service.$tenantSlug()).toBeNull();
      expect(service.$isMultiTenant()).toBe(false);
      expect(localStorage.getItem("tenantId")).toBeNull();
      expect(localStorage.getItem("tenantSlug")).toBeNull();
    });
  });

  describe("initializeTenant", () => {
    it("should initialize tenant from localStorage", () => {
      localStorage.setItem("tenantId", "stored-tenant-123");
      localStorage.setItem("tenantSlug", "stored-tenant");

      service.initializeTenant();

      expect(service.$currentTenant()).toEqual({
        id: "stored-tenant-123",
        slug: "stored-tenant",
        name: "stored-tenant",
        isActive: true,
      });
      expect(service.$tenantId()).toBe("stored-tenant-123");
      expect(service.$tenantSlug()).toBe("stored-tenant");
    });

    it("should initialize tenant from subdomain when localStorage is empty", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "test-tenant.example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$currentTenant()).toEqual({
        id: "test-tenant",
        slug: "test-tenant",
        name: "test-tenant",
        isActive: true,
      });
      expect(localStorage.getItem("tenantId")).toBe("test-tenant");
      expect(localStorage.getItem("tenantSlug")).toBe("test-tenant");
    });

    it("should not initialize tenant from www subdomain", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "www.example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
    });

    it("should not initialize tenant from api subdomain", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "api.example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
    });

    it("should not initialize tenant when no subdomain is present", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
    });

    it("should prioritize localStorage over subdomain", () => {
      localStorage.setItem("tenantId", "stored-tenant-456");
      localStorage.setItem("tenantSlug", "stored-tenant");

      Object.defineProperty(window, "location", {
        value: {
          hostname: "subdomain-tenant.example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$tenantId()).toBe("stored-tenant-456");
      expect(service.$tenantSlug()).toBe("stored-tenant");
    });
  });

  describe("getTenantIdForHeaders", () => {
    it("should return tenant ID when tenant is set", () => {
      const tenant: Tenant = {
        id: "tenant-789",
        slug: "header-tenant",
        name: "Header Tenant",
        isActive: true,
      };

      service.setTenant(tenant);

      expect(service.getTenantIdForHeaders()).toBe("tenant-789");
    });

    it("should return null when no tenant is set", () => {
      expect(service.getTenantIdForHeaders()).toBeNull();
    });
  });

  describe("computed signals", () => {
    it("should update computed signals when tenant changes", () => {
      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
      expect(service.$tenantSlug()).toBeNull();
      expect(service.$isMultiTenant()).toBe(false);

      const tenant: Tenant = {
        id: "computed-tenant-101",
        slug: "computed-tenant",
        name: "Computed Tenant",
        isActive: true,
      };

      service.setTenant(tenant);

      expect(service.$currentTenant()).toEqual(tenant);
      expect(service.$tenantId()).toBe("computed-tenant-101");
      expect(service.$tenantSlug()).toBe("computed-tenant");
      expect(service.$isMultiTenant()).toBe(true);

      service.clearTenant();

      expect(service.$currentTenant()).toBeNull();
      expect(service.$tenantId()).toBeNull();
      expect(service.$tenantSlug()).toBeNull();
      expect(service.$isMultiTenant()).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle partial localStorage data", () => {
      localStorage.setItem("tenantId", "partial-tenant-123");
      // Missing tenantSlug

      service.initializeTenant();

      expect(service.$currentTenant()).toBeNull();
    });

    it("should handle complex subdomain structures", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "app.tenant.example.com",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$tenantId()).toBe("app");
      expect(service.$tenantSlug()).toBe("app");
    });

    it("should handle localhost development environment", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "localhost",
        },
        writable: true,
      });

      service.initializeTenant();

      expect(service.$currentTenant()).toBeNull();
    });
  });
});
