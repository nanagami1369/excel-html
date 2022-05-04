import './style/base.css'
import './style/index.css'
import { FontSize, MousePosition } from './util'

class SelectMouseRange {
    // マウスで範囲選択した要素を入れる配列
    value: HTMLTableRowElement[] = []
    // マウスで範囲選択された要素につけるクラス名
    #selectMouseRangeClassName: string = 'select-mouse-range'

    // マウスで範囲選択する関数
    select(tableRow: HTMLTableRowElement) {
        tableRow.classList.add(this.#selectMouseRangeClassName)
        this.value.push(tableRow)
    }

    // すべての範囲選択を解除
    unSelectAll = () => {
        this.value.forEach((tableRow) => tableRow.classList.remove(this.#selectMouseRangeClassName))
        this.value.splice(0)
    }

    getCurrent(): HTMLTableRowElement | null {
        if (this.value.length === 0) {
            return null
        } else {
            return this.value[this.value.length - 1]
        }
    }
}

class FocusManager {
    #value: HTMLTableRowElement[] = []

    // フォーカスが当たっている要素につけるクラス名
    #FocusTableRowClassName: Readonly<string> = 'focus-table-row'

    // テーブルをスクロールできる親要素
    // この要素の範囲内にフォーカスがあればテーブルを操作可能
    #tableViewer: HTMLElement

    // テーブルそのもの
    #table: HTMLTableElement

    constructor(tableViewer: HTMLElement, table: HTMLTableElement) {
        this.#tableViewer = tableViewer
        this.#table = table

        // すぐに操作できるようにテーブルにフォーカスを当てる
        this.#tableViewer.focus()
        //アクセス時に最初の要素にフォーカスを当てる
        const firstTableRow = this.#getFirstTableRow()
        if (!(firstTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#focus(firstTableRow)
    }

    #getHeaderTableRow(): HTMLTableRowElement {
        // テーブルヘッダーは必ずあるはずなので無ければ例外
        if (this.#table.tHead == null || this.#table.tHead.rows.length === 0) {
            throw new Error('table header is not found')
        }
        return this.#table.tHead.rows[0]
    }

    #getFirstTableRow(): HTMLTableRowElement | null {
        return this.#table.querySelector('tbody tr:first-child')
    }

    #getLastTableRow(): HTMLTableRowElement | null {
        return this.#table.querySelector('tbody tr:last-child')
    }

    #getTableRowAll(): NodeListOf<HTMLTableRowElement> | null {
        return this.#table.querySelectorAll('tbody tr')
    }

    #focus(target: HTMLTableRowElement): void {
        target.classList.add(this.#FocusTableRowClassName)
        this.#value.push(target)
    }

    #focusAll(event: Event): void {
        this.#unFocusAll()
        this.#getTableRowAll()?.forEach((tableRows) => this.#focus(tableRows))
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

    #getStandardTableRow(): HTMLTableRowElement | null {
        if (this.#value.length === 0) {
            return null
        } else {
            return this.#value[0]
        }
    }

