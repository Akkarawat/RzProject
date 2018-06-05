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
//assembler for TX processor
//recieve assembly code as input
//generate machine code for simulator in 

var enableDebug = false;

var sInput, sOutput;
var lines, tokens;
var EoF = false;
var state = 'S';
var lineno = 0, loc = 0, tp = 0, mark = 0, t = 0;
var symnum = 0;
var mem = []; // array of [string mode, string type, int value]
var symTable = []; // associative array of [int value, string type, string mode]
var initsym = [];

function atxMain(){
	
	display = false;
	
	init();
	initsymbol();

	sInput = plainTextAssembly.value;
	sOutput = "";
	
	lognl("" + symnum.toString() + " initsymbol");

	lines = sInput.split('\n');
	
	pass1();
	pass2();
	
	claerTxtArea("plainTextMC");
	printTxtArea("plainTextMC", sOutput);
	
	display = true;
	log("");

}

function init(){
	EoF = false;
	state = 'S';
	lineno = 0, loc = 0, tp = 0, t = 0;
	symnum = 0;
	mem = [];
	symTable = [];
	initsym = [	["NOP", 0, "NA"], ["LD", 1, "MEM"], ["ST", 3, "MEM"], 
		["MOV", 5, "MRI"], ["JMP", 6, "SP"], ["JAL", 7, "ABS"], ["RET", 30, "SP"],
		["JT", 8, "ABS"], ["JF", 9, "ABS"],
		["ADD", 10, "RRI"], ["SUB", 11, "RRI"], ["MUL", 12,"RRI"], ["DIV", 13, "RRI"],
	    ["MOD", 26, "RRI"],
		["AND", 14,"RRI"], ["OR", 15, "RRI"], ["XOR", 16, "RRI"],
		["EQ", 17, "RRI"], ["NE", 18, "RRI"], ["LT", 19, "RRI"], ["LE", 20, "RRI"],
		["GT", 21, "RRI"], ["GE", 22, "RRI"],
		["SHL", 23, "RRI"], ["SHR", 24, "RRI"], ["NOT", 25, "REG"],
		["TRAP", 31, "TR"], ["PUSH", 32, "REG"], ["POP", 33, "REG"],
		["INT", 34, "SP"], ["RETI", 35, "NA"],
		["PUSHM", 36, "SP"], ["POPM", 37, "SP"], ["XCH", 38, "SP"],
		
		["R0", 0, "0"], ["R1", 1, "0"], ["R2", 2, "0"], ["R3", 3, "0"],
		["R4", 4, "0"], ["R5", 5, "0"], ["R6", 6, "0"], ["R7", 7, "0"],
		["R8", 8, "0"], ["R9", 9, "0"], ["R10", 10, "0"], ["R11", 11, "0"],
		["R12", 12, "0"], ["R13", 13, "0"], ["R14", 14, "0"], ["R15", 15, "0"],
		["R16", 16, "0"], ["R17", 17, "0"], ["R18", 18, "0"], ["R19", 19, "0"],
		["R20", 20, "0"], ["R21", 21, "0"], ["R22", 22, "0"], ["R23", 23, "0"],
		["R24", 24, "0"], ["R25", 25, "0"], ["R26", 26, "0"], ["R27", 27, "0"],
		["R28", 28, "0"], ["R29", 29, "0"], ["R30", 30, "0"], ["R31", 31, "0"],
		
		["r0", 0, "0"], ["r1", 1, "0"], ["r2", 2, "0"], ["r3", 3, "0"],
		["r4", 4, "0"], ["r5", 5, "0"], ["r6", 6, "0"], ["r7", 7, "0"],
		["r8", 8, "0"], ["r9", 9, "0"], ["r10", 10, "0"], ["r11", 11, "0"],
		["r12", 12, "0"], ["r13", 13, "0"], ["r14", 14, "0"], ["r15", 15, "0"],
		["r16", 16, "0"], ["r17", 17, "0"], ["r18", 18, "0"], ["r19", 19, "0"],
		["r20", 20, "0"], ["r21", 21, "0"], ["r22", 22, "0"], ["r23", 23, "0"],
		["r24", 24, "0"], ["r25", 25, "0"], ["r26", 26, "0"], ["r27", 27, "0"],
		["r28", 28, "0"], ["r29", 29, "0"], ["r30", 30, "0"], ["r31", 31, "0"]];
}

function initsymbol(){
	for(var i = 0; i < initsym.length; i++){
		symTable[initsym[i][0]] = [initsym[i][1], "OP", initsym[i][2]];
		symnum++;
	}
}

function cmp(string1, string2){
	return string1.toUpperCase() === string2.toUpperCase();
}

