var sOutputDiv = "";

function printTxtArea(txtAreaName, string){
	var txtArea = document.getElementById(txtAreaName);
	var sOutput = txtArea.value;
	sOutput += string;
	txtArea.value = sOutput;
	txtArea.scrollTop = txtArea.scrollHeight;
}

function claerTxtArea(txtAreaName){
	var txtArea = document.getElementById(txtAreaName);
	var sOutput = txtArea.value;
	sOutput = "";
	txtArea.value = sOutput;
	txtArea.scrollTop = txtArea.scrollHeight;
}

function error(string){
	var errorDisplay = "plainTextMC";
	var txtArea = document.getElementById(errorDisplay);
	var sOutput = txtArea.value;
	sOutput += string;
	txtArea.value = sOutput;
	txtArea.scrollTop = txtArea.scrollHeight;
}

function printOutput(string){
	console.log(string);
	sOutputDiv += string;
	if(display)
		document.getElementById('output').innerHTML = sOutputDiv;
	output.scrollTop = output.scrollHeight;
}

function clearOutput(){
	sOutputDiv = "";
	if(display)
		document.getElementById('output').innerHTML = sOutputDiv;
	output.scrollTop = output.scrollHeight;
}