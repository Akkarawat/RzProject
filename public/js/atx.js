//assembler for TX processor
//recieve assembly code as input
//generate machine code for simulator in 

var enableDebug = false;

var sInput, sOutput;
var lines, tokens;
var EoF = false;
var state = 'S';
var lineno = 0, loc = 0, tp = 0, t = 0;
var symnum = 0;
var mem = [];
var symTable = [];
var initsym = [	["NOP", 0], ["LDA", 1], ["STA", 2], 
				["JMP", 3], ["JT", 4], ["JF", 5], ["CALL", 6], 
				["ADD", 10], ["SUB", 11], 
				["AND", 12], ["OR", 13], ["XOR", 14], 
				["EQ", 15], ["LT", 16], ["LE", 17], 
				["GT", 18], ["GE", 19], 
				["ADDI", 20], ["SUBI", 21], 
				["ANDI", 22], ["ORI", 23], ["XORI", 24], 
				["EQI", 25], ["LTI", 26], ["LEI", 27], 
				["GTI", 28], ["GEI", 29], 
				["MVA", 30], ["MVR", 31], ["LDX", 32], ["STX", 33], 
				["MVI", 34], ["TRAP", 35], ["RET", 36], 
				["NOT", 37], ["CLR", 38], ["INC", 39], ["DEC", 40], 
				
				["R0", 0], ["R1", 1], ["R2", 2], ["R3", 3], ["R4", 4], 
				["R5", 5], ["R6", 6], ["R7", 7], ["R8", 8], ["R9", 9], 
				["R10", 10], ["R11", 11], ["R12", 12], ["R13", 13], ["R14", 14], 
				["R15", 15], ["BP", 15]];

function atxMain(){
	
	init();
	initsymbol();

	sInput = plainTextAssembly.value;
	sOutput = "";
	
	print("" + symnum.toString() + " initsymbol");

	lines = sInput.split('\n');
	
	pass1();
	pass2();
	
	clearMC();
	printMC(sOutput);

}

function init(){
	EoF = false;
	state = 'S';
	lineno = 0, loc = 0, tp = 0, t = 0;
	symnum = 0;
	initsym = [	["NOP", 0], ["LDA", 1], ["STA", 2], 
		["JMP", 3], ["JT", 4], ["JF", 5], ["CALL", 6], 
		["ADD", 10], ["SUB", 11], 
		["AND", 12], ["OR", 13], ["XOR", 14], 
		["EQ", 15], ["LT", 16], ["LE", 17], 
		["GT", 18], ["GE", 19], 
		["ADDI", 20], ["SUBI", 21], 
		["ANDI", 22], ["ORI", 23], ["XORI", 24], 
		["EQI", 25], ["LTI", 26], ["LEI", 27], 
		["GTI", 28], ["GEI", 29], 
		["MVA", 30], ["MVR", 31], ["LDX", 32], ["STX", 33], 
		["MVI", 34], ["TRAP", 35], ["RET", 36], 
		["NOT", 37], ["CLR", 38], ["INC", 39], ["DEC", 40], 
		
		["R0", 0], ["R1", 1], ["R2", 2], ["R3", 3], ["R4", 4], 
		["R5", 5], ["R6", 6], ["R7", 7], ["R8", 8], ["R9", 9], 
		["R10", 10], ["R11", 11], ["R12", 12], ["R13", 13], ["R14", 14], 
		["R15", 15], ["BP", 15]];
}

function initsymbol(){
	for(var i = 0; i < initsym.length; i++){
		symTable[initsym[i][0]] = [initsym[i][1], "OP"];
		symnum++;
	}
}

function cmp(string1, string2){
	return string1.toUpperCase() === string2.toUpperCase();
}

// string, int
function store(type, ref){
	mem[tp] = new Array(type, ref, lineno);
	tp++;
	w = ref;
	if(typeof w === "number")
		w = w.toString();
	print("\n--- " + type + " : " + w + " ---");
}

