import { html, render } from 'https://unpkg.com/lit-html?module'

const elmForm = document.getElementById('urlform')
const elmUri = document.getElementById('url')
const elmOut = document.getElementById('out')

elmForm.addEventListener('submit', (e) => e.preventDefault())

elmUri.addEventListener('input', (e) => {
  try {
    const url = new URL(e.target.value)
    const report = createReport(url)
    render(report, elmOut)
  } catch (err) {
    render(html`${err}`, elmOut)
  }
})

const createReport = (url) =>
  html` ${createTable('Address', [
    ['protocol', url.protocol],
    ['host', url.host],
    ['port', url.port],
    ['pathname', url.pathname],
  ])}
  ${url.search && createTable('Query string', [...url.searchParams.entries()])}
  ${url.hash && createTable('Hash', [['hash', url.hash]])}`

const createTable = (caption, arr) =>
  html`<table class="datasheet small">
    <colgroup>
      <col width="200" />
    </colgroup>
    <thead>
      <tr>
        <th colspan="2">${caption}</th>
      </tr>
    </thead>
    <tbody>
      ${arr.map(
        ([key, value]) =>
          html`<tr>
            <td>${key}</td>
            <td>${value}</td>
          </tr>`
      )}
    </tbody>
  </table>`
