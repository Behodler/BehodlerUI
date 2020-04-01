import * as React from 'react'
import { List, ListItem, TextField, Typography, Paper, Button } from '@material-ui/core'

interface behodlerProps {

}

export default function Behodler(props: behodlerProps) {
    return <div>
        <List>
            <ListItem>
                <Paper>
                    <Typography variant="h5">Seed </Typography>
                    <List>
                        <ListItem>
                            <TextField label="lachesis"></TextField>
                        </ListItem>
                        <ListItem>
                            <TextField label="kharon"></TextField>
                        </ListItem>
                        <ListItem>
                            <TextField label="janus"></TextField>
                        </ListItem>
                        <ListItem>
                            <TextField label="chronos"></TextField>
                        </ListItem>
                    </List>
                    <Button variant="contained" color="secondary">Execute</Button>
                </Paper>
            </ListItem>
            <ListItem>
                <Paper>
                    <Typography variant="h5">CalculateAverageScarcityPerToken </Typography>
                    <List>
                        <ListItem>
                            <TextField label="token"></TextField>
                        </ListItem>
                        <ListItem>
                            <TextField label="value (uint)"></TextField>
                        </ListItem>
                    </List>
                    <Button variant="contained" color="secondary">Execute</Button>
                </Paper>
            </ListItem>
        </List>
    </div>
}