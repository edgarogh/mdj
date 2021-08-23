import {CardActions, makeStyles} from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import CardHeader from "@material-ui/core/CardHeader";
import Card from "@material-ui/core/Card";
import Skeleton from "@material-ui/lab/Skeleton";
import {useCallback} from "react";
import {Link} from "react-router-dom";
import {Course, useApi} from "./Api";
import Button from "@material-ui/core/Button";

export interface CourseViewProps {
    course: Course | undefined,
}

const useStyles = makeStyles((theme) => ({
    card: {
        margin: '8px',
    },
    recurrenceSummary: {
        display: 'flex',
        background: 'lightgray',
        padding: '8px',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));

export default function CourseView({ course }: CourseViewProps) {
    const classes = useStyles();
    const { deleteCourse } = useApi();

    const isLoaded = !!course?.id;

    const onDeleteButtonClick = useCallback(() => {
        if (course?.id && confirm(`Voulez vous vraiment supprimer "${course.name}" ?`)) {
            deleteCourse(course.id);
        }
    }, [course?.id]);

    return (
        <Card className={classes.card}>
            <CardHeader
                title={!!course ? course.name : <Skeleton/>}
                subheader={course?.description}
            />
            {!!course ? (
                // <div className={classes.recurrenceSummary}>
                //     <Chip clickable={isLoaded} label="08 août 21" disabled/>
                //     <Chip clickable={isLoaded} label="09 sept. 21"/>
                //     <Chip clickable={isLoaded} label="12 nov. 21"/>
                // </div>
                false
            ) : (
                <Skeleton variant="rect" height={56}/>
            )}
            <CardActions>
                <Button disabled={!isLoaded} size="small" to={isLoaded ? `/courses/${course.id}` : undefined} component={isLoaded ? Link : undefined}>Modifier</Button>
                <Button disabled={!isLoaded} size="small" onClick={onDeleteButtonClick}>Supprimer</Button>
            </CardActions>
        </Card>
    );
}
