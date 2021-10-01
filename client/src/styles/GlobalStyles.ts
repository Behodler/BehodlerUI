import { createStyles, makeStyles } from '@material-ui/core'

// some default config to make styling easier

const useStyles = makeStyles(() =>
    createStyles({
        '@global': {
            "*::-webkit-scrollbar-track":
            {
                backgroundColor: "#15102f !important"
            },
            "*::-webkit-scrollbar":
            {
                width: 8,
                backgroundColor: "#F5F5F5 !important"
            },
            "*::-webkit-scrollbar-thumb": {
                borderRadius: 10,
                background: "rgba(107,80,181,0.7) !important"
    
            },
            '*': {
                boxSizing: 'border-box',
                margin: 0,
                padding: 0,
            },
            html: {
                height: '100%',
                width: '100%',
            },
            body: {
                height: '100%',
                width: '100%',
                fontFamily: 'Gilroy',
            },
            '#root': {
                height: '100%',
                width: '100%',
            },
        },
    })
)

const GlobalStyles = () => {
    useStyles()

    return null
}

export default GlobalStyles
