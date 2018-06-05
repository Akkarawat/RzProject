//simulator of TX processor
//recieve machine code as input
//machine code is generated by assembler in atx.js

var ip;
var AC, Ir, Pc, RetAds, F;
var markLoc = -1;
var runflag = false, display = true, savePc;
var T;
var step;
var end = false;
var M = new Array();
var R = Array(16).fill(0);

function initcpu(){
	var i;
	runflag = true;
	Pc = 0;
	F = 0;
	AC = 0;
	step = 0;
	RetAds = 0;
	for(i = 0; i < 16; i++){
		R[i] = 0;
	}
}

function dumpreg(){
	printTxtArea('<span class="acDisplay">');
	if(markLoc == 18)
		printTxtArea("<b>F:" + F.toString() + "</b>");
	else
		printTxtArea("F:" + F.toString());
	printTxtArea("&nbsp&nbsp");
	if(markLoc == 17)
		printTxtArea("<b>ac:" + AC.toString() + "</b>");
	else
		printTxtArea("ac:" + AC.toString());
	printTxtArea("</span>");
	
	printTxtArea('<span class="regDisplay">');
	var i;
	for(i=0; i<16; i++){
		if(i == markLoc)
			printTxtArea("<b>r" + i.toString() + ":" + R[i].toString() + "</b> ");
		else
			printTxtArea("r" + i.toString() + ":" + R[i].toString() + " ");
	}
	printTxtArea("</span><br>");
}

function updateMemDisplay(){
	var offset = 0;
//	var str = "";
    for(var i=0; i<100; i++){
//    	if(i%10 == 0 && i != 0)
//    		str += "\n";
//    	str += "m";
//    	str += i.toString();
//    	str += " : ";
    	var j = i + offset;
    	var str = "";
    	str += "m";
    	str += j.toString();
    	str += " : ";
    	str += M[j] >>> 12;
    	str += ' ';
    	str += M[j] >>> 8 & 0x0000000F;
    	str += ' ';
    	str += M[j] & 0x000000FF;
    	var ref = "m";
    	ref += i.toString();
    	document.getElementById(ref).innerHTML = str;
    }
//    claerTxtArea2();
//    printTxtArea2(str);
}

