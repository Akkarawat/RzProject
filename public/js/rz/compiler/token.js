var tkSTAR 		= 	50;
var tkSLASH 	=	51;
var tkMINUS 	=	52;
var tkPLUS 		=	53;
var tkEQ 		=	54;
var tkEQEQ 		=	55;
var tkAND 		=	56;
var tkANDAND 	=	57;
var tkOR 		=	58;
var tkOROR 		=	59;
var tkNOT 		=	60;
var tkNE 		=	61;
var tkLT 		=	62;
var tkLE 		=	63;
var tkGT 		=	64;
var tkGE 		=	65;
var tkCOMMA 	=	66;
var tkSEMI 		=	67;
var tkLPAREN 	=	68;
var tkRPAREN 	=	69;
var tkLBRACKET 	=	70;
var tkRBRACKET 	=	71;
var tkLBRACE 	=	72;
var tkRBRACE 	=	73;
var tkIF 		=	74;
var tkELSE 		=	75;
var tkWHILE 	=	76;
var tkRETURN 	=	77;
var tkPRINT 	=	78;

// internal token for parse tree
var tkFUN   	=	79;
var tkCALL  	=	80;
var tkDO    	=	81;
var tkVEC   	=	82;
var tkFUNX  	=	83;    // function with no frame

// uop
var tkUMINUS 	=	84;
var tkUNOT   	=	85;
var tkDEREF  	=	86;
var tkADS    	=	87;
// magic op to mark bottom of operator stack
var tkBOT    	=	49;

//used to lex

function token() {
    switch(CH) {
    case '*':
        accept(tkSTAR,1);
        break;
    case '/':
        accept(tkSLASH,1);
        break;
    case '-':
        accept(tkMINUS,1);
        break;
    case '+':
        accept(tkPLUS,1);
        break;
    case '=':
        getC();
        switch(CH) {
        case '=':
            accept(tkEQEQ,2);
            break;
        default:
            accept(tkEQ,1);
        }
        break;
    case '&':
        getC();
        switch(CH) {
        case '&':
            accept(tkANDAND,2);
            break;
        default:
            accept(tkAND,1);
        }
        break;
    case '|':
        getC();
        switch(CH) {
        case '|':
            accept(tkOROR,2);
            break;
        default:
            accept(tkOR,1);
        }
        break;
    case '!':
        getC();
        switch(CH) {
        case '=':
            accept(tkNE,2);
            break;
        default:
            accept(tkNOT,1);
        }
        break;
    case '<':
        getC();
        switch(CH) {
        case '=':
            accept(tkLE,2);
            break;
        default:
            accept(tkLT,1);
        }
        break;
    case '>':
        getC();
        switch(CH) {
        case '=':
            accept(tkGE,2);
            break;
        default:
            accept(tkGT,1);
        }
        break;
    case ',':
        accept(tkCOMMA,1);
        break;
    case ';':
        accept(tkSEMI,1);
        break;
    case '(':
        accept(tkLPAREN,1);
        break;
    case ')':
        accept(tkRPAREN,1);
        break;
    case '[':
        accept(tkLBRACKET,1);
        break;
    case ']':
        accept(tkRBRACKET,1);
        break;
    case '{':
        accept(tkLBRACE,1);
        break;
    case '}':
        accept(tkRBRACE,1);
        break;
    case 'i':
        getC();
        switch(CH) {
        case 'f':
            getC();
            if( isLetterOrDigit(CH) ) return 0;
            accept(tkIF,2);
            break;
        default:
            return 0;
        } /* reject */
        break;
    case 'e':
        getC();
        switch(CH) {
        case 'l':
            getC();
            switch(CH) {
            case 's':
                getC();
                switch(CH) {
                case 'e':
                    getC();
                    if( isLetterOrDigit(CH) ) return 0;
                    accept(tkELSE,4);
                    break;
                default:
                    return 0;
                } /* reject */
                break;
            default:
                return 0;
            } /* reject */
            break;
        default:
            return 0;
        } /* reject */
        break;
    case 'w':
        getC();
        switch(CH) {
        case 'h':
            getC();
            switch(CH) {
            case 'i':
                getC();
                switch(CH) {
                case 'l':
                    getC();
                    switch(CH) {
                    case 'e':
                        getC();
                        if( isLetterOrDigit(CH) ) return 0;
                        accept(tkWHILE,5);
                        break;
                    default:
                        return 0;
                    } /* reject */
                    break;
                default:
                    return 0;
                } /* reject */
                break;
            default:
                return 0;
            } /* reject */
            break;
        default:
            return 0;
        } /* reject */
        break;
    case 'r':
        getC();
        switch(CH) {
        case 'e':
            getC();
            switch(CH) {
            case 't':
                getC();
                switch(CH) {
                case 'u':
                    getC();
                    switch(CH) {
                    case 'r':
                        getC();
                        switch(CH) {
                        case 'n':
                            getC();
                            if( isLetterOrDigit(CH) ) return 0;
                            accept(tkRETURN,6);
                            break;
                        default:
                            return 0;
                        } /* reject */
                        break;
                    default:
                        return 0;
                    } /* reject */
                    break;
                default:
                    return 0;
                } /* reject */
                break;
            default:
                return 0;
            } /* reject */
            break;
        default:
            return 0;
        } /* reject */
        break;
    case 'p':
        getC();
        switch(CH) {
        case 'r':
            getC();
            switch(CH) {
            case 'i':
                getC();
                switch(CH) {
                case 'n':
                    getC();
                    switch(CH) {
                    case 't':
                        getC();
                        if( isLetterOrDigit(CH) ) return 0;
                        accept(tkPRINT,5);
                        break;
                    default:
                        return 0;
                    } /* reject */
                    break;
                default:
                    return 0;
                } /* reject */
                break;
            default:
                return 0;
            } /* reject */
            break;
        default:
            return 0;
        } /* reject */
        break;
    default:
        return 0;
    } /* reject */
    return 1;
}
