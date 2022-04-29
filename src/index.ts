import './style/base.css'
import './style/index.css'

class FocusManager {
    #value: HTMLTableRowElement[] = []

    #FocusTableRowClassName: Readonly<string> = 'focus-table-row'

    #tableViewer: HTMLElement

    #table: HTMLTableElement

    constructor(tableViewer: HTMLElement, table: HTMLTableElement) {
        this.#tableViewer = tableViewer
        this.#table = table
    }

    #focus(target: HTMLTableRowElement): void {
        target.classList.add(this.#FocusTableRowClassName)
        this.#value.push(target)
    }

    #unFocus(target: HTMLTableRowElement): void {
        const findIndex = this.#value.findIndex((tableRow) => tableRow.isEqualNode(target))
        if (findIndex === -1) {
            return
        }
        this.#value[findIndex].classList.remove(this.#FocusTableRowClassName)
        this.#value.splice(findIndex, 1)
    }

    #unFocusAll(): void {
        this.#value.forEach((tableRow) => tableRow.classList.remove(this.#FocusTableRowClassName))
        this.#value.splice(0)
    }

    #moveDown(event: KeyboardEvent) {
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const nextTableRow = this.#value[0].nextElementSibling
        // 次のテーブル行がなければ終了
        if (!(nextTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(nextTableRow)
        // スクロール位置を調整
        const bottom =
            this.#tableViewer.offsetTop + this.#tableViewer.offsetHeight - nextTableRow.offsetHeight
        const currentBottom = Math.trunc(nextTableRow.getBoundingClientRect().bottom)
        if (currentBottom > bottom) {
            this.#tableViewer.scrollBy({
                top: currentBottom - bottom,
            })
        }
        event.preventDefault()
    }

    #moveUp(event: KeyboardEvent) {
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const previousTableRow = this.#value[0].previousElementSibling
        // 次のテーブル行がなければ終了
        if (!(previousTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(previousTableRow)
        // スクロール位置を調整
        const top = this.#tableViewer.offsetTop + previousTableRow.offsetHeight
        const currentTop = Math.trunc(previousTableRow.getBoundingClientRect().top)
        if (currentTop <= top) {
            this.#tableViewer.scrollBy({ top: currentTop - top })
        }
        event.preventDefault()
    }

    #moveFarDown(event: KeyboardEvent) {
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        this.#unFocusAll()
        const rows = this.#table.rows
        const LastTableRowsIndex = rows.length - 1
        this.#focus(rows[LastTableRowsIndex])
        // スクロール位置を調整
        // 最も下までスクロール
        this.#tableViewer.scrollTo({ top: this.#tableViewer.scrollHeight })
        event.preventDefault()
    }

    #moveFarUp(event: KeyboardEvent) {
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        this.#unFocusAll()
        console.log(this.#table.rows[0])
        const rows = this.#table.rows
        const FirstTableRowsIndex = 1
        this.#focus(rows[FirstTableRowsIndex])
        // スクロール位置を調整
        // 最も上までスクロール
        this.#tableViewer.scrollTo({ top: 0 })
        event.preventDefault()
    }

    // EventHandler
    public get eventHandlers(): {
        tableMouseDown: (event: Event) => void
        tableKeyDown: (event: KeyboardEvent) => void
    } {
        return {
            tableMouseDown: (event: Event): void => {
                let target = event.target
                // テーブルセルなら親要素へ
                if (target instanceof HTMLTableCellElement && target.tagName == 'TD') {
                    target = target.parentElement
                }
                if (!(target instanceof HTMLTableRowElement)) {
                    return
                }
                this.#unFocusAll()
                this.#focus(target)
            },
            tableKeyDown: (event: KeyboardEvent) => {
                switch (event.key) {
                    case 'ArrowDown':
                        if (event.ctrlKey) {
                            this.#moveFarDown(event)
                        } else {
                            this.#moveDown(event)
                        }
                        break
                    case 'ArrowUp':
                        if (event.ctrlKey) {
                            this.#moveFarUp(event)
                        } else {
                            this.#moveUp(event)
                        }
                        break
                    default:
                        console.log(event)
                        break
                }
            },
        }
    }
}

const setup = (): void => {
    // テストデータ読み込み
    const testTemplate1 = document.querySelector('.test-template1')
    const testTemplate2 = document.querySelector('.test-template2')
    if (
        !(
            testTemplate1 instanceof HTMLTableRowElement &&
            testTemplate2 instanceof HTMLTableRowElement
        )
    ) {
        throw new Error('testTemplate is null')
    }
    const tbody = document.querySelector('.table tbody')
    for (let index = 0; index < 50; index++) {
        tbody?.insertAdjacentElement('beforeend', testTemplate1.cloneNode(true) as HTMLElement)
        tbody?.insertAdjacentElement('beforeend', testTemplate2.cloneNode(true) as HTMLElement)
    }
    // イベントの登録
    const main = document.querySelector('main')
    if (main == null) {
        throw new Error('main Element is null')
    }
    const table = document.querySelector('.table')
    if (!(table instanceof HTMLTableElement)) {
        throw new Error('not found table Element ')
    }
    const focusManager = new FocusManager(main, table)
    table.addEventListener('mousedown', focusManager.eventHandlers.tableMouseDown)
    table.addEventListener('keydown', focusManager.eventHandlers.tableKeyDown, {
        passive: false,
    })
}

window.addEventListener('DOMContentLoaded', setup)
