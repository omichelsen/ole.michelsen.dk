var handleFiles, handleResult;

handleFiles = function(files) {
  var file, loading, reader;
  if (files.length === 0) {
    return;
  }
  file = files[0];
  reader = new FileReader();
  loading = document.getElementById("loading");
  loading.style.display = "";
  reader.onloadend = function() {
    handleResult(file, reader.result);
    loading.style.display = "none";
  };
  reader.readAsDataURL(file);
};

handleResult = function(file, result) {
  var elmOutput, elmStats, percent, sizeInput, sizeOutput;
  elmOutput = document.getElementById("output");
  elmOutput.value = result;
  elmOutput.select();
  sizeInput = file.size;
  sizeOutput = result.length - result.indexOf(",") - 1;
  percent = Math.round((sizeOutput / sizeInput - 1) * 100);
  elmStats = document.getElementById("resultstats");
  elmStats.innerHTML = "Size increased from " + sizeInput + " to " + sizeOutput + " (" + percent + "%)";
};
