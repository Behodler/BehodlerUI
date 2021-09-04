import { createStyles, makeStyles } from '@material-ui/core'

// some default config to make styling easier

const useStyles = makeStyles(() =>
    createStyles({
        '@global': {
            '*::-webkit-scrollbar': {
                width: '0.4em',
            },
            '*::-webkit-scrollbar-track': {
                '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
            },
            '*::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.1)',
                outline: '1px solid slategrey',
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
                fontFamily: 'Gilroy-medium',
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
