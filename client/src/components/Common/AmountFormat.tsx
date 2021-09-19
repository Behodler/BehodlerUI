import React from 'react'
// import styled from 'styled-components'


const AmountFormat: React.FC<any> = ({ value, formatType }: { value: number, formatType: string }) => {

  let valueFormatted: any
  console.log('value: ' + value)
  if (formatType === 'compact') {
    valueFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  } else if (formatType === 'standard') {
    valueFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  } else if (formatType === 'compact_num') {
    valueFormatted = new Intl.NumberFormat('en-US', {
    }).format(value)
  } else if (formatType === 'standard_num') {
    valueFormatted = new Intl.NumberFormat('en-US', {
    }).format(value)
  } else {
    valueFormatted = value
  }

  return (
    <div style={{"display":"inline"}}>
      {valueFormatted}
    </div>
  )
}
export default AmountFormat