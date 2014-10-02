handleFiles = (files) ->
  return  if files.length is 0
  file = files[0]
  reader = new FileReader()

  loading = document.getElementById("loading")
  loading.style.display = ""

  reader.onloadend = ->
    handleResult file, reader.result
    loading.style.display = "none"
    return

  reader.readAsDataURL file
  return


handleResult = (file, result) ->
  elmOutput = document.getElementById("output")
  elmOutput.value = result
  elmOutput.select()

  sizeInput = file.size
  sizeOutput = result.length - result.indexOf(",") - 1
  percent = Math.round((sizeOutput / sizeInput - 1) * 100)
  elmStats = document.getElementById("resultstats")
  elmStats.innerHTML = "Size increased from " + sizeInput + " to " + sizeOutput + " (" + percent + "%)"
  return
