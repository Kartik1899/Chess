var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);

function CreateMvvLva() {
	var i;
	var j;
	
	for(i = PIECES.wP; i <= PIECES.bK; ++i) {
		for(j = PIECES.wP; j <= PIECES.bK; ++j) {
			MvvLvaScores[j * 14 + i] = MvvLvaValue[j] + 6 - (MvvLvaValue[i]/100);
		}
	}

}

function IsPresent(move) {
	
	CreateMoves();
    
	var index;
	var moveFound = NOMOVE;
	for(index = BOARD.depthList[BOARD.currSearchDepth]; index < BOARD.depthList[BOARD.currSearchDepth + 1]; ++index) {
	
		moveFound = BOARD.moveList[index];	
		if(MakeMove(moveFound) == 0) {
			continue;
		}				
		TakeMove();
		if(move == moveFound) {
			return 1;
		}
	}
	return 0;
}

function MOVE(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function CaptureMove(move) {
	BOARD.moveList[BOARD.depthList[BOARD.currSearchDepth+1]] = move;
	BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth+1]++] =  
		MvvLvaScores[CAPTURED(move) * 14 + BOARD.pieces[FROMSQ(move)]] + 1000000;	
}

function NormalMove(move) {
	BOARD.moveList[BOARD.depthList[BOARD.currSearchDepth+1]] = move;
	BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth+1]] =  0;
	
	if(move == BOARD.searchKillers[BOARD.currSearchDepth]) {
		BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth+1]] = 900000;
	} else if(move == BOARD.searchKillers[BOARD.currSearchDepth + TOTALSEARCHDEPT]) {
		BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth+1]] = 800000;
	} else {
		BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth+1]] = 
			BOARD.searchHistory[BOARD.pieces[FROMSQ(move)] * 120 + TOSQ(move)];
	}
	
	BOARD.depthList[BOARD.currSearchDepth+1]++
}

function EnPasant(move) {
	BOARD.moveList[BOARD.depthList[BOARD.currSearchDepth+1]] = move;
	BOARD.moveScores[BOARD.depthList[BOARD.currSearchDepth + 1]++] = 105 + 1000000;
}

function wPCaptureMove(from, to, cap) {
	if(ALLRANKS[from]==RANKS.RANK_7) {
		CaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.wN, 0));	
	} else {
		CaptureMove(MOVE(from, to, cap, PIECES.NONE, 0));	
	}
}

function bPCaptureMove(from, to, cap) {
	if(ALLRANKS[from]==RANKS.RANK_2) {
		CaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		CaptureMove(MOVE(from, to, cap, PIECES.bN, 0));	
	} else {
		CaptureMove(MOVE(from, to, cap, PIECES.NONE, 0));	
	}
}

function wPNormalMove(from, to) {
	if(ALLRANKS[from]==RANKS.RANK_7) {
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.wQ,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.wR,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.wB,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.wN,0));
	} else {
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.NONE,0));	
	}
}

function bPNormalMove(from, to) {
	if(ALLRANKS[from]==RANKS.RANK_2) {
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.bQ,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.bR,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.bB,0));
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.bN,0));
	} else {
		NormalMove(MOVE(from,to,PIECES.NONE,PIECES.NONE,0));	
	}
}

