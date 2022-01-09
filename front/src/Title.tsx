import Typography from "@mui/material/Typography";
import React, {useEffect, useState} from "react";

const J = [0, 1, 3, 7, 14, 28];

export default function Title() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const i = setInterval(() => {
            setIdx((idx + 1) % J.length);
        }, 1000);

        return () => clearInterval(i);
    })

    return (
        <Typography variant="h4" component="h1">Méthode des J</Typography>
    );
}
