import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {delay} from "..";

interface Job {
  url: string;
  enable: boolean;
  steps: Step[];
  selector: string;
}

interface Step {
  selector: string;
  trigger: 'click';
  delay: number;
  retry?: number;
}

interface WaitUntil {
  selector: string;
  duration?: number;
}

@Injectable({providedIn: 'root'})
export class RobotService {

  jobs: Job[] = [];

  constructor(private http: HttpClient, private router: Router) {
  }

  load(url: string) {
    this.http.get<Job[]>(url).subscribe(res => {
      this.jobs = res;
      this.init();
    });
  }

  private init() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.processUrl();
      }
    });
    this.processUrl();
  }

  private processUrl() {
    const job = this.jobs.find(x => {
      return (!('enable' in x) || x.enable === true) && this.router.url.startsWith(x.url);
    });
    if (!job) return;
    setTimeout(() => {
      this.runJob(job);
    }, 200);
  }

  private async runJob(job: Job) {
    const el = document.querySelector(job.selector) as HTMLElement;
    if (!el) return;
    for (let i = 0; i < job.steps.length; i++) {
      const step = job.steps[i];
      await delay(step.delay ?? 100);
      let timer = step.retry ?? 3000;
      do {
        const target = el.querySelector(step.selector) as HTMLElement;
        if (target) {
          target[step.trigger]();
          break;
        }
        await delay(100);
        timer -= 100;
        if (timer < 0) {
          return;
        }
      } while (true)
    }
  }
}
