function PrintSquare(sq) {
	return (FileCharacters[ALLFILES[sq]] + RankCharacters[ALLRANKS[sq]]);
}

function PrintMove(move) {	
	var MvStr;
	
	var ff = ALLFILES[FROMSQ(move)];
	var rf = ALLRANKS[FROMSQ(move)];
	var ft = ALLFILES[TOSQ(move)];
	var rt = ALLRANKS[TOSQ(move)];
	
	MvStr = FileCharacters[ff] + RankCharacters[rf] + FileCharacters[ft] + RankCharacters[rt];
	
	var promoted = PROMOTED(move);

	if(promoted != PIECES.NONE) {
		var pchar = 'q';
		if(isKnight[promoted] == 1) {
			pchar = 'n';
		} else if(isRookQueen[promoted] == 1 && isBishopQueen[promoted] == 0)  {
			pchar = 'r';
		} else if(isRookQueen[promoted] == 0 && isBishopQueen[promoted] == 1)   {
			pchar = 'b';
		}
		MvStr += pchar;
	}
	return MvStr;
}

function PrintMoveList() {

	var index;
	var move;
	var num = 1;
	console.log('MoveList:');

	for(index = BOARD.depthList[BOARD.currSearchDepth]; index < BOARD.depthList[BOARD.currSearchDepth+1]; ++index) {
		move = BOARD.moveList[index];
		console.log('IMove:' + num + ':(' + index + '):' + PrintMove(move) + ' Score:' +  BOARD.moveScores[index]);
		num++;
	}
	console.log('End MoveList');
}

function ParseMove(from, to) {

	CreateMoves();
	
	var Move = NOMOVE;
	var PromPce = PIECES.NONE;
	var found = 0;
	
	for(index = BOARD.depthList[BOARD.currSearchDepth]; 
							index < BOARD.depthList[BOARD.currSearchDepth + 1]; ++index) {	
		Move = BOARD.moveList[index];
		if(FROMSQ(Move) == from && TOSQ(Move) == to) {
			PromPce = PROMOTED(Move);
			if(PromPce != PIECES.NONE) {
				if( (PromPce == PIECES.wQ && BOARD.side == SIDE.WHITE) ||
					(PromPce == PIECES.bQ && BOARD.side == SIDE.BLACK) ) {
					found = 1;
					break;
				}
				continue;
			}
			found = 1;
			break;
		}		
	}
	
	if(found != 0) {
		if(MakeMove(Move) == 0) {
			return NOMOVE;
		}
		TakeMove();
		return Move;
	}
	
	return NOMOVE;
}