function CreateMoves() {
	BOARD.depthList[BOARD.currSearchDepth+1] = BOARD.depthList[BOARD.currSearchDepth];
	
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;
	
	if(BOARD.side == SIDE.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pceType]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pceType, pceNum)];			
			if(BOARD.pieces[sq + 10] == PIECES.NONE) {
				wPNormalMove(sq, sq+10);
				if(ALLRANKS[sq] == RANKS.RANK_2 && BOARD.pieces[sq + 20] == PIECES.NONE) {
					NormalMove( MOVE(sq, sq + 20, PIECES.NONE, PIECES.NONE, PS_Flag ));
				}
			}
			
			if(SQOUT(sq + 9) == 0 && COLOUR[BOARD.pieces[sq+9]] == SIDE.BLACK) {
				wPCaptureMove(sq, sq + 9, BOARD.pieces[sq+9]);
			}
			
			if(SQOUT(sq + 11) == 0 && COLOUR[BOARD.pieces[sq+11]] == SIDE.BLACK) {
				wPCaptureMove(sq, sq + 11, BOARD.pieces[sq+11]);
			}			
			
			if(BOARD.en_pasant != KEYS.BOUND) {
				if(sq + 9 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq+9, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
				
				if(sq + 11 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq+11, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
			}			
			
		}
		
		if(BOARD.checkCastle & CASTLEBIT.WKCA) {			
			if(BOARD.pieces[KEYS.F1] == PIECES.NONE && BOARD.pieces[KEYS.G1] == PIECES.NONE) {
				if(IsAttacked(KEYS.F1, SIDE.BLACK) == 0 && IsAttacked(KEYS.E1, SIDE.BLACK) == 0) {
					NormalMove( MOVE(KEYS.E1, KEYS.G1, PIECES.NONE, PIECES.NONE, CS_FLAG ));
				}
			}
		}
		
		if(BOARD.checkCastle & CASTLEBIT.WQCA) {
			if(BOARD.pieces[KEYS.D1] == PIECES.NONE && BOARD.pieces[KEYS.C1] == PIECES.NONE && BOARD.pieces[KEYS.B1] == PIECES.NONE) {
				if(IsAttacked(KEYS.D1, SIDE.BLACK) == 0 && IsAttacked(KEYS.E1, SIDE.BLACK) == 0) {
					NormalMove( MOVE(KEYS.E1, KEYS.C1, PIECES.NONE, PIECES.NONE, CS_FLAG ));
				}
			}
		}		

	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pceType]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pceType, pceNum)];
			if(BOARD.pieces[sq - 10] == PIECES.NONE) {
				bPNormalMove(sq, sq-10);		
				if(ALLRANKS[sq] == RANKS.RANK_7 && BOARD.pieces[sq - 20] == PIECES.NONE) {
					NormalMove( MOVE(sq, sq - 20, PIECES.NONE, PIECES.NONE, PS_Flag ));
				}
			}
			
			if(SQOUT(sq - 9) == 0 && COLOUR[BOARD.pieces[sq-9]] == SIDE.WHITE) {
				bPCaptureMove(sq, sq - 9, BOARD.pieces[sq-9]);
			}
			
			if(SQOUT(sq - 11) == 0 && COLOUR[BOARD.pieces[sq-11]] == SIDE.WHITE) {
				bPCaptureMove(sq, sq - 11, BOARD.pieces[sq-11]);
			}			
			
			if(BOARD.en_pasant != KEYS.BOUND) {
				if(sq - 9 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq-9, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
				
				if(sq - 11 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq-11, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
			}
		}
		if(BOARD.checkCastle & CASTLEBIT.BKCA) {	
			if(BOARD.pieces[KEYS.F8] == PIECES.NONE && BOARD.pieces[KEYS.G8] == PIECES.NONE) {
				if(IsAttacked(KEYS.F8, SIDE.WHITE) == 0 && IsAttacked(KEYS.E8, SIDE.WHITE) == 0) {
					NormalMove( MOVE(KEYS.E8, KEYS.G8, PIECES.NONE, PIECES.NONE, CS_FLAG ));
				}
			}
		}
		
		if(BOARD.checkCastle & CASTLEBIT.BQCA) {
			if(BOARD.pieces[KEYS.D8] == PIECES.NONE && BOARD.pieces[KEYS.C8] == PIECES.NONE && BOARD.pieces[KEYS.B8] == PIECES.NONE) {
				if(IsAttacked(KEYS.D8, SIDE.WHITE) == 0 && IsAttacked(KEYS.E8, SIDE.WHITE) == 0) {
					NormalMove( MOVE(KEYS.E8, KEYS.C8, PIECES.NONE, PIECES.NONE, CS_FLAG ));
				}
			}
		}	
	}	
	
	pceIndex = SingleMoveIndex[BOARD.side];
	pce = SingleMovePieces[pceIndex++];
	
	while (pce != 0) {
		for(pceNum = 0; pceNum < BOARD.pieceCount[pce]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pce, pceNum)];
			
			for(index = 0; index < MoveDirections[pce]; index++) {
				dir = PieceDirection[pce][index];
				t_sq = sq + dir;
				
				if(SQOUT(t_sq) == 1) {
					continue;
				}
				
				if(BOARD.pieces[t_sq] != PIECES.NONE) {
					if(COLOUR[BOARD.pieces[t_sq]] != BOARD.side) {
						CaptureMove( MOVE(sq, t_sq, BOARD.pieces[t_sq], PIECES.NONE, 0 ));
					}
				} else {
					NormalMove( MOVE(sq, t_sq, PIECES.NONE, PIECES.NONE, 0 ));
				}
			}			
		}	
		pce = SingleMovePieces[pceIndex++];
	}
	
	pceIndex = MultiMoveIndex[BOARD.side];
	pce = MultiMovePieces[pceIndex++];
	
	while(pce != 0) {		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pce]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pce, pceNum)];
			
			for(index = 0; index < MoveDirections[pce]; index++) {
				dir = PieceDirection[pce][index];
				t_sq = sq + dir;
				
				while( SQOUT(t_sq) == 0 ) {	
				
					if(BOARD.pieces[t_sq] != PIECES.NONE) {
						if(COLOUR[BOARD.pieces[t_sq]] != BOARD.side) {
							CaptureMove( MOVE(sq, t_sq, BOARD.pieces[t_sq], PIECES.NONE, 0 ));
						}
						break;
					}
					NormalMove( MOVE(sq, t_sq, PIECES.NONE, PIECES.NONE, 0 ));
					t_sq += dir;
				}
			}			
		}	
		pce = MultiMovePieces[pceIndex++];
	}
}

