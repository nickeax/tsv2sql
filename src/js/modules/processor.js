export class Processor {
  #headers = []
  #data
  #headersInput
  #dataInput
  #process
  #messages

  constructor() {
    this.#headersInput = document.querySelector('#headersInput')
    this.#dataInput = document.querySelector('#TSVDataInput')
    this.#process = document.querySelector('#process')
    this.#messages = document.querySelector('#messages')
    this.#process.addEventListener('click', e => this.#processData(e))
  }

  addHeaders(str) {
    this.#headers = str.split(' ')
  }

  #processData(e) {
    e.preventDefault()
    if (this.#headersInput.value !== '' && this.#dataInput.value !== '') {
      this.#headers = this.#headersInput.value.split('\t')
    } else if (this.#dataInput.value != '') {
      this.#headers = this.#dataInput.value.split('\n')[0]
    } else {
      this.#message('info', 'No data...')
    }
    console.log(`Let the show begin!`)
    this.#la()
  }

  #message(type, str) {
    this[type](str)
  }

  info(str) {
    this.#messages.innerHTML = `<span class="info">${str}</span>`
  }

  error(str) {
    this.#messages.innerHTML = `<span class="error">${str}</span>`
  }

  #la() {
    console.log(`[processor]\t\theaders: ${this.#headers}`)
    console.log(`[processor]\t\tdata: ${this.#data}`)
  }
}