// string, int
function store(type, mode, ref){
	mem[tp] = new Array(type, ref, mode, lineno);
	w = ref;
	if(typeof w === "number")
		w = w.toString();
	lognl("storing token at " + tp + " --- " + type + " | " + w + "|" + mode);
	tp++;
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

function setop(mode){
	lognl("setop = " + mode);
	mem[mark][2] = mode;
}

//read reg, mode RR
function readR(){
	lognl("readR");
	w = tok();
	var w0 = w.substring(0, 1);
	if(w0 == ':' || w0 == '@' || w0 == '+' || w0 == '#')
		error("expect register or ads argument");
	if(isNumeric(w))
		store("NUM", "RR", parseInt(w));
	else
		store("SYM", "RR", w);
}

function storew(s, mode){
	if(isNumeric(s))
		store("NUM", mode, parseInt(s));
	else
		store("SYM", mode, s);
	setop(mode);
}

//read mem, set mode ABS IND INX
function readM(){
	lognl("readM");
	w = tok();
	var w0 = w.substring(0, 1);
	switch(w0){
		case '@' : storew(w.substr(1, w.length - 1), "IND"); readR(); break;
		case '+' : storew(w.substr(1, w.length - 1), "INX"); readR(); break;
		default : storew(w, "ABS"); break;
	}
}

function readRI(imm, r){
	lognl("readRI");
	w = tok();
	var w0 = w.substring(0, 1);
	if(w0 == ':' || w0 == '@' || w0 == '+')
		error("expect register or immediate argument");
	if(w0 == '#')
		storew(w.substr(1, w.length - 1), imm);
	else
		storew(w, r);
}

function readI(){
	lognl("readI");
	w = tok();
	var w0 = w.substring(0, 1);
	w = w.substr(1, w.length - 1);
	if(w0 == '#')
		storew(w, "IMM");
	else
		error("expect immediate argument");
	
}

function readcode(w){
	log("opcode : " + w);
	var op = symTable[w.toUpperCase()][0];
	lognl(" = " + op.toString());
	
	mark = tp;
	store("OP", "NA", op);
	
	switch(op){
		case symTable["NOP"][0]:	// zero arg
		case symTable["RETI"][0]:	break;
		case symTable["LD"][0]:
		case symTable["ST"][0]:		readR(); readM(); break;
		case symTable["JMP"][0]:	// one arg
		case symTable["RET"][0]:	readR(); setop("SP"); break;
		case symTable["JAL"][0]:	// two arg
		case symTable["JT"][0]:
		case symTable["JF"][0]:		readR(); readR(); setop("ABS"); break;
		case symTable["ADD"][0]:	// three arg
		case symTable["SUB"][0]:
		case symTable["MUL"][0]:
		case symTable["DIV"][0]:
		case symTable["MOD"][0]:
		case symTable["AND"][0]:
		case symTable["OR"][0]:
		case symTable["XOR"][0]:
		case symTable["EQ"][0]:
		case symTable["NE"][0]:
		case symTable["LT"][0]:
		case symTable["LE"][0]:
		case symTable["GT"][0]:
		case symTable["GE"][0]:
		case symTable["SHL"][0]:
		case symTable["SHR"][0]:	readR(); readR(); readRI("RI", "RR"); break;
		case symTable["MOV"][0]:	readR(); readRI("IMM", "REG"); break;
		case symTable["NOT"][0]:	//two regs
		case symTable["PUSH"][0]:
		case symTable["POP"][0]:	readR(); readR(); setop("REG"); break;
		case symTable["TRAP"][0]:	readR(); readI(); setop("TR"); break;
		case symTable["INT"][0]:	readI(); setop("SP"); break;
		case symTable["PUSHM"][0]:
		case symTable["POPM"][0]:
		case symTable["XCH"][0]:	readR(); setop("SP"); break
			  
		default: error("undefine op");
	}
	
}

function chkarg(type){
	lognl("chkarg");
	var mode;
	var f = false;
	mode = mem[mark][2];
	switch(type){
		case "MEM" : f = (cmp(mode, "ABS") || cmp(mode, "IND") || cmp(mode, "INX")); break;
		case "RRI" : f = (cmp(mode, "RR") || cmp(mode, "RI")); break;
		case "MRI" : f = (cmp(mode, "IMM") || cmp(mode, "REG")); break;
		case "ABS" : f = cmp(mode, "ABS") ; break;
		case "RI" : f = cmp(mode, "RI") ; break;
		case "RR" : f = cmp(mode, "RR") ; break;
		case "SP" : f = cmp(mode, "SP") ; break;
		case "TR" : f = cmp(mode, "TR") ; break;
		case "REG" : f = cmp(mode, "REG") ; break;
		case "NA" : f = cmp(mode, "NA") ; break;
	}
	if(f)
		error("incorrect argument type");
}

function rdtokval(){
	log("rdtokval");
	var w = -1;
	switch(mem[tp][0]){
		case "NUM": w = mem[tp][1]; break;
		case "SYM": w = symTable[mem[tp][1]][0]; break;
	}
	if(w == -1)
		error("undefined symbol");
	lognl(" --- w = " + w);
	tp++;
	return w;
}

function readarg(mode){
	lognl("readarg");
	var a1 = -1, a2 = -1, a3 = -1;
	a1 = rdtokval();
	switch(mode){
		case "SP" : 	break;	// one arg
		case "ABS" : 			// two arg
		case "IMM" :
		case "REG" :
		case "TR" : 	a2 = rdtokval(); break;
		case "INX" : 			// three arg
		case "IND" : 
		case "RI" :
		case "RR" : 	a2 = rdtokval(); a3 = rdtokval(); break;
		default : 		error("unknow addressing mode");
	}
	return new Array(a1, a2, a3);
}

function prL(op, a1, a2){
	sOutput += "L " + op.toString() + " " + a1.toString() + " " + a2.toString() + "\n";
	lognl(" prL " + op.toString() + " " + a1.toString() + " " + a2.toString() + " ");
}

function prD(op, a1, a2, a3){
	sOutput += "D " + op.toString() + " " + a1.toString() + " " + a2.toString() + " " + a3.toString() + "\n";
	lognl(" prD " + op.toString() + " " + a1.toString() + " " + a2.toString() + " " + a3.toString() + " ");
}

function prX(xop, a1, a2, a3){
	sOutput += "X 31 " + a1.toString() + " " + a2.toString() + " " + a3.toString() + " " + xop.toString() + "\n";
	lognl(" prX " + xop.toString() + " " + a1.toString() + " " + a2.toString() + " " + a3.toString() + " ");
}

function gencode(){
	lognl("gencode");
	var op, op2, mode, temp, a1, a2, a3;
	mode = mem[tp][2];
	op = mem[tp][1];
	tp++;
	if(!cmp(mode, "NA")){
		temp = readarg(mode);
		a1 = temp[0];
		a2 = temp[1];
		a3 = temp[2];
	}
	
	lognl("gencode [op=" + op.toString() + " , mode=" +  mode + "] ");
	
	switch(op){
		case symTable["NOP"][0]: 	prL(0, 0, 0); break;
		case symTable["LD"][0]:
			switch(mode){
				case "ABS" :	prL(1, a1, a2); break;
				case "IND" :	prD(2, a1, a3, a2); break;
				case "INX" :	prX(17, a1, a2, a3); break;
			}
			break;
		case symTable["ST"][0]:
			switch(mode){
				case "ABS" :	prL(3, a1, a2); break;
				case "IND" :	prD(4, a1, a3, a2); break;
				case "INX" :	prX(18, a1, a2, a3); break;
			}
			break;
		case symTable["JMP"][0]:	prL(6, 0, a1); break;
		case symTable["JAL"][0]:
		case symTable["JT"][0]:
		case symTable["JF"][0]:		prL(op, a1, a2); break;
		case symTable["RET"][0]:	prX(19, a1, 0, 0); break;
		case symTable["ADD"][0]:	// three arg
		case symTable["SUB"][0]:
		case symTable["MUL"][0]:
		case symTable["DIV"][0]:
		case symTable["MOD"][0]:
		case symTable["AND"][0]:
		case symTable["OR"][0]:
		case symTable["XOR"][0]:
		case symTable["EQ"][0]:
		case symTable["NE"][0]:
		case symTable["LT"][0]:
		case symTable["LE"][0]:
		case symTable["GT"][0]:
		case symTable["GE"][0]:
		case symTable["SHL"][0]:
		case symTable["SHR"][0]:
			switch(mode){
				case "RI" : prD(op, a1, a2, a3); break;
				case "RR" : prX(op-10, a1, a2, a3); break;
			}
			break;
		case symTable["MOV"][0]:
			switch(mode){
				case "IMM" : prL(5, a1, a2); break;
				case "REG" : prX(16, a1, a2, 0); break;
			}
			break;
		case symTable["TRAP"][0]:	prX(20, a1, a2, 0); break;
		case symTable["PUSH"][0]:	prX(21, a1, a2, 0); break;
		case symTable["POP"][0]:	prX(22, a1, a2, 0); break;
		case symTable["NOT"][0]:	prX(23, a1, a2, 0); break;
		case symTable["INT"][0]:	prX(24, a1, 0, 0); break;
		case symTable["RETI"][0]:	prX(25, 0, 0, 0); break;
		case symTable["PUSHM"][0]:	prX(26, a1, 0, 0); break;
		case symTable["POPM"][0]:	prX(27, a1, 0, 0); break;
		case symTable["XCH"][0]:	prX(28, a1, 0, 0); break;
		
		default: error("undefine op");
	}
}

function log(string){
	if(enableDebug)
		printOutput(string);
	console.log(string);
}

function lognl(string){
	if(enableDebug)
		printOutput(string + "<br>");
	console.log(string);
}

function error(string){
	if(enableDebug)
		printOutput("<br>" + string + " ");
	console.log(string);
}

function pass1(){

	for(var i = 0; i < lines.length && !EoF; i++){
	    //code here using lines[i] which will give you each line
	    
		log("line : " + i.toString());
		
	    tokens = lines[i].split(/\s+/);
	    
	    t = 0;
	    var w = tokens[t];

	    while(true) {
	    	
	    	if(cmp(w, ".END")){
	    		EoF = true;
	    		break;
	    	}
	    	
	    	lognl(" [" + w + ", " + (t+1).toString() + "/" + tokens.length.toString() + "] ");
	    	if(cmp(w, ".SYMBOL")){
		    	state = 'S';
		    }else if(cmp(w, ".DATA")){
		    	loc = parseInt(tok());
		    	store("DOTD", "NA", loc);
		    	state = 'D';
		    }else if(cmp(w, ".CODE")){
		    	loc = parseInt(tok());
		    	store("DOTC", "NA", loc);
		    	state = 'C';
		    }else{
		    	 switch(state){
		    	 	case 'S':
		    	 		if(typeof symTable[w] !== 'undefined')
		    	 			error("duplicate symbol");
		    	 		else if(w != ''){
		    	 			symTable[w] = new Array(parseInt(tok()), "SYM", "NA");
		    	 			lognl("new symbol stored : " + w + " = " + symTable[w][0].toString());
		    	 		}
		    	 		break;
		    	 	case 'D':
		    	 		if(isNumeric(w))
		    	 			store("NUM", "NA", parseInt(w));
		    	 		else if(w != '')
		    	 			store("SYM", "NA", w);
		    	 		loc++;
		    	 		break;
		    	 	case 'C':
		    	 		if(w.charAt(0) == ':'){
		    	 			w = w.substr(1, w.length - 1);
		    	 			if(typeof symTable[w] !== 'undefined')
		    	 				lognl("duplicate label");
		    	 			else{
		    	 				symTable[w] = new Array(loc, "SYM", "NA");
		    	 				lognl("new label stored : " + w + " = " + loc.toString());
		    	 			}
		    	 		}
		    	 		else if(w != ''){
		    	 			var er = false;
		    	 			w = w.toUpperCase();
		    	 			if(typeof symTable[w] === 'undefined' 
		    	 				|| symTable[w][1] != "OP"){
		    	 				error("undefined op");
		    	 				er = true;
		    	 			}
		    	 			else{
		    	 				lognl(" reading code : " + w + " ");
		    	 				readcode(w);
		    	 				chkarg(w);
		    	 			}
		    	 			if(!er){
			    	 			loc++;
			    	 			lognl("loc = " + loc);
		    	 			}
		    	 		}
		    	 			
		    	 
		    	 }
		    }
		    t++;
		    if(t < tokens.length)
		    	w = tokens[t];
		    else
		    	break;
		} // while
	    //console.log("line " + i + " completed");
	} // for
	store("DOTE", "NA", loc);
    
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
					lognl("C generating code block from tp = " + tp.toString() + " | " + mem[tp][0] + "|" + mem[tp][1] + "|" + mem[tp][2]);
					gencode();
					loc++;
				}
				break;
			case "DOTD":
				loc = mem[tp][1];
				sOutput += "a " + loc.toString() + "\n";
				tp++;
				while(mem[tp][0] != "DOTC" && mem[tp][0] != "DOTD" && mem[tp][0] != "DOTE"){
					lognl("D generating data block from tp = " + tp.toString() + " | " + mem[tp][0] + "|" + mem[tp][1] + "|" + mem[tp][2]);
					sOutput += "w " + rdtokval().toString() + "\n";
					loc++;
				}
		}
	}
	sOutput += "e";
	
}
//simulator of Rz processor
//recieve machine code as input
//machine code is generated by assembler in atx.js

