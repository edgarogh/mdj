import {makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, {useEffect, useState} from "react";
import Api, {useApi} from "./Api";
import {BottomButtonProvider} from "./BottomButton";
import CourseEdit from "./CourseEdit";
import CourseList from "./CourseList";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Settings from "./Settings";
import Tabs from "./Tabs";
import Timeline from "./Timeline";
import CalendarScreen from "./CalendarScreen";

const useStyles = makeStyles({
    container: {
        padding: '0 !important',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    main: {
        flex: '1',
        overflowY: 'auto',
        paddingBottom: '8px',
    },
});

function ApiInitializer() {
    const { courses, fetchAccountInfo, fetchTimeline, fetchCourses } = useApi();
    const [ran, setRan] = useState(false);

    useEffect(() => {
        if (window) {
            fetchAccountInfo();
            fetchCourses();
        };
    }, []);

    useEffect(() => {
        if (window && courses && !ran) fetchTimeline().then(() => setRan(true));
    }, [courses, ran]);

    return <></>;
}

export default function App() {
    const classes = useStyles();

    return (
        <Api endpoint="/">
            <CssBaseline/>
            <ApiInitializer/>
            <BottomButtonProvider>
            <Router>
                <Container className={classes.container} maxWidth="sm">
                    <main className={classes.main}>
                        <Switch>
                            <Route path="/calendar">
                                <CalendarScreen/>
                            </Route>
                            <Route path="/courses/:id">
                                <CourseEdit/>
                            </Route>
                            <Route path="/courses">
                                <CourseList/>
                            </Route>
                            <Route path="/settings">
                                <Settings/>
                            </Route>
                            <Route path="/">
                                <Timeline/>
                            </Route>
                        </Switch>
                    </main>
                    <Tabs/>
                </Container>
            </Router>
            </BottomButtonProvider>
        </Api>
    );
}
