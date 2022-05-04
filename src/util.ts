export class FontSize {
    element: HTMLElement

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
        this.element = element
        this.element.style.fontSize = this.getFontSize()
    }

    getFontSize() {
        return this.#_fontSize + 'em'
    }

    zoomReset() {
        this.#_fontSize = this.#initSize
        this.element.style.fontSize = this.getFontSize()
    }

    zoomIn() {
        this.#_fontSize *= this.#tickFrequency
        if (this.#_fontSize > this.#max) {
            this.#_fontSize = this.#max
        }
        this.element.style.fontSize = this.getFontSize()
    }
    zoomOut() {
        this.#_fontSize /= this.#tickFrequency
        if (this.#min > this.#_fontSize) {
            this.#_fontSize = this.#min
        }
        this.element.style.fontSize = this.getFontSize()
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
