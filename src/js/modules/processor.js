export class Processor {
  #headers
  #tableName = 'TABLE NAME'
  #externalTableReferences = [] // to be joined as array of objects with respective ids/indexes
  #mode
  #data
  #headersInput
  #dataInput
  #originalData
  #delimeter
  #delimeterType
  #process
  #reset
  #clear
  #externalTableRef
  #addETR
  #etrHeading
  #messages
  #width
  #copyrightInfo

  constructor() {
    this.#headersInput = document.querySelector('#headersInput')
    this.#headersInput.classList.add('hidden')
    this.#tableName = document.querySelector('#tableName')
    this.#mode = document.querySelector('#mode')
    this.#dataInput = document.querySelector('#TSVDataInput')
    this.#delimeter = document.querySelector('#delimeter')
    this.#process = document.querySelector('#process')
    this.#reset = document.querySelector('#reset')
    this.#clear = document.querySelector('#clear')
    this.#addETR = document.querySelector('#addETR')
    this.#messages = document.querySelector('#messages')
    this.#externalTableRef = document.querySelector('#externalTableRef')
    this.#etrHeading = document.querySelector('#etrHeading')
    this.#copyrightInfo = document.querySelector('#copyrightInfo')

    let date = new Date()
    let year = date.getFullYear()
    this.#copyrightInfo.innerHTML = `&#169; ${year} Nick Fletcher`

    this.#delimeter.addEventListener('input', e => this.#updateDelimeter(e))
    this.#process.addEventListener('click', e => this.#processData(e))
    this.#reset.addEventListener('click', e => this.#resetData(e))
    this.#clear.addEventListener('click', e => this.#clearForm(e))
    this.#addETR.addEventListener('click', e => this.addETR(e))
  }

  #updateDelimeter(e) {
    switch (this.#delimeter.value) {
      case 'tabs': this.#delimeterType = '\t'
        break
      case 'commas': this.#delimeterType = ','
        break
      case 'dashes': this.#delimeterType = '-'
        break
      case 'underscores': this.#delimeterType = '_'
        break
      case 'periods': this.#delimeterType = '.'
        break
      case 'slashes': this.#delimeterType = '\\'
        break
      case 'asterix': this.#delimeterType = '*'
        break
      case 'pipes': this.#delimeterType = '|'
        break
    }
  }
  // External Table Reference Management
  addETR(e) {
    e.preventDefault()
    let id = this.#externalTableReferences.length
    this.#externalTableReferences.push({ id: `${id}`, tableName: '', value: [] })
    let el = document.createElement('input')
    el.type = 'text'
    el.setAttribute(
      'placeholder', ` [ID-${id + 1}] Enter table name, followed by comma-separated field list EX. employees, id, fName, lName, email, department
      `)
    el.setAttribute('title', 'This will allow your generated query to replace field values with foreign keys')
    el.id = id
    el.addEventListener('input', e => this.ETRAddValue(e))

    let delBtn = document.createElement('button')
    delBtn.innerText = 'X'
    delBtn.classList.add('delete')
    delBtn.id = `delBtn-${id}`
    delBtn.setAttribute('title', `Remove external reference: [ID:${id + 1}]`)
    delBtn.addEventListener('click', e => this.removeETR(id))
    this.#externalTableRef.appendChild(el)
    this.#externalTableRef.appendChild(delBtn)
    this.#etrHeading.innerText = `External Table References (${this.#externalTableReferences.length})`
  }

  ETRAddValue(e) {
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
    this.#originalData = this.#dataInput.value
    if (this.#headersInput.value !== '' && this.#dataInput.value !== '') {
      this.#headers = this.#headersInput.value.split(this.#delimeterType)
    } else if (this.#dataInput.value != '') {
      this.#processHeaders()
      this.#headersInput.classList.toggle('hidden')
      this.#processBodyData()
    } else {
      this.#message('error', 'No data...')
      return
    }
  }

  #processHeaders() {
    this.#headers = this.#dataInput.value.split('\n').slice(0, 1)
    this.#headersInput.value = this.#headers[0].split(this.#delimeterType).map(x => `[${x}] `).join(' ')
    this.#width = this.#headers[0].split(this.#delimeterType).length
  }

  #processBodyData() {
    let bodyData = this.#dataInput.value.split('\n')
    let body = bodyData.slice(1, bodyData.length)
    this.#dataInput.value = body
    let outputArr = []
    let currentString = ''
    body.forEach((x) => {
      currentString = ''
      let currentRow = x.split(this.#delimeterType)
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
      if (currentString.length >= this.#width)
        outputArr.push(currentString)
    })
    this.#displayOutput(this.#processClosingParens(outputArr))
    this.#message('info', 'Processing complete')
  }

  findReference(needle, index) {
    // needle is the current row field value
    // index can be used to find the header field value that aligns with the current row field value
    let headerField = this.#headers[0].split(this.#delimeterType)[index]
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
    let arr = this.#headers[0].split(this.#delimeterType)
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
    let str = `INSERT INTO ${this.#tableName.value}\n`
    str += this.#formatHeaders()
    str += ' VALUES \n'
    arr.forEach(x => {
      str += `(${x}\n`
    })
    str += '\n'

    this.#dataInput.value = str
    this.#mode.innerText = 'OUTPUT'
  }

  #resetData(e) {
    e.preventDefault()
    e.stopPropagation()
    if (this.#originalData) {
      console.log(this.#originalData)
      this.#dataInput.value = ''
      this.#mode.innerText = 'INPUT'
      this.#headersInput.value = ''
      this.#dataInput.value = this.#originalData
      this.#messages.innerHTML = ''
      this.#headersInput.classList.toggle('hidden')
    } else {
      this.#dataInput.value = 'Original data lost...'
    }
  }

  #clearForm(e) {
    e.preventDefault()
    e.stopPropagation()
    this.#mode.innerText = 'INPUT'
    this.#headersInput.value = ''
    this.#originalData = this.#dataInput.value
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