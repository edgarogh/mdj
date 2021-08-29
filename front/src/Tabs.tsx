import {BottomNavigation, BottomNavigationAction, makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CalendarViewDayRoundedIcon from "@material-ui/icons/CalendarViewDayRounded";
import LessonsIcon from "@material-ui/icons/LibraryBooksRounded";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";
import {Link, useRouteMatch} from "react-router-dom";
import {useBottomButtonProps} from "./BottomButton";
import {useNonNullMemo} from "./utils";

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

    const routeMatch = useRouteMatch(['/courses/:id', '/courses', '/settings', '/']);
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
                <BottomNavigationAction label={"Fil"} icon={<CalendarViewDayRoundedIcon />} value="/" to="/" component={Link} />
                <BottomNavigationAction label={"Cours"} icon={<LessonsIcon />} value="/courses" to="/courses" component={Link} />
                <BottomNavigationAction label={"Paramètres"} icon={<SettingsIcon />} value="/settings" to="/settings" component={Link} />
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
