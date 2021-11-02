import {makeStyles} from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import {observer} from "mobx-react-lite";
import React, {useCallback, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import CourseList from "./course/CourseList";
import EmptyState from "./EmptyState";
import preload from "./preload";
import {Course} from "./store";
import {useRootStore} from "./StoreProvider";

const EMPTY_STATE = preload(new URL('../assets/empty_state_courses.min.svg', import.meta.url));
const EMPTY_STATE_SEARCH = preload(new URL('../assets/empty_state_courses_search.min.svg', import.meta.url));

function searchCourses(courses: Course[], searchInput: string) {
    if (process.env.NODE_ENV !== 'production') console.profile('course search');
    if (searchInput.length === 0) return courses;
    const input = searchInput.toLowerCase().split(/\s+/g).filter((term) => term.length > 0);
    return courses
        .map((course) => [
            course,
            input.map((term) => (
                (course.name.toLowerCase().includes(term) ? term.length : 0)
                + (course.description?.toLowerCase()?.includes(term) ? term.length : 0)
            )).reduce((a, b) => a + b, 0), // sum
        ] as const)
        .filter(([_, occurrences]) => occurrences > 0)
        .sort(([_, a], [__, b]) => b - a)
        .map(([course, _]) => course);
}

const useStyles = makeStyles((theme) => ({
    search: {
        width: `calc(100% - ${2 * theme.spacing(1)}px) !important`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: theme.spacing(1),
        padding: '2px 4px',
    },
    searchInput: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    searchIconButton: {
        padding: 10,
    },
    searchDivider: {
        height: 28,
        margin: 4,
    },
}));

export default observer(function CourseListScreen() {
    const classes = useStyles();
    const { courseStore } = useRootStore();

    const courses = courseStore.courses;

    const [searchInput, setSearchInput] = useState('');
    const onSearchChange = useCallback((e) => {
        setSearchInput(e.target.value);
    }, []);

    const filteredCourses = useMemo(() => searchCourses(courses, searchInput), [searchInput, courses]);
    const searchDisabled = courseStore.isLoading || (courses.length == 0);

    return (
        <>
            <Paper className={classes.search}>
                <InputBase
                    className={classes.searchInput}
                    placeholder={"Rechercher un cours"}
                    disabled={searchDisabled}
                    value={searchInput}
                    onChange={onSearchChange}
                />
                <IconButton
                    className={classes.searchIconButton}
                    disabled={searchDisabled}
                    aria-hidden // This button is useless, it just hides the keyboard on mobile by getting focus
                >
                    <SearchIcon/>
                </IconButton>
                <Divider className={classes.searchDivider} orientation="vertical"/>
                <IconButton
                    className={classes.searchIconButton}
                    disabled={courseStore.isLoading}
                    title={"Ajouter un cours"}
                    aria-label={"Ajouter un cours"}
                    component={Link}
                    to="/courses/new"
                >
                    <AddIcon/>
                </IconButton>
            </Paper>
            {courseStore.isLoading || filteredCourses.length > 0 ? (
                <CourseList courses={courseStore.isLoading ? undefined : filteredCourses}/>
            ) : courses.length > 0 ? (
                <EmptyState
                    illustration={EMPTY_STATE_SEARCH}
                    title={"Aucun cours"}
                    subtitle={"Essayez d'autres termes de recherche"}
                />
            ) : (
                <EmptyState
                    illustration={EMPTY_STATE}
                    title={"Aucun cours"}
                    subtitle={"Allez-vous abandonner dès maintenant ?"}
                    ctaLabel={"Créer un cours"}
                    ctaProps={{ component: Link, to: "/courses/new" }}
                />
            )}
        </>
    );
});
