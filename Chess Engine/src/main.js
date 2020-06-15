var PIECES =  { NONE : 0, wP : 1, wN : 2, wB : 3,wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };
var START_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";


var FILES =  { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
var RANKS =  { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, RANK_NONE:8 };

var SIDE = { WHITE : 0, BLACK : 1, BOTH: 2};
var COLOUR = [ SIDE.BOTH, SIDE.WHITE, SIDE.WHITE, SIDE.WHITE, SIDE.WHITE, SIDE.WHITE, SIDE.WHITE, SIDE.BLACK, SIDE.BLACK, SIDE.BLACK, SIDE.BLACK, SIDE.BLACK, SIDE.BLACK ];
    
var KEYS = {A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28, A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98, BOUND: 99, OUT:100};

var ALLFILES = new Array(120);
var ALLRANKS = new Array(120);

var EN_PasFLAG = 0x40000;
var PS_Flag = 0x80000;
var CS_FLAG = 0x1000000;
var CAP_FLAG = 0x7C000;
var PROM_FLAG = 0xF00000;

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

var matrix120 = new Array(120);
var matrix64 = new Array(64);

var ALLPOSSIBLEMOVES = 2000;
var ALLPOSITIONALMOVES = 200;
var TOTALSEARCHDEPT = 64;

var NotPawn = [ 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1 ];
var Major = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1 ];
var Minor = [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0 ];
var Value = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];

	
var isPawn = [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];	
var isKnight = [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
var isKing = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
var isRookQueen = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0];
var isBishopQueen = [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0];
var isMultimove = [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0];


var KnMoves = [ -8, -19, -21, -12, 8, 19, 21, 12];
var RMoves = [ -1, -10,	1, 10];
var BMoves = [ -9, -11, 11, 9];
var KMoves = [ -1, -10,	1, 10, -9, -11, 11, 9];
var MATE = 29000;
var INFINITE = 30000;
var MoveDirections = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8]
var PieceDirection = [0, 0, KnMoves, BMoves, RMoves, KMoves, KMoves, 0, KnMoves, BMoves, RMoves, KMoves, KMoves];

var SingleMovePieces = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK,0];
var SingleMoveIndex = [0, 3];
var MultiMovePieces = [PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
var MultiMoveIndex = [0, 4];
var TABLEENTRIES = 10000;

var PieceKeys = new Array(14 * 120);
var SideKey;
var CastleKeys = new Array(16);
var NOMOVE = 0;
var PieceCharacters = ".PNBRQKpnbrqk";
var SideCharacters = "wb-";
var RankCharacters = "12345678";
var FileCharacters = "abcdefgh";

function getSqaure(file, rank) {
    return ( (21 + file) + ( rank * 10) );
}

function HASH_PIECE(type, posi) {
    BOARD.posiKey ^= PieceKeys[(type * 120) + posi];
}
function HASH_CASTLE() {
    BOARD.posiKey ^= CastleKeys[BOARD.checkCastle];
}
function HASH_SIDE() {
    BOARD.posiKey ^= SideKey;
}
function HASH_ENPASANT() {
    BOARD.posiKey ^= PieceKeys[BOARD.en_pasant];
}

var Kings = [PIECES.wK, PIECES.bK];
var CastleArray = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

function MIRROR64(position) {
    return Mirror64[position];
}
var Mirror64 = [
    56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
    48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
    40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
    32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
    24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
    16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
    8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
    0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
    ];
function GET_RANDOM() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}
function inMat64(in120) {
    return matrix120[(in120)];
}
function inMat120(in64) {
    return matrix64[(in64)];
}
function FROMSQ(m) { return (m & 0x7F); }
function TOSQ(m) { return ( (m >> 7) & 0x7F); }
function CAPTURED(m) { return ( (m >> 14) & 0xF); }
function PROMOTED(m) { return ( (m >> 20) & 0xF); }
function SQOUT(square) {
    if(ALLRANKS[square] == KEYS.OUT) return 1;
    return 0;
}


var Controller = {};
Controller.EngineSide = SIDE.BOTH;
Controller.PlayerSide = SIDE.BOTH;
Controller.GameOver = 0;

var User = {};
User.from = KEYS.BOUND;
User.to = KEYS.BOUND;

