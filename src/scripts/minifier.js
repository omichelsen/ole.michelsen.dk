autosize(document.querySelectorAll('textarea'))

const elmInput = document.getElementById('input')
const elmOutput = document.getElementById('output')
const elmStats = document.getElementById('stats')
const elmLoader = document.getElementById('loader')

const cssPattern = /\.\w+\s*{/

const handleSubmit = async (event) => {
  event.preventDefault()

  const input = elmInput.value
  const inputSize = input.length
  const inputType = cssPattern.test(input) ? 'css' : 'js'

  elmLoader.classList.remove('hide')

  const res = await fetch('/.netlify/functions/minifier', {
    method: 'post',
    body: JSON.stringify({ [inputType]: input }),
  })

  elmLoader.classList.add('hide')

  if (res.ok) {
    const { output } = await res.json()
    const outputSize = output.length
    const savings = Math.round((outputSize / inputSize - 1) * 100)

    elmOutput.value = output
    elmStats.innerText = `Reduced input size from ${inputSize} to ${outputSize} (${savings}%)`

    autosize.update(elmOutput)
  }
}

document.getElementById('minifier').onsubmit = handleSubmit
elmInput.oninput = handleSubmit
