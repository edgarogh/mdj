import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CalendarIcon from "@material-ui/icons/DateRange";
import Skeleton from "@material-ui/lab/Skeleton";
import {observer} from "mobx-react-lite";
import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useRootStore} from "./StoreProvider";
import Category from "./timeline/Category";
import Title from "./Title";

const useStyles = makeStyles({
    padded: {
        padding: '12px 8px 8px 8px',
    },
    calendarButtonContainer: {
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default observer(function Timeline() {
    const classes = useStyles();
    const store = useRootStore();

    const email = store.accountInfo?.email;
    const timeline = store.eventStore.timeline;

    const [expanded, setExpanded] = useState<string | undefined>(undefined);

    const categories =
        store.eventStore.isLoading ? (
            <>
                <Category name='today' events={undefined}/>
                <Category name='week' events={undefined}/>
            </>
        ) : (
            <>
                <Category name="today" events={store.eventStore.timelineToday} expanded={expanded} setExpanded={setExpanded}/>
                <Category name="week" events={store.eventStore.timeline7Days} expanded={expanded} setExpanded={setExpanded}/>
                <Category name="rest" events={store.eventStore.timelineRest} expanded={expanded} setExpanded={setExpanded}/>
            </>
        );

    return <>
        <div className={classes.padded}>
            <Title/>
            <Typography variant="caption" color="textSecondary">
                {email ? (
                    "Connecté en tant que " + email
                ) : (
                    <Skeleton width="60%"/>
                )}
            </Typography>
        </div>

        {categories}

        {(timeline.length > 0) && <div className={classes.calendarButtonContainer}>
            <Button
                variant="contained"
                endIcon={<CalendarIcon/>}
                component={Link}
                to="/calendar"
            >
                Voir le calendrier (EXPÉRIMENTAL)
            </Button>
        </div>}
    </>;
});
