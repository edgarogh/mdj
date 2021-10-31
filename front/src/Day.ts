export default class Day {
    value: string;

    constructor(value: string) {
        if (value.split('-').length !== 3) throw "Invalid day";
        this.value = value;
    }

    static fromLocal(date: Date) {
        return new Day(date.toISOString().substr(0, 10));
    }

    static fromUtc(date: Date) {
        const offset = new Date().getTimezoneOffset() * 60000;
        return Day.fromLocal(new Date(date.getTime() - offset));
    }

    static today() {
        return Day.fromUtc(new Date());
    }

    isToday() {
        return this.equals(Day.today());
    }

    isBefore(other: Day) {
        return this.value < other.value;
    }

    isBeforeOrEq(other: Day) {
        return this.value <= other.value;
    }

    isAfter(other: Day) {
        return this.value > other.value;
    }

    equals(other: Day) {
        return this.value == other.value;
    }

    toUtc() {
        return new Date(Date.parse(this.value));
    }
}
