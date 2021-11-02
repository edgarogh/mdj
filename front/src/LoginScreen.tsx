import {makeStyles} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import React, {FormEvent, useCallback, useRef, useState} from "react";
import {useHistory} from "react-router-dom";
import {WithBottomButton} from "./BottomButton";
import {useRootStore} from "./StoreProvider";
import {VOID_URL} from "./utils";
import * as routes from "./routes";

const useStyles = makeStyles({
    form: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        '& > *': {
            width: '80%',
        },

        '& > *:nth-child(2)': {
            marginBottom: '16px',
        },
    },
    logo: {
        width: '128px',
        height: '128px',
        boxSizing: 'border-box',
        padding: '20px',
        border: '3px dashed red',
        borderRadius: '12px',
        marginBottom: '32px',
        cursor: 'default',
    },
    passwordLink: {
        textAlign: 'end',
    },
});

export default function LoginScreen() {
    const classes = useStyles();
    const rootStore = useRootStore();
    const history = useHistory();

    const formRef = useRef<HTMLFormElement | null>(null);
    const [loggingIn, setLoggingIn] = useState(false);

    const doLogin = useCallback((e?: FormEvent) => {
        e?.preventDefault();
        const formData = formRef.current ? new FormData(formRef.current) : null;
        if (formData) {
            setLoggingIn(true);
            rootStore.api.login(formData).then(result => {
                setLoggingIn(false);
                const showToast = (message) => rootStore.toasts.showToast(message, 'error', 'login');
                switch (result) {
                    case true: {
                        rootStore.fetchAll();
                        history.push(routes.TIMELINE);
                        break;
                    }
                    case 'database': {
                        showToast('Erreur interne. Veuillez réessayer plus tard.')
                        break;
                    }
                    case 'invalid_credentials': {
                        showToast('Identifiants invalides')
                        break;
                    }
                    case 'invalid_response': {
                        showToast('Le serveur à renvoyé une réponse invalide. Essayez de recharger la page ?')
                        break;
                    }
                }
            });
        }
    }, []);

    const passwordForgotten = useCallback(() => {
        alert("Envoie un message à dev@edgar.bzh et explique ton problème ;)")
    }, []);

    const noAccount = useCallback(() => {
        alert("Dommage.");
        alert("Non, sérieusement, tu peux envoyer un mail à dev@edgar.bzh pour avoir un compte. Il sera bientôt possible de s'inscrire normalement sinon.")
    }, []);

    return (
        <form className={classes.form} method="post" onSubmit={doLogin} ref={formRef}>
            <div aria-disabled className={classes.logo}>N.B.: penser à faire un logo</div>
            <TextField label={"Adresse e-mail"} disabled={loggingIn} variant="outlined" type="text" name="email" placeholder="john@doe.net" />
            <TextField label={"Mot de passe"} disabled={loggingIn} variant="outlined" type="password" name="password" placeholder="azerty1234" />
            <Link className={classes.passwordLink} variant="caption" onClick={passwordForgotten} href={VOID_URL}>Mot de passe oublié</Link>
            <Link className={classes.passwordLink} variant="caption" onClick={noAccount} href={VOID_URL}>Je n'ai pas de compte</Link>
            <WithBottomButton instance="login" disabled={loggingIn} label={"Se connecter"} onClick={doLogin}/>
        </form>
    );
}
