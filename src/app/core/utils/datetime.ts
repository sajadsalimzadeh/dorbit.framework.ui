import { Moment } from 'jalali-moment';
import * as _moment from 'jalali-moment';
const moment = (_moment as any).default;

export class DateTime {
    protected moment: Moment;

    get invalid(): boolean { return this.getYear() === -1 || this.getMonth() === -1 || this.getDay() === -1 || this.getHour() === -1 || this.getMinute() === -1 || this.getSecond() === -1; }
    get value(): string { return `${this.getYear() * 10000 + this.getMonth() * 100 + this.getDay()}${this.getHour() < 10 ? '0' : ''}${this.getHour() * 10000 + this.getMinute() * 100 + this.getSecond()}`; }

    public constructor(year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number) {
        this.moment = moment();
        this.setMoment(this.moment);
        if (year !== undefined) this.setYear(year);
        if (month !== undefined) this.setMonth(month);
        if (day !== undefined) this.setDay(day);
        if (hour !== undefined) this.setHour(hour);
        if (minute !== undefined) this.setMinute(minute);
        if (second !== undefined) this.setSecond(second);
    }
    public setYear(value: number): DateTime { this.moment.year(value); return this; }
    public setMonth(value: number): DateTime { this.moment.month(value - 1); return this; }
    public setDay(value: number): DateTime { this.moment.date(value); return this; }

    public setHour(value: number): DateTime { this.moment.hour(value); return this; }
    public setMinute(value: number): DateTime { this.moment.minute(value); return this; }
    public setSecond(value: number): DateTime { this.moment.second(value); return this; }

    public setMoment(value: Moment) { this.moment = value; return this; }
    public getMoment(): Moment { return this.moment; }

    public getYear(): number { return this.moment.year(); }
    public getMonth(): number { return this.moment.month() + 1; }
    public getDay(): number { return this.moment.date(); }

    public getHour(): number { return this.moment.hour(); }
    public getMinute(): number { return this.moment.minute(); }
    public getSecond(): number { return this.moment.second(); }

    public getStartDayOfMonth(): number { return this.clone().setDay(1).toDate().getDay(); }
    public getDayOfWeek(): number { return this.toDate().getDay(); }

    public isLeapYear(): boolean { return this.moment.isLeapYear(); }

    public equalsDate(date: DateTime): boolean { return this.value.substring(0, 8) === date.value.substring(0, 8); }
    public equalsTime(date: DateTime): boolean { return this.value.substring(8, 6) === date.value.substring(8, 6); }
    public equals(date: DateTime): boolean { return this.value === date.value; }
    public smallerDate(date: DateTime): boolean { return this.value.substring(0, 8) < date.value.substring(0, 8); }
    public smallerTime(date: DateTime): boolean { return this.value.substring(8, 6) < date.value.substring(8, 6); }
    public smaller(date: DateTime): boolean { return this.value < date.value; }
    public greaterDate(date: DateTime): boolean { return this.value.substring(0, 8) > date.value.substring(0, 8); }
    public greaterTime(date: DateTime): boolean { return this.value.substring(8, 6) > date.value.substring(8, 6); }
    public greater(date: DateTime): boolean { return this.value > date.value; }

    public addSeconds(value: number): DateTime { this.moment.add(value, 'seconds'); return this; }
    public addMinutes(value: number): DateTime { this.moment.add(value, 'minutes'); return this; }
    public addHours(value: number): DateTime { this.moment.add(value, 'hours'); return this; }
    public addDays(value: number): DateTime { this.moment.add(value, 'days'); return this; }
    public addMonth(value: number): DateTime { this.moment.add(value, 'months'); return this; }
    public addYear(value: number): DateTime { this.moment.add(value, 'years'); return this; }

