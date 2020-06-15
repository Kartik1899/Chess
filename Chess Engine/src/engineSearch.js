var Searcher = {};

Searcher.totalNodes;
Searcher.high;
Searcher.highFirst;
Searcher.depth;
Searcher.time;
Searcher.start;
Searcher.stop;
Searcher.best;
Searcher.isActive;

function GetNextMove(MoveNum) {

	var index = 0;
	var bestScore = -1;
	var bestNum = MoveNum;
	
	for(index = MoveNum; index < BOARD.depthList[BOARD.currSearchDepth+1]; ++index) {
		if(BOARD.moveScores[index] > bestScore) {
			bestScore = BOARD.moveScores[index];
			bestNum = index;			
		}
	} 
	
	if(bestNum != MoveNum) {
		var temp = 0;
		temp = BOARD.moveScores[MoveNum];
		BOARD.moveScores[MoveNum] = BOARD.moveScores[bestNum];
		BOARD.moveScores[bestNum] = temp;
		
		temp = BOARD.moveList[MoveNum];
		BOARD.moveList[MoveNum] = BOARD.moveList[bestNum];
		BOARD.moveList[bestNum] = temp;
	}

}

function ClearPvTable() {
	
	for(index = 0; index < TABLEENTRIES; index++) {
			BOARD.PvTable[index].move = NOMOVE;
			BOARD.PvTable[index].posiKey = 0;		
	}
}

function CheckTime() {
	if (( $.now() - Searcher.start ) > Searcher.time) {
		Searcher.stop = 1;
	}
}

function IsRepetition() {
	var index = 0;
	
	for(index = BOARD.moveNo - BOARD.drawFifty; index < BOARD.moveNo - 1; ++index) {
		if(BOARD.posiKey == BOARD.moveHistory[index].posiKey) {
			return 1;
		}
	}
	
	return 0;
}

function Quiescence(lower, upper) {

	if ((Searcher.totalNodes & 2047) == 0) {
		CheckTime();
	}
	
	Searcher.totalNodes++;
	
	if( (IsRepetition() || BOARD.drawFifty >= 100) && BOARD.currSearchDepth != 0) {
		return 0;
	}
	
	if(BOARD.currSearchDepth > TOTALSEARCHDEPT -1) {
		return ScorePosition();
	}	
	
	var Score = ScorePosition();
	
	if(Score >= upper) {
		return upper;
	}
	
	if(Score > lower) {
		lower = Score;
	}
	
	GenerateCaptures();
	
	var MoveNum = 0;
	var rightMoves = 0;
	var lastLower = lower;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	for(MoveNum = BOARD.depthList[BOARD.currSearchDepth]; MoveNum < BOARD.depthList[BOARD.currSearchDepth + 1]; ++MoveNum) {
	
		GetNextMove(MoveNum);
		
		Move = BOARD.moveList[MoveNum];	

		if(MakeMove(Move) == 0) {
			continue;
		}		
		rightMoves++;
		Score = -Quiescence( -upper, -lower);
		
		TakeMove();
		
		if(Searcher.stop == 1) {
			return 0;
		}
		
		if(Score > lower) {
			if(Score >= upper) {
				if(rightMoves == 1) {
					Searcher.highFirst++;
				}
				Searcher.high++;	
				return upper;
			}
			lower = Score;
			BestMove = Move;
		}		
	}
	
	if(lower != lastLower) {
		StorePvMove(BestMove);
	}
	
	return lower;

}

