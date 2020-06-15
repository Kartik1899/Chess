var BOARD = {};

BOARD.pieces = new Array(120);
BOARD.side = SIDE.WHITE;
BOARD.drawFifty = 0;
BOARD.moveNo = 0;
BOARD.moveHistory = [];
BOARD.currSearchDepth = 0;
BOARD.en_pasant = 0;
BOARD.checkCastle = 0;
BOARD.score = new Array(2); // WHITE,BLACK material of pieces
BOARD.pieceCount = new Array(13); // indexed by Pce
BOARD.pieceList = new Array(14 * 10);
BOARD.posiKey = 0;
BOARD.moveList = new Array(TOTALSEARCHDEPT * ALLPOSITIONALMOVES);
BOARD.moveScores = new Array(TOTALSEARCHDEPT * ALLPOSITIONALMOVES);
BOARD.depthList = new Array(TOTALSEARCHDEPT);
BOARD.PvTable = [];
BOARD.moveArra = new Array(TOTALSEARCHDEPT);
BOARD.searchHistory = new Array( 14 * 120);
BOARD.searchKillers = new Array(3 * TOTALSEARCHDEPT);



function CheckBoard() {   
 
	var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [ 0, 0];
	var sq64, t_piece, t_pce_num, sq120;
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for(t_pce_num = 0; t_pce_num < BOARD.pieceCount[t_piece]; ++t_pce_num) {
			sq120 = BOARD.pieceList[getIndex(t_piece,t_pce_num)];
			if(BOARD.pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return 0;
			}
		}	
	}
	
	for(sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = inMat120(sq64);
		t_piece = BOARD.pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[COLOUR[t_piece]] += Value[t_piece];
	}
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if(t_pceNum[t_piece] != BOARD.pieceCount[t_piece]) {
				console.log('Error t_pceNum');
				return 0;
			}	
	}
	
	if(t_material[SIDE.WHITE] != BOARD.score[SIDE.WHITE] ||
			 t_material[SIDE.BLACK] != BOARD.score[SIDE.BLACK]) {
				console.log('Error t_material');
				return 0;
	}	
	
	if(BOARD.side!=SIDE.WHITE && BOARD.side!=SIDE.BLACK) {
				console.log('Error BOARD.side');
				return 0;
	}
	
	if(GenerateKey()!=BOARD.posiKey) {
				console.log('Error BOARD.posiKey');
				return 0;
	}	
	return 1;
}

function PrintGame() {
	
	var sq,file,rank,piece;

	console.log("\nGame Board:\n");
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(RankCharacters[rank] + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = getSqaure(file,rank);
			piece = BOARD.pieces[sq];
			line += (" " + PieceCharacters[piece] + " ");
		}
		console.log(line);
	}
	
	console.log("");
	var line = "   ";
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileCharacters[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + SideCharacters[BOARD.side] );
	console.log("enPas:" + BOARD.en_pasant);
	line = "";	
	
	if(BOARD.checkCastle & CASTLEBIT.WKCA) line += 'K';
	if(BOARD.checkCastle & CASTLEBIT.WQCA) line += 'Q';
	if(BOARD.checkCastle & CASTLEBIT.BKCA) line += 'k';
	if(BOARD.checkCastle & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + BOARD.posiKey.toString(16));
}

function GenerateKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.NONE;

	for(sq = 0; sq < 120; ++sq) {
		piece = BOARD.pieces[sq];
		if(piece != PIECES.NONE && piece != KEYS.OUT) {			
			finalKey ^= PieceKeys[(piece * 120) + sq];
		}		
	}

	if(BOARD.side == SIDE.WHITE) {
		finalKey ^= SideKey;
	}
	
	if(BOARD.en_pasant != KEYS.BOUND) {		
		finalKey ^= PieceKeys[BOARD.en_pasant];
	}
	
	finalKey ^= CastleKeys[BOARD.checkCastle];
	
	return finalKey;

}

function PrintPieces() {

	var piece, pceNum;
	
	for(piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
		for(pceNum = 0; pceNum < BOARD.pieceCount[piece]; ++pceNum) {
			console.log('Piece ' + PieceCharacters[piece] + ' on ' + PrintSquare( BOARD.pieceList[getIndex(piece,pceNum)] ));
		}
	}

}

