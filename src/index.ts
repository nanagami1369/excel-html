import './style/base.css'
import './style/index.css'

class FocusManager {
    #value: HTMLTableRowElement[] = []

    #FocusTableRowClassName: Readonly<string> = 'focus-table-row'

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

    // EventHandler
    public get eventHandlers(): { tableMouseDown: (event: Event) => void } {
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
        tbody?.insertAdjacentElement('beforebegin', testTemplate1.cloneNode(true) as HTMLElement)
        tbody?.insertAdjacentElement('beforebegin', testTemplate2.cloneNode(true) as HTMLElement)
    }
    // イベントの登録
    const focusManager = new FocusManager()
    document
        .querySelector('.table')
        ?.addEventListener('mousedown', focusManager.eventHandlers.tableMouseDown)
}

window.addEventListener('DOMContentLoaded', setup)
