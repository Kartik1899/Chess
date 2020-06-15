$(function() {
	init();
	console.log("GameStarted");	
	NewGame(START_POSITION);
});

function InitBoard() {
	
	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = KEYS.A1;
	
	for(index = 0; index < 120; ++index) {
		ALLFILES[index] = KEYS.OUT;
		ALLRANKS[index] = KEYS.OUT;
	}
	
	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = getSqaure(file,rank);
			ALLFILES[sq] = file;
			ALLRANKS[sq] = rank;
		}
	}
}

function InitHashKeys() {
    var index = 0;
	
	for(index = 0; index < 14 * 120; ++index) {				
		PieceKeys[index] = GET_RANDOM();
	}
	
	SideKey = GET_RANDOM();
	
	for(index = 0; index < 16; ++index) {
		CastleKeys[index] = GET_RANDOM();
	}
}

function InitMatrix() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = KEYS.A1;
	var sq64 = 0;

	for(index = 0; index < 120; ++index) {
		matrix120[index] = 65;
	}
	
	for(index = 0; index < 64; ++index) {
		matrix64[index] = 120;
	}
	
	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = getSqaure(file,rank);
			matrix64[sq64] = sq;
			matrix120[sq] = sq64;
			sq64++;
		}
	}

}

function InitArrays() {

	var index = 0;
	for(index = 0; index < ALLPOSSIBLEMOVES; ++index) {
		BOARD.moveHistory.push( {
			move : NOMOVE,
			castlePerm : 0,
			enPas : 0,
			drawFifty : 0,
			posKey : 0
		});
	}	
	
	for(index = 0; index < TABLEENTRIES; ++index) {
		BOARD.PvTable.push({
			move : NOMOVE,
			posKey : 0
		});
	}
}

function InitBoardSquares() {
	var light = 0;
	var rankName;
	var fileName;
	var divString;
	var lastLight = 0;
	var rankIter = 0;
	var fileIter = 0;
	var lightString;
	
	for(rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
		light = lastLight ^ 1;
		lastLight ^= 1;
		rankName = "rank" + (rankIter+1);
		for(fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
			fileName = "file" + (fileIter+1);
			
			if(light==0) lightString="Light";
			else lightString = "Dark";
			divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
			light^=1;
			$("#Board").append(divString);
 		}
 	}
}

function InitBoardSquares() {
	var light = 1;
	var rankName;
	var fileName;
	var divString;
	var rankIter;
	var fileIter;
	var lightString;
	
	for(rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
		light ^= 1;
		rankName = "rank" + (rankIter + 1);
		for(fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
			fileName = "file" + (fileIter + 1);
			if(light == 0) lightString="Light";
			else lightString = "Dark";
			light^=1;
			divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
			$("#Board").append(divString);
		}
	}
	
}

function init() {
	console.log("init() called");
	InitBoard();
	InitHashKeys();
	InitMatrix();
	InitArrays();
	CreateMvvLva();
	InitBoardSquares();
}