function UpdateGame() {	
	
	var piece,sq,index,colour;
	
	for(index = 0; index < 14 * 120; ++index) {
		BOARD.pieceList[index] = PIECES.NONE;
	}
	
	for(index = 0; index < 2; ++index) {		
		BOARD.score[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		BOARD.pieceCount[index] = 0;
	}
	
	for(index = 0; index < 64; ++index) {
		sq = inMat120(index);
		piece = BOARD.pieces[sq];
		if(piece != PIECES.NONE) {
			
			colour = COLOUR[piece];		
			
			BOARD.score[colour] += Value[piece];
			
			BOARD.pieceList[getIndex(piece,BOARD.pieceCount[piece])] = sq;
			BOARD.pieceCount[piece]++;			
		}
	}
	
}

function Reset() {
	
	var index = 0;
	
	for(index = 0; index < 120; ++index) {
		BOARD.pieces[index] = KEYS.OUT;
	}
	
	for(index = 0; index < 64; ++index) {
		BOARD.pieces[inMat120(index)] = PIECES.NONE;
	}
	
	BOARD.side = SIDE.BOTH;
	BOARD.en_pasant = KEYS.BOUND;
	BOARD.drawFifty = 0;	
	BOARD.currSearchDepth = 0;
	BOARD.moveNo = 0;	
	BOARD.checkCastle = 0;	
	BOARD.posiKey = 0;
	BOARD.depthList[BOARD.currSearchDepth] = 0;
	
}

function GetPosition(fen) {

	Reset();
	
	var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;  
	var sq120 = 0;
	var fenCnt = 0; 
	
	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.NONE;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = getSqaure(file,rank);            
            BOARD.pieces[sq120] = piece;
			file++;
        }
		fenCnt++;
	} 
	BOARD.side = (fen[fenCnt] == 'w') ? SIDE.WHITE : SIDE.BLACK;
	fenCnt += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }		
		switch(fen[fenCnt]) {
			case 'K': BOARD.checkCastle |= CASTLEBIT.WKCA; break;
			case 'Q': BOARD.checkCastle |= CASTLEBIT.WQCA; break;
			case 'k': BOARD.checkCastle |= CASTLEBIT.BKCA; break;
			case 'q': BOARD.checkCastle |= CASTLEBIT.BQCA; break;
			default:	     break;
        }
		fenCnt++;
	}
	fenCnt++;	
	
	if (fen[fenCnt] != '-') {        
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();	
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);	
		BOARD.en_pasant = getSqaure(file,rank);		
    }
	
	BOARD.posiKey = GenerateKey();	
	UpdateGame();
}

function IsAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;
	
	if(side == SIDE.WHITE) {
		if(BOARD.pieces[sq - 11] == PIECES.wP || BOARD.pieces[sq - 9] == PIECES.wP) {
			return 1;
		}
	} else {
		if(BOARD.pieces[sq + 11] == PIECES.bP || BOARD.pieces[sq + 9] == PIECES.bP) {
			return 1;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		pce = BOARD.pieces[sq + KnMoves[index]];
		if(pce != KEYS.OUT && COLOUR[pce] == side && isKnight[pce] == 1) {
			return 1;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = RMoves[index];
		t_sq = sq + dir;
		pce = BOARD.pieces[t_sq];
		while(pce != KEYS.OUT) {
			if(pce != PIECES.NONE) {
				if(isRookQueen[pce] == 1 && COLOUR[pce] == side) {
					return 1;
				}
				break;
			}
			t_sq += dir;
			pce = BOARD.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = BMoves[index];
		t_sq = sq + dir;
		pce = BOARD.pieces[t_sq];
		while(pce != KEYS.OUT) {
			if(pce != PIECES.NONE) {
				if(isBishopQueen[pce] == 1 && COLOUR[pce] == side) {
					return 1;
				}
				break;
			}
			t_sq += dir;
			pce = BOARD.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 8; index++) {
		pce = BOARD.pieces[sq + KMoves[index]];
		if(pce != KEYS.OUT && COLOUR[pce] == side && isKing[pce] == 1) {
			return 1;
		}
	}
	
	return 0;
}


function getIndex(pce, pceNum) {
	return (pce * 10 + pceNum);
}
