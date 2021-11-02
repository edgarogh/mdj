import Button, {ButtonProps} from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

export interface EmptyStateProps {
    illustration: string | URL;
    title: string;
    subtitle: string;
    ctaLabel?: string;
    ctaOnClick?: () => void;
    ctaProps?: Partial<ButtonProps>;
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '80%',
        flex: 1,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButton: {
        marginTop: theme.spacing(2),
    },
}));

export default function EmptyState(props: EmptyStateProps) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img aria-hidden alt="" src={props.illustration as string}/>
            <Typography variant="h5" component="h3">{props.title}</Typography>
            <Typography variant="subtitle1" component="p">{props.subtitle}</Typography>
            {props.ctaLabel && (
                <Button
                    className={classes.ctaButton}
                    variant="contained"
                    color="primary"
                    onClick={props.ctaOnClick}
                    {...props.ctaProps}
                >
                    {props.ctaLabel}
                </Button>
            )}
        </div>
    );
}
