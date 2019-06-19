/*
 * Canvasを利用してステージを描画
 */
import _ from "lodash"

const BLOCK_SIZE = 24
const BLOCK_ROWS = 22
const BLOCK_COLS = 12

const SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS
const SCREEN_HEIGHT = BLOCK_SIZE * BLOCK_ROWS

const NON_BLOCK = 0
const NORMAL_BLOCK = 1
const WALL = 9
const LOCK_BLOCK = 2

const BLOCK_COLOR = "#00ffff"
const BACK_COLOR = "#f5f5f5"
const WALL_COLOR = "#000000"
const LOCK_COLOR = "#c0c0c0"

const STAGE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const	BLOCKS = [
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
 ],
 [
   [0, 0, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
 ],
 [
   [0, 0, 1, 0],
   [0, 1, 1, 0],
   [0, 1, 0, 0],
   [0, 0, 0, 0],
 ],
 [
   [0, 1, 0, 0],
   [0, 1, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 0, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 1, 0],
   [0, 1, 0, 0],
   [0, 1, 0, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 1, 0],
   [0, 0, 1, 0],
   [0, 0, 1, 0],
 ],
 [
   [0, 0, 0, 0],
   [0, 1, 0, 0],
   [1, 1, 1, 0],
   [0, 0, 0, 0],
 ]
]

const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40

const GAMEOVER = 0

export default class Tetris {
  constructor (canvas) {
    canvas.width = SCREEN_WIDTH
    canvas.height = SCREEN_HEIGHT
    this.cxt = canvas.getContext("2d")


    this.x = 0
    this.y = 0
    this.beforeX = 0
    this.beforeY = 0

    this.block = []

    this.stage = _.cloneDeep(STAGE)

    this.createBlock()
    this.updateBlock()
    this.draw()

    const speed = 500
    let lastUpdate = 0

    this.ticker = (timestamp) => {
      if (this.mode === GAMEOVER) return

      this.beforeX = this.x
      this.beforeY = this.y

      const diff = timestamp - lastUpdate
      if (diff > speed) {
        lastUpdate = timestamp

        this.clearBlock()
        this.y++
        if (this.isHit()) {
          this.y = this.beforeY
          this.lockBlock()
          this.deleteLine()
          this.createBlock()
        }
        this.updateBlock()
      }
      this.draw()

      requestAnimationFrame(this.ticker)
    }

    requestAnimationFrame(this.ticker)

    window.addEventListener("keydown", (evt) => {
      this.keyHandler(evt)
    })
  }

  draw () {
    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        switch(this.stage[row][col]){
          case NON_BLOCK:
            this.cxt.fillStyle = BACK_COLOR
            break
          case WALL:
            this.cxt.fillStyle = WALL_COLOR
            break
          case NORMAL_BLOCK:
            this.cxt.fillStyle = BLOCK_COLOR
            break
          case LOCK_BLOCK:
            this.cxt.fillStyle = LOCK_COLOR
            break
        }
        this.cxt.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE -1, BLOCK_SIZE - 1)
      }
    }
  }

  createBlock () {
    const blockType = Math.floor(Math.random() * BLOCKS.length)
    this.x = this.beforeX = Math.floor(BLOCK_COLS / 3)
    this.y = this.beforeY = 0

    this.block = _.cloneDeep(BLOCKS[blockType])

    if (this.isHit()) {
      this.mode = GAMEOVER
    }
  }

  updateBlock () {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.block[row][col]) this.stage[row + this.y][col + this.x] = this.block[row][col]
      }
    }
  }

  clearBlock () {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.block[row][col]) this.stage[row + this.y][col + this.x] = NON_BLOCK
      }
    }
  }

  lockBlock () {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.block[row][col]) this.stage[row + this.y][col + this.x] = LOCK_BLOCK
      }
    }
  }

  isHit () {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.stage[row + this.y][col  + this.x] && this.block[row][col]) return true
      }
    }
    return false
  }

  keyHandler (e) {
    this.clearBlock()
    this.beforeX = this.x
    this.beforeY = this.y

    switch (e.keyCode) {
      case KEY_RIGHT:
        this.x++
        break
      case KEY_LEFT:
        this.x--
        break
      case KEY_DOWN:
        this.y++
        break
      case KEY_UP:
        this.rotateBlock()
        break
    }

    if (this.isHit()) {
      this.x = this.beforeX
      this.y = this.beforeY
    }

    this.updateBlock()
  }

  rotateBlock () {
    this.clearBlock()

    const beforeBlock = _.cloneDeep(this.block)
    const copy = new Array(this.block)

    for (let col = 0; col < 4; col++) {
      copy[col] = new Array(4)

      for (let row = 0; row < 4; row++) {
        copy[col][row] = this.block[3-row][col]
      }
    }
    this.block = copy

    if (this.isHit()) {
      this.block = beforeBlock
    }
  }

  deleteLine () {
    for (let row = BLOCK_ROWS-1; row > 0; row--) {
      const cells = _.filter(this.stage[row], (cell) => cell !== NON_BLOCK && cell !== WALL)

      if (cells.length === BLOCK_COLS - 2) {
        for (let col =1; col < BLOCK_COLS-1; col++) {
          this.stage[row][col] = this.stage[row -1][col]

          for (let topRow = row - 1; topRow > 0; topRow--) {
            this.stage[topRow][col] = this.stage[topRow - 1][col]
          }
        }
        row++
      }
    }
  }
}
