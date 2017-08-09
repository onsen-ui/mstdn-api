import { Writable } from 'stream'

/**
 * WritableStream for Server-sent Events
 *
 * This implementation is partially adapted from [webkit](https://github.com/WebKit/webkit/blob/master/Source/WebCore/page/EventSource.cpp)
 */

export default class EventStream extends Writable {
  private buf = ''
  private newLine = false
  private data = ''
  private eventName = ''

  _write (chunk: Buffer, _encoding: string, next: (err?: Error) => void) {
    this.buf += chunk
    let position = 0
    const size = this.buf.length

    while (position < size) {
      if (this.newLine) {
        this.newLine = false
        if (this.buf[position] === '\n') position++
      }

      let lineLength = -1
      let fieldLength = -1
      for (let i = position; i < size; ++i) {
        if (lineLength !== -1) break
        switch (this.buf[i]) {
          case ':':
            if (fieldLength === -1) fieldLength = i - position
            break
          case '\n':
            lineLength = i - position
            break
        }
      }

      if (lineLength === -1) break
      this.parseEventStreamLine(position, fieldLength, lineLength)

      position += lineLength + 1
    }

    if (position === size) this.buf = ''
    else if (position) this.buf = this.buf.slice(position)
    next()
  }

  private parseEventStreamLine (position: number, fieldLength: number, lineLength: number): void {
    if (lineLength === 0) {
      if (this.data.length > 0) {
        let data: object
        try {
          data = JSON.parse(this.data.slice(0, -1))
        } catch (err) {
          data = {err}
        }
        this.emit(this.eventName, data)
        this.data = ''
      }
      this.eventName = ''
      return
    }

    if (fieldLength === 0) return

    let step = 0
    const field = this.buf.slice(position, position + (fieldLength === -1 ? lineLength : fieldLength))

    if (fieldLength === -1) {
      step = lineLength
    } else if (this.buf[position + fieldLength + 1] !== ' ') {
      step = fieldLength + 1
    } else {
      step = fieldLength + 2
    }
    position += step

    const valueLength = lineLength - step
    const value = this.buf.slice(position, position + valueLength)

    switch (field) {
      case 'data':
        this.data += value + '\n'
        break
      case 'event':
        this.eventName = value
        break
    }
  }
}
