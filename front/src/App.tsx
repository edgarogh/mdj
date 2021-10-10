import {makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import React from "react";
import {BottomButtonProvider} from "./BottomButton";
import CourseEdit from "./CourseEdit";
import CourseListScreen from "./CourseListScreen";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Settings from "./Settings";
import Tabs from "./Tabs";
import Timeline from "./Timeline";
import CalendarScreen from "./CalendarScreen";
import * as routes from './routes';

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

export default function App() {
    const classes = useStyles();

    return (
        <>
            <CssBaseline/>
            <BottomButtonProvider>
            <Router>
                <Container className={classes.container} maxWidth="sm">
                    <main className={classes.main}>
                        <Switch>
                            <Route path={routes.CALENDAR}>
                                <CalendarScreen/>
                            </Route>
                            <Route path={routes.COURSES_EDIT}>
                                <CourseEdit/>
                            </Route>
                            <Route path={routes.COURSES}>
                                <CourseListScreen/>
                            </Route>
                            <Route path={routes.TAB_SETTINGS}>
                                <Settings/>
                            </Route>
                            <Route path={routes.TIMELINE}>
                                <Timeline/>
                            </Route>
                        </Switch>
                    </main>
                    <Tabs/>
                </Container>
            </Router>
            </BottomButtonProvider>
        </>
    );
}
