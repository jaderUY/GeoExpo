import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnadirPage } from './anadir.page';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AnadirPage', () => {
  let component: AnadirPage;
  let fixture: ComponentFixture<AnadirPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnadirPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
