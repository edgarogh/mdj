import {makeStyles} from "@mui/styles";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Button from "@mui/material/Button";
import CalendarViewDayRoundedIcon from "@mui/icons-material/CalendarViewDayRounded";
import LessonsIcon from "@mui/icons-material/LibraryBooksRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import React from "react";
import {Link, useRouteMatch} from "react-router-dom";
import {useBottomButtonProps} from "./BottomButton";
import {useNonNullMemo} from "./utils";
import * as routes from './routes';

const useStyles = makeStyles({
    container: {
        position: 'relative',
        height: '56px',
        width: '100%',
        overflow: 'hidden',
        '& > *': {
            position: 'absolute',
            height: '56px',
            width: '100%',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    },
    buttonContainer: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        background: 'white',
        pointerEvents: 'none',
        transform: 'translateY(50%)',
        opacity: '0',
        transition: 'transform 0.2s, opacity 0.2s',
    },
    buttonContainerVisible: {
        display: 'inherit',
        transform: 'translateY(0)',
        opacity: '1',
        pointerEvents: 'inherit',
    },
    button: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        width: '100%',
        height: '100%',
    },
});

export default function Tabs() {
    const classes = useStyles();

    // @ts-ignore
    const routeMatch = useRouteMatch([routes.TAB_COURSES, routes.TAB_SETTINGS, routes.TAB_TIMELINE]);
    const currentTab = routeMatch?.path;

    const bottomButtonProps = useBottomButtonProps();
    const buttonInstance = useNonNullMemo(bottomButtonProps?.instance);
    const label = useNonNullMemo(bottomButtonProps?.label);

    return (
        <div className={classes.container}>
            <BottomNavigation
                value={currentTab}
                showLabels
                aria-disabled={!!bottomButtonProps}
            >
                <BottomNavigationAction label={"Fil"} icon={<CalendarViewDayRoundedIcon />} value={routes.TAB_TIMELINE} to="/" component={Link} />
                <BottomNavigationAction label={"Cours"} icon={<LessonsIcon />} value={routes.TAB_COURSES} to="/courses" component={Link} />
                <BottomNavigationAction label={"Paramètres"} icon={<SettingsIcon />} value={routes.TAB_SETTINGS} to="/settings" component={Link} />
            </BottomNavigation>
            <div
                className={`${classes.buttonContainer} ${bottomButtonProps ? classes.buttonContainerVisible : ''}`}
                style={{background: 'white'}}
            >
                <Button
                    key={buttonInstance}
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    disabled={bottomButtonProps?.disabled}
                    aria-disabled={!bottomButtonProps}
                    onClick={bottomButtonProps?.onClick}
                >
                    {label}
                </Button>
            </div>
        </div>
    );
}
