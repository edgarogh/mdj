import {BottomNavigation, BottomNavigationAction, makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CalendarViewDayRoundedIcon from "@material-ui/icons/CalendarViewDayRounded";
import LessonsIcon from "@material-ui/icons/LibraryBooksRounded";
import SettingsIcon from "@material-ui/icons/Settings";
import {Link, useRouteMatch} from "react-router-dom";
import {useBottomButtonProps} from "./BottomButton";

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    button: {
        height: '56px', width: '100%',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
});

export default function Tabs() {
    const classes = useStyles();

    const routeMatch = useRouteMatch(['/courses/:id', '/courses', '/settings', '/']);
    const currentTab = routeMatch?.path;

    const bottomButtonProps = useBottomButtonProps();

    if (bottomButtonProps) {
        return (
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={bottomButtonProps.onClick}
            >
                {bottomButtonProps.label}
            </Button>
        );
    }

    return (
        <BottomNavigation
            value={currentTab}
            showLabels
            className={classes.root}
        >
            <BottomNavigationAction label="Fil" icon={<CalendarViewDayRoundedIcon />} value="/" to="/" component={Link} />
            <BottomNavigationAction label="Cours" icon={<LessonsIcon />} value="/courses" to="/courses" component={Link} />
            <BottomNavigationAction label="Paramètres" icon={<SettingsIcon />} value="/settings" to="/settings" component={Link} />
        </BottomNavigation>
    );
}
