export class Processor {
  #headers = []
  #data
  #headersInput
  #dataInput
  #process
  #clear
  #messages

  constructor() {
    this.#headersInput = document.querySelector('#headersInput')
    this.#dataInput = document.querySelector('#TSVDataInput')
    this.#process = document.querySelector('#process')
    this.#clear = document.querySelector('#clear')
    this.#messages = document.querySelector('#messages')

    this.#process.addEventListener('click', e => this.#processData(e))
    this.#clear.addEventListener('click', e => this.#clearForm(e))
  }

  addHeaders(str) {
    this.#headers = str.split(' ')
  }

  #processData(e) {
    this.#message('info', 'Processing...')
    e.preventDefault()
    e.stopPropagation()
    if (this.#headersInput.value !== '' && this.#dataInput.value !== '') {
      this.#headers = this.#headersInput.value.split('\t')
    } else if (this.#dataInput.value != '') {
      this.#processHeaders()
      this.#processBodyData()
    } else {
      this.#message('error', 'No data...')
      return
    }
  }

  #processHeaders() {
    this.#headers = this.#dataInput.value.split('\n').slice(0, 1)
    this.#headersInput.value = this.#headers
  }

  #processBodyData() {
    let bodyData = this.#dataInput.value.split('\n')
    let body = bodyData.slice(1, bodyData.length)
    this.#dataInput.value = body

    this.#message('info', 'Processing complete')
  }

  #clearForm() {
    this.#headersInput.value = ''
    this.#dataInput.value = ''
    this.#messages.innerHTML = ''
  }

  #message(type, str) {
    this[type](str)
  }

  info(str) {
    console.log(`${str}`)
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