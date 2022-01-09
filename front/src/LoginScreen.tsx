import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import React, {FormEvent, useCallback, useRef, useState} from "react";
import {useHistory} from "react-router-dom";
import {WithBottomButton} from "./BottomButton";
import {useRootStore} from "./StoreProvider";
import {VOID_URL} from "./utils";
import * as routes from "./routes";
import {styled} from "@mui/material/styles";

const Form = styled('form')`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & > * {
        width: 80%;
    }
    
    & > *:nth-child(2) {
        margin-bottom: 16px;
    }
`;

const FakeLogo = styled('div')`
    width: 128px;
    height: 128px;
    box-sizing: border-box;
    padding: 20px;
    border: 3px dashed red;
    border-radius: 12px;
    margin-bottom: 32px;
    cursor: default;
`;

const PasswordLink = styled(Link)`
    text-align: end;
`;

export default function LoginScreen() {
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
        <Form method="post" onSubmit={doLogin} ref={formRef}>
            <FakeLogo aria-hidden>N.B.: penser à faire un logo</FakeLogo>
            <TextField label={"Adresse e-mail"} disabled={loggingIn} variant="outlined" type="text" name="email" placeholder="john@doe.net" />
            <TextField label={"Mot de passe"} disabled={loggingIn} variant="outlined" type="password" name="password" placeholder="azerty1234" />
            <PasswordLink variant="caption" onClick={passwordForgotten} href={VOID_URL}>Mot de passe oublié</PasswordLink>
            <PasswordLink variant="caption" onClick={noAccount} href={VOID_URL}>Je n'ai pas de compte</PasswordLink>
            <WithBottomButton instance="login" disabled={loggingIn} label={"Se connecter"} onClick={doLogin}/>
        </Form>
    );
}