var timer0range, timer1range;

var memDisplayAddress = 0;

var MAXMEM = 20000;		// memory max
var DEL	= 100;			// interrupt interval (inst)
var INTVEC = 1000;		// int vec location
var STRSEG = 9000; 		//string segment
var MAXSIM = 10000;		// max sim clock
var RETV = 28;			// return value register
var SPTR = 29;			// stack pointer
var HEAP = 10000;		// heap for malloc

var ip;
var Ir, Pc, RetAds;
var markLoc = -1;
var runflag, saveflaf, cpuflag;
var heapfree = HEAP;

var display = true, savePc;
var enableSimDebug = false;
var markLoc = -1;
var trapString = "";
//var T;
var step, ninst, clock; 
var end = false;

var intflag, intnum;
var intmask = [false, false, false, false];
var intrq = [false, false, false, false];

var M = new Array();
var R = Array(32).fill(0);
var opCode = [];

var initOpCode = [["NOP", 0], ["LDA", 1], ["LDD", 2], ["STA", 3],
				["STD", 4], ["MVI", 5], ["JMP", 6], ["JAL", 7],
				["JT", 8], ["JF", 9], ["ADDI", 10], ["SUBI", 11],
				["MULI", 12], ["DIVI", 13], ["ANDI", 14], ["ORI", 15],
				["XORI", 16], ["EQI", 17], ["NEI", 18], ["LTI", 19],
				["LEI", 20], ["GTI", 21], ["GEI", 22], ["SHLI", 23],
				["SHRI", 24], ["MODI", 25], ["XOP", 31],
				
				//	xop
				["ADD", 0], ["SUB", 1], ["MUL", 2], ["DIV", 3],
				["AND", 4], ["OR", 5], ["XOR", 6], ["EQ", 7],
				["NE", 8], ["LT", 9], ["LE", 10], ["GT", 11],
				["GE", 12], ["SHL", 13], ["SHR", 14], ["MOD", 15],
				["MOV", 16], ["LDX", 17], ["STX", 18], ["RET", 19],
				["TRAP", 20], ["PUSH", 21], ["POP", 22], ["NOT", 23],
				["INT", 24], ["RETI", 25], ["PUSHM", 26], ["POPM", 27],
				["XCH", 28],

				["RETV", 28], ["SPTR", 29]
				];

