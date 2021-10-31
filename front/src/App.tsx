import {makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, {useEffect} from "react";
import {BrowserRouter as Router, Route, Switch, useHistory} from "react-router-dom";
import {BottomButtonProvider} from "./BottomButton";
import CalendarScreen from "./CalendarScreen";
import CourseEdit from "./course/CourseEdit";
import CourseListScreen from "./CourseListScreen";
import LoginScreen from "./LoginScreen";
import * as routes from "./routes";
import Settings from "./Settings";
import {useRootStore} from "./StoreProvider";
import Tabs from "./Tabs";
import Timeline from "./Timeline";

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

/**
 * Imperative component that captures `react-router`'s history object and creates an handler for when the API returns
 * status code "401 Unauthorized", which would indicate that the current session is invalid.
 */
function SetupUnauthorizedHandler() {
    const { api } = useRootStore();
    const history = useHistory();

    useEffect(() => {
        api.onDisconnectedHandler = () => {
           if (history.location.pathname !== routes.LOGIN) {
               // TODO "Your session has expired" snackbar
               history.push(routes.LOGIN);
           }
        };
    }, []);

    return <></>;
}

export default function App() {
    const classes = useStyles();

    return (
        <>
            <CssBaseline/>
            <BottomButtonProvider>
            <Router>
                <SetupUnauthorizedHandler />
                <Container className={classes.container} maxWidth="sm">
                    <main className={classes.main}>
                        <Switch>
                            <Route path={routes.LOGIN}>
                                <LoginScreen/>
                            </Route>
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
