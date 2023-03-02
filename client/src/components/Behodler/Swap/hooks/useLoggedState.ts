import {useEffect, useState} from "react";

const loggingOn: boolean = false

export function useLoggedState<T>(initialState: T, logthis?: boolean): [T, (newState: T) => void] {
    const [state, setState] = useState<T>(initialState)
    useEffect(() => {
        if (loggingOn || logthis)
            console.log(`state update: ${JSON.stringify(state)}`)
    }, [state])
    return [state, setState]
}