function initOp(){
	for(var i = 0; i < initOpCode.length; i++){
		opCode[initOpCode[i][0]] = initOpCode[i][1];
	}
	
}

function simlog(string){
	if(enableSimDebug)
		printOutput("<br>" + string + "<br>");
	console.log(string);
}

function initcpu(){
	display = true;
	clock = 0;
	ninst = 0;
	step = 1;
	Pc = 0;
	runflag = true;
	cpuflag = true;
	intflag = true;
	intmask[0] = 1;
	intmask[1] = 0;
	intmask[2] = 0;
	intmask[3] = 0;
	var i;
	M = new Array();
	for(i = 0; i < 32; i++){
		R[i] = 0;
	}
	initOpCode = [["NOP", 0], ["LDA", 1], ["LDD", 2], ["STA", 3],
		["STD", 4], ["MVI", 5], ["JMP", 6], ["JAL", 7],
		["JT", 8], ["JF", 9], ["ADDI", 10], ["SUBI", 11],
		["MULI", 12], ["DIVI", 13], ["ANDI", 14], ["ORI", 15],
		["XORI", 16], ["EQI", 17], ["NEI", 18], ["LTI", 19],
		["LEI", 20], ["GTI", 21], ["GEI", 22], ["SHLI", 23],
		["SHRI", 24], ["MODI", 25], ["XOP", 31],
		
		//	xop
		["ADD", 0], ["SUB", 1], ["MUL", 2], ["DIV", 3],
		["AND", 4], ["OR", 5], ["XOR", 6], ["EQ", 7],
		["NE", 8], ["LT", 9], ["LE", 10], ["GT", 11],
		["GE", 12], ["SHL", 13], ["SHR", 14], ["MOD", 15],
		["MOV", 16], ["LDX", 17], ["STX", 18], ["RET", 19],
		["TRAP", 20], ["PUSH", 21], ["POP", 22], ["NOT", 23],
		["INT", 24], ["RETI", 25], ["PUSHM", 26], ["POPM", 27],
		["XCH", 28],

		["RETV", 28], ["SPTR", 29]
		];
}

