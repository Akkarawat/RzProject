var	TABLESIZE	= 	500;
var LOCALSIZE  	=	100;
var NAMELEN		=	32;
var STRLEN   	=	80;
var MAXCS		=	5000;
//var MAXFUNC	500
var MAXSTK		=	50;
var MAXMEM		=	5000;

var STRBASE		=	3000;
var DSBASE		=	1100;

// type of token
var	tkIDEN    	=	10;
var	tkNUMBER  	=	11;
var	tkSTRING   	=	12;
var	tkEOF    	=	13;
var tkNIL		=	14;
var	tkERROR   	=	15;
var tkBREAK		=	16;
var tkPRAGMA	=	17;

// type of symbol in symbol table
var tyVECTOR   	=	3;
var tySCALAR   	=	4;
var tyFUNCTION 	=	6;
var tyLOCAL		=	7;
//var tyNEW			8

// 	type of atom in parse tree
var SP			=	0;
var OPER		=	1;
var NUM			=	2;
var GNAME		=	3;
var LNAME		=	4;
var STRING		=	6;
var ADS			=	7;

var NL_CHAR		=	10;
var EOF_CHAR	=	255;

// marker
var NIL			=	0;
var MARK		=	1;

var verbose		=	0;

function compileMain(){
	var source, code, list, iasm, name;
	
	predefineFun();
	readinfile(source);
	initlex();
	pass();
	outHeader();
	genall();
	epilog();
	return 0;
}