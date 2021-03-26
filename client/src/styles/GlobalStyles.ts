import { createStyles, makeStyles } from "@material-ui/core";

// some default config to make styling easier

const useStyles = makeStyles(() =>
    createStyles({
        "@global": {
            "*": {
                boxSizing: "border-box",
                margin: 0,
                padding: 0,
            },
            html: {
                height: "100%",
                width: "100%",
            },
            body: {
                height: "100%",
                width: "100%",
            },
            "#root": {
                height: "100%",
                width: "100%",
            },
        },
    })
);

const GlobalStyles = () => {
    useStyles();

    return null;
};

export default GlobalStyles;