function dumpreg(){
	
	printOutput('<span class="regDisplay">');
	var i;
	for(i=0; i<32; i++){
		if(i == markLoc)
			printOutput("<b>r" + i.toString() + ":" + R[i].toString() + "</b> ");
		else
			printOutput("r" + i.toString() + ":" + R[i].toString() + " ");
	}
	printOutput("</span><br>");
}

function memJump(){
	memDisplayAddress = document.getElementById("memAddress").value;
	if(memDisplayAddress < 0)
		memDisplayAddress = 0;
	updateMemDisplay();
}

function updateMemDisplay(){
	var offset = memDisplayAddress;
    for(var i = offset; i < (offset+100); i++){
    	
    	var str = "";
    	
    	str += "m";
    	str += i.toString();
    	str += " : ";
    	
    	if(M[i] != 'undefined'){
	    	str += (M[i] >> 27) & 0x01F;
	    	str += ' ';
	    	str += (M[i] >> 22) & 0x01F;
	    	str += ' ';
	    	str += (M[i] >> 17) & 0x01F;
	    	str += ' ';
	    	str += (M[i] >> 12) & 0x01F;
	    	str += ' ';
	    	str += M[i] & 0x0FFF;
    	}
    	else{
    		str += "-"
    	}
    	
    	var ref = "m";
    	ref += (i-offset).toString();
    	document.getElementById(ref).innerHTML = str;
    	
    } 
//    claerTxtArea2();
//    printTxtArea2(str);
}

function printSimTxtArea(string){
	if(display)
		printOutput(string);
}

function pr(s){
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'></span>");
}
function pr3R(s){
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'>r" + IRr1() + " r" +IRr2() + " r" + IRr3() + "</span>");
}
function prI(s) {
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'>r" + IRr1() + " r" +IRr2() + " #" + IRdisp() + "</span>");
}
function prA(s) {
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'>r" + IRr1() + " " + IRads() + "</span>");
}
function pr2R(s){
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'>r" + IRr1() + " r" + IRr2() + "</span>");
}
function pr1R(s){
	printOutput("<span class='opDisplay'>" + s + "</span><span class='paraDisplay'>r" + IRr1() + "</span>");
}

