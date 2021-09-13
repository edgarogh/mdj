import React, {createContext, ReactNode, useContext, useMemo, useState} from "react";
import Day from "./Day";

export interface AccountInfo {
    id?: string;
    email?: string;
    recurrences: number[][];
}

export interface Event {
    course: Course;
    j: number;
    marking: string;
    date: Day;
}

export interface Course {
    id: string;
    name: string;
    description?: string;
    j_0: string;
    j_end: string;
    recurrence: string;

    occurrences: [string, string][];
}

export interface Api {
    accountInfo: AccountInfo;
    timeline?: Event[];
    courses?: Course[];

    fetchAccountInfo(): Promise<void>;

    fetchTimeline(): Promise<void>;
    markEvent(course: string, j: number, mark: string): Promise<void>;

    fetchCourses(): Promise<void>;
    insertOrUpdateCourse(course: Course): Promise<void>;
    deleteCourse(id: string): Promise<void>;
}

export const ApiContext = createContext<Api>(undefined as never);

export interface ApiProps {
    endpoint: string;
    children: ReactNode | undefined;
}

export default function Api(props: ApiProps) {
    const [accountInfo, setAccountInfo] = useState({
        id: undefined,
        email: undefined,
        recurrences: [],
    } as AccountInfo);
    const [timeline, setTimeline] = useState<Event[] | undefined>();
    const [courses, setCourses] = useState<Course[] | undefined>();

    const value = useMemo<Api>(() => {
        const endpoint = props.endpoint;

        let ENDPOINTS =  {
            account: endpoint + 'api/account',
            courses: endpoint + 'api/courses',
            courses_id: endpoint + 'api/courses/',
            timeline: endpoint + 'api/timeline',
            timeline_after: endpoint + 'api/timeline?after=',
        };

        const value: Api = {
            accountInfo,
            timeline,
            courses,

            async fetchAccountInfo(): Promise<void> {
                setAccountInfo(await fetch(ENDPOINTS.account).then(res => res.json()));
            },

            fetchTimeline() {
                if (!courses) {
                    throw "Courses not loaded";
                }

                return fetch(ENDPOINTS.timeline, { credentials: 'include' }).then(res => res.json()).then((res: any[]) => {
                    setTimeline(res.map((e) => Object.assign(e, {
                        date: new Day(e.date),
                        course: courses?.find((c) => c.id === (e as any).course),
                    }) as Event));
                });
            },

            async markEvent(course: string, j: number, mark: string) {
                const localEvent = (timeline || []).find((e) => (e.course.id === course && e.j === j));
                if (localEvent) {
                    localEvent.marking = mark;
                    setTimeline(timeline);
                }

                setTimeline(timeline && [...timeline]);

                await fetch(ENDPOINTS.courses_id + course + '/events/' + j, {
                    method: 'PUT',
                    body: mark,
                });
            },

            async fetchCourses() {
                const res = await fetch(ENDPOINTS.courses).then(res => res.json());
                setCourses(res);
            },

            async insertOrUpdateCourse(newCourse) {
                if (!courses) {
                    throw "Courses not loaded";
                }

                if (newCourse.id) {
                    const course = courses.find((c) => c.id === newCourse.id)!!;
                    course.name = newCourse.name;
                    course.description = newCourse.description;
                    course.j_0 = newCourse.j_0;
                    course.j_end = newCourse.j_end;
                    course.recurrence = newCourse.recurrence;
                    course.occurrences = [[course.j_0, ""]];

                    courses.sort((a, b) => (new Date(a.j_0).getTime() - new Date(b.j_0).getTime()));
                    setCourses([...courses]);

                    await fetch(ENDPOINTS.courses_id + newCourse.id, {
                        method: 'PUT',
                        body: JSON.stringify({
                            name: newCourse.name,
                            description: newCourse.description,
                            j_0: newCourse.j_0,
                            j_end: newCourse.j_end,
                            recurrence: newCourse.recurrence,
                        }),
                    }).then(res => res.json()).then(() => Promise.all([value.fetchCourses(), value.fetchTimeline()]));
                } else {
                    const course = {
                        id: undefined as (string | undefined),
                        name: newCourse.name,
                        description: newCourse.description,
                        j_0: newCourse.j_0,
                        j_end: newCourse.j_end,
                        recurrence: newCourse.recurrence,
                        occurrences: [[newCourse.j_0, ""]],
                    };

                    const body = JSON.stringify(course);

                    course.id = '';

                    courses.push(course as Course);
                    courses.sort((a, b) => (new Day(a.j_0).toUtc().getTime() - new Day(b.j_0).toUtc().getTime()));
                    setCourses([...courses]);

                    const inserted = await fetch(ENDPOINTS.courses, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body,
                    }).then(res => res.json());

                    course.id = inserted.id;
                    course.occurrences = inserted.occurrences;

                    await value.fetchTimeline();
                }
            },

            async deleteCourse(id: string) {
                if (!courses) {
                    throw "Courses not loaded";
                }

                await fetch(ENDPOINTS.courses_id + id, {
                    method: 'DELETE',
                }).then(res => res.text()).then(() => value.fetchTimeline());

                setCourses(courses.filter((c) => c.id !== id));
            },
        };

        return value;
    }, [props.endpoint, timeline, courses]);

    return <ApiContext.Provider value={value}>{props.children}</ApiContext.Provider>
}

export const useApi = () => useContext(ApiContext);
