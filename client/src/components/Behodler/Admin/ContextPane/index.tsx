import * as React from 'react'
// import { useState } from 'react'
// import { useTheme, withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ListItemText } from '@material-ui/core';
interface contextPaneProps {
    selectedContract:string
}

function ContextPane(props: contextPaneProps) {
const selectedText = 'selected: '+props.selectedContract
    return (
        <List>
            <ListItem button>
                <ListItemText primary={selectedText} />
            </ListItem>
        </List>
    )
}

export default ContextPane