import {Color} from "@mui/material";
import {makeAutoObservable, runInAction} from "mobx";
import Day from "./Day";

class Api {
    private readonly login_url: string;
    private readonly account: string;
    private readonly courses: string;
    private readonly courses_id: string;
    private readonly timeline: string;
    private readonly timeline_after: string;

    public onDisconnectedHandler: (() => void) | null = null;

    constructor(baseUrl: string) {
        this.login_url = baseUrl + 'login';
        this.account = baseUrl + 'api/account';
        this.courses = baseUrl + 'api/courses';
        this.courses_id = baseUrl + 'api/courses/';
        this.timeline = baseUrl + 'api/timeline';
        this.timeline_after = baseUrl + 'api/timeline?after=';
    }

    private fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<any | null> {
        return fetch(input, init).then(res => {
            switch (res.status) {
                case 200: return res.json();
                case 401: {
                    this.onDisconnectedHandler?.();
                    return null;
                }
                default: throw res;
            }
        });
    }

    async login(form: FormData): Promise<true | 'invalid_response' | 'database' | 'invalid_credentials'> {
        return await fetch(this.login_url, {
            method: 'POST',
            body: form,
        }).then(async res => {
            if (res.redirected) {
                return true;
            } else {
                const errorKind = (await res.json())?.error_kind as 'database' | 'invalid_credentials';
                if (errorKind) return errorKind;
                else return 'invalid_response';
            }
        });
    }

    async fetchAccountInfo(): Promise<Record<string, any> | null> {
        return await this.fetch(this.account);
    }

    async fetchCourses(archived = false): Promise<Record<string, any>[] | null> {
        return await this.fetch(this.courses + '?archived=' + archived);
    }

    async createCourse(course: any): Promise<Record<string, any> | null> {
        const body = JSON.stringify(course);

        return await this.fetch(this.courses, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
    }

    async updateCourse(course: any) {
        await this.fetch(this.courses_id + course.id, {
            method: 'PUT',
            body: JSON.stringify({
                name: course.name,
                description: course.description,
                j_0: course.j_0,
                j_end: course.j_end,
                recurrence: course.recurrence,
            }),
        });
    }

    async updateCourseRecurrence(courseId: string, recurrence: string, j0: string, jEnd: string) {
        await this.fetch(this.courses_id + courseId + '/recurrence', {
            method: 'POST',
            body: JSON.stringify({
                recurrence,
                j_0: j0,
                j_end: jEnd,
            }),
        });
    }

    async archiveCourse(id: string, archived = true) {
        await this.fetch(this.courses_id + id + '/archived', {
            method: 'PUT',
            body: JSON.stringify(archived),
        });
    }

    async deleteCourse(id: string): Promise<void> {
        await this.fetch(this.courses_id + id, {
            method: 'DELETE',
        });
    }

    async fetchTimeline(): Promise<Record<string, any>[] | null> {
        return this.fetch(this.timeline, { credentials: 'include' });
    }

    async markEvent(courseId: string, j: number, mark: string): Promise<void> {
        await this.fetch(this.courses_id + courseId + '/events/' + j + '/marking', {
            method: 'PUT',
            body: mark,
        });
    }
}

export class RootStore {
    api: Api;

    toasts: ToastStore;
    courseStore: CourseStore;
    eventStore: EventStore;

    accountInfo: {
        id?: string;
        email?: string;
        recurrences: number[][];
    } = {
        id: undefined,
        email: undefined,
        recurrences: [],
    };

    constructor(api: Api = new Api('/')) {
        makeAutoObservable(this, { api: false, toasts: false, courseStore: false, eventStore: false });
        this.api = api;
        this.toasts = new ToastStore();
        this.courseStore = new CourseStore(this);
        this.eventStore = new EventStore(this);

        this.fetchAll();
    }

    fetchAll() {
        this.fetchAccountInfo();
        this.courseStore.loadCourses();
        this.eventStore.fetchTimeline();
    }

    fetchAccountInfo() {
        this.api.fetchAccountInfo().then((ai) => {
            if (ai) runInAction(() => {
                this.accountInfo = ai as any;
            });
        });
    }
}

class Toast {
    readonly store: ToastStore;
    readonly channel: string | undefined;
    readonly text: string;
    readonly severity: Color | undefined = undefined;
    readonly delay: number;
    expired = false;

