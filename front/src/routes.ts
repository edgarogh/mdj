export const TIMELINE = '/';
export const CALENDAR = '/calendar';
export const TAB_TIMELINE = [TIMELINE, CALENDAR] as const;

export const COURSES = '/courses';
export const COURSES_EDIT = '/courses/:id';
export const TAB_COURSES = [COURSES, COURSES_EDIT] as const;

export const SETTINGS = '/settings';
export const ARCHIVE_COURSES = '/archive/courses';
export const TAB_SETTINGS = [SETTINGS, ARCHIVE_COURSES] as const;