    #getCurrentTableRow(): HTMLTableRowElement | null {
        if (this.#value.length === 0) {
            return null
        } else {
            return this.#value[this.#value.length - 1]
        }
    }

    #getCurrentTableRowIndex(): number | null {
        if (this.#value.length === 0) {
            return -1
        } else {
            return this.#value.length - 1
        }
    }

    #scrollTop(): void {
        this.#tableViewer.scrollTo({ top: 0 })
    }
    #scrollBottom(): void {
        this.#tableViewer.scrollTo({ top: this.#tableViewer.scrollHeight })
    }
    #scrollTableRowIntoView(tableRow: HTMLTableRowElement): void {
        // テーブル行の下部がスクロール範囲外ならスクロール
        // prettier-ignore
        const bottom = this.#tableViewer.offsetTop + this.#tableViewer.offsetHeight - tableRow.offsetHeight
        const currentBottom = Math.trunc(tableRow.getBoundingClientRect().bottom)
        if (currentBottom > bottom) {
            this.#tableViewer.scrollBy({
                top: currentBottom - bottom,
            })
            return
        }
        // テーブル行の上部がスクロール範囲外ならスクロール
        const top = this.#tableViewer.offsetTop + tableRow.offsetHeight
        const currentTop = Math.trunc(tableRow.getBoundingClientRect().top)
        if (currentTop <= top) {
            this.#tableViewer.scrollBy({ top: currentTop - top })
            return
        }
    }

    #moveDown(event: KeyboardEvent) {
        event.preventDefault()
        const nextTableRow = this.#getCurrentTableRow()?.nextElementSibling
        // 次のテーブル行がなければ終了
        if (!(nextTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(nextTableRow)
        // スクロール位置を調整
        this.#scrollTableRowIntoView(nextTableRow)
    }

    #moveUp(event: KeyboardEvent) {
        event.preventDefault()
        const previousTableRow = this.#getCurrentTableRow()?.previousElementSibling
        // 次のテーブル行がなければ終了
        if (!(previousTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(previousTableRow)
        // スクロール位置を調整
        this.#scrollTableRowIntoView(previousTableRow)
    }

    #moveFarDown(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const lastTableRow = this.#getLastTableRow()
        // 最後の要素がなければ終了
        if (!(lastTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(lastTableRow)
        // スクロール位置を調整
        this.#scrollBottom()
    }

    #moveFarUp(event: KeyboardEvent) {
        event.preventDefault()
        // フォーカスが当たっている要素がなければ終了
        if (this.#value.length === 0) {
            return
        }
        const firstTableRow = this.#getFirstTableRow()
        // 最初の要素が無ければ終了
        if (!(firstTableRow instanceof HTMLTableRowElement)) {
            return
        }
        this.#unFocusAll()
        this.#focus(firstTableRow)
        // スクロール位置を調整
        this.#scrollTop()
    }

    #moveRangeDown(event: KeyboardEvent) {
        event.preventDefault()
        const nextTableRow = this.#getCurrentTableRow()?.nextElementSibling
        // 次のテーブル行がなければ終了
        if (!(nextTableRow instanceof HTMLTableRowElement)) {
            return
        }
        const standardTableRow = this.#getStandardTableRow()
        const currentTableRowIndex = this.#getCurrentTableRowIndex()
        // フォーカスが当たっている行が無ければ終了
        if (standardTableRow == null || currentTableRowIndex == null) {
            return
        }
        // standardTableRow
        // nextTableRow
        // の場合
        if (standardTableRow.rowIndex < nextTableRow.rowIndex) {
            this.#focus(nextTableRow)
        }
        // nextTableRow
        // standardTableRow
        // の場合
        else {
            this.#unFocus(currentTableRowIndex)
        }

        // スクロール位置を調整
        this.#scrollTableRowIntoView(nextTableRow)
    }

    #moveRangeUp(event: KeyboardEvent) {
        event.preventDefault()
        const previousTableRow = this.#getCurrentTableRow()?.previousElementSibling

        // 次のテーブル行がなければ終了
        if (!(previousTableRow instanceof HTMLTableRowElement)) {
            return
        }
        const standardTableRow = this.#getStandardTableRow()
        const currentTableRowIndex = this.#getCurrentTableRowIndex()
        // フォーカスが当たっている行が無ければ終了
        if (standardTableRow == null || currentTableRowIndex == null) {
            return
        }
        // previousTableRow
        // standardTableRow
        // の場合
        if (previousTableRow.rowIndex < standardTableRow.rowIndex) {
            this.#focus(previousTableRow)
        }
        // standardTableRow
        // previousTableRow
        // の場合
        else {
            this.#unFocus(currentTableRowIndex)
        }

        // スクロール位置を調整
        this.#scrollTableRowIntoView(previousTableRow)
    }

    #moveRangeFarDown(event: KeyboardEvent) {
        event.preventDefault()
        const rangeStartPointClassName = 'range-start-point-range'
        const standardTablerow = this.#getStandardTableRow()
        // フォーカスが当たっている要素がなければ終了
        if (standardTablerow == null) {
            return
        }

        // 初期値から最も下までのテーブル行を取得
        standardTablerow.classList.add(rangeStartPointClassName)
        const rangeTableRows = Array.from(
            this.#table.querySelectorAll(`tbody .${rangeStartPointClassName} ~ tr`)
        ) as HTMLTableRowElement[]
        rangeTableRows.unshift(standardTablerow)
        standardTablerow.classList.remove(rangeStartPointClassName)

        //見つかったテーブル行にフォーカスを当てる
        this.#unFocusAll()
        rangeTableRows.forEach((tableRow) => this.#focus(tableRow))

        // スクロール位置を調整
        this.#scrollBottom()
    }

    #moveRangeFarUp(event: KeyboardEvent) {
        event.preventDefault()
        const rangeStartPointClassName = 'range-start-point-range'
        const standardTableRow = this.#getStandardTableRow()
        // フォーカスが当たっている要素がなければ終了
        if (standardTableRow == null) {
            return
        }

        // 初期値から最も上までのテーブル行を取得
        standardTableRow.classList.add(rangeStartPointClassName)
        const rangeTableRows = Array.from(
            this.#table.querySelectorAll(`tbody tr:not(.${rangeStartPointClassName} ~ tr)`)
        ) as HTMLTableRowElement[]
        standardTableRow.classList.remove(rangeStartPointClassName)
        // moveRangeUpと同じように配列に追加されるように調整
        rangeTableRows.reverse()

        //見つかったテーブル行にフォーカスを当てる
        this.#unFocusAll()
        rangeTableRows.forEach((tableRow) => this.#focus(tableRow))

        // スクロール位置を調整
        this.#scrollTop()
    }
    // EventHandler
    public get eventHandlers(): {
        tableMouseDown: (event: MouseEvent) => void
        tableKeyDown: (event: KeyboardEvent) => void
    } {
        return {
            tableMouseDown: (event: MouseEvent): void => {
                event.preventDefault()
                let target = event.target
                // テーブルセルなら親要素へ
                if (target instanceof HTMLTableCellElement && target.tagName == 'TD') {
                    target = target.parentElement
                }
                if (!(target instanceof HTMLTableRowElement)) {
                    return
                }

                // マウスで範囲選択に必要な変数を初期化
                const selectRange = new SelectMouseRange()
                const mousePosition = new MousePosition(event)

                // マウスをおろした場所を初期値として選択する
                const standardTableRow = target
                selectRange.select(standardTableRow)

                // マウスによるフォーカスの判定が始まった時点で前回のフォーカスは解除
                this.#unFocusAll()

                // 初期値と現在のマウスの位置から現在選択されているテーブルの範囲を判定する関数
                const selectingMouseRangeTableRow = () => {
                    // マウスの高さから次に選択するテーブル行を割り出す

                    // TableViewの画面上の一番上の位置を取得
                    const { top } = this.#tableViewer.getBoundingClientRect()
                    // ヘッダーを除いたテーブル上部
                    const tableTop = top + this.#getHeaderTableRow().clientHeight // ヘッダーの高さ分下げる
                    // スクロールバーを除いたテーブル下部
                    const tableBottom = top + this.#tableViewer.clientHeight
                    // マウスの画面上の高さ
                    const mouseY = mousePosition.getClientY()

                    let target: unknown
                    // マウス座標
                    // ---- テーブル上部 ----
                    // なら現在位置の一つ上の要素をtargetに
                    console.log(mouseY, tableTop, tableBottom)
                    if (mouseY < tableTop) {
                        console.log('上', tableTop)
                        const previousElement = selectRange.getCurrent()?.previousElementSibling
                        target = previousElement
                    }
                    // ---- テーブル下部 ----
                    // マウス座標
                    // なら現在位置の一つ下の要素をtargetに
                    else if (mouseY > tableBottom) {
                        const nextElement = selectRange.getCurrent()?.nextElementSibling
                        target = nextElement
                        console.log('下', target)
                    }
                    // ---- テーブル上部 ----
                    // マウス座標
                    // ---- テーブル下部 ----
                    // ならフォーカスが当たっているtargetに
                    else {
                        target = mousePosition.getTarget()
                        console.log('中', target)
                    }

                    // 次に選択するテーブル行を実際に選択する

                    // targetがテーブルセルなら親要素へ
                    if (target instanceof HTMLTableCellElement && target.tagName == 'TD') {
                        target = target.parentElement
                    }
                    if (!(target instanceof HTMLTableRowElement)) {
                        return
                    }
                    selectRange.unSelectAll()
                    // 範囲の判定
                    const currentTableRow = target
                    // 一つの要素のみを選択している場合
                    if (standardTableRow.rowIndex == currentTableRow.rowIndex) {
                        selectRange.select(standardTableRow)
                    }
                    // standard rowIndex 小
                    // current   rowIndex 大
                    // の場合
                    else if (standardTableRow.rowIndex < currentTableRow.rowIndex) {
                        Array.from(this.#table.rows)
                            .slice(standardTableRow.rowIndex, currentTableRow.rowIndex + 1)
                            .forEach((tableRow) => selectRange.select(tableRow))
                    }
                    // current   rowIndex 大
                    // standard rowIndex 小
                    // の場合
                    else {
                        // standardTableRow (基準値)を中心に配列に入るようにreverseで配列を反転
                        Array.from(this.#table.rows)
                            .slice(currentTableRow.rowIndex, standardTableRow.rowIndex + 1)
                            .reverse()
                            .forEach((tableRow) => selectRange.select(tableRow))
                    }
                    const currentRange = selectRange.getCurrent()
                    // 範囲選択されていなければ終了
                    if (currentRange == null) {
                        return
                    }
                    const { previousElementSibling, nextElementSibling } = currentRange
                    if (previousElementSibling instanceof HTMLTableRowElement) {
                        this.#scrollTableRowIntoView(previousElementSibling)
                    }
                    if (nextElementSibling instanceof HTMLTableRowElement) {
                        this.#scrollTableRowIntoView(nextElementSibling)
                    }
                }
                const mouseMovePoolingId = setInterval(selectingMouseRangeTableRow, 50)
                const focusMouseRangeTableRow = (event: Event) => {
                    event.preventDefault()
                    clearInterval(mouseMovePoolingId)
                    mousePosition.Dispose()
                    document.removeEventListener('mouseup', focusMouseRangeTableRow)
                    selectRange.value.forEach((tableRow) => this.#focus(tableRow))
                    selectRange.unSelectAll()
                }
                document.addEventListener('mouseup', focusMouseRangeTableRow, {
                    passive: false,
                })
                event.preventDefault()
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
    const testTemplate1 = document.querySelector('.test-template1')?.cloneNode(true)
    const testTemplate2 = document.querySelector('.test-template2')?.cloneNode(true)
    if (
        !(
            testTemplate1 instanceof HTMLTableRowElement &&
            testTemplate2 instanceof HTMLTableRowElement
        )
    ) {
        throw new Error('testTemplate is null')
    }
    document.querySelector('.test-template1')?.remove()
    document.querySelector('.test-template2')?.remove()
    const tbody = document.querySelector('.table tbody')
    for (let index = 0; index < 50; index += 2) {
        const testTemplate1Copy = testTemplate1.cloneNode(true) as HTMLTableRowElement
        const testTemplate2Copy = testTemplate2.cloneNode(true) as HTMLTableRowElement
        testTemplate1Copy.cells.item(0)!.textContent = String(index)
        testTemplate2Copy.cells.item(0)!.textContent = String(index + 1)
        tbody?.insertAdjacentElement('beforeend', testTemplate1Copy as HTMLElement)
        tbody?.insertAdjacentElement('beforeend', testTemplate2Copy as HTMLElement)
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

    main.addEventListener('mousedown', focusManager.eventHandlers.tableMouseDown, {
        passive: false,
    })
    main.addEventListener('keydown', focusManager.eventHandlers.tableKeyDown, {
        passive: false,
    })
    const fontSize = new FontSize(table, 1, 0.5, 5)
    document.addEventListener(
        'wheel',
        (e) => {
            if (e.ctrlKey) {
                e.preventDefault()
                // zoom out
                if (e.deltaY > 0) {
                    fontSize.zoomOut()
                }
                // zoom in
                else {
                    fontSize.zoomIn()
                }
            }
        },
        { passive: false }
    )
    document.addEventListener(
        'keydown',
        (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '0':
                        fontSize.zoomReset()
                        e.preventDefault()
                        break
                    case '-':
                        fontSize.zoomOut()
                        e.preventDefault()
                    case '=':
                    case ';':
                        fontSize.zoomIn()
                        e.preventDefault()
                        break
                    default:
                        break
                }
            }
        },
        { passive: false }
    )
}

window.addEventListener('DOMContentLoaded', setup)
