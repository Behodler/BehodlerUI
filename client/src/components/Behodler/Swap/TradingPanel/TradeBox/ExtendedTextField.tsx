import * as React from 'react'

interface DropDownField {
  name: string,
  address: string
}

interface props {
  label: string
  dropDownFields: DropDownField[],
}



export default function ExtendedTextField(props: props) {


  return <div>{props.label}</div>
}