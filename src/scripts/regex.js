autosize(document.querySelectorAll('textarea'))

const elmPattern = document.getElementById('pattern')
const elmInput = document.getElementById('input')
const elmReplace = document.getElementById('replace')
const elmMatches = document.getElementById('matches')

const validate = (pattern, modifiers, replace, subject) => {
  // Since forward slashes delimit the regular expression, any forward slashes that appear in the regex need to be escaped. E.g. the regex 1/2 is written as /1\/2/ in JavaScript.
  const escaped = pattern.replace('/', '/')

  // Instantiate RegExp object (needed when pattern is from variable)
  const re = new RegExp(escaped, modifiers)

  if (replace && replace.length > 0) {
    const m = subject.replace(re, replace)
    return m == null ? 'No match' : m
  } else {
    const m = subject.match(re)
    return m == null
      ? 'No match'
      : m.reduce((s, match, i) => s + `${i}: ${match}\n`, '')
  }
}

const handleFormInput = (event, doReplace) => {
  event.preventDefault()

  const pattern = elmPattern.value
  const input = elmInput.value
  const replace = doReplace ? elmReplace.value : ''

  const modifiers = Array.prototype.slice
    .apply(document.querySelectorAll('input:checked'))
    .reduce((m, elm) => m + elm.value, '')

  try {
    elmMatches.value = validate(pattern, modifiers, replace, input)
  } catch (err) {
    elmMatches.value = err
  }

  autosize.update(elmMatches)
}

// Bind form event listeners
document.getElementById('regex').onsubmit = handleFormInput
document.getElementById('doValidate').onclick = handleFormInput
document.getElementById('doReplace').onclick = (e) => handleFormInput(e, true)
elmPattern.oninput = handleFormInput
elmInput.oninput = handleFormInput
elmReplace.oninput = handleFormInput

const copySample = (event) => {
  event.preventDefault()

  const id = event.target.getAttribute('href')

  // Pattern is fetched from the first <td>
  elmPattern.value = document.querySelector(`${id} td:first-child`).innerHTML

  // Input is fetched from first <span> (in second <td>)
  elmInput.value = document.querySelector(`${id} span:first-child`).innerHTML
}

document.querySelectorAll('#samples a').forEach((elm) => {
  elm.onclick = copySample
})