    public format(format: string = 'YYYY-MM-DD hh:mm:ss'): string { return DateTime.format(this, format); }
    public toDate(): Date { const m = this.moment.clone().locale('en'); return new Date(m.year(), m.month() + 1, m.date(), m.hour(), m.minute(), m.second()); }
    public toGDate(): GDate { const m = this.moment.clone().locale('en'); return new GDate(m.year(), m.month() + 1, m.date(), m.hour(), m.minute(), m.second()); }
    public toJDate(): JDate { const m = this.moment.clone().locale('en'); return new JDate(m.jYear(), m.jMonth() + 1, m.jDate(), m.hour(), m.minute(), m.second()); }
    public clone(): DateTime { return new DateTime(this.getYear(), this.getMonth(), this.getDay(), this.getHour(), this.getMinute(), this.getSecond()); }
    public copyTo(t: DateTime): DateTime {
        t.setSecond(this.getSecond());
        t.setMinute(this.getMinute());
        t.setHour(this.getHour());
        t.setDay(this.getDay());
        t.setMonth(this.getMonth());
        t.setYear(this.getYear());
        return t;
    }

    public static get now(): DateTime { return new DateTime(); }

    protected static parseOnce(value: string, format: string, find: string): number | undefined {
        let index = format.indexOf(find);
        if (index > -1) {
            let sub = value.substring(index, index + find.length);
            if (sub) {
                let result = parseInt(sub);
                if (result + '' !== 'NaN') return result;
                return -1;
            }
        }
        return undefined;
    }
    public static parse(value: string, format: string = 'YYYY/MM/DD hh:mm:ss'): DateTime {
        if (value && typeof value === 'string') {
            return new DateTime(
                DateTime.parseOnce(value, format, 'YYYY'),
                DateTime.parseOnce(value, format, 'MM'),
                DateTime.parseOnce(value, format, 'DD'),
                DateTime.parseOnce(value, format, 'hh'),
                DateTime.parseOnce(value, format, 'mm'),
                DateTime.parseOnce(value, format, 'ss'),
            );
        }
        return new DateTime();
    }
    public static format(t: Date | DateTime | JDate, format: string = 'YYYY/MM/DD hh:mm:ss'): string {
        if (t instanceof Date) return DateTime.toGDate(t).format(format);
        let year = t.getYear();
        let month = t.getMonth();
        let day = t.getDay();
        let hour = t.getHour();
        let minute = t.getMinute();
        let second = t.getSecond();
        format = format.replace(/YYYY/g, year.toString());
        format = format.replace(/MM/g, (month < 10 ? '0' + month : month).toString());
        format = format.replace(/DD/g, (day < 10 ? '0' + day : day).toString());
        format = format.replace(/hh/g, (hour < 10 ? '0' + hour : hour).toString());
        format = format.replace(/mm/g, (minute < 10 ? '0' + minute : minute).toString());
        format = format.replace(/ss/g, (second < 10 ? '0' + second : second).toString());
        return format;
    }
    public static parseDate(value: string, format: string = 'YYYY-MM-DD hh:mm:ss'): Date {
        let date = this.parse(value, format);
        return new Date(date.getYear(), date.getMonth(), date.getDay(), date.getHour(), date.getMinute(), date.getSecond());
    }
    public static parseJDate(value: string, format: string = 'YYYY-MM-DD hh:mm:ss'): JDate {
        return JDate.parse(value, format);
    }
    public static parseGDate(value: string, format: string = 'YYYY-MM-DD hh:mm:ss'): GDate {
        return GDate.parse(value, format);
    }
    public static toJDate(t: DateTime | GDate | Date | Moment): JDate {
        if (t instanceof DateTime) return t.toJDate();
        if (t instanceof Date) return this.toJDate(this.getMoment(t));
        return new JDate(t.jYear(), t.jMonth() + 1, t.jDate(), t.hour(), t.minute(), t.second());
    }
    public static toGDate(t: DateTime | JDate | Date | Moment): GDate {
        if (t instanceof DateTime) return t.toGDate();
        if (t instanceof Date) return this.toGDate(this.getMoment(t));
        return new GDate(t.year(), t.month() + 1, t.date(), t.hour(), t.minute(), t.second());
    }
    public static toDate(t: DateTime | GDate | JDate | Moment): Date {
        if (t instanceof DateTime) return t.toDate();
        return new Date(t.year(), t.month() + 1, t.date(), t.hour(), t.minute(), t.second());
    }
    public static toDateTime(t: Date | Moment): DateTime {
        if (t instanceof Date) return new DateTime(t.getFullYear(), t.getMonth() + 1, t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds());
        return new DateTime(t.year(), t.month() + 1, t.date(), t.hour(), t.minute(), t.second());
    }
    public static getMoment(t: DateTime | GDate | JDate | Date): Moment {
        if (t instanceof Date) {
            const m = moment();
            m.second(t.getSeconds());
            m.minute(t.getMinutes());
            m.hour(t.getHours());
            m.date(t.getDate());
            m.month(t.getMonth() - 1);
            m.year(t.getFullYear());
            return m;
        }
        return t.getMoment();
    }
}
export class GDate extends DateTime {