function GenerateCaptures() {
	BOARD.depthList[BOARD.currSearchDepth+1] = BOARD.depthList[BOARD.currSearchDepth];
	
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;
	
	if(BOARD.side == SIDE.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pceType]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pceType, pceNum)];				
			
			if(SQOUT(sq + 9) == 0 && COLOUR[BOARD.pieces[sq+9]] == SIDE.BLACK) {
				wPCaptureMove(sq, sq + 9, BOARD.pieces[sq+9]);
			}
			
			if(SQOUT(sq + 11) == 0 && COLOUR[BOARD.pieces[sq+11]] == SIDE.BLACK) {
				wPCaptureMove(sq, sq + 11, BOARD.pieces[sq+11]);
			}			
			
			if(BOARD.en_pasant != KEYS.BOUND) {
				if(sq + 9 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq+9, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
				
				if(sq + 11 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq+11, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
			}			
			
		}			

	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pceType]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pceType, pceNum)];			
			
			if(SQOUT(sq - 9) == 0 && COLOUR[BOARD.pieces[sq-9]] == SIDE.WHITE) {
				bPCaptureMove(sq, sq - 9, BOARD.pieces[sq-9]);
			}
			
			if(SQOUT(sq - 11) == 0 && COLOUR[BOARD.pieces[sq-11]] == SIDE.WHITE) {
				bPCaptureMove(sq, sq - 11, BOARD.pieces[sq-11]);
			}			
			
			if(BOARD.en_pasant != KEYS.BOUND) {
				if(sq - 9 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq-9, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
				
				if(sq - 11 == BOARD.en_pasant) {
					EnPasant( MOVE(sq, sq-11, PIECES.NONE, PIECES.NONE, EN_PasFLAG ) );
				}
			}
		}			
	}	
	
	pceIndex = SingleMoveIndex[BOARD.side];
	pce = SingleMovePieces[pceIndex++];
	
	while (pce != 0) {
		for(pceNum = 0; pceNum < BOARD.pieceCount[pce]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pce, pceNum)];
			
			for(index = 0; index < MoveDirections[pce]; index++) {
				dir = PieceDirection[pce][index];
				t_sq = sq + dir;
				
				if(SQOUT(t_sq) == 1) {
					continue;
				}
				
				if(BOARD.pieces[t_sq] != PIECES.NONE) {
					if(COLOUR[BOARD.pieces[t_sq]] != BOARD.side) {
						CaptureMove( MOVE(sq, t_sq, BOARD.pieces[t_sq], PIECES.NONE, 0 ));
					}
				}
			}			
		}	
		pce = SingleMovePieces[pceIndex++];
	}
	
	pceIndex = MultiMoveIndex[BOARD.side];
	pce = MultiMovePieces[pceIndex++];
	
	while(pce != 0) {		
		for(pceNum = 0; pceNum < BOARD.pieceCount[pce]; ++pceNum) {
			sq = BOARD.pieceList[getIndex(pce, pceNum)];
			
			for(index = 0; index < MoveDirections[pce]; index++) {
				dir = PieceDirection[pce][index];
				t_sq = sq + dir;
				
				while( SQOUT(t_sq) == 0 ) {	
				
					if(BOARD.pieces[t_sq] != PIECES.NONE) {
						if(COLOUR[BOARD.pieces[t_sq]] != BOARD.side) {
							CaptureMove( MOVE(sq, t_sq, BOARD.pieces[t_sq], PIECES.NONE, 0 ));
						}
						break;
					}
					t_sq += dir;
				}
			}			
		}	
		pce = MultiMovePieces[pceIndex++];
	}
}