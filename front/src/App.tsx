import {createTheme, ThemeProvider} from "@mui/material/styles";
import MuiContainer from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
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
import Toast from "./Toast";
import {styled} from "@mui/material/styles";

const Container = styled(MuiContainer)`
    padding: 0 !important;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const Main = styled('main')`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding-bottom: ${({theme}) => theme.spacing(1)};

    & > *:not(.MuiSnackbar-root) {
        width: 100%;
    }
`;

/**
 * Imperative component that captures `react-router`'s history object and creates an handler for when the API returns
 * status code "401 Unauthorized", which would indicate that the current session is invalid.
 */
function SetupUnauthorizedHandler() {
    const { api, toasts } = useRootStore();
    const history = useHistory();

    useEffect(() => {
        api.onDisconnectedHandler = () => {
            if (history.location.pathname !== routes.LOGIN) {
                toasts.showToast('Votre session a expiré, veuillez vous reconnecter', 'info', undefined, 5000);
                history.push(routes.LOGIN);
            }
        };
    }, []);

    return <></>;
}

const THEME = createTheme();

export default function App() {
    return (
        <ThemeProvider theme={THEME}>
            <CssBaseline/>
            <BottomButtonProvider>
            <Router>
                <SetupUnauthorizedHandler />
                <Container maxWidth="sm">
                    <Main>
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
                        <Toast bottom={56 + 16}/>
                    </Main>
                    <Tabs/>
                </Container>
            </Router>
            </BottomButtonProvider>
        </ThemeProvider>
    );
}
