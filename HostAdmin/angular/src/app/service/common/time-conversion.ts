import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TimeConversion {
  hours: any;
  minutes: any;
  seconds: any;
  constructor() { }

  getHours(totalSeconds) {
    return this.hours = Math.round(totalSeconds / (60 * 60));
  }
  getMinutes(totalSeconds, hours) {
    this.minutes = Math.round((totalSeconds - hours * (60 * 60)) / 60);
    return (this.minutes < 10 ? '0' : '') + this.minutes;
  }
  getSeconds(totalSeconds, hours, minutes) {
    this.seconds = Math.round(totalSeconds - hours * (60 * 60) - minutes * 60);
    return (this.seconds < 10 ? '0' : '') + this.seconds;
  }
  roundOfHours(totalDuration) {
    return Math.round(totalDuration / (60 * 60));
  }
  calculatePercentage(total, completed, roundOff = true) {
    if (roundOff) {
      return 100 - Math.round(((total - completed) / total) * 100);
    }
    return 100 - (((total - completed) / total) * 100);
  }
}
