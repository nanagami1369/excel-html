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

    #focusAll(event: Event): void {
        this.#unFocusAll()
        Array.from(this.#table.rows)
            .slice(1)
            .forEach((tableRows) => this.#focus(tableRows))
        event.preventDefault()
    }

    #unFocus(focusTableRowIndex: number): void {
        this.#value[focusTableRowIndex].classList.remove(this.#FocusTableRowClassName)
        this.#value.splice(focusTableRowIndex, 1)
    }

    #unFocusAll(): void {
        this.#value.forEach((tableRow) => tableRow.classList.remove(this.#FocusTableRowClassName))
        this.#value.splice(0)
    }

    #moveDown(event: KeyboardEvent) {
        event.preventDefault()
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
    }

    #moveUp(event: KeyboardEvent) {
        event.preventDefault()
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
    }

    #moveFarDown(event: KeyboardEvent) {
        event.preventDefault()
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
    }

    #moveFarUp(event: KeyboardEvent) {
        event.preventDefault()
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
    }

    #moveRangeDown(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const currentTableRowIndex = this.#value.length - 1
        const nextTableRow = this.#value[currentTableRowIndex].nextElementSibling
        // 次のテーブル行がなければ終了
        if (!(nextTableRow instanceof HTMLTableRowElement)) {
            return
        }
        const firstTableRowIndex = 0
        const firstTableRow = this.#value[firstTableRowIndex]
        if (nextTableRow.offsetTop > firstTableRow.offsetTop) {
            this.#focus(nextTableRow)
        } else {
            this.#unFocus(currentTableRowIndex)
        }

        // スクロール位置を調整
        const bottom =
            this.#tableViewer.offsetTop + this.#tableViewer.offsetHeight - nextTableRow.offsetHeight
        const currentBottom = Math.trunc(nextTableRow.getBoundingClientRect().bottom)
        if (currentBottom > bottom) {
            this.#tableViewer.scrollBy({
                top: currentBottom - bottom,
            })
        }
    }

    #moveRangeUp(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const currentTableRowIndex = this.#value.length - 1
        const previousTableRow = this.#value[currentTableRowIndex].previousElementSibling

        // 次のテーブル行がなければ終了
        if (!(previousTableRow instanceof HTMLTableRowElement)) {
            return
        }
        const firstTableRowIndex = 0
        const firstTableRow = this.#value[firstTableRowIndex]
        if (previousTableRow.offsetTop < firstTableRow.offsetTop) {
            this.#focus(previousTableRow)
        } else {
            this.#unFocus(currentTableRowIndex)
        }

        // スクロール位置を調整
        const top = this.#tableViewer.offsetTop + previousTableRow.offsetHeight
        const currentTop = Math.trunc(previousTableRow.getBoundingClientRect().top)
        if (currentTop <= top) {
            this.#tableViewer.scrollBy({ top: currentTop - top })
        }
    }

    #moveRangeFarDown(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const rangeStartPointClassName = 'range-start-point-range'
        const firstTableRowIndex = 0
        const firstTableRow = this.#value[firstTableRowIndex]
        // 初期値から最も下までのテーブル行を取得
        firstTableRow.classList.add(rangeStartPointClassName)
        const rangeTableRows = Array.from(
            this.#table.querySelectorAll(`tbody .${rangeStartPointClassName} ~ tr`)
        ) as HTMLTableRowElement[]
        rangeTableRows.unshift(firstTableRow)
        firstTableRow.classList.remove(rangeStartPointClassName)

        //見つかったテーブル行にフォーカスを当てる
        this.#unFocusAll()
        rangeTableRows.forEach((tableRow) => this.#focus(tableRow))

        // スクロール位置を調整
        // 最も下までスクロール
        this.#tableViewer.scrollTo({ top: this.#tableViewer.scrollHeight })
    }

    #moveRangeFarUp(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const rangeStartPointClassName = 'range-start-point-range'
        const firstTableRowIndex = 0
        const firstTableRow = this.#value[firstTableRowIndex]
        // 初期値から最も上までのテーブル行を取得
        firstTableRow.classList.add(rangeStartPointClassName)
        const rangeTableRows = Array.from(
            this.#table.querySelectorAll(`tbody tr:not(.${rangeStartPointClassName} ~ tr)`)
        ) as HTMLTableRowElement[]
        firstTableRow.classList.remove(rangeStartPointClassName)
        // moveRangeUpと同じように配列に追加されるように調整
        rangeTableRows.reverse()

        //見つかったテーブル行にフォーカスを当てる
        this.#unFocusAll()
        rangeTableRows.forEach((tableRow) => this.#focus(tableRow))

        // スクロール位置を調整
        // 最も上までスクロール
        this.#tableViewer.scrollTo({ top: 0 })
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
                            if (event.shiftKey) {
                                this.#moveRangeFarDown(event)
                            } else {
                                this.#moveFarDown(event)
                            }
                        } else {
                            if (event.shiftKey) {
                                this.#moveRangeDown(event)
                            } else {
                                this.#moveDown(event)
                            }
                        }
                        break
                    case 'ArrowUp':
                        if (event.ctrlKey) {
                            if (event.shiftKey) {
                                this.#moveRangeFarUp(event)
                            } else {
                                this.#moveFarUp(event)
                            }
                        } else {
                            if (event.shiftKey) {
                                this.#moveRangeUp(event)
                            } else {
                                this.#moveUp(event)
                            }
                        }
                        break
                    case 'a':
                        if (event.ctrlKey) {
                            this.#focusAll(event)
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

    main.addEventListener('mousedown', focusManager.eventHandlers.tableMouseDown)
    main.addEventListener('keydown', focusManager.eventHandlers.tableKeyDown, {
        passive: false,
    })
}

window.addEventListener('DOMContentLoaded', setup)
