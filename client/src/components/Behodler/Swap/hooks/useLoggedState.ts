import {useEffect, useState} from "react";

const loggingOn: boolean = false

export function useLoggedState<T>(initialState: T, logName?:string): [T, (newState: T) => void] {
    const [state, setState] = useState<T>(initialState)
    useEffect(() => {
        if (loggingOn || logName)
            console.log(`state update for ${logName}: ${JSON.stringify(state)}`)
    }, [state])
    return [state, setState]
}
