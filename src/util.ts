export class FontZoomManager {
    #element: HTMLElement

    #min: number
    #max: number
    #initSize: number
    #tickFrequency: number
    #_fontSize: number

    constructor(
        element: HTMLElement,
        initSize: number = 1,
        min: number = 0.5,
        max: number = Infinity,
        tickFrequency: number = 1.08
    ) {
        this.#initSize = initSize
        this.#_fontSize = this.#initSize
        this.#min = min
        this.#max = max
        this.#tickFrequency = tickFrequency
        this.#element = element
        this.#element.style.fontSize = this.getFontSize()

        document.addEventListener('wheel', this.#eventHandlers.wheel, { passive: false })
        document.addEventListener('keydown', this.#eventHandlers.keyDown, { passive: false })
    }

    getFontSize() {
        return this.#_fontSize + 'em'
    }

    #zoomReset() {
        this.#_fontSize = this.#initSize
        this.#element.style.fontSize = this.getFontSize()
    }

    #zoomIn() {
        this.#_fontSize *= this.#tickFrequency
        if (this.#_fontSize > this.#max) {
            this.#_fontSize = this.#max
        }
        this.#element.style.fontSize = this.getFontSize()
    }
    #zoomOut() {
        // なぜか1回だけ割っても縮小しなかったので2回割る
        this.#_fontSize = this.#_fontSize / this.#tickFrequency / this.#tickFrequency
        if (this.#min > this.#_fontSize) {
            this.#_fontSize = this.#min
        }
        this.#element.style.fontSize = this.getFontSize()
    }

    // zoomの拡大縮小をできなくします
    Dispose() {
        document.removeEventListener('wheel', this.#eventHandlers.wheel)
        document.removeEventListener('keydown', this.#eventHandlers.keyDown)
    }

    // eventHandler
    get #eventHandlers(): {
        wheel: (event: WheelEvent) => void
        keyDown: (event: KeyboardEvent) => void
    } {
        return {
            wheel: (event: WheelEvent): void => {
                if (event.ctrlKey) {
                    event.preventDefault()
                    if (event.deltaY > 0) {
                        this.#zoomOut()
                    } else {
                        this.#zoomIn()
                    }
                }
            },
            keyDown: (event: KeyboardEvent) => {
                if (event.ctrlKey && event.key === '0') {
                    this.#zoomReset()
                }
            },
        }
    }
}

export class MousePosition {
    #clientX: number
    #clientY: number
    #target: EventTarget | null
    constructor(event: MouseEvent) {
        this.#clientX = event.clientX
        this.#clientY = event.clientY
        this.#target = event.target
        document.addEventListener('mousemove', this.eventHandlers.mouseMove)
    }

    getClientX(): number {
        return this.#clientX
    }
    getClientY(): number {
        return this.#clientY
    }

    getTarget(): EventTarget | null {
        return this.#target
    }

    //最新のマウス座標を取得しなくなります
    Dispose() {
        document.removeEventListener('mousemove', this.eventHandlers.mouseMove)
    }

    // eventHandler
    get eventHandlers(): {
        mouseMove: (event: MouseEvent) => void
    } {
        return {
            mouseMove: (event: MouseEvent): void => {
                this.#clientX = event.clientX
                this.#clientY = event.clientY
                this.#target = event.target
            },
        }
    }
}

export class InfoView {
    #FocusTableRowLength: HTMLSpanElement
    constructor(focusTableRowLength: HTMLSpanElement) {
        this.#FocusTableRowLength = focusTableRowLength
        this.Writer(0)
    }

    Writer(focusTableRowLength: number) {
        this.#FocusTableRowLength.textContent = String(focusTableRowLength)
    }
}
