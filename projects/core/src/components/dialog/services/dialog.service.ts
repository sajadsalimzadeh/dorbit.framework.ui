import {Injectable} from "@angular/core";
import {DomService} from "../../../services/dom.service";
import {DialogComponent, DialogOptions} from "../components/dialog/dialog.component";
import {DialogContainerComponent} from "../dialog-container.component";
import {Subject} from "rxjs";

export interface DialogRef {
  close: () => void;
  onClose: Subject<void>;
}

@Injectable({providedIn: 'root'})
export class DialogService {
  containers: DialogContainerComponent[] = [];

  constructor(private domService: DomService) {
  }

  show(options: DialogOptions): DialogRef {
    let container = this.containers.find(x => x.name == options.container);
    const componentRef = this.domService.createByComponent(DialogComponent, container?.elementRef.nativeElement);
    Object.assign(componentRef.instance, options);
    componentRef.instance.componentRef = componentRef;
    return {
      close: () => {
        componentRef.instance.close();
      },
      onClose: componentRef.instance.onClose
    };
  }
}