function AlphaBeta(lower, upper, depth) {

	
	if(depth <= 0) {
		return Quiescence(lower, upper);
	}
	
	if ((Searcher.totalNodes & 2000) == 0) {
		CheckTime();
	}
	
	Searcher.totalNodes++;
	
	if( (IsRepetition() || BOARD.drawFifty >= 100) && BOARD.currSearchDepth != 0) {
		return 0;
	}
	
	if(BOARD.currSearchDepth > TOTALSEARCHDEPT -1) {
		return ScorePosition();
	}	
	
	var InCheck = IsAttacked(BOARD.pieceList[getIndex(Kings[BOARD.side],0)], BOARD.side^1);
	if(InCheck == 1)  {
		depth++;
	}	
	
	var Score = -INFINITE;
	
	CreateMoves();
	
	var MoveNum = 0;
	var rightMoves = 0;
	var lastLower = lower;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	var PvMove = InitPvTable();
	if(PvMove != NOMOVE) {
		for(MoveNum = BOARD.depthList[BOARD.currSearchDepth]; MoveNum < BOARD.depthList[BOARD.currSearchDepth + 1]; ++MoveNum) {
			if(BOARD.moveList[MoveNum] == PvMove) {
				BOARD.moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}
	
	for(MoveNum = BOARD.depthList[BOARD.currSearchDepth]; MoveNum < BOARD.depthList[BOARD.currSearchDepth + 1]; ++MoveNum) {
	
		GetNextMove(MoveNum);	
		
		Move = BOARD.moveList[MoveNum];	
		
		if(MakeMove(Move) == 0) {
			continue;
		}		
		rightMoves++;
		Score = -AlphaBeta( -upper, -lower, depth-1);
		
		TakeMove();
		
		if(Searcher.stop == 1) {
			return 0;
		}
		
		if(Score > lower) {
			if(Score >= upper) {
				if(rightMoves == 1) {
					Searcher.highFirst++;
				}
				Searcher.high++;		
				if((Move & CAP_FLAG) == 0) {
					BOARD.searchKillers[TOTALSEARCHDEPT + BOARD.currSearchDepth] = 
						BOARD.searchKillers[BOARD.currSearchDepth];
					BOARD.searchKillers[BOARD.currSearchDepth] = Move;
				}					
				return upper;
			}
			if((Move & CAP_FLAG) == 0) {
				BOARD.searchHistory[BOARD.pieces[FROMSQ(Move)] * 120 + TOSQ(Move)]
						 += depth * depth;
			}
			lower = Score;
			BestMove = Move;				
		}		
	}	
	
	if(rightMoves == 0) {
		if(InCheck == 1) {
			return -MATE + BOARD.currSearchDepth;
		} else {
			return 0;
		}
	}	
	
	if(lower != lastLower) {
		StorePvMove(BestMove);
	}
	
	return lower;
}

function ReadySearch() {

	var index = 0;
	
	for(index = 0; index < 14 * 120; ++index) {				
		BOARD.searchHistory[index] = 0;	
	}
	
	for(index = 0; index < 3 * TOTALSEARCHDEPT; ++index) {
		BOARD.searchKillers[index] = 0;
	}	
	
	ClearPvTable();
	BOARD.currSearchDepth = 0;
	Searcher.totalNodes = 0;
	Searcher.high = 0;
	Searcher.highFirst = 0;
	Searcher.start = $.now();
	Searcher.stop = 0;
}

function SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var Score = -INFINITE;
	var currentDepth = 0;
	var line;
	var PvNum;
	var c;
	ReadySearch();
	
	for( currentDepth = 1; currentDepth <= Searcher.depth; ++currentDepth) {	
	
		Score = AlphaBeta(-INFINITE, INFINITE, currentDepth);
					
		if(Searcher.stop == 1) {
			break;
		}
		
		bestScore = Score; 
		bestMove = InitPvTable();
		line = 'D:' + currentDepth + ' Best:' + PrintMove(bestMove) + ' Score:' + bestScore + 
				' nodes:' + Searcher.totalNodes;
				
		PvNum = GetPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < PvNum; ++c) {
			line += ' ' + PrintMove(BOARD.moveArra[c]);
		}
		if(currentDepth!=1) {
			line += (" Ordering:" + ((Searcher.highFirst/Searcher.high)*100).toFixed(2) + "%");
		}
		console.log(line);			
	}	

	Searcher.best = bestMove;
	Searcher.isActive = 0;
	UpdateDOMStats(bestScore, currentDepth);
}

function UpdateDOMStats(dom_score, dom_depth) {

	var scoreText = "Score: " + (dom_score / 100).toFixed(2);
	if(Math.abs(dom_score) > MATE - TOTALSEARCHDEPT) {
		scoreText = "Score: Mate In " + (MATE - (Math.abs(dom_score))-1) + " moves";
	}
	
	$("#OrderingOut").text("Ordering: " + ((Searcher.highFirst/Searcher.high)*100).toFixed(2) + "%");
	$("#DepthOut").text("Depth: " + dom_depth);
	$("#ScoreOut").text(scoreText);
	$("#NodesOut").text("Nodes: " + Searcher.totalNodes);
	$("#TimeOut").text("Time: " + (($.now()-Searcher.start)/1000).toFixed(1) + "s");
	$("#BestOut").text("BestMove: " + PrintMove(Searcher.best));
}