function disassem(){
	switch(IRop()){
		case opCode["NOP"]	:	pr("nop"); break;
		case opCode["LDA"]	:	prA("ld"); break;
		case opCode["LDD"]	:	printOutput("<span class='opDisplay'>ld</span><span class='paraDisplay'>r" + IRr1() + " @" + IRdisp() + " r" + IRr2() + "</span>"); break;
		case opCode["STA"]	:	prA("st"); break;
		case opCode["STD"]	:	printOutput("<span class='opDisplay'>st</span><span class='paraDisplay'>r" + IRr1() + " @" + IRdisp() + " r" + IRr2() + "</span>"); break;
		case opCode["JMP"]	:	printOutput("<span class='opDisplay'>jmp</span><span class='paraDisplay'>" + IRads() + "</span>"); break;
		case opCode["JAL"]	:	prA("jal"); break;
		case opCode["JT"]	:	prA("jt"); break;
		case opCode["JF"]	:	prA("jf"); break;
		case opCode["MVI"]	:	printOutput("<span class='opDisplay'>mov</span><span class='paraDisplay'>r" + IRr1() + " #" + signx2(IRads()) + "</span>"); break;
		case opCode["ADDI"]	:	prI("add"); break;
		case opCode["SUBI"]	:	prI("sub"); break;
		case opCode["MULI"]	:	prI("mul"); break;
		case opCode["DIVI"]	:	prI("div"); break;
		case opCode["ANDI"]	:	prI("and"); break;
		case opCode["ORI"]	:	prI("or"); break;
		case opCode["XORI"]	:	prI("xor"); break;
		case opCode["EQI"]	:	prI("eq"); break;
		case opCode["NEI"]	:	prI("ne"); break;
		case opCode["LTI"]	:	prI("lt"); break;
		case opCode["LEI"]	:	prI("le"); break;
		case opCode["GTI"]	:	prI("gt"); break;
		case opCode["GEI"]	:	prI("ge"); break;
		case opCode["SHLI"]	:	prI("shl"); break;
		case opCode["SHRI"]	:	prI("shr"); break;
		case opCode["MODI"]	:	prI("mod"); break;
		case opCode["XOP"]	:	
			switch(IRxop()){
				case opCode["ADD"]	:	pr3R("add"); break;
				case opCode["SUB"]	:	pr3R("sub"); break;
				case opCode["MUL"]	:	pr3R("mul"); break;
				case opCode["DIV"]	:	pr3R("div"); break;
				case opCode["AND"]	:	pr3R("and"); break;
				case opCode["OR"]	:	pr3R("or"); break;
				case opCode["XOR"]	:	pr3R("xor"); break;
				case opCode["EQ"]	:	pr3R("eq"); break;
				case opCode["NE"]	:	pr3R("ne"); break;
				case opCode["LT"]	:	pr3R("lt"); break;
				case opCode["LE"]	:	pr3R("le"); break;
				case opCode["GT"]	:	pr3R("gt"); break;
				case opCode["GE"]	:	pr3R("ge"); break;
				case opCode["SHL"]	:	pr3R("shl"); break;
				case opCode["SHR"]	:	pr3R("shr"); break;
				case opCode["MOD"]	:	pr3R("mod"); break;
				case opCode["MOV"]	:	pr2R("mov"); break;
				case opCode["PUSH"]	:	pr2R("push"); break;
				case opCode["POP"]	:	pr2R("pop"); break;
				case opCode["LDX"]	:	printOutput("<span class='opDisplay'>ld</span><span class='paraDisplay'>r" + IRr1() + " +" + IRr2() + " r" + IRr3() + "</span>"); break;
				case opCode["STX"]	:	printOutput("<span class='opDisplay'>st</span><span class='paraDisplay'>r" + IRr1() + " +" + IRr2() + " r" + IRr3() + "</span>"); break;
				case opCode["RET"]	:	pr1R("ret"); break;
				case opCode["TRAP"]	:	printOutput("<span class='opDisplay'>trap</span><span class='paraDisplay'>r" + IRr1() + " #" + IRr2() + "</span>"); break;
				case opCode["NOT"]	:	pr2R("not"); break;
				case opCode["INT"]	:	printOutput("<span class='opDisplay'>int</span><span class='paraDisplay'>#" + IRr1() + "</span>"); break;
				case opCode["RETI"]	:	pr("reti"); break;
				case opCode["PUSHM"]	:	pr1R("pushm"); break;
				case opCode["POPM"]	:	pr1R("popm"); break;
				case opCode["XCH"]	:	pr1R("xch"); break;
				
			
				default : pr("error1"); break;
			}
			break;
		
	
		default: pr("error1"); break;
	}
}

function runUntilStop(){
	display = false;
	while(runflag)
		runoneclock();
	if(!end){
		display = true;
		//updateMemDisplay();
		printOutput("");
		//printOutput("Finished at step " + (step-1).toString());
		//dumpreg();
		end = true;
	}
}

function signx2(d){	// sign bit 21 extended
	if( d & 0x0200000 ) return d | 0xFFC00000;
	return d;
}

function signx(d){		// sign bit 16 extended
	if( d & 0x010000 ) return d | 0xFFFE0000;
	return d;
}

function IRop()  { return((Ir >> 27) & 0x01F);} // bit 31..27
function IRr1()  { return((Ir >> 22) & 0x01F);} // bit 26..22
function IRads() { return( Ir & 0x003FFFFF  );} // bit 21..0
function IRr2()  { return((Ir >> 17) & 0x01F);} // bit 21..17
function IRr3()  { return((Ir >> 12) & 0x01F);} // bit 16..12
function IRxop() { return( Ir & 0x0FFF      );} // bit 11..0
function IRdisp(){ return(signx(Ir & 0x01FFFF));} // bit 16..0

function trap(reg, num){
	var n, i, x, y;
	switch(num){
		case 0: 		//stop
			runflag = false;
			trapString = "stop, clock " + clock + ", execute " + ninst + " instructions";
			break;
		case 1: 		//print integer
			trapString = R[reg] + "";
			break;
		case 2: 		//printc
			trapString = String.fromCharCode(97 + R[reg]);
			break;
		case 3: 		//print string
			i = 0;
			x = M[STRSEG + i];
			var buf = "";
			while(x != 0){
				buf += String.fromCharCode(97 + x);
				i++;
				x = M[STRSEG + i];
			}
			trapString = buf;
			break;	
		case 4:			//iput (return string)
			var buf = "string";
			i = 0;
			while(i < buff.length){
				buf += String.fromCharCode(97 + x);
				M[STRSEG + i] = buff.charAt(i);
				i++;
			}
			M[STRSEG + i] = 0; 		// terminate string
			R[RETV] = STRSEG;		// return pointer to string
			break;	
		case 15: 		//disable int
			n = R[reg];
			intmask[n] = false;
			break;
		case 16: 			// enable int
			n = R[reg];
			intmask[n] = true;
			break;
		case 17: cpuflag = false; break;	// put cpu to sleep
		case 19:			// malloc
			R[RETV] = heapfree;
			heapfree += R[reg];
			if( heapfree > MAXMEM )
				simlog("malloc: out of memory");
			break;
	
	}
	
}

