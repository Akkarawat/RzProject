var MAXFIN		=	10000;		/* max input file size */
var MAXLINE  	=	1000;		/* max no. of source line */

var	cBLANK		=	0;			// character type
var	cLETTER     =	1;
var	cDIGIT      =	2;
var cQUOTE		=	3;
var cSPECIAL	=	4;
var cHASH		=	5;

var LEX_LEX		=	11;
var LEX_NEW		=	12;
var LEX_EOF		=	13;
var LEX_BACK	=	14;
var LEX_OLD		=	15;

var tok;		     						/* current token type, string */
var tokstring;
var line 		= 	1;						/* current position */
var CH;       								/* current char */

var inbuf		=	Array(MAXFIN).fill(0);	/* input file buffer */
var cp, ieof, cp1;
var col 		= 	0;						// current column
var tokcol 		= 	1;						// current token column
var colstk 		= 	Array(100).fill(0), colstkp = 0;	// column stack, pointer
var lexstate 	= 	LEX_LEX;

var chartype	= [
		  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		  0,0,0,4,3,5,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,4,4,
		  4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
		  1,4,4,4,4,1,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
		  1,1,1,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4
		];

function pushcol(){
	colstkp++;
    colstk[colstkp] = tokcol;
}

function popcol(){
	colstkp--;
}

function topcol(){
	return colstk[colstkp]; 
}

function getC(){
	if ( cp >= ieof ) {
		CH = EOF_CHAR; cp = ieof;
	}else{
		CH  = inbuf[cp++];
		col++;
	}
}

function doline(){
	line++; col = 0;
}

function skipblank(){
	for(;;) {
		while( chartype[CH] == cBLANK ) {
			if ( CH == NL_CHAR) doline();
			getC();
		}
		// check comment, *cp lookahead one char
        if( CH != '/' || inbuf[cp] != '/' ) break;
		while( CH != NL_CHAR && CH != EOF_CHAR) getC();
	}
}

function copyToken(a, b){
	var len;
	len = b - a;
	if( len <= 0 ) {
		printf("lex error token length = 0\n");
		exit(-1);
	}
	if( len > 255 ) {
		printf("error token too long > 256 char\n");
		exit(-1);
	}
	tokstring = inbuf.substring(a, b);
	tokstring[len] = 0;
}

//----------------------//

function isDigit(){
	return (chartype[c] == cDIGIT);
}

function isLetterOrDigit(){
	return  (chartype[c] == cLETTER || chartype[c] == cDIGIT);
}

function accept(v, k){
	tok = v;
	cp = cp1 + k;
	getC();
}

function mylex2(){
	skipblank();
	tokcol = col;
	if( CH == EOF_CHAR ) {
		tok = tkEOF; return; 
	}
	cp1 = cp - 1;
	if( token() == 1 ) 
		return;

	// recogniser reject, reset char pointer
	cp = cp1;
	getC();
	switch( chartype[CH] ) {
		case cLETTER :
			while( isLetterOrDigit(CH) ) getC();
			copyToken(cp1,cp-1);
			tok = tkIDEN;
			break;
		case cDIGIT :
			while( isDigit(CH) ) getC();
			copyToken(cp1,cp - 1);
			tok = tkNUMBER;
			break;
		case cQUOTE :
			do {
				getC();
				if ( CH == NL_CHAR ) doline();
			}  while( CH != '"' && CH != EOF_CHAR);
			copyToken(cp1+1,cp-1);
			getC();
			tok = tkSTRING;
			break;
		case cHASH :
			getC();
			while( isLetterOrDigit(CH) ) getC();
			copyToken(cp1,cp-1);
			tok = tkPRAGMA;
			break;
		default : tok = tkERROR;
	}
}

function mylex(){
	var oldline;
	var oldtok;
	
	switch(lexstate){
    case LEX_LEX:
        oldline = line;
        mylex2();
        // order of decision is important
        if( tok == tkEOF ){
            tok = tkSEMI;
            lexstate = LEX_EOF;
        }else if( line != oldline ){	// new line
            oldtok = tok;
            if( tokcol == topcol() ){		// out ;
                tok = tkSEMI;
                lexstate = LEX_NEW;
            }else if( tokcol > topcol() ){	// out {
                tok = tkLBRACE;
                pushcol();
                lexstate = LEX_NEW;
            }else{				// tokcol < top, out ; }
                tok = tkSEMI;
                lexstate = LEX_BACK;
            }
        }						// old line, out tok
        break;
    case LEX_NEW:
        tok = oldtok;			// out tok
        lexstate = LEX_LEX;
        break;
    case LEX_BACK:
        if( tokcol < topcol() ){
            tok = tkRBRACE;		// out } until match
            popcol();
        }else{
            tok = oldtok;
            lexstate = LEX_LEX;
        }
        break;
    case LEX_EOF:
        if( colstkp > 1 ){		// out } until match
            tok = tkRBRACE;
            popcol();
        }else
            tok = tkEOF;
        break;
    }
}

function initlex(){
	mylex2();
    pushcol();
}

function readinfile(){
	
} 