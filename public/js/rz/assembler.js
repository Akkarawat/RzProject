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