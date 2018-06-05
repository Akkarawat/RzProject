var sOutput = "";

function printTxtArea(string){
//	var sOutput = output.value;
//	sOutput += string;
//	output.value = sOutput;
//	output.scrollTop = output.scrollHeight;
	
	sOutput += string;
	if(display)
		document.getElementById('output').innerHTML = sOutput;
	output.scrollTop = output.scrollHeight;
}

function printTxtArea2(string){
	var sOutput = memoryOutput.value;
	sOutput += string;
	memoryOutput.value = sOutput;
	memoryOutput.scrollTop = memoryOutput.scrollHeight;
}

function claerTxtArea(){
//	output.value = "";
//	output.scrollTop = output.scrollHeight;
	sOutput = "";
	document.getElementById('output').innerHTML = sOutput;
	output.scrollTop = output.scrollHeight;
}

function claerTxtArea2(){
	memoryOutput.value = "";
	memoryOutput.scrollTop = memoryOutput.scrollHeight;
}

function printMC(string){
	var sOutput = plainTextMC.value;
	sOutput += string;
	plainTextMC.value = sOutput;
	plainTextMC.scrollTop = plainTextMC.scrollHeight;
}

function clearMC(){
	plainTextMC.value = "";
	plainTextMC.scrollTop = plainTextMC.scrollHeight;
}