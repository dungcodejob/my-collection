import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { TenantService } from "@client/web-shared-services";
import { tenantHeaderInterceptor } from "./tenant-header.interceptor";

describe("TenantHeaderInterceptor", () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let tenantService: jest.Mocked<TenantService>;

  beforeEach(() => {
    const mockTenantService = {
      getTenantIdForHeaders: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tenantHeaderInterceptor])),
        provideHttpClientTesting(),
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    tenantService = TestBed.inject(TenantService) as jest.Mocked<TenantService>;
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  it("should add x-tenant-id header when tenant ID is available", () => {
    const tenantId = "tenant-123";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    httpClient.get("/api/test").subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(tenantService.getTenantIdForHeaders).toHaveBeenCalled();

    req.flush({ data: "test" });
  });

  it("should not add x-tenant-id header when tenant ID is not available", () => {
    tenantService.getTenantIdForHeaders.mockReturnValue(null);

    httpClient.get("/api/test").subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.headers.has("x-tenant-id")).toBe(false);
    expect(tenantService.getTenantIdForHeaders).toHaveBeenCalled();

    req.flush({ data: "test" });
  });

  it("should preserve existing headers when adding tenant header", () => {
    const tenantId = "tenant-456";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    const customHeaders = { "Custom-Header": "custom-value" };
    httpClient.get("/api/test", { headers: customHeaders }).subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(req.request.headers.get("Custom-Header")).toBe("custom-value");

    req.flush({ data: "test" });
  });

  it("should work with POST requests", () => {
    const tenantId = "tenant-789";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    const postData = { name: "test" };
    httpClient.post("/api/test", postData).subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.method).toBe("POST");
    expect(req.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(req.request.body).toEqual(postData);

    req.flush({ id: 1, ...postData });
  });

  it("should work with PUT requests", () => {
    const tenantId = "tenant-101";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    const putData = { id: 1, name: "updated" };
    httpClient.put("/api/test/1", putData).subscribe();

    const req = httpTestingController.expectOne("/api/test/1");
    expect(req.request.method).toBe("PUT");
    expect(req.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(req.request.body).toEqual(putData);

    req.flush(putData);
  });

  it("should work with DELETE requests", () => {
    const tenantId = "tenant-202";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    httpClient.delete("/api/test/1").subscribe();

    const req = httpTestingController.expectOne("/api/test/1");
    expect(req.request.method).toBe("DELETE");
    expect(req.request.headers.get("x-tenant-id")).toBe(tenantId);

    req.flush({});
  });

  it("should handle multiple concurrent requests", () => {
    const tenantId = "tenant-303";
    tenantService.getTenantIdForHeaders.mockReturnValue(tenantId);

    // Make multiple concurrent requests
    httpClient.get("/api/test1").subscribe();
    httpClient.get("/api/test2").subscribe();
    httpClient.post("/api/test3", {}).subscribe();

    const req1 = httpTestingController.expectOne("/api/test1");
    const req2 = httpTestingController.expectOne("/api/test2");
    const req3 = httpTestingController.expectOne("/api/test3");

    expect(req1.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(req2.request.headers.get("x-tenant-id")).toBe(tenantId);
    expect(req3.request.headers.get("x-tenant-id")).toBe(tenantId);

    req1.flush({ data: "test1" });
    req2.flush({ data: "test2" });
    req3.flush({ data: "test3" });
  });

  it("should handle empty string tenant ID", () => {
    tenantService.getTenantIdForHeaders.mockReturnValue("");

    httpClient.get("/api/test").subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.headers.has("x-tenant-id")).toBe(false);

    req.flush({ data: "test" });
  });

  it("should handle undefined tenant ID", () => {
    tenantService.getTenantIdForHeaders.mockReturnValue(undefined as any);

    httpClient.get("/api/test").subscribe();

    const req = httpTestingController.expectOne("/api/test");
    expect(req.request.headers.has("x-tenant-id")).toBe(false);

    req.flush({ data: "test" });
  });
});