    public constructor(year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number) {
        super(year, month, day, hour, minute, second);
    }

    public override setMoment(value: Moment) { return super.setMoment(value.locale('en')); }

    public override addYear(value: number): GDate { this.moment.add(value, 'years'); return this; }
    public override addMonth(value: number): GDate { this.moment.add(value, 'months'); return this; }
    public override addDays(value: number): GDate { this.moment.add(value, 'days'); return this; }

    public override toDate(): Date { const m = this.moment.clone().locale('en'); return new Date(m.year(), m.month() + 1, m.date(), m.hour(), m.minute(), m.second()); }
    public override toJDate(): JDate { const m = this.moment.clone().locale('en'); return new JDate(m.jYear(), m.jMonth() + 1, m.jDate(), m.hour(), m.minute(), m.second()); }

    public override clone(): GDate { return new GDate(this.getYear(), this.getMonth(), this.getDay(), this.getHour(), this.getMinute(), this.getSecond()); }

    public static override parse(value: string, format: string = 'YYYY-MM-DD hh:mm:ss'): GDate {
        moment.locale('en');
        const t = DateTime.parse(value, format);
        return new GDate(t.getYear(), t.getMonth(), t.getDay(), t.getHour(), t.getMinute(), t.getSecond());
    }
    public static override get now(): GDate { return DateTime.toGDate(moment()); }
}
export class JDate extends DateTime {

    public constructor(year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number) {
        super(year, month, day, hour, minute, second);
    }
    public override getStartDayOfMonth(): number { return this.getMoment().clone().date(1).day(); }
    public override getDayOfWeek(): number { return this.moment.day(); }

    public override setMoment(value: Moment) { return super.setMoment(value.locale('fa')); }

    public override setDay(value: number): DateTime { this.moment.jDate(value); return this; }
    public override setMonth(value: number): DateTime { this.moment.jMonth(value - 1); return this; }
    public override setYear(value: number): DateTime { this.moment.jYear(value); return this; }

    public override addDays(value: number): JDate { this.moment.add(value, 'jDay'); return this; }
    public override addMonth(value: number): JDate { this.moment.add(value, 'jMonth'); return this; }
    public override addYear(value: number): JDate { this.moment.add(value, 'jYear'); return this; }
    public override addHours(value: number): JDate { this.moment.add(value, 'hours'); return this; }
    public override addMinutes(value: number): JDate { this.moment.add(value, 'minute'); return this; }
    public override addSeconds(value: number): JDate { this.moment.add(value, 'second'); return this; }

    public override toDate(): Date { const m = this.moment.clone().locale('en'); return new Date(m.year(), m.month() + 1, m.date(), m.hour(), m.minute(), m.second()); }
    public override toGDate(): GDate { const m = this.moment.clone().locale('en'); return new GDate(m.year(), m.month() + 1, m.date(), m.hour(), m.minute(), m.second()); }

    public override format(format: string = 'YYYY-MM-DD hh:mm:ss'): string { return this.moment.format(format); }
    public override clone(): JDate { return new JDate(this.getYear(), this.getMonth(), this.getDay(), this.getHour(), this.getMinute(), this.getSecond()); }

    public static override parse(value: string, format: string = 'YYYY-MM-DD hh:mm:ss'): JDate {
        moment.locale('fa');
        const t = DateTime.parse(value, format);
        return new JDate(t.getYear(), t.getMonth(), t.getDay(), t.getHour(), t.getMinute(), t.getSecond());
    }
    public static override get now(): JDate { return DateTime.toJDate(moment()); }
}
