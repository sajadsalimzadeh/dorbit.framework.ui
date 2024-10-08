import {Component, EventEmitter, TemplateRef, ViewChild} from '@angular/core';
import {DialogService, DialogRef} from "../../services/dialog.service";
import {DialogOptions} from "../dialog/dialog.component";
import {ConfirmButton, ConfirmOptions} from "../../models";
import {LoadingService} from "../../../../services";

@Component({
  selector: 'd-confirm',
  templateUrl: 'confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements ConfirmOptions, DialogRef {
  onClose = new EventEmitter<void>();

  message!: string;
  options!: DialogOptions;

  dialog?: DialogRef;
  loading?: boolean;
  buttons: ConfirmButton[] = [];

  @ViewChild('confirmTpl') set template(value: TemplateRef<any>) {
    if(this.dialog) return;
    this.dialog = this.diagService.open({
      width: '400px',
      ...this.options,
      template: value,
    })
  }

  constructor(private diagService: DialogService, protected loadingService: LoadingService) {
  }

  close() {
    this.dialog?.close();
  }
}
