$("#SetFen").click(function () {
	var fenStr = $("#fenIn").val();	
	NewGame(fenStr);
});

$('#TakeButton').click( function () {
	if(BOARD.moveNo > 0) {
		TakeMove();
		BOARD.currSearchDepth = 0;
		SetPieces();
	}
});

$('#NewGameButton').click( function () {
	NewGame(START_FEN);
});

function NewGame(fenStr) {
	GetPosition(fenStr);
	PrintGame();
	SetPieces();
	Status();
}

function RemoveAllPieces() {
	$(".Piece").remove();
}

function SetPieces() {

	var sq;
	var sq120;
	RemoveAllPieces();
	
	for(sq = 0; sq < 64; ++sq) {
		sq120 = inMat120(sq);
		pce = BOARD.pieces[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			AddToGui(sq120, pce);
		}
	}
}

function LightenSelection(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == 1) {
				$(this).removeClass('SqSelected');
		}
	} );
}

function DarkenSelection(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == 1) {
				$(this).addClass('SqSelected');
		}
	} );
}

function ActiveSquare(pageX, pageY) {
	console.log('ActiveSquare() at ' + pageX + ',' + pageY);
	var position = $('#Board').position();
	
	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);
	
	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);
	
	var sq = getSqaure(file,rank);
	
	console.log('Clicked sq:' + PrintSquare(sq));
	
	DarkenSelection(sq);	
	
	return sq;
}

$(document).on('click','.Piece', function (e) {
	console.log('Piece Click');
	
	if(User.from == KEYS.BOUND) {
		User.from = ActiveSquare(e.pageX, e.pageY);
	} else {
		User.to = ActiveSquare(e.pageX, e.pageY);
	}
	
	UserMoved();
	
});

$(document).on('click','.Square', function (e) {
	console.log('Square Click');	
	if(User.from != KEYS.BOUND) {
		User.to = ActiveSquare(e.pageX, e.pageY);
		UserMoved();
	}

});

function UserMoved() {

	if(User.from != KEYS.BOUND && User.to != KEYS.BOUND) {
	
		console.log("User Move:" + PrintSquare(User.from) + PrintSquare(User.to));	
		
		var parsed = ParseMove(User.from,User.to);
		
		if(parsed != NOMOVE) {
			MakeMove(parsed);
			PrintGame();
			MoveGuiPiece(parsed);
			Status();
			Prepare();
		}
	
		LightenSelection(User.from);
		LightenSelection(User.to);
		
		User.from = KEYS.BOUND;
		User.to = KEYS.BOUND;
	}

}

function PieceIsOnSq(sq, top, left) {

	if( (ALLRANKS[sq] == 7 - Math.round(top/60) ) && 
		ALLFILES[sq] == Math.round(left/60) ) {
		return 1;
	}
		
	return 0;

}

function RemoveFromGui(sq) {

	$('.Piece').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == 1) {
			$(this).remove();
		}
	} );
	
}

