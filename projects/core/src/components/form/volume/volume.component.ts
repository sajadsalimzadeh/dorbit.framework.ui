import {AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {AbstractFormControl, createControlValueAccessor} from "../form-control.directive";
import {Orientation} from "../../../types";

export interface VolumeRange {
  start: number;
  end: number;
}

@Component({
  selector: 'd-volume',
  templateUrl: 'volume.component.html',
  styleUrls: ['../control.scss', './volume.component.scss'],
  providers: [createControlValueAccessor(VolumeComponent)]
})
export class VolumeComponent extends AbstractFormControl<number | VolumeRange> implements AfterViewInit {

  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() orientation: Orientation = 'horizontal';
  @Input() mode: 'single' | 'multiple' = 'single';
  @Input() dir: 'rtl' | 'ltr' = 'ltr';

  @ViewChild('valueBarEl') valueBarEl?: ElementRef<HTMLDivElement>;

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp() {
    if (this.onMouseMove) {
      window.removeEventListener('mousemove', this.onMouseMove)
    }
  }

  private onMouseMove?: (e: MouseEvent) => void;

  private getRange(): VolumeRange {
    if (typeof this.formControl.value === 'object') {
      return this.formControl.value;
    }
    return {
      start: this.min,
      end: this.formControl.value
    }
  }

  override onClick(e: MouseEvent) {
    super.onClick(e);
  }

  override render() {
    super.render();
    this.classes[this.dir] = true;
    this.classes[this.orientation] = true;
    this.processStyles();
  }

  ngAfterViewInit(): void {
    this.processStyles();
  }

  processStyles() {
    const containerBarEl = this.elementRef?.nativeElement;
    const valueBarEl = this.valueBarEl?.nativeElement;
    if (!containerBarEl || !valueBarEl) return;

    const range = this.getRange();
    const totalSize = (this.orientation == 'horizontal' ? containerBarEl.offsetWidth : containerBarEl.offsetHeight);
    const totalValue = this.max - this.min;
    const startSize = (range.start - this.min) * totalSize / totalValue;
    const endSize = (this.max - range.end) * totalSize / totalValue;
    this.dir = getComputedStyle(containerBarEl).direction as any;
    if (this.orientation == 'horizontal') {
      valueBarEl.style.top = '';
      valueBarEl.style.bottom = '';

      if (this.dir == 'rtl') {
        valueBarEl.style.left = endSize + 'px';
        valueBarEl.style.right = startSize + 'px';
      } else {
        valueBarEl.style.right = endSize + 'px';
        valueBarEl.style.left = startSize + 'px';
      }

    } else {
      valueBarEl.style.left = '';
      valueBarEl.style.right = '';
      valueBarEl.style.top = startSize + 'px';
      valueBarEl.style.bottom = endSize + 'px';
    }
  }

  onDragStart(e: MouseEvent, type: 'start' | 'end') {
    const containerBarEl = this.elementRef?.nativeElement;
    if (!containerBarEl) return;

    const totalSize = (this.orientation == 'horizontal' ? containerBarEl.offsetWidth : containerBarEl.offsetHeight);
    const totalValue = this.max - this.min;
    const stepSize = totalSize / totalValue;

    const getValue = () => {
      const range = this.getRange();
      if (type == 'start') return range.start;
      return range.end;
    }

    const setValue = (value: number) => {
      if (value < this.min) value = this.min;
      if (value > this.max) value = this.max;
      if (this.mode === 'single') {
        this.formControl.setValue(value);
      } else {
        const range = this.getRange();
        if (type == 'start' && value > range['end']) value = range['end'];
        if (type == 'end' && value < range['start']) value = range['start'];
        range[type] = value;
        this.formControl.setValue({...range});
      }
    }
    const firstValue = getValue();

    this.onWindowMouseUp();
    window.addEventListener('mousemove', this.onMouseMove = (we) => {
      const diff = (this.orientation == 'horizontal' ? (we.pageX - e.pageX) : (we.pageY - e.pageY));
      let value = firstValue + (diff / stepSize);
      value = Math.round(value / this.step) * this.step;
      if (getValue() != value) {
        setValue(value);
      }
    })
  }
}
