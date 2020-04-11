import * as React from 'react'

interface props {
    text: string
}

export default function ExtendedTextField(props: props) {
    return <div>{props.text}</div>
}