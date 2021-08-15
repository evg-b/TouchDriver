import React, { ElementType, ReactNode } from 'react'

export type TouchCoord = {
    startItXorY?: string
    itXorY?: string
    startDirection?: string // top | bottom | left | right
    direction?: string      // top | bottom | left | right
    startX: number
    startY: number
    startTime?: number
    nowX?: number
    nowY?: number
    shiftX?: number
    shiftY?: number
    deltaX?: number
    deltaY?: number
    inertia?: boolean
}

export interface ITouchDriver {
    /**
     * Корневой узел. Это HTML элемент или компонент.
    */
    component?: ElementType

    /**
     * Это контент между открывающим и закрывающим тегом компонента.
    */
    children?: ReactNode

    /**
     * Чтобы указать CSS классы, используйте этот атрибут.
    */
    className?: string

    /**
     * Если true, не останавливает нативный скролл при движении на поверхности TouchDriver.
    */
    scrollable?: boolean

    /**
     * Вызывается при касании к области внутри компонента.
    */

    moveStart?: (TouchCoord: TouchCoord) => void,

    /**
     * Вызывается при движении курсора или пальца по области и за ее пределами. 
     * Если до этого сработал moveStart.
    */
    moveXY?: (TouchCoord: TouchCoord) => void,

    /**
     * Вызывается при окончании движения.
    */
    moveEnd?: (TouchCoord: TouchCoord) => void,
}
const EventSettings = {
    capture: true, // запускаемся на погружении
    passive: false,
}
export class TouchDriver extends React.Component<ITouchDriver> {
    constructor(props: ITouchDriver) {
        super(props);
        // this.slip = 0
        // this.slipSensitivity = 2

        // this.touchRef = this.props.innerRef || React.createRef();
        // this.touchRef = React.createRef();

        // this.isTouch = React.createRef(false);
        // this.prevDelta = React.createRef();
        // this.moveCoord = React.createRef();
        // this.moveCoordInit = this.moveCoordInit.bind(this)
        // this.getInCoord = this.getInCoord.bind(this)
        this.detectStart = this.detectStart.bind(this)
        this.detectMove = this.detectMove.bind(this)
        this.detectEnd = this.detectEnd.bind(this)
        // this.moveHome = this.moveHome.bind(this)
    }
    touchRef = React.createRef() as React.MutableRefObject<HTMLDivElement>;

    componentDidMount() {
        this.touchRef.current.addEventListener('mousedown', this.detectStart, EventSettings)
    }
    componentWillUnmount() {
        this.touchRef.current.removeEventListener('mousedown', this.detectStart, EventSettings)
    }

    detectStart() {
        const { moveStart } = this.props
        const touchCoord: TouchCoord = {
            startX: 0,
            startY: 0,
            nowX: 0,
            nowY: 0,
            startTime: Date.now()
        }

        moveStart && moveStart(touchCoord)

        window.addEventListener('mousemove', this.detectMove, EventSettings)
        window.addEventListener('mouseup', this.detectEnd, EventSettings)
    }
    detectMove() {

    }
    detectEnd() {


        window.removeEventListener('mousemove', this.detectMove, EventSettings)
        window.removeEventListener('mouseup', this.detectEnd, EventSettings)
    }

    render() {
        const {
            children,
            component: Component = 'div',
            // innerRef,
            scrollable,
            moveStart,
            moveXY,
            moveEnd,
            ...otherProps
        } = this.props
        return (
            <Component
                ref={this.touchRef}
                // onTouchStart={ }

                {...otherProps}
            >
                {children}
            </Component>
        )
    }
}
// TouchDriver.defaultProps = {
//     component: 'div',
//     autoMove: false,
//     touchpad: false,
//     scrollable: false,
// }