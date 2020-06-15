function RemovePiece(sq) {

	var pce = BOARD.pieces[sq];
	var col = COLOUR[pce];
	var index;
	var t_pceNum = -1;
	
	HASH_PIECE(pce, sq);
	
	BOARD.pieces[sq] = PIECES.NONE;
	BOARD.score[col] -= Value[pce];
	
	for(index = 0; index < BOARD.pieceCount[pce]; ++index) {
		if(BOARD.pieceList[getIndex(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	BOARD.pieceCount[pce]--;
	BOARD.pieceList[getIndex(pce, t_pceNum)] = BOARD.pieceList[getIndex(pce, BOARD.pieceCount[pce])];	

}

function AddPiece(sq, pce) {

	var col = COLOUR[pce];
	
	HASH_PIECE(pce, sq);
	
	BOARD.pieces[sq] = pce;
	BOARD.score[col] += Value[pce];
	BOARD.pieceList[getIndex(pce, BOARD.pieceCount[pce])] = sq;
	BOARD.pieceCount[pce]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var pce = BOARD.pieces[from];
	
	HASH_PIECE(pce, from);
	BOARD.pieces[from] = PIECES.NONE;
	
	HASH_PIECE(pce,to);
	BOARD.pieces[to] = pce;
	
	for(index = 0; index < BOARD.pieceCount[pce]; ++index) {
		if(BOARD.pieceList[getIndex(pce,index)] == from) {
			BOARD.pieceList[getIndex(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = BOARD.side;	

	BOARD.moveHistory[BOARD.moveNo].posiKey = BOARD.posiKey;

	if( (move & EN_PasFLAG) != 0) {
		if(side == SIDE.WHITE) {
			RemovePiece(to-10);
		} else {
			RemovePiece(to+10);
		}
	} else if( (move & CS_FLAG) != 0) {
		switch(to) {
			case KEYS.C1:
                MovePiece(KEYS.A1, KEYS.D1);
			break;
            case KEYS.C8:
                MovePiece(KEYS.A8, KEYS.D8);
			break;
            case KEYS.G1:
                MovePiece(KEYS.H1, KEYS.F1);
			break;
            case KEYS.G8:
                MovePiece(KEYS.H8, KEYS.F8);
			break;
            default: break;
		}
	}
	
	if(BOARD.en_pasant != KEYS.BOUND) HASH_ENPASANT();
	HASH_CASTLE();
	
	BOARD.moveHistory[BOARD.moveNo].move = move;
    BOARD.moveHistory[BOARD.moveNo].drawFifty = BOARD.drawFifty;
    BOARD.moveHistory[BOARD.moveNo].en_pasant = BOARD.en_pasant;
    BOARD.moveHistory[BOARD.moveNo].checkCastle = BOARD.checkCastle;
    
    BOARD.checkCastle &= CastleArray[from];
    BOARD.checkCastle &= CastleArray[to];
    BOARD.en_pasant = KEYS.BOUND;
    
    HASH_CASTLE();
    
    var captured = CAPTURED(move);
    BOARD.drawFifty++;
    
    if(captured != PIECES.NONE) {
        RemovePiece(to);
        BOARD.drawFifty = 0;
    }
    
    BOARD.moveNo++;
	BOARD.currSearchDepth++;
	
	if(isPawn[BOARD.pieces[from]] == 1) {
        BOARD.drawFifty = 0;
        if( (move & PS_Flag) != 0) {
            if(side==SIDE.WHITE) {
                BOARD.en_pasant=from+10;
            } else {
                BOARD.en_pasant=from-10;
            }
            HASH_ENPASANT();
        }
    }
    
    MovePiece(from, to);
    
    var prPce = PROMOTED(move);
    if(prPce != PIECES.NONE)   {       
        RemovePiece(to);
        AddPiece(to, prPce);
    }
    
    BOARD.side ^= 1;
    HASH_SIDE();
    
    if(IsAttacked(BOARD.pieceList[getIndex(Kings[side],0)], BOARD.side))  {
         TakeMove();
    	return 0;
    }
    
    return 1;
}

function TakeMove() {
	
	BOARD.moveNo--;
    BOARD.currSearchDepth--;
    
    var move = BOARD.moveHistory[BOARD.moveNo].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(BOARD.en_pasant != KEYS.BOUND) HASH_ENPASANT();
    HASH_CASTLE();
    
    BOARD.checkCastle = BOARD.moveHistory[BOARD.moveNo].checkCastle;
    BOARD.drawFifty = BOARD.moveHistory[BOARD.moveNo].drawFifty;
    BOARD.en_pasant = BOARD.moveHistory[BOARD.moveNo].en_pasant;
    
    if(BOARD.en_pasant != KEYS.BOUND) HASH_ENPASANT();
    HASH_CASTLE();
    
    BOARD.side ^= 1;
    HASH_SIDE();
    
    if( (EN_PasFLAG & move) != 0) {
        if(BOARD.side == SIDE.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (CS_FLAG & move) != 0) {
        switch(to) {
        	case KEYS.C1: MovePiece(KEYS.D1, KEYS.A1); break;
            case KEYS.C8: MovePiece(KEYS.D8, KEYS.A8); break;
            case KEYS.G1: MovePiece(KEYS.F1, KEYS.H1); break;
            case KEYS.G8: MovePiece(KEYS.F8, KEYS.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);
    if(captured != PIECES.NONE) {      
        AddPiece(to, captured);
    }
    
    if(PROMOTED(move) != PIECES.NONE)   {        
        RemovePiece(from);
        AddPiece(from, (COLOUR[PROMOTED(move)] == SIDE.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}