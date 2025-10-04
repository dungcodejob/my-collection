import { computed, Injectable, signal } from "@angular/core";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
};

@Injectable({
  providedIn: "root",
})
export class TenantService {
  private readonly _$currentTenant = signal<Tenant | null>(null);

  // Public readonly signals
  readonly $currentTenant = computed(() => this._$currentTenant());
  readonly $tenantId = computed(() => this._$currentTenant()?.id || null);
  readonly $tenantSlug = computed(() => this._$currentTenant()?.slug || null);
  readonly $isMultiTenant = computed(() => this._$currentTenant() !== null);

  /**
   * Set the current tenant context
   */
  setTenant(tenant: Tenant): void {
    this._$currentTenant.set(tenant);

    // Store tenant ID in local storage for persistence
    localStorage.setItem("tenantId", tenant.id);
    localStorage.setItem("tenantSlug", tenant.slug);
  }

  /**
   * Clear the current tenant context
   */
  clearTenant(): void {
    this._$currentTenant.set(null);

    // Remove from storage
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenantSlug");
  }

  /**
   * Initialize tenant from storage or URL
   */
  initializeTenant(): void {
    // Try to get tenant from local storage first
    const storedTenantId = localStorage.getItem("tenantId");
    const storedTenantSlug = localStorage.getItem("tenantSlug");

    if (storedTenantId && storedTenantSlug) {
      this._$currentTenant.set({
        id: storedTenantId,
        slug: storedTenantSlug,
        name: storedTenantSlug, // Fallback to slug as name
        isActive: true,
      });
      return;
    }

    // Try to extract from subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2) {
      const subdomain = parts[0];
      if (subdomain && subdomain !== "www" && subdomain !== "api") {
        this._$currentTenant.set({
          id: subdomain, // Use subdomain as ID temporarily
          slug: subdomain,
          name: subdomain,
          isActive: true,
        });

        // Store for future use
        localStorage.setItem("tenantId", subdomain);
        localStorage.setItem("tenantSlug", subdomain);
      }
    }
  }

  /**
   * Get tenant ID for HTTP headers
   */
  getTenantIdForHeaders(): string | null {
    return this.$tenantId();
  }
}