function interrupt(n){
	if( n > 3 )
		simlog("unknown interrupt");
	intnum = n;
	RetAds = Pc;		// save pc
	Pc = M[INTVEC+n];
	cpuflag = true; 		// wake up sleepy cpu
	intflag = false;		// master disable interrupt
	intrq[n] = false;		// clear int request
}

function checkinterrupt(){
	if( intflag ){
		if( intmask[0] && intrq[0] ) interrupt(0);
		else if( intmask[1] && intrq[1] ) interrupt(1);
		else if( intmask[2] && intrq[2] ) interrupt(2);
		else if( intmask[3] && intrq[3] ) interrupt(3);
	}
}

function runoneclock(){
	clock++;
	if( runflag && cpuflag ){
		run();
	}
	checkinterrupt();
}

//execute one instruction
function run(){
	
	if(!runflag)
		return;
	
	var ads, d, r1, r2, r3, i;
	
	printOutput("Clock " + clock);
	printOutput("<span class='pcDisplay'>PC " + Pc.toString() + "</span>");

	savePc = Pc;
	Ir = M[Pc];
	Pc++;
	ads = IRads();
	d = IRdisp();
	r1 = IRr1();
	r2 = IRr2(); 
	r3 = IRr3();
	ninst++;
	
	markLoc = -1;
	trapString = "";
	
	switch(IRop()){
		case opCode["NOP"]:		break;
		case opCode["LDA"]:		R[r1] = M[ads];			markLoc = r1; break;
		case opCode["LDD"]:		R[r1] = M[R[r2]+d];		markLoc = r1; break;
		case opCode["STA"]:		M[ads] = R[r1];			break;
		case opCode["STD"]:		M[R[r2]+d] = R[r1];		break;
		case opCode["MVI"]:		R[r1] = signx2(ads);	markLoc = r1; break;
		case opCode["JMP"]:		Pc = ads;				break;
		case opCode["JAL"]:		R[r1] = Pc; Pc = ads;	break;
		case opCode["JT"]:		if(R[r1] != 0) Pc = ads;	break;
		case opCode["JF"]:		if(R[r1] == 0) Pc = ads;	break;
		case opCode["ADDI"]:	R[r1] = R[r2] + d;		markLoc = r1; break;
		case opCode["SUBI"]:	R[r1] = R[r2] - d;		markLoc = r1; break;
		case opCode["MULI"]:	R[r1] = R[r2] * d;		markLoc = r1; break;
		case opCode["DIVI"]:	R[r1] = R[r2] / d;		markLoc = r1; break;
		case opCode["ANDI"]:	R[r1] = R[r2] & d;		markLoc = r1; break;
		case opCode["ORI"]:		R[r1] = R[r2] | d;		markLoc = r1; break;
		case opCode["XORI"]:	R[r1] = R[r2] ^ d;		markLoc = r1; break;
		case opCode["EQI"]:		R[r1] = R[r2] == d;		markLoc = r1; break;
		case opCode["NEI"]:		R[r1] = R[r2] != d;		markLoc = r1; break;
		case opCode["LTI"]:		R[r1] = R[r2] <  d;		markLoc = r1; break;
		case opCode["LEI"]:		R[r1] = R[r2] <= d;		markLoc = r1; break;
		case opCode["GTI"]:		R[r1] = R[r2] >  d;		markLoc = r1; break;
		case opCode["GEI"]:		R[r1] = R[r2] >= d;		markLoc = r1; break;
		case opCode["SHLI"]:	R[r1] = R[r2] << d;		markLoc = r1; break;
		case opCode["SHRI"]:	R[r1] = R[r2] >> d;		markLoc = r1; break;
		case opCode["MODI"]:	R[r1] = R[r2] %  d;		markLoc = r1; break;
		case opCode["XOP"]:	
			switch(IRxop()){
				case opCode["ADD"]:		R[r1] = R[r2] + R[r3];	markLoc = r1; break;
				case opCode["SUB"]:		R[r1] = R[r2] - R[r3];	markLoc = r1; break;
				case opCode["MUL"]:		R[r1] = R[r2] * R[r3];	markLoc = r1; break;
				case opCode["DIV"]:		R[r1] = R[r2] / R[r3];	markLoc = r1; break;
				case opCode["AND"]:		R[r1] = R[r2] & R[r3];	markLoc = r1; break;
				case opCode["OR"]:		R[r1] = R[r2] | R[r3];	markLoc = r1; break;
				case opCode["XOR"]:		R[r1] = R[r2] ^ R[r3];	markLoc = r1; break;
				case opCode["EQ"]:		R[r1] = R[r2] == R[r3];	markLoc = r1; break;
				case opCode["NE"]:		R[r1] = R[r2] != R[r3];	markLoc = r1; break;
				case opCode["LT"]:		R[r1] = R[r2] <  R[r3];	markLoc = r1; break;
				case opCode["LE"]:		R[r1] = R[r2] <= R[r3];	markLoc = r1; break;
				case opCode["GT"]:		R[r1] = R[r2] >  R[r3];	markLoc = r1; break;
				case opCode["GE"]:		R[r1] = R[r2] >= R[r3];	markLoc = r1; break;
				case opCode["SHL"]:		R[r1] = R[r2] << R[r3];	markLoc = r1; break;
				case opCode["SHR"]:		R[r1] = R[r2] >> R[r3];	markLoc = r1; break;
				case opCode["MOD"]:		R[r1] = R[r2] %  R[r3];	markLoc = r1; break;
				case opCode["MOV"]:		R[r1] = R[r2];			markLoc = r1; break;
				case opCode["LDX"]:		R[r1] = M[R[r2] + R[r3]];	markLoc = r1; break;
				case opCode["STX"]:		M[R[r2] + R[r3]] = R[r1];	break;
				case opCode["RET"]:		Pc = R[r1];	break;
				case opCode["TRAP"]:	trap(r1,r2);	break;
				case opCode["PUSH"]:	
					R[r1]++;
					M[R[r1]] = R[r2];
					break;
				case opCode["POP"]:		
					R[r2] = M[R[r1]];
					R[r1]--;	
					markLoc = r2; 
					break;
				case opCode["NOT"]:		R[r1] = (R[r2] == 0) ? ~0 : 0;	markLoc = r1; break;
				case opCode["INT"]:		interrupt(r1);	break;
				case opCode["RETI"]:	
					Pc = RetAds;
					intflag = true;	
					break;
				case opCode["PUSHM"]:	
					for(i = 0; i < 16; i++){
						R[r1]++;
						M[R[r1]] = R[i];
					}	
					break;
				case opCode["POPM"]:	
					for(i = 15; i >= 0; i--){
						R[i] = M[R[r1]];
						R[r1]--;
					}
					break;
				case opCode["XCH"]:		
					d = RetAds;
					RetAds = R[r1];
					R[r1] = d;	
					break;
				
				default:	error("undefined xop");	break;
			}
			break;

		default:	error("undefined op");	break;
	}

	disassem();
	dumpreg();
	printOutput("<br>");
	if(trapString != ""){
		printOutput(trapString + "<br>");
	}
		
	step++;
}


