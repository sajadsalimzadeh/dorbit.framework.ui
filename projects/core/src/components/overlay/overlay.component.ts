import {Component, HostListener, Input, OnInit, TemplateRef} from "@angular/core";
import {OverlayRef} from "./overlay.service";
import {Colors} from "../../types";
import {AbstractComponent} from "../abstract.component";

export type OverlayAlignments =
  'top-start' | 'top-center' | 'top-end' |
  'bottom-start' | 'bottom-center' | 'bottom-end' |
  'start-top' | 'start-center' | 'start-bottom' |
  'end-top' | 'end-center' | 'end-bottom';

export interface OverlayOptions {
  autoClose?: boolean;
  ref?: HTMLElement;
  template?: TemplateRef<any>;
  text?: string;
  html?: string;
  ngClass?: any;
  color?: Colors;
  styles?: any;
  context?: any;
  alignment?: OverlayAlignments;
  verticalThreshold?: number;
  horizontalThreshold?: number;
}

@Component({
  selector: 'd-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent extends AbstractComponent implements OnInit, OverlayOptions {
  @Input() ref?: HTMLElement;
  @Input() alignment?: OverlayAlignments;

  autoClose = true;
  overlayRef!: OverlayRef;
  template?: TemplateRef<any>;
  text?: string;
  html?: string;
  styles?: any;
  context?: any;

  verticalThreshold = 300;
  horizontalThreshold = 300;

  animation: string = 'fade';

  overlayClasses: any = {};

  @HostListener('window:click', ['$event'])
  onWindowClick() {
    if (this.overlayRef) {
      this.overlayRef.destroy();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.render();
  }

  override render() {
    super.render();
    if (!this.ref) return;

    const rect = this.ref.getBoundingClientRect();
    const topOfScreen = window.innerHeight + window.scrollY;
    const horizontalOfScreen = window.innerWidth + window.scrollX;

    const width = rect.width;
    const height = rect.height;
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;
    const right = window.innerWidth - rect.right + window.scrollX;
    const dir = getComputedStyle(document.body).direction;

    let alignment = this.alignment ?? 'bottom-start';

    if ((dir == 'ltr' && horizontalOfScreen - this.horizontalThreshold < left) || (dir == 'rtl' && horizontalOfScreen - this.horizontalThreshold < right)) {
      if (alignment == 'top-start') alignment = 'top-end';
      else if (alignment == 'bottom-start') alignment = 'bottom-end';
      else if (alignment == 'end-top') alignment = 'start-top';
      else if (alignment == 'end-bottom') alignment = 'start-bottom';
    }

    if ((dir == 'ltr' && this.horizontalThreshold > left) || (dir == 'rtl' && this.horizontalThreshold > right)) {
      if (alignment == 'top-end') alignment = 'top-start';
      else if (alignment == 'bottom-end') alignment = 'bottom-start';
      else if (alignment == 'start-top') alignment = 'end-top';
      else if (alignment == 'start-bottom') alignment = 'end-bottom';
    }

    if (top > this.verticalThreshold) {
      if (alignment == 'top-start') alignment = 'bottom-start';
      else if (alignment == 'top-center') alignment = 'bottom-center';
      else if (alignment == 'top-end') alignment = 'bottom-end';
      else if (alignment == 'start-bottom') alignment = 'start-top';
      else if (alignment == 'end-bottom') alignment = 'end-top';
    }

    if (topOfScreen - this.verticalThreshold < top) {
      if (alignment == 'bottom-start') alignment = 'top-start';
      else if (alignment == 'bottom-center') alignment = 'top-center';
      else if (alignment == 'bottom-end') alignment = 'top-end';
      else if (alignment == 'start-top') alignment = 'start-bottom';
      else if (alignment == 'end-top') alignment = 'end-bottom';
    }

    const styles = this.elementRef.nativeElement.style;

    styles.width = width + 'px';

    if (alignment.startsWith('top') || alignment.startsWith('bottom')) {
      styles.width = width + 'px';
      if (dir == 'ltr') {
        styles.left = left + 'px';
      } else {
        styles.right = right + 'px';
      }

      if (alignment.startsWith('top')) {
        styles.top = top + 'px';
      } else {
        styles.top = top + height + 'px';
      }
    }

    if (alignment.startsWith('start') || alignment.startsWith('end')) {
      styles.top = top + 'px';
      styles.height = height + 'px';

      if (dir == 'ltr' && alignment.startsWith('start')) {
        styles.right = right + width + 'px';
      } else if (dir == 'ltr' && alignment.startsWith('end')) {
        styles.left = left + width + 'px';
      } else if (dir == 'rtl' && alignment.startsWith('start')) {
        styles.left = left + width + 'px';
      } else if (dir == 'rtl' && alignment.startsWith('end')) {
        styles.right = right + width + 'px';
      }
    }
    this.overlayClasses = {};
    this.overlayClasses[alignment] = true;
    this.overlayClasses[alignment.split('-')[0]] = true;
    this.overlayClasses['direction-' + dir] = true;
    this.overlayClasses[this.animation] = !!this.animation;
  }
}
