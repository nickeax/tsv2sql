export class Processor {
  #headers = []
  #data
  #headersInput
  #dataInput
  #process

  constructor() {
    this.#headersInput = document.querySelector('#headersInput')
    this.#dataInput = document.querySelector('#TSVDataInput')
    this.#process = document.querySelector('#process')
    this.#process.addEventListener('click', e => this.#processData(e))
  }

  addHeaders(str) {
    this.#headers = str.split(' ')
  }

  #processData(e) {
    e.preventDefault()
    if (this.#headersInput.value !== '') {
      this.#headers = this.#headersInput.value.split('\t')
      this.#la()
    }
    console.log(`Let the show begin!`)
  }

  #la() {
    console.log(`[processor]\t\theaders: ${this.#headers}`)
    console.log(`[processor]\t\tdata: ${this.#data}`)
  }
}