function tok(){
	while(t < tokens.length){
		t++;
		w = tokens[t];
		if(w != '')
			return w;
	}
	return -1;
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function readR(){
	w = tok();
	if(isNumeric(w))
		store("NUM", parseInt(w));
	else
		store("NUM", symTable[w.toUpperCase()][0])
}

function readM(){
	w = tok();
	if(isNumeric(w))
		store("NUM", parseInt(w));
	else
		store("SYM", w);
}

function readI(){
	w = tok();
	if(w.charAt(0) == '#'){
		w = w.substr(1, w.length - 1);
		if(isNumeric(w))
			store("NUM", parseInt(w));
		else
			store("SYM", w);
	}
	else
		error("expect immediate argument");
	
}

function readcode(){
	var w = tokens[t];
	print("\n opcode : " + w);
	var op = symTable[w.toUpperCase()][0];
	print(" = " + op.toString());
	
	store("OP", op);
	
	switch(op){
		case symTable["LDA"][0]:
		case symTable["STA"][0]:
		case symTable["JMP"][0]:
		case symTable["JT"][0]:
		case symTable["JF"][0]:
		case symTable["CALL"][0]:	readM(); break;

		case symTable["ADD"][0]:
		case symTable["SUB"][0]:
		case symTable["AND"][0]:
		case symTable["OR"][0]:
		case symTable["XOR"][0]:
		case symTable["EQ"][0]:
		case symTable["LT"][0]:
		case symTable["LE"][0]:
		case symTable["GT"][0]:
		case symTable["GE"][0]:
		case symTable["MVA"][0]:
		case symTable["MVR"][0]:
		case symTable["LDX"][0]:
		case symTable["STX"][0]:
		case symTable["CLR"][0]:
		case symTable["INC"][0]:
		case symTable["DEC"][0]:	readR(); break;
		
		case symTable["ADDI"][0]:
		case symTable["SUBI"][0]:
		case symTable["ANDI"][0]:
		case symTable["ORI"][0]:
		case symTable["XORI"][0]:
		case symTable["EQI"][0]:
		case symTable["LTI"][0]:
		case symTable["LEI"][0]:
		case symTable["GTI"][0]:
		case symTable["GEI"][0]:
		case symTable["MVI"][0]:
		case symTable["TRAP"][0]:	readI(); break;
		
		case symTable["RET"][0]:
		case symTable["NOT"][0]:	break;
		
		default: error("undefine op");
	}
	
}

function rdtokval(){
	var w = -1;
	switch(mem[tp][0]){
		case "NUM": w = mem[tp][1]; break;
		case "SYM": w = symTable[mem[tp][1]][0]; break;
		default : error("undefine symbol");
	}
	tp++;
	return w;
}

function prL(op, a1){
	sOutput += "L " + op.toString() + " " + a1.toString() + "\n";
	print(" prL " + op.toString() + " " + a1.toString() + " ");
}

function prR(op, a1){
	sOutput += "R 14 " + op.toString() + " " + a1.toString() + "\n";
	print(" prR " + op.toString() + " " + a1.toString() + " ");
}

function prI(op, a1){
	sOutput += "I 15 " + op.toString() + " " + a1.toString() + "\n";
	print(" prI " + op.toString() + " " + a1.toString() + " ");
}

function gencode(){
	var op, a1;
	
	op = mem[tp][1];
	tp++;
	
	print(" gencode [op=" + op.toString() + "] ");
	
	switch(op){
		case symTable["NOP"][0]: 	prL(0, 0); break;
		case symTable["LDA"][0]:
		case symTable["STA"][0]:
		case symTable["JMP"][0]:
		case symTable["JT"][0]:
		case symTable["JF"][0]:
		case symTable["CALL"][0]:	prL(op, rdtokval()); break;
	
		case symTable["ADD"][0]:
		case symTable["SUB"][0]:
		case symTable["AND"][0]:
		case symTable["OR"][0]:
		case symTable["XOR"][0]:
		case symTable["EQ"][0]:
		case symTable["LT"][0]:
		case symTable["LE"][0]:
		case symTable["GT"][0]:
		case symTable["GE"][0]:		prR(op-10, rdtokval()); break;
			
		case symTable["MVA"][0]:
		case symTable["MVR"][0]:
		case symTable["LDX"][0]:
		case symTable["STX"][0]:	prR(op-20, rdtokval()); break;
		
		case symTable["ADDI"][0]:
		case symTable["SUBI"][0]:
		case symTable["ANDI"][0]:
		case symTable["ORI"][0]:
		case symTable["XORI"][0]:
		case symTable["EQI"][0]:
		case symTable["LTI"][0]:
		case symTable["LEI"][0]:
		case symTable["GTI"][0]:
		case symTable["GEI"][0]:	prI(op-20,rdtokval()); break;
			
		case symTable["MVI"][0]:
		case symTable["TRAP"][0]:	prI(op-24,rdtokval()); break;
		case symTable["RET"][0]:	sOutput += "I 15 12 0" + "\n"; break;
		case symTable["NOT"][0]:	sOutput += "I 15 13 0" + "\n"; break;
		case symTable["CLR"][0]:	sOutput += "R 13 0 " + rdtokval().toString() + "\n"; break;
		case symTable["INC"][0]:	sOutput += "R 13 1 " + rdtokval().toString() + "\n"; break;
		case symTable["DEC"][0]:	sOutput += "R 13 2 " + rdtokval().toString() + "\n"; break;
		
		default: error("undefine op");
	}
}

function print(string1){
	if(enableDebug)
		printTxtArea(string1);
}

function error(string1){
	if(enableDebug)
		printTxtArea("\n" + string1 + " ");
}

function pass1(){

	for(var i = 0; i < lines.length && !EoF; i++){
	    //code here using lines[i] which will give you each line
	    
		print("\nline : " + i.toString());
		
	    tokens = lines[i].split(/\s+/);
	    
	    t = 0;
	    var w = tokens[t];

	    while(true) {
	    	
	    	if(cmp(w, ".END")){
	    		EoF = true;
	    		break;
	    	}
	    	
	    	print(" [" + w + ", " + (t+1).toString() + "/" + tokens.length.toString() + "] ");
	    	if(cmp(w, ".SYMBOL")){
		    	state = 'S';
		    }else if(cmp(w, ".DATA")){
		    	loc = parseInt(tok());
		    	store("DOTD", loc);
		    	state = 'D';
		    }else if(cmp(w, ".CODE")){
		    	loc = parseInt(tok());
		    	store("DOTC", loc);
		    	state = 'C';
		    }else{
		    	 switch(state){
		    	 	case 'S':
		    	 		if(typeof symTable[w] !== 'undefined')
		    	 			print("duplicate symbol");
		    	 		else if(w != ''){
		    	 			symTable[w] = new Array(parseInt(tok()), "SYM");
		    	 			print("new symbol stored : " + w + " = " + symTable[w][0].toString());
		    	 		}
		    	 		break;
		    	 	case 'D':
		    	 		if(isNumeric(w))
		    	 			store("NUM", parseInt(w));
		    	 		else if(w != '')
		    	 			store("SYM", w);
		    	 		loc++;
		    	 		break;
		    	 	case 'C':
		    	 		if(w.charAt(0) == ':'){
		    	 			w = w.substr(1, w.length - 1);
		    	 			if(typeof symTable[w] !== 'undefined')
		    	 				print("duplicate label");
		    	 			else{
		    	 				symTable[w] = new Array(loc, "SYM");
		    	 				print("new label stored : " + w + " = " + loc.toString());
		    	 			}
		    	 		}
		    	 		else if(w != ''){
		    	 			w = w.toUpperCase();
		    	 			
		    	 			if(typeof symTable[w] === 'undefined' 
		    	 				|| symTable[w][1] != "OP")
		    	 				print("undefined op");
		    	 			else{
		    	 				print(" reading code : " + w + " ");
		    	 				readcode();
		    	 			}
		    	 			loc++;
		    	 		}
		    	 			
		    	 
		    	 }
		    }
		    t++;
		    if(t < tokens.length)
		    	w = tokens[t];
		    else
		    	break;
		} // while
	} // for
	store("DOTE", loc);
    
}

function pass2(){
	tp = 0;
	while(mem[tp][0] != "DOTE"){
		switch(mem[tp][0]){
			case "DOTC":
				loc = mem[tp][1];
				sOutput += "a " + loc.toString() + "\n";
				tp++;
				while(mem[tp][0] != "DOTC" && mem[tp][0] != "DOTD" && mem[tp][0] != "DOTE"){
					print("\ngenerating code block (" + tp.toString() + ")");
					gencode();
					loc++;
				}
				break;
			case "DOTD":
				loc = mem[tp][1];
				sOutput += "a " + loc.toString() + "\n";
				tp++;
				while(mem[tp][0] != "DOTC" && mem[tp][0] != "DOTD" && mem[tp][0] != "DOTE"){
					print("\ngenerating data block (" + tp.toString() + ")");
					sOutput += "w " + rdtokval().toString() + "\n";
					loc++;
				}
		}
	}
	sOutput += "e";
	
}