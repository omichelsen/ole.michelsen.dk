const fields = [
  'default-src',
  'connect-src',
  'font-src',
  'img-src',
  'media-src',
  'object-src',
  'script-src',
  'style-src',
  'frame-src',
]
const format = 'plain'
let elmList, elmOutput

function fillInput(config) {
  elmList.forEach(function (elm) {
    if (elm.id in config) {
      elm.value = config[elm.id].replace(/\s+/g, '\n')
    }
  })

  onInputChange()
}

function parseConfig(pattern, config) {
  const match = pattern.exec(config)
  if (match && match.length > 0) {
    const obj = {}
    let firstSpacePos
    match[1].split(';').forEach((item) => {
      item = item.trim()
      firstSpacePos = item.indexOf(' ')
      obj[item.substring(0, firstSpacePos)] = item.substr(firstSpacePos + 1)
    })
    return obj
  }
}

function parseApache(config) {
  const pattern =
    /^\s*Header\s(?:always\s)?(?:set|append|merge|add)\sContent-Security-Policy\s"(.+)"/im
  fillInput(parseConfig(pattern, config))
  setRadioChecked('apache')
}

function parseNginx(config) {
  const pattern = /^\s*add_header\sContent-Security-Policy\s"(.+)"/im
  fillInput(parseConfig(pattern, config))
  setRadioChecked('nginx')
}

function parseIis(config) {
  const pattern = /<add name="Content-Security-Policy" value="(.+)"/im
  fillInput(parseConfig(pattern, config))
  setRadioChecked('iis')
}

function parseFile(file, result) {
  const config = window.atob(result.substr(result.indexOf(',') + 1))
  if (config.indexOf('add_header') > -1) {
    parseNginx(config)
  } else if (config.indexOf('Header') > -1) {
    parseApache(config)
  } else if (config.indexOf('name="Content-Security-Policy"') > -1) {
    parseIis(config)
  }
  autosize.update(elmList)
}

function onFileChange(files) {
  if (files.length === 0) return

  const file = files[0]
  const reader = new FileReader()

  reader.onloadend = () => parseFile(file, reader.result)

  reader.readAsDataURL(file)
}

function setRadioChecked(value) {
  const elm = document.querySelector(`input[value=${value}]`)
  elm.checked = true
}

const formatInput = (text) => text.split(/\n/).sort().join(' ')

function formatOutput(outputList) {
  if (format === 'apache') {
    return formatApache(outputList)
  } else if (format === 'nginx') {
    return formatNginx(outputList)
  } else if (format === 'iis') {
    return formatIis(outputList)
  }
  return outputList.join('; ')
}

function formatApache(cspList) {
  return `Header set Content-Security-Policy "${cspList.join('; ')}"`
}

function formatNginx(cspList) {
  return `add_header Content-Security-Policy "${cspList.join('; ')}"`
}

function formatIis(cspList) {
  return `<add name="Content-Security-Policy" value="${cspList.join('; ')}" />`
}

function onRadioChange(radio) {
  format = radio.value
  onInputChange()
}

function onInputChange() {
  const outputList = elmList
    .map((curr) => {
      const val = formatInput(curr.value)
      if (val.length) {
        return `${curr.id} ${val}`
      }
    })
    .filter((item) => !!item)
  elmOutput.value = formatOutput(outputList)
}

function init() {
  elmOutput = document.getElementById('csp-output')

  elmOutput.addEventListener('click', function () {
    this.select()
  })

  elmList = fields.map((id) => document.getElementById(id))

  elmList.forEach((elm) => elm.addEventListener('change', onInputChange))

  autosize(elmList)

  fillInput({
    'default-src': "'self'",
  })
}

document.addEventListener('DOMContentLoaded', init)