function disassem(op, Ir, ads, d, r1){
	switch(op){
		case 0:	printTxtArea("nop" 	+ "</span><span class='paraDisplay'>"); markLoc = -1; break;
		case 1:	printTxtArea("ld" 	+ "</span><span class='paraDisplay'>" + ads.toString()); markLoc = 17; break;
		case 2:	printTxtArea("st" 	+ "</span><span class='paraDisplay'>" + ads.toString()); markLoc = -1; break;
		case 3: printTxtArea("jmp" 	+ "</span><span class='paraDisplay'>" + ads.toString()); markLoc = 19; break;
		case 4: printTxtArea("jt" 	+ "</span><span class='paraDisplay'>" + ads.toString()); markLoc = 19; break;
		case 5: printTxtArea("jf" 	+ "</span><span class='paraDisplay'>" + ads.toString()); markLoc = 19; break;
		case 6: printTxtArea("call" + "</span><span class='paraDisplay'>" + ads.toString()); markLoc = 19; break;
	
		case 13:
			switch( (Ir & 0x00000F00) >> 8){
				case 0: printTxtArea("crl" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = r1; break;
				case 1: printTxtArea("inc" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = r1; break;
				case 2: printTxtArea("dec" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = r1; break;
			}
			break;
	
		case 14:
			switch( (Ir & 0x00000F00) >> 8 ){
				case 0:  printTxtArea("add" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 1:  printTxtArea("sub" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 2:  printTxtArea("and" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 3:  printTxtArea("or" 	+ "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 4:  printTxtArea("xor" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
	
				case 5:   printTxtArea("eq" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 18; break;
				case 6:   printTxtArea("lt" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 18; break;
				case 7:   printTxtArea("le" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 18; break;
				case 8:   printTxtArea("gt" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 18; break;
				case 9:   printTxtArea("ge" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 18; break;
	
				case 10:  printTxtArea("mva" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 11:  printTxtArea("mvr" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = r1; break;
				case 12:  printTxtArea("ldx" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = 17; break;
				case 13:  printTxtArea("stx" + "</span><span class='paraDisplay'>" + "r" + r1.toString()); markLoc = -1; break;
				default:  break;
			}
			break;
	
		case 15:
			switch( (Ir & 0x00000F00) >> 8 ){
				case 0: printTxtArea("addi" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
				case 1: printTxtArea("subi" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
				case 2: printTxtArea("andi" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
				case 3: printTxtArea("ori" 	+ "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
				case 4: printTxtArea("xori" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
	
				case 5: printTxtArea("eqi" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 18; break;
				case 6: printTxtArea("lti" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 18; break;
				case 7: printTxtArea("lei" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 18; break;
				case 8: printTxtArea("gti" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 18; break;
				case 9: printTxtArea("gei" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 18; break;
	
				case 10: printTxtArea("mvi" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = 17; break;
				case 11: printTxtArea("trap" + "</span><span class='paraDisplay'>" + "#" + d.toString()); markLoc = -1; break;
				case 12: printTxtArea("ret" + "</span><span class='paraDisplay'>"); markLoc = -1; break;
				case 13: printTxtArea("not" + "</span><span class='paraDisplay'>"); markLoc = 17; break;
				default: break;
			}
			break;
	
		default:
			 markLoc = -1; break;
	}
}

function trap(){
	runflag = false;
}

function runUntilStop(){
	display = false;
	while(runflag)
		run();
	if(!end){
		display = true;
		updateMemDisplay()
		printTxtArea("Finished at step " + (step-1).toString());
		//dumpreg();
		end = true;
	}
}

//execute one instruction
function run(){
	
	if(!runflag)
		return;
	
	var op, ads, d, r1;

	savePc = Pc;
	Ir = M[Pc];
	Pc++;
	ads = (Ir & 0x00000FFF);
	d = (Ir & 0x000000FF);
	r1 = (Ir & 0x0000000F);
	op = (Ir & 0x0000F000) >> 12;
	switch(op){
		case 0:	break;
		case 1:	AC = M[ads]; break;
		case 2:	M[ads] = AC; break;
		case 3: Pc = ads; break;
		case 4: if( F != 0 ) Pc = ads; break;
		case 5: if( F == 0 ) Pc = ads; break;
		case 6: RetAds = Pc; Pc = ads; break;

		case 13:
			switch( (Ir & 0x00000F00) >> 8){
				case 0: R[r1] = 0; break;
				case 1: R[r1]++; break;
				case 2: R[r1]--; break;
			}
			break;

		case 14:
			switch( (Ir & 0x00000F00) >> 8 ){
				case 0:  AC += R[r1]; break;
				case 1:  AC += R[r1]; break;
				case 2:  AC += R[r1]; break;
				case 3:  AC += R[r1]; break;
				case 4:  AC += R[r1]; break;
	
				case 5:   F = AC == R[r1] ? 1 : 0; break;
				case 6:   F = AC <  R[r1] ? 1 : 0; break;
				case 7:   F = AC <= R[r1] ? 1 : 0; break;
				case 8:   F = AC >  R[r1] ? 1 : 0; break;
				case 9:   F = AC >= R[r1] ? 1 : 0; break;
	
				case 10:  AC = R[r1]; break;
				case 11:  R[r1] = AC; break;
				case 12:  AC = M[(R[15] << 4) + R[r1]]; break;
				case 13:  M[(R[15] << 4) + R[r1]] = AC; break;
				default:  break;
			}
			break;

		case 15:
			switch( (Ir & 0x00000F00) >> 8 ){
				case 0: AC += d; break;
				case 1: AC -= d; break;
				case 2: AC &= d; break;
				case 3: AC |= d; break;
				case 4: AC ^= d; break;
	
				case 5:  F = AC == d ? 1 : 0; break;
				case 6:  F = AC <  d ? 1 : 0; break;
				case 7:  F = AC <= d ? 1 : 0; break;
				case 8:  F = AC >  d ? 1 : 0; break;
				case 9:  F = AC >= d ? 1 : 0; break;
	
				case 10: AC = d; break;
				case 11: trap(); break;
				case 12: Pc = RetAds; break;
				case 13: AC = ~AC; break;
				default: break;
			}
			break;

		default:
			break;
	}
	
	printTxtArea("Step " + step.toString());
	printTxtArea("<span class='pcDisplay'>PC " + Pc.toString() + "</span>");
	printTxtArea("<span class='opDisplay'>");
	disassem(op, Ir, ads, d, r1);
	printTxtArea("</span>");
	dumpreg();
		
	step++;
}


function load(){
	
	runflag = true;
	display = true;
	end = false;
	
	initcpu();
	
	var sInput = plainTextMC.value;
	var sOutput = "";

	var lines = sInput.split('\n');

	var cnt, a1, a2, a3;
	
	for(var i = 0; i < lines.length; i++){
	    //code here using lines[i] which will give you each line
		
	    var EoF = false;
	    
	    tokens = lines[i].split(' ');

	    switch(tokens[0]) {
		    case 'a':
		        ip = parseInt(tokens[1]);
		        break;
		       case 'L':
		        a1 = parseInt(tokens[1]); a2 = parseInt(tokens[2]);
		        M[ip] = a1<<12 | a2;
		        ip++;
		        break;
		    case 'R':
		    case 'I':
		    	a1 = parseInt(tokens[1]); a2 = parseInt(tokens[2]); a3 = parseInt(tokens[3]);
		    	M[ip] = a1<<12 | a2<<8 | a3;
				ip++;
				break;
		    case 'w' :
			    M[ip] = parseInt(tokens[1]);
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
	
	claerTxtArea();
	
	updateMemDisplay()
	
	printTxtArea("load program, last address " + ip.toString() + "<br>");
	
}


function viewMem() {
    var myWindow = window.open("Memory", "Memory", "width=700,height=500,directories=no,titlebar=no");
    var str = "";
    for(var i=0; i<100; i++){
    	str += "m";
    	str += i.toString();
    	str += " : ";
    	str += M[i] >>> 12;
    	str += ' ';
    	str += M[i] >>> 8 & 0x0000000F;
    	str += ' ';
    	str += M[i] & 0x000000FF;
    	str += ' | ';
    }
    myWindow.document.write(str);
}