function load(){
	
	runflag = true;
	display = true;
	end = false;
	
	initcpu();
	initOp();
	
	var sInput = plainTextMC.value;
	var sOutput = "";

	var lines = sInput.split('\n');

	var cnt, a1, a2, a3, a4, a5;
	ip = 0;
	
	for(var i = 0; i < lines.length; i++){
	    //code here using lines[i] which will give you each line
		
	    var EoF = false;
	    
	    tokens = lines[i].split(' ');

	    switch(tokens[0]) {
		    case 'a':
		        ip = parseInt(tokens[1]);
		        break;
		    case 'L':
		        a1 = parseInt(tokens[1]); a2 = parseInt(tokens[2]); a3 = parseInt(tokens[3]);
		        M[ip] = a1<<27 | a2<<22 | (a3&0x3FFFFF);
		        ip++;
		        break;
		    case 'D':
		    	a1 = parseInt(tokens[1]); a2 = parseInt(tokens[2]); a3 = parseInt(tokens[3]); a4 = parseInt(tokens[4]);
		    	M[ip] = a1<<27 | a2<<22 | a3<<17 | (a4&0x1FFFF);
				ip++;
				break;
		    case 'X':
		    	a1 = parseInt(tokens[1]); a2 = parseInt(tokens[2]); a3 = parseInt(tokens[3]); a4 = parseInt(tokens[4]); a5 = parseInt(tokens[5]);
		    	M[ip] = a1<<27 | a2<<22 | a3<<17 | a4<<12 | (a5&0x0FFF);
				ip++;
				break;
		    case 'w' :
			    M[ ip] = parseInt(tokens[1]);
			    ip++;
				break;
		    case 'e':
			    EoF = true;
			    break;
		    default:
		        break;
		}

	    if(EoF){
		    break;
	    }
	}
	
	clearOutput();
	
	printOutput("load program, last address " + ip.toString() + "<br>");
	
	updateMemDisplay()
	
}


function viewMem() {
    var myWindow = window.open("Memory", "Memory", "width=700,height=500,directories=no,titlebar=no");
    var str = "";
    for(var i=0; i<100; i++){
    	str += "m";
    	str += i.toString();
    	str += " : ";
    	str += (M[i] >> 27) & 0x01F;
    	str += ' ';
    	str += (M[i] >> 22) & 0x01F;
    	str += ' ';
    	str += (M[i] >> 17) & 0x01F;
    	str += ' ';
    	str += (M[i] >> 12) & 0x01F;
    	str += ' ';
    	str += M[i] & 0x0FFF;
    	str += ' | ';
    }
    myWindow.document.write(str);
}
