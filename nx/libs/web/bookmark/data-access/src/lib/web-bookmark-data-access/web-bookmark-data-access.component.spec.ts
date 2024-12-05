import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebBookmarkDataAccessComponent } from './web-bookmark-data-access.component';

describe('WebBookmarkDataAccessComponent', () => {
  let component: WebBookmarkDataAccessComponent;
  let fixture: ComponentFixture<WebBookmarkDataAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebBookmarkDataAccessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebBookmarkDataAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
