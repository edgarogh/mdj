import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CalendarIcon from "@mui/icons-material/DateRange";
import Skeleton from "@mui/material/Skeleton";
import {observer} from "mobx-react-lite";
import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useRootStore} from "./StoreProvider";
import Category from "./timeline/Category";
import Title from "./Title";
import {styled} from "@mui/material/styles";

const PaddedContainer = styled('div')`
    padding: ${({theme}) => theme.spacing(1.5)}${({theme}) => (' ' + theme.spacing(1)).repeat(3)};
`;

const CalendarButtonContainer = styled('div')`
    width: 100%;
    padding: ${({theme}) => theme.spacing(3)};
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

export default observer(function Timeline() {
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
        <PaddedContainer>
            <Title/>
            <Typography variant="caption" color="textSecondary">
                {email ? (
                    "Connecté en tant que " + email
                ) : (
                    <Skeleton width="60%"/>
                )}
            </Typography>
        </PaddedContainer>

        {categories}

        {(timeline.length > 0) && <CalendarButtonContainer>
            <Button
                variant="contained"
                endIcon={<CalendarIcon/>}
                component={Link}
                to="/calendar"
            >
                Voir le calendrier (EXPÉRIMENTAL)
            </Button>
        </CalendarButtonContainer>}
    </>;
});
