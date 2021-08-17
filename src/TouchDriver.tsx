import React, { ElementType, ReactNode } from 'react'

export type TouchCoord = {
    startItXorY: string
    itXorY: string
    startDirection: string // top | bottom | left | right
    direction: string      // top | bottom | left | right
    startX: number
    startY: number
    startTime: number
    nowX: number
    nowY: number
    shiftX: number
    shiftY: number
    deltaX: number
    deltaY: number
    inertia: boolean
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
        this.getInCoord = this.getInCoord.bind(this)
        this.detectStart = this.detectStart.bind(this)
        this.detectMove = this.detectMove.bind(this)
        this.detectEnd = this.detectEnd.bind(this)
    }
    touchRef = React.createRef() as React.MutableRefObject<HTMLDivElement>;
    isTouch = false
    touchCoord: TouchCoord = this.generationTouchCoord()
    prevDelta: { x: number, y: number } = { x: 0, y: 0 }

    componentDidMount() {
        this.touchRef.current.addEventListener('mousedown', this.detectStart, EventSettings)
    }
    componentWillUnmount() {
        this.touchRef.current.removeEventListener('mousedown', this.detectStart, EventSettings)
    }
    generationTouchCoord(startX: number = 0, startY: number = 0): TouchCoord {
        return {
            startItXorY: '',
            itXorY: '',
            startDirection: '',
            direction: '',
            startX: startX,
            startY: startY,
            startTime: Date.now(),
            nowX: startX,
            nowY: startY,
            shiftX: 0,
            shiftY: 0,
            deltaX: 0,
            deltaY: 0,
            inertia: false
        }
    }
    getInCoord(e: MouseEvent | TouchEvent) {
        let tch_ref = this.touchRef.current
        let clientX = 0, clientY = 0

        // 1 - находим координаты нажатия относительно экрана
        if (e instanceof MouseEvent) {
            clientX = e.clientX
            clientY = e.clientY
        } else {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        }

        // 2 - находим координаты ref родителя относительно экрана
        let { x, y } = tch_ref.getBoundingClientRect()

        // 3 - в итоге получаем координаты нажатия внутри родительского элемента
        return {
            nowX: clientX - x,
            nowY: clientY - y
        }
    }

    detectStart(e: MouseEvent | TouchEvent) {
        const { moveStart } = this.props
        let startCoord = this.getInCoord(e)
        this.touchCoord = this.generationTouchCoord(startCoord.nowX, startCoord.nowY)

        window.addEventListener('mousemove', this.detectMove, EventSettings)
        window.addEventListener('mouseup', this.detectEnd, EventSettings)
        moveStart && moveStart(this.touchCoord)
    }
    detectMove(e: MouseEvent | TouchEvent) {
        const { moveXY } = this.props
        let { touchCoord, prevDelta } = this
        let { nowX, nowY } = this.getInCoord(e)

        // формируем дельты
        if (touchCoord.nowX !== 0) { touchCoord.deltaX = nowX - touchCoord.nowX }
        if (touchCoord.nowY !== 0) { touchCoord.deltaY = nowY - touchCoord.nowY }

        // запоминаем текущее положение
        touchCoord.nowX = nowX
        touchCoord.nowY = nowY

        // решаем конфликт между неопределенностью между x и y
        if (touchCoord.deltaX === touchCoord.deltaY && touchCoord.nowX !== 0 && touchCoord.nowY !== 0) {
            touchCoord.deltaY = prevDelta.y
            touchCoord.deltaX = prevDelta.x
        }
        prevDelta = { x: touchCoord.deltaX, y: touchCoord.deltaY }

        // формируем сдвиги от начала
        touchCoord.shiftX = touchCoord.nowX - touchCoord.startX
        touchCoord.shiftY = touchCoord.nowY - touchCoord.startY

        moveXY && moveXY(touchCoord)
    }
    detectEnd() {
        const { moveEnd } = this.props

        window.removeEventListener('mousemove', this.detectMove, EventSettings)
        window.removeEventListener('mouseup', this.detectEnd, EventSettings)
        moveEnd && moveEnd(this.touchCoord)
    }

    render() {
        const {
            children,
            component: Component = 'div',
            scrollable,
            moveStart,
            moveXY,
            moveEnd,
            ...otherProps
        } = this.props
        return (
            <Component
                ref={this.touchRef}
                {...otherProps}
            >
                {children}
            </Component>
        )
    }
}