import React from 'react';
import { useEffect, useRef, useState } from "react";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { useMousePosition } from '../Common/MousePosition'
import { useWindowSize } from '../Common/WindowSize'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        holdEye: {
            display: 'block',
            width: '80px',
            height: '80px',
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -50%)'
        },
    }),
)

export default function BehodlerEye() {
    let eyeX = 40
    let eyeY = 40
    let pupilX = 40
    let pupilY = 40
    const classes = useStyles()
    const windowsize = useWindowSize()
    const position = useMousePosition()
    const [eyePosition, setEyePosition] = useState({ x: eyeX, y: eyeY })
    const [pupilPosition, setPupilPosition] = useState({ x: pupilX, y: pupilY })
    const [beholdPosition, setBeholdPosition] = useState({ x: 0, y: 0 })
    const eyeHld = useRef(document.createElement("div"))

    useEffect(() => {
        if (position) {
            let element = eyeHld.current.getBoundingClientRect();
            let centerX = element.left;
            let centerY = element.top;
            let newEyeX =
                position.x > centerX
                ? eyeX + 11 * ((position.x - centerX) / windowsize.x)
                : eyeX + 11 * ((position.x - centerX) / windowsize.x);
            let newEyeY =
                position.y > centerY
                ? eyeY + 18 * ((position.y - centerY) / windowsize.y)
                : eyeY + 8 * ((position.y - centerY) / windowsize.y);
            if (newEyeX && newEyeY) {
                setEyePosition({ x: newEyeX, y: newEyeY });
            }
            let newPupilX =
                position.x > centerX
                ? eyeX + 14 * ((position.x - centerX) / windowsize.x)
                : eyeX + 14 * ((position.x - centerX) / windowsize.x);
            let newPupilY =
                position.y > centerY
                ? eyeY + 20 * ((position.y - centerY) / windowsize.y)
                : eyeY + 12 * ((position.y - centerY) / windowsize.y);
            if (newPupilX && newPupilY) {
                setPupilPosition({ x: newPupilX, y: newPupilY });
            }
            let beholdX = ((position.x - centerX) / windowsize.x) * 6;
            let beholdY = ((position.y - centerY) / windowsize.y) * 10;
            if (beholdX && beholdY) {
                setBeholdPosition({ x: beholdX, y: beholdY });
            }
        }
      }, [eyeHld, position]);

    return (
        <div>
            <div ref={eyeHld} className={classes.holdEye}>
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 80 80">
                <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="50%" style={{stopColor: 'rgb(256,256,256)', stopOpacity:0}} />
                        <stop offset="90%" style={{stopColor: 'rgb(0,0,0)', stopOpacity:0.0}} />
                    </radialGradient>
                </defs>
                <circle style={{ fill: "#f5fdff" }} cx="40" cy="40" r="40" />
                <path style={{fill: "#5957A5", transform: `translate(${beholdPosition.x}%, ${beholdPosition.y}%)`}}
                d="M66.5,38.9h-7.9c-1,0-1.9-0.6-2.2-1.6c0,0,0,0,0-0.1c-0.4-1.1,0-2.3,1-2.9l6.8-3.9c1.3-0.7,1.7-2.4,1-3.7
                    c-0.7-1.3-2.4-1.7-3.7-1L54.3,30c-0.9,0.5-2,0.4-2.7-0.3l0,0c-0.7-0.7-0.9-1.9-0.4-2.8l4.1-7.2c0.7-1.3,0.3-2.9-1-3.7
                    c-1.3-0.7-2.9-0.3-3.7,1l-4.1,7.1c-0.5,0.9-1.6,1.4-2.6,1.1l0,0c-1-0.3-1.7-1.2-1.7-2.2v-8.1c0-1.5-1.1-2.7-2.6-2.7
                    c-1.5-0.1-2.8,1.2-2.8,2.7V23c0,1.1-0.7,2-1.7,2.3l0,0c-1,0.3-2.1-0.2-2.7-1.1l-4-6.9c-0.7-1.3-2.4-1.7-3.7-1
                    c-1.3,0.7-1.7,2.4-1,3.7l4,7c0.5,0.9,0.4,2.1-0.4,2.9l0,0c-0.8,0.7-1.9,0.9-2.8,0.4l-6.9-4c-1.3-0.8-3-0.3-3.7,1.1
                    c-0.7,1.3-0.2,2.9,1.1,3.6l6.4,3.7c1.1,0.6,1.5,1.9,1.1,3l0,0c-0.3,1-1.3,1.7-2.4,1.7h-7.3c-1.5,0-2.7,1.1-2.7,2.6
                    c-0.1,1.5,1.2,2.8,2.7,2.8h5.4c1.6,0,3,1.2,3.2,2.8l0,0c0.2,1.3-0.5,2.5-1.6,3.2l-5.4,3.1c-1.3,0.7-1.7,2.4-1,3.7
                    c0.5,0.9,1.4,1.3,2.3,1.3c0.5,0,0.9-0.1,1.3-0.4l7.1-4.1l0,0c3.2,3.9,8.9,5.3,15.3,5.3c6.6,0,12.4-1.5,15.6-5.7l0,0l7.1,4.1
                    c0.4,0.2,0.9,0.4,1.3,0.4c0.8,0,1.6-0.4,2.1-1c1-1.3,0.6-3.2-0.9-4l-5.9-3.4c-1-0.6-1.6-1.7-1.5-2.8c0.1-1.5,1.4-2.7,3-2.7h6.1
                    c1.5,0,2.7-1.2,2.7-2.8C69.2,40,68,38.9,66.5,38.9z M39.5,54.3c-7,0-12.8-2.4-12.8-10.3s5.7-14.2,12.8-14.2c7,0,12.8,6.4,12.8,14.2
                    S46.5,54.3,39.5,54.3z" />
                <circle style={{ fill: "#5957A5" }} cx={eyePosition.x} cy={eyePosition.y} r="7.3" />
                <circle style={{ fill: "#ffffff" }} cx={pupilPosition.x} cy={pupilPosition.y} r="3.5" />
                <circle style={{ fill: "url(#grad1)" }} cx="40" cy="40" r="40" />
            </svg>
        </div>
      </div>
    );
}
