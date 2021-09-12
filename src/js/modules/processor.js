export class Processor {
  #headers
  #externalTableReferences = [] // to be joined as array of objects with respective ids/indexes
  #mode
  #data
  #headersInput
  #dataInput
  #process
  #clear
  #externalTableRef
  #addETR
  #etrHeading
  #messages
  #width

  constructor() {
    this.#headersInput = document.querySelector('#headersInput')
    this.#mode = document.querySelector('#mode')
    this.#dataInput = document.querySelector('#TSVDataInput')
    this.#process = document.querySelector('#process')
    this.#clear = document.querySelector('#clear')
    this.#addETR = document.querySelector('#addETR')
    this.#messages = document.querySelector('#messages')
    this.#externalTableRef = document.querySelector('#externalTableRef')
    this.#etrHeading = document.querySelector('#etrHeading')

    this.#process.addEventListener('click', e => this.#processData(e))
    this.#clear.addEventListener('click', e => this.#clearForm(e))
    this.#addETR.addEventListener('click', e => this.addETR(e))
  }

  addHeaders(str) {
    this.#headers = str.split(' ')
  }

  // External Table Reference Management
  addETR(e) {
    e.preventDefault()
    let id = this.#externalTableReferences.length
    this.#externalTableReferences.push({ id: `${id}`, tableName: '', value: [] })
    let el = document.createElement('input')
    el.type = 'text'
    el.setAttribute(
      'placeholder', ` [ID-${id + 1}] Enter table name, followed by space-separated field list EX. employees id fName lName email department
      `)
    el.id = id
    el.addEventListener('input', e => this.ETRAddValue(e))

    let delBtn = document.createElement('button')
    delBtn.innerText = 'X'
    delBtn.classList.add('delete')
    delBtn.id = `delBtn-${id}`
    delBtn.addEventListener('click', e => this.removeETR(id))
    this.#externalTableRef.appendChild(el)
    this.#externalTableRef.appendChild(delBtn)
    this.#etrHeading.innerText = `External Table References (${this.#externalTableReferences.length})`
  }

  ETRAddValue(e) {
    console.clear()
    let id = e.target.id
    let values = e.target.value
    let entry = this.#externalTableReferences.find(x => x.id === id)
    if (values.split(',').length > 2) {
      let tmpArr = values.split(',')
      entry.tableName = tmpArr[0]
      tmpArr = tmpArr.slice(1, tmpArr.length)
      tmpArr = tmpArr.map(x => x.trim())
      entry.value = tmpArr
    }
    console.table(this.#externalTableReferences);
    console.log(entry)
  }

  removeETR(id) {
    console.clear()
    this.#externalTableReferences = this.#externalTableReferences.filter(x => x.id != id)
    document.getElementById(id).remove()
    document.getElementById(`delBtn-${id}`).remove()
    if (this.#externalTableReferences.length < 1) {
      this.#etrHeading.innerText = ``
    } else {
      this.#etrHeading.innerText = `External Table References (${this.#externalTableReferences.length})`
    }
    console.table(this.#externalTableReferences);
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
    this.#width = this.#headers[0].split('\t').length
    console.log("WIDTH:", this.#width)
  }

  #processBodyData() {
    let bodyData = this.#dataInput.value.split('\n')
    let body = bodyData.slice(1, bodyData.length)
    this.#dataInput.value = body
    let outputArr = []
    let currentString = ''
    body.forEach((x, outerIndex) => {
      currentString = ''
      let currentRow = x.split('\t')
      currentRow = currentRow.map(x => x.trim())
      currentRow.forEach((y, i) => {
        if (Number.isInteger(parseInt(y)) && y.split(' ').length < 2) {
          currentString += `${y}`
        } else {
          if (this.findReference(y, i) > 0) { // if we find a foreign key, use it instead
            currentString += this.findReference(y, i)
          } else
            currentString += `'${y}'`
        }
        if (i !== currentRow.length - 1) {
          currentString += ','
        }
      })
      outputArr.push(currentString)
    })
    this.#displayOutput(this.#processClosingParens(outputArr))
    this.#message('info', 'Processing complete')
  }

  findReference(needle, index) {
    // needle is the current row field value
    // index can be used to find the header field value that aligns with the current row field value
    let headerField = this.#headers[0].split('\t')[index]
    let el = this.#externalTableReferences.find(x => x.tableName === headerField)
    if (el?.value.length > 0) {
      if (el.value.indexOf(needle) !== -1)
        return el.value.indexOf(needle)
    } return -1
  }

  #processClosingParens(arr) {
    arr = arr.map((x, i) => {
      if (i !== arr.length - 1) {
        return `${x}),`
      } else return `${x})`
    })

    return arr
  }

  #formatHeaders() {
    let str = ''
    let arr = this.#headers[0].split('\t')
    arr = arr.map((x, i) => {
      str = ''
      if (i !== arr.length - 1) {
        str += `${x}, `
      } else {
        str += `${x}`
      }
      return str
    })

    let outputStr = ''
    arr.forEach(x => {
      outputStr += x
    })

    return `(${outputStr})`
  }

  #displayOutput(arr) {
    let str = 'INSERT INTO tableNameHere\n'
    str += this.#formatHeaders()
    str += ' VALUES \n'
    arr.forEach(x => {
      str += `(${x}\n`
    })
    str += '\n'

    this.#dataInput.value = str
    this.#mode.innerText = 'OUTPUT'
  }

  #clearForm() {
    this.#mode.innerText = 'INPUT'
    this.#headersInput.value = ''
    this.#dataInput.value = ''
    this.#messages.innerHTML = ''
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