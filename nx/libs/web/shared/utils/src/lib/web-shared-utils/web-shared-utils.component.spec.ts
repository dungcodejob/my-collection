import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebSharedUtilsComponent } from './web-shared-utils.component';

describe('WebSharedUtilsComponent', () => {
  let component: WebSharedUtilsComponent;
  let fixture: ComponentFixture<WebSharedUtilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSharedUtilsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebSharedUtilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
