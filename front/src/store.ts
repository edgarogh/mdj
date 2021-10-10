import {makeAutoObservable, runInAction} from "mobx";
import Day from "./Day";

class Api {
    private account: string;
    private courses: string;
    private courses_id: string;
    private timeline: string;
    private timeline_after: string;

    constructor(baseUrl: string) {
        this.account = baseUrl + 'api/account';
        this.courses = baseUrl + 'api/courses';
        this.courses_id = baseUrl + 'api/courses/';
        this.timeline = baseUrl + 'api/timeline';
        this.timeline_after = baseUrl + 'api/timeline?after=';
    }

    async fetchAccountInfo(): Promise<any> {
        return await fetch(this.account).then(res => res.json());
    }

    async fetchCourses(archived = false): Promise<any> {
        return await fetch(this.courses + '?archived=' + archived).then(res => res.json());
    }

    async createCourse(course: any): Promise<any> {
        const body = JSON.stringify(course);

        return await fetch(this.courses, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        }).then(res => res.json());
    }

    async updateCourse(course: any) {
        await fetch(this.courses_id + course.id, {
            method: 'PUT',
            body: JSON.stringify({
                name: course.name,
                description: course.description,
                j_0: course.j_0,
                j_end: course.j_end,
                recurrence: course.recurrence,
            }),
        }).then(res => res.json());
    }

    async archiveCourse(id: string, archived = true) {
        await fetch(this.courses_id + id + '/archived', {
            method: 'PUT',
            body: JSON.stringify(archived),
        }).then(res => res.json());
    }

    async deleteCourse(id: string): Promise<void> {
        await fetch(this.courses_id + id, {
            method: 'DELETE',
        }).then(res => res.text());
    }

    async fetchTimeline(): Promise<any[]> {
        return fetch(this.timeline, { credentials: 'include' }).then(res => res.json());
    }

    async markEvent(courseId: string, j: number, mark: string): Promise<void> {
        await fetch(this.courses_id + courseId + '/events/' + j, {
            method: 'PUT',
            body: mark,
        }).then((res) => res.json());
    }
}

export class RootStore {
    api: Api;
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
        makeAutoObservable(this, { api: false, courseStore: false, eventStore: false });
        this.api = api;
        this.courseStore = new CourseStore(this);
        this.eventStore = new EventStore(this);

        this.api.fetchAccountInfo().then((ai) => {
            runInAction(() => {
                this.accountInfo = ai;
            });
        });
    }
}

class CourseStore {
    rootStore: RootStore;

    isLoading = false;
    courses: Course[] = [];

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false, findCourse: false });
        this.rootStore = rootStore;
        this.loadCourses();
    }

    findCourse(courseId: string) {
        return this.courses.find(({ id }) => id === courseId);
    }

    loadCourses(clear = false) {
        this.isLoading = true;
        this.rootStore.api.fetchCourses().then((courses) => {
            runInAction(() => {
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
        course.occurrences = [[newCourse.j_0, ""]];

        this.courses.push(course);
        this.courses.sort((a, b) => (a.j_0.toUtc().getTime() - b.j_0.toUtc().getTime()));

        this.rootStore.api.createCourse(newCourse).then(({ id, occurrences }) => {
            runInAction(() => {
                course.id = id;
                course.occurrences = occurrences;
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
    occurrences: [string, string][] = [];

    constructor(store: CourseStore, id: string) {
        makeAutoObservable(this, { store: false });
        this.store = store;
        this.id = id;
    }

    updateFromJson(json: any) {
        this.name = json.name;
        this.description = json.description;
        this.j_0 = new Day(json.j_0);
        this.j_end = new Day(json.j_end);
        this.recurrence = json.recurrence;
        this.occurrences = json.occurrences || [];

        this.store.courses.sort((a, b) => (a.j_0.toUtc().getTime() - b.j_0.toUtc().getTime()));
    }

    update(json: any) {
        this.updateFromJson(json);
        this.store.rootStore.api.updateCourse(json).then(() => {
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

class EventStore {
    rootStore: RootStore;

    isLoading = false;
    timeline: Event[] = [];

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
        this.fetchTimeline();
    }

    fetchTimeline() {
        this.isLoading = true;
        this.rootStore.api.fetchTimeline().then((events) => {
            runInAction(() => {
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

    get course() {
        return this.store.rootStore.courseStore.findCourse(this.courseId) || null;
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