    constructor(store: ToastStore, text: string, delay: number, severity: Color | undefined, channel: string | undefined) {
        makeAutoObservable(this, { store: false, channel: false, text: false, delay: false });
        this.store = store;
        this.channel = channel;
        this.text = text;
        this.delay = delay;
        this.severity = severity;
    }

    startCountdown() {
        setTimeout(() => runInAction(() => this.expired = true), this.delay);
        setTimeout(() => runInAction(() => this.store.toasts.shift()), this.delay + 200);
    }
}

class ToastStore {
    private static TOAST_DELAY = 2000;

    toasts: Toast[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    showToast(message: string, severity?: Color, channel?: string, delay?: number) {
        if (channel && this.toasts.find((toast) => toast.channel == channel)) return;
        this.toasts.push(new Toast(this, message, delay || ToastStore.TOAST_DELAY, severity, channel));
    }

    get current(): (Toast & { expired: false }) | undefined {
        const toast = this.toasts.length > 0 ? this.toasts[0] : undefined;
        if (toast && !toast.expired) {
            return toast as any;
        } else {
            return undefined;
        }
    }
}

class CourseStore {
    rootStore: RootStore;

    isLoading = false;
    courses: Course[] = [];

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false, findCourse: false });
        this.rootStore = rootStore;
    }

    sort() {
        this.courses.sort((a, b) => (a.j_0.toUtc().getTime() - b.j_0.toUtc().getTime()));
    }

    findCourse(courseId: string) {
        return this.courses.find(({ id }) => id === courseId);
    }

    loadCourses(clear = false) {
        this.isLoading = true;
        this.rootStore.api.fetchCourses().then((courses) => {
            if (courses) runInAction(() => {
                if (clear) this.courses = [];
                for (const course of courses) this.updateCourseFromServer(course);
                this.isLoading = false;
            });
        });
    }

    updateCourseFromServer(json: any) {
        let course = this.findCourse(json.id);
        if (!course) {
            course = new Course(this, json.id);
            this.courses.push(course);
        }

        course.updateFromJson(json);
    }

    createCourse(newCourse: any) {
        const course = new Course(this, '');
        course.name = newCourse.name;
        course.description = newCourse.description;
        course.j_0 = new Day(newCourse.j_0);
        course.j_end = new Day(newCourse.j_end);
        course.recurrence = newCourse.recurrence;
        course.occurrences_ = [[newCourse.j_0, 0, ""]];

        this.courses.push(course);
        this.courses.sort((a, b) => (a.j_0.toUtc().getTime() - b.j_0.toUtc().getTime()));

        this.rootStore.api.createCourse(newCourse).then((newCourse) => {
            if (newCourse) runInAction(() => {
                course.id = newCourse.id;
                course.occurrences_ = newCourse.occurrences;
            });

            this.rootStore.eventStore.fetchTimeline();
        });
    }

    restoreCourse(courseId: string) {
        this.rootStore.api.archiveCourse(courseId, false).then(() => {
            this.loadCourses(true);
            this.rootStore.eventStore.fetchTimeline();
        });
    }

    removeCourse(course: Course) {
        this.courses.splice(this.courses.indexOf(course), 1);
    }
}

export class Course {
    store: CourseStore;

    id: string = '';
    name: string = '';
    description: string | undefined = undefined;
    j_0: Day = undefined as never as Day;
    j_end: Day = undefined as never as Day;
    recurrence: string = '';
    occurrences_: [string, number, string | undefined][] = [];

    get occurrences() {
        const eventStore = this.store.rootStore.eventStore;

        return this.occurrences_.map(([date, j, marking]) => new Occurrence(
            eventStore,
            {
                course: this.id,
                j,
                marking,
                date,
            },
        ));
    }

    constructor(store: CourseStore, id: string) {
        makeAutoObservable(this, { store: false });
        this.store = store;
        this.id = id;
    }

    updateFromJson(json: any) {
        this.name = json.name;
        this.description = json.description;
        this.j_0 = typeof json.j_0 === 'string' ? new Day(json.j_0) : this.j_0;
        this.j_end = typeof json.j_end === 'string' ? new Day(json.j_end) : this.j_end;
        this.recurrence = json.recurrence || this.recurrence;
        this.occurrences_ = json.occurrences || this.occurrences_;

        this.store.sort();
    }