function AddToGui(sq, pce) {

	var file = ALLFILES[sq];
	var rank = ALLRANKS[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "images/" + SideCharacters[COLOUR[pce]] + PieceCharacters[pce].toUpperCase() + ".png";
	var	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}

function MoveGuiPiece(move) {
	
	var from = FROMSQ(move);
	var to = TOSQ(move);	
	
	if(move & EN_PasFLAG) {
		var epRemove;
		if(BOARD.side == SIDE.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		RemoveFromGui(epRemove);
	} else if(CAPTURED(move)) {
		RemoveFromGui(to);
	}
	
	var file = ALLFILES[to];
	var rank = ALLRANKS[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	
	$('.Piece').each( function(index) {
		if(PieceIsOnSq(from, $(this).position().top, $(this).position().left) == 1) {
			$(this).removeClass();
			$(this).addClass("Piece " + rankName + " " + fileName);
		}
	} );
	
	if(move & CS_FLAG) {
		switch(to) {
			case KEYS.G1: RemoveFromGui(KEYS.H1); AddToGui(KEYS.F1, PIECES.wR); break;
			case KEYS.C1: RemoveFromGui(KEYS.A1); AddToGui(KEYS.D1, PIECES.wR); break;
			case KEYS.G8: RemoveFromGui(KEYS.H8); AddToGui(KEYS.F8, PIECES.bR); break;
			case KEYS.C8: RemoveFromGui(KEYS.A8); AddToGui(KEYS.D8, PIECES.bR); break;
		}
	} else if (PROMOTED(move)) {
		RemoveFromGui(to);
		AddToGui(to, PROMOTED(move));
	}
	
}


function CheckDraw() {

	if (BOARD.pieceCount[PIECES.wP]!=0 || BOARD.pieceCount[PIECES.bP]!=0) return 0;
	if (BOARD.pieceCount[PIECES.wQ]!=0 || BOARD.pieceCount[PIECES.bQ]!=0 ||
					BOARD.pieceCount[PIECES.wR]!=0 || BOARD.pieceCount[PIECES.bR]!=0) return 0;
	if (BOARD.pieceCount[PIECES.wB] > 1 || BOARD.pieceCount[PIECES.bB] > 1) {return 0;}
    if (BOARD.pieceCount[PIECES.wN] > 1 || BOARD.pieceCount[PIECES.bN] > 1) {return 0;}
	
	if (BOARD.pieceCount[PIECES.wN]!=0 && BOARD.pieceCount[PIECES.wB]!=0) {return 0;}
	if (BOARD.pieceCount[PIECES.bN]!=0 && BOARD.pieceCount[PIECES.bB]!=0) {return 0;}
	 
	return 1;
}

function CheckDrawThree() {
	var i = 0, r = 0;
	
	for(i = 0; i < BOARD.hiscurrSearchDepth; ++i) {
		if (BOARD.moveHistory[i].posiKey == BOARD.posiKey) {
		    r++;
		}
	}
	return r;
}

function GetResult() {
	if(BOARD.drawFifty >= 100) {
		 $("#GameStatus").text("GAME DRAWN {fifty move rule}"); 
		 return 1;
	}
	
	if (CheckDrawThree() >= 2) {
     	$("#GameStatus").text("GAME DRAWN {3-fold repetition}"); 
     	return 1;
    }
	
	if (CheckDraw() == 1) {
     	$("#GameStatus").text("GAME DRAWN {insufficient material to mate}"); 
     	return 1;
    }
    
    CreateMoves();
      
    var MoveNum = 0;
	var found = 0;
	
	for(MoveNum = BOARD.depthList[BOARD.currSearchDepth]; MoveNum < BOARD.depthList[BOARD.currSearchDepth + 1]; ++MoveNum)  {	
       
        if ( MakeMove(BOARD.moveList[MoveNum]) == 0)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }
	
	if(found != 0) return 0;
	
	var InCheck = IsAttacked(BOARD.pieceList[getIndex(Kings[BOARD.side],0)], BOARD.side^1);
	
	if(InCheck == 1) {
		if(BOARD.side == SIDE.WHITE) {
	      $("#GameStatus").text("GAME OVER {black mates}");
	      return 1;
        } else {
	      $("#GameStatus").text("GAME OVER {white mates}");
	      return 1;
        }
	} else {
		$("#GameStatus").text("GAME DRAWN {stalemate}");return 1;
	}
	
	return 0;	
}

function Status() {
	if(GetResult() == 1) {
		Controller.GameOver = 1;
	} else {
		Controller.GameOver = 0;
		$("#GameStatus").text('');
	}
}

function Prepare() {
	if(Controller.GameOver == 0) {
		Searcher.isActive = 1;
		setTimeout( function() { StartSearch(); }, 200 );
	}
}

$('#SearchButton').click( function () {	
	Controller.PlayerSide = Controller.side ^ 1;
	Prepare();
});

function StartSearch() {

	Searcher.depth = TOTALSEARCHDEPT;
	var t = $.now();
	var tt = $('#ThinkTimeChoice').val();
	
	Searcher.time = parseInt(tt) * 1000;
	SearchPosition();
	
	MakeMove(Searcher.best);
	MoveGuiPiece(Searcher.best);
	Status();
}