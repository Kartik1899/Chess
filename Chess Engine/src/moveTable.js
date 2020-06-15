function GetPvLine(depth) {
	
	var move = InitPvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( IsPresent(move) == 1) {
			MakeMove(move);
			BOARD.moveArra[count++] = move;			
		} else {
			break;
		}		
		move = InitPvTable();	
	}
	
	while(BOARD.currSearchDepth > 0) {
		TakeMove();
	}
	
	return count;
	
}

function InitPvTable() {
	var index = BOARD.posiKey % TABLEENTRIES;
	
	if(BOARD.PvTable[index].posiKey == BOARD.posiKey) {
		return BOARD.PvTable[index].move;
	}
	
	return NOMOVE;
}

function StorePvMove(move) {
	var index = BOARD.posiKey % TABLEENTRIES;
	BOARD.PvTable[index].posiKey = BOARD.posiKey;
	BOARD.PvTable[index].move = move;
}