    update(json: any) {
        this.updateFromJson(json);
        this.store.rootStore.api.updateCourse(json).then(() => {
            this.store.loadCourses(true);
            this.store.rootStore.eventStore.fetchTimeline();
        });

        this.store.sort();
    }

    updateRecurrence(recurrence: string, j0: string, jEnd: string) {
        this.recurrence = recurrence;
        this.j_0 = new Day(j0);
        this.j_end = new Day(jEnd);
        this.occurrences_ = [];
        this.store.rootStore.api.updateCourseRecurrence(this.id, recurrence, j0, jEnd).then(() => {
            this.store.loadCourses(true);
            this.store.rootStore.eventStore.fetchTimeline();
        });
    }

    archive() {
        if (!this.id) return;
        this.store.rootStore.api
            .archiveCourse(this.id)
            .then(() => this.store.rootStore.eventStore.fetchTimeline());

        this.store.removeCourse(this);
        this.id = '';
    }

    delete() {
        if (!this.id) return;
        this.store.rootStore.api.deleteCourse(this.id).then(() => this.store.rootStore.eventStore.fetchTimeline());
        this.store.removeCourse(this);
    }
}

export class Occurrence {
    eventStore: EventStore;
    eventJson: any = {};

    constructor(store: EventStore, eventJson: any) {
        makeAutoObservable(this, { eventStore: false });
        this.eventStore = store;
        this.eventJson = eventJson;
    }

    get event() {
        const event = this
            .eventStore
            .timeline
            .find(te => te.courseId === this.eventJson.course && te.j === this.eventJson.j);

        if (event) return event;
        else return new Event(this.eventStore, this.eventJson);
    }
}

class EventStore {
    rootStore: RootStore;

    isLoading = false;
    timeline: Event[] = [];

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    fetchTimeline() {
        this.isLoading = true;
        this.rootStore.api.fetchTimeline().then((events) => {
            if (events) runInAction(() => {
                this.isLoading = false;
                this.timeline.length = 0;
                events.forEach((e) => {
                    const event = new Event(this, e);
                    this.timeline.push(event);
                });
            });
        });
    }

    get timelineToday() {
        return this.timeline.filter(e => e.date.isToday());
    }

    get timeline7Days() {
        const oneWeek = Day.fromUtc(new Date(Date.now() + 1000 * 3600 * 24 * 7));
        return this.timeline.filter(e => e.date.isAfter(Day.today()) && e.date.isBeforeOrEq(oneWeek));
    }

    get timelineRest() {
        const oneWeek = Day.fromUtc(new Date(Date.now() + 1000 * 3600 * 24 * 7));
        return this.timeline.filter(e => e.date.isAfter(oneWeek));
    }
}

export class Event {
    store: EventStore;

    key: string;

    courseId: string;
    j: number;
    marking: string | null = null;
    date: Day;
    previous: { j: number, marking: string | null } | null = null;

    get course() {
        return this.store.rootStore.courseStore.findCourse(this.courseId) || null;
    }

    get isPast() {
        return this.date.isBefore(Day.today());
    }

    get previousEvent(): Event | null {
        return this.store.timeline
            .find((e) => e.courseId === this.courseId && e.j === this.previous?.j) || null;
    }

    get previousMarking() {
        return this.previousEvent?.marking || this.previous?.marking || null;
    }

    constructor(store: EventStore, json: any) {
        makeAutoObservable(this, { store: false, key: false });
        this.key = `${json.course}/${json.j}`;
        this.store = store;
        this.updateFromJson(json);
    }

    updateFromJson(json: any) {
        this.j = json.j;
        this.marking = json.marking || null;
        this.date = new Day(json.date);
        this.courseId = json.course;

        if (typeof json.previous_j === 'number') {
            this.previous = {
                j: json.previous_j,
                marking: json.previous_marking || null,
            };
        }
    }

    mark(mark: string) {
        const lastMark = this.marking;
        this.marking = mark;
        if (this.course) {
            this.store.rootStore.api.markEvent(this.course.id, this.j, mark)
                .catch(() => this.marking = lastMark);
        }
    }
}
