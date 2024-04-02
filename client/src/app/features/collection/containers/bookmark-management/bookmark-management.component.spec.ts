import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkManagementComponent } from './bookmark-management.component';

describe('BookmarkManagementComponent', () => {
  let component: BookmarkManagementComponent;
  let fixture: ComponentFixture<BookmarkManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookmarkManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
