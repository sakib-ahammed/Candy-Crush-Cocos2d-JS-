var matchSize = 3;
var fieldSize = 7;
var tileSize = 60;
var tileArray = [];
var tileImage=[];
var tileImageBack = "res/tile.png";
var tileTypes = ["red", "green", "blue", "pink", "sky", "white"];
//var tileTypes = ["red", "green", "blue", "pink"];

var layer_posX, layer_posY;

var globezLayer, tileImageBacklayer;

var visitedTiles = [];
var startColor = null;
var tolerance = 400;

var matchHorizontalTile = [];
var matchVerticalTile = [];
var matchResultTile = [];
var resultFlag = true;
var checkCollisionTile = [];

var powerTileArray = [];
var play = false;

var gold_count = 0;
var gold_egg_collect = [];

var shuffelElement = [];

var current_gold_egg_number = 0;
var need_gold_egg_number = 3;
var egg_count_label;
var score = 0;
var score_label;
var move_left = 10;
var move_left_label;

var size;

var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        size = cc.winSize;
        layer_posX = size.width/2 - tileSize*fieldSize/2;
        layer_posY = size.height/2 - tileSize*fieldSize/2;

        var background;
        if(size.width < size.height)
            background = new cc.Sprite.create("res/Background1.png");
        else
            background = new cc.Sprite.create("res/Background2.png");
        
        background.setPosition(size.width/2, size.height/2);
        background.setOpacity(200);
        this.addChild(background, 0);

        // candy image process
        var x1 = 0, x2=90, y1=0, y2=85;
        for(var i=0; i<5; i++){
            tileImage[i] = [];
            for (var j=0; j<6; j++){
                tileImage[i].push(cc.rect(x1,y1,x2,y2));
                if( j >= 3)
                    x1 += x2+7;
                else
                    x1 += x2+15;
            }
            x1 = 0, x2=90, y1 += 95, y2=85;
        }
        
        tileImageBacklayer = cc.Layer.create();
        tileImageBacklayer.setPosition(layer_posX, layer_posY);
        this.addChild(tileImageBacklayer);

        globezLayer = cc.Layer.create();
        globezLayer.setPosition(layer_posX, layer_posY);
        this.addChild(globezLayer);

        this.createLevel();

        // Auto match for First Loading
        for(var i=0; i<fieldSize; i++){
            checkCollisionTile.push({
                row: 0,
                col: i,
                val: tileArray[0][i].val
            });
        }

        // score & gold collection label
        var egg_spite =  new cc.Sprite.create("res/egg.png");
        egg_spite.setPosition(cc.p(size.width/2 + layer_posX/4, size.height/2 + layer_posY));
        egg_spite.setScale(0.5);
        globezLayer.addChild(egg_spite, 1);

        egg_count_label = new cc.LabelTTF(current_gold_egg_number+"/"+need_gold_egg_number, "Arial", 40);
        egg_count_label.x = size.width/2 + layer_posX/4 + tileSize;
        egg_count_label.y = size.height / 2 + layer_posY;
        globezLayer.addChild(egg_count_label, 1);

        move_left_label = new cc.LabelTTF("Moves: "+ move_left, "Arial", 40);
        move_left_label.x = size.width/2 + layer_posX/4;
        move_left_label.y = size.height / 2 + layer_posY + tileSize;
        //move_left_label.setColor(cc.color(255,0,0));
        globezLayer.addChild(move_left_label, 1);

        score_label = new cc.LabelTTF("Score: "+ score, "Arial", 40);
        score_label.x = size.width/2 + layer_posX/4;
        score_label.y = size.height / 2 + layer_posY - tileSize;
        //score_label.setColor(cc.color(255,0,0));
        globezLayer.addChild(score_label, 1);



        cc.eventManager.addListener(touchListener, this);
        touchListener.UpdateFunction();

        return true;
    },

    createLevel: function(){
        for(var i = 0; i < fieldSize; i ++){
            tileArray[i] = [];
            for(var j = 0;j < fieldSize; j ++){
                this.addTile(i, j);
            }
        }
    },

    addTile:function(row,col){
        if(gold_count == 45){
            gold_count = 0;
            var sprite = cc.Sprite.createWithSpriteFrame("res/egg.png");
            sprite.val = "egg";
            sprite.power = "egg";
            sprite.picked = false;
            sprite.setScale(0.40);
            globezLayer.addChild(sprite,1);
            sprite.setPosition(col*tileSize+tileSize/2,row*tileSize+tileSize/2);
            tileArray[row][col] = sprite;
        }
        else{
            var randomTile = Math.floor(Math.random()*tileTypes.length);
            var sprite = cc.Sprite.createWithSpriteFrame("res/candy.png" ,tileImage[0][randomTile]);
            sprite.val = randomTile;
            sprite.power = 0;
            sprite.picked = false;
            sprite.setScale(0.55);
            globezLayer.addChild(sprite,1);
            sprite.setPosition(col*tileSize+tileSize/2,row*tileSize+tileSize/2);
            tileArray[row][col] = sprite;
        }

        var sprite = new cc.Sprite.create(tileImageBack);
        sprite.setPosition(col*tileSize+tileSize/2,row*tileSize+tileSize/2);
        tileImageBacklayer.addChild(sprite,0);
        gold_count++;
    },
});

var pickedRow;
var pickedCol;

var touchListener = cc.EventListener.create({
    event: cc.EventListener.MOUSE,

    checkShuffelDirection: function(R, C){
        var shuffelDirc = [ [[0,1],[1,2]], [[0,1],[-1,2]], [[0,-1],[1,-2]], [[0,-1],[-1,-2]], [[1,0],[2,1]], [[1,0],[2,-1]], [[-1,0],[-2,1]], [[-1,0],[-2,-1]], [[1,1],[1,-1]], [[-1,1],[-1,-1]], [[1,1],[-1,1]], [[1,-1],[-1,-1]], [[0,1],[0,-2]], [[0,-1],[0,2]], [[1,0],[-2,0]], [[-1,0],[2,0]] ];
        for (var i = 0; i < shuffelDirc.length; i++) {
            var count = 0;
            for (var j = 0; j < shuffelDirc[i].length; j++){
                if( (shuffelDirc[i][j][0]+R >= 0 &&  shuffelDirc[i][j][0]+R < fieldSize) && (shuffelDirc[i][j][1]+C >= 0 &&  shuffelDirc[i][j][1]+C < fieldSize) )
                    if(tileArray[shuffelDirc[i][j][0]+R][shuffelDirc[i][j][1]+C].val == tileArray[R][C].val)
                        count++;
            }
            if(count >= 2)   return true;
        }
        return false;
    },

    IsShuffelNeed: function(){
        shuffelElement = [];
        for(var i=0; i<fieldSize; i++){
            shuffelElement[i] = [];
            for(var j=0; j<fieldSize; j++){
                if(this.checkShuffelDirection(i,j))
                    return false;
                shuffelElement[i].push({
                    row: i,
                    col:j
                });
            }
        }
        return true;
    },

    Shuffel: function(o){
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    doShuffel: function(){
        var tempTile = tileArray;
        this.Shuffel(tempTile);

        for(var i=0; i<fieldSize; i++){
            for(var j=0; j<fieldSize; j++){
                var sprite;

                if(tempTile[i][j].val == "egg"){
                    sprite = cc.Sprite.createWithSpriteFrame("res/egg.png");
                    sprite.val = "egg";
                    sprite.power = "egg";
                    sprite.picked = false;
                    sprite.setScale(0.40);
                }
                else if(tempTile[i][j].val == "food"){
                    sprite = cc.Sprite.createWithSpriteFrame("res/food.png");
                    sprite.val = "food";
                    sprite.power = "food";
                    sprite.picked = false;
                    sprite.setScale(0.50);
                }
                else if(tempTile[i][j].val == "coin"){
                    sprite = cc.Sprite.createWithSpriteFrame("res/coin.png");
                    sprite.val = "coin";
                    sprite.power = "coin";
                    sprite.picked = false;
                    sprite.setScale(0.50);
                }
                else{
                    sprite = cc.Sprite.createWithSpriteFrame("res/candy.png" ,tileImage[tempTile[i][j].power][tempTile[i][j].val]);
                    sprite.val = tempTile[i][j].val;
                    sprite.power = tempTile[i][j].power;
                    sprite.picked = false;
                    sprite.setScale(0.55);
                }

                globezLayer.addChild(sprite,1);
                sprite.setPosition(j*tileSize+tileSize/2,i*tileSize+tileSize/2);

                globezLayer.removeChild(tileArray[i][j]);
                tileArray[i][j] = null;
                                
                tileArray[i][j] = sprite;
            }
        }
    },

    swapCandyAnimation: function(){

        var sprite1 = tileArray[visitedTiles[0].row][visitedTiles[0].col];
        var sprite2 = tileArray[visitedTiles[1].row][visitedTiles[1].col];

        var actionMove = new cc.MoveBy.create(0.3, cc.p(visitedTiles[1].col*tileSize - visitedTiles[0].col*tileSize, visitedTiles[1].row*tileSize - visitedTiles[0].row*tileSize))
        tileArray[visitedTiles[0].row][visitedTiles[0].col].runAction(actionMove);

        var actionMove = new cc.MoveBy.create(0.3, cc.p(visitedTiles[0].col*tileSize - visitedTiles[1].col*tileSize, visitedTiles[0].row*tileSize - visitedTiles[1].row*tileSize));
        tileArray[visitedTiles[1].row][visitedTiles[1].col].runAction(actionMove);

        setTimeout(function(){
            for(var i=0; i<visitedTiles.length; i++){
                globezLayer.removeChild(tileArray[visitedTiles[i].row][visitedTiles[i].col]);
                tileArray[visitedTiles[i].row][visitedTiles[i].col]=null;
            }

            tileArray[visitedTiles[0].row][visitedTiles[0].col] = sprite2;
            tileArray[visitedTiles[1].row][visitedTiles[1].col] = sprite1;

            for(i = 0; i < visitedTiles.length; i ++){
                globezLayer.addChild(tileArray[visitedTiles[i].row][visitedTiles[i].col],0);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].setPosition(visitedTiles[i].col*tileSize+tileSize/2,visitedTiles[i].row*tileSize+tileSize/2);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
                tileArray[visitedTiles[i].row][visitedTiles[i].col].picked=false;
            }
        },300);

        return 0;
    },

    notInMatchResultTile:function(r,c){
        for(var i=0; i<matchResultTile.length; i++){
            if(matchResultTile[i].row == r && matchResultTile[i].col == c)
                return false;
        }

        return true;
    },

    searchMatchTile: function(currentRow, currentCol){
        matchHorizontalTile = [];
        matchVerticalTile = [];

        // Vertical Search
        matchVerticalTile.push({
                row: currentRow,
                col: currentCol,
                val: tileArray[currentRow][currentCol].val
            });

        for(var i=1; (currentRow+i<fieldSize && currentRow+i>=0) && tileArray[currentRow+i][currentCol].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow+i,currentCol); i++){
            matchVerticalTile.push({
                row: currentRow+i,
                col: currentCol,
                val: tileArray[currentRow+i][currentCol].val
            });
        }

        for(var i=-1; (currentRow+i<fieldSize && currentRow+i>=0) && (tileArray[currentRow+i][currentCol].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow+i,currentCol) ); i--){
            matchVerticalTile.push({
                row: currentRow+i,
                col: currentCol,
                val: tileArray[currentRow+i][currentCol].val
            });
        }

        // Horizontal Search
        matchHorizontalTile.push({
                row: currentRow,
                col: currentCol,
                val: tileArray[currentRow][currentCol].val
            });

        for(var i=1; (currentCol+i<fieldSize && currentCol+i>=0) && tileArray[currentRow][currentCol+i].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow,currentCol+i); i++){
            matchHorizontalTile.push({
                row: currentRow,
                col: currentCol+i,
                val: tileArray[currentRow][currentCol+i].val
            });
        }

        for(var i=-1; (currentCol+i<fieldSize && currentCol+i>=0) && tileArray[currentRow][currentCol+i].val == tileArray[currentRow][currentCol].val && this.notInMatchResultTile(currentRow,currentCol+i); i--){
            matchHorizontalTile.push({
                row: currentRow,
                col: currentCol+i,
                val: tileArray[currentRow][currentCol+i].val
            });
        }

        return 0;
    },

    powerCandyCreate: function(R, C, val, power){
        var rand;
        if(power<3)
            rand = Math.floor(Math.random()*2);
        else
            rand = 2;
        var sprite = cc.Sprite.createWithSpriteFrame( "res/candy.png" ,tileImage[rand+1][val]);
        sprite.power = rand + 1;
        sprite.val = val;
        sprite.picked = false;
        sprite.setScale(0.55);
        globezLayer.addChild(sprite,1);
        sprite.setPosition(C*tileSize+tileSize/2,R*tileSize+tileSize/2);
        tileArray[R][C] = sprite;
    },

    powerHorizontal: function(R, C){
        for(var i=0; i<fieldSize; i++){
            if(this.notInMatchResultTile(R, i) && tileArray[R][i].val != "egg"){
                matchResultTile.push({
                    row: R,
                    col: i
                });

                if(tileArray[R][i].power == 1)
                    this.powerVertical(R, i);
                else if (tileArray[R][i].power == 3)
                    this.powerCandy(R, i);
                else if (tileArray[R][i].power == 4)
                    this.powerJumbo(R, C, tileArray[R][C].val);
            }
        }

        return 0;
    },

    powerVertical: function(R, C){
        for(var i=0; i<fieldSize; i++){
            if(this.notInMatchResultTile(i,C) && tileArray[i][C].val != "egg"){    
                matchResultTile.push({
                    row: i,
                    col: C
                });

                if(tileArray[i][C].power == 2)
                    this.powerHorizontal(i, C);
                else if (tileArray[i][C].power == 3)
                    this.powerCandy(i, C);
                else if (tileArray[i][C].power == 4)
                    this.powerJumbo(R, C, tileArray[R][C].val);
            }
        }

        return 0;
    },

    powerCandy: function(R, C){
        
        if(this.notInMatchResultTile(R, C))
            matchResultTile.push({
                row: R,
                col: C
            });

        var dircCandy = [[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0]];
        for(var i=0; i<dircCandy.length; i++){
            if( (dircCandy[i][0]+R >= 0 && dircCandy[i][0]+R < fieldSize) && (dircCandy[i][1]+C >= 0 && dircCandy[i][1]+C < fieldSize) ){
                if(this.notInMatchResultTile(dircCandy[i][0]+R, dircCandy[i][1]+C) && tileArray[dircCandy[i][0]+R][dircCandy[i][1]+C].val != "egg"){
                    matchResultTile.push({
                        row: dircCandy[i][0]+R,
                        col: dircCandy[i][1]+C
                    });

                    if(tileArray[dircCandy[i][0]+R][dircCandy[i][1]+C].power == 1)
                        this.powerVertical(dircCandy[i][0]+R, dircCandy[i][1]+C);
                    else if(tileArray[dircCandy[i][0]+R][dircCandy[i][1]+C].power == 2)
                        this.powerHorizontal(dircCandy[i][0]+R, dircCandy[i][1]+C);
                    else if (tileArray[dircCandy[i][0]+R][dircCandy[i][1]+C].power == 4)
                        this.powerJumbo(R, C, tileArray[R][C].val);
                }
            }
        }

        return 0;
    },

    powerJumbo: function(R, C, val){
        if(this.notInMatchResultTile(R, C))
            matchResultTile.push({
                row: R,
                col: C
            });

        for(var i=0; i<fieldSize; i++){
            for(var j=0; j<fieldSize; j++){
                if(tileArray[i][j].val == val){
                    if(this.notInMatchResultTile(i,j) && tileArray[i][j].val != "egg"){
                        matchResultTile.push({
                            row: i,
                            col: j,
                            val: tileArray[i][j].val
                        });

                        if(tileArray[i][j].power == 1)
                            this.powerVertical(i, j);
                        else if(tileArray[i][j].power == 2)
                            this.powerHorizontal(i, j);
                        else if (tileArray[i][j].power == 3)
                            this.powerCandy(i, j);
                    }
                }
            }
        }

        return 0;
    },

    powerCandyClash:function(r1, c1, r2, c2){
        resultFlag = false;

        if(tileArray[r1][c1].power == 4 && tileArray[r2][c2].power == 4){
            var rand = Math.floor(Math.random()*tileTypes.length);
            this.powerJumbo(r1, c1, rand);
            var rand = Math.floor(Math.random()*tileTypes.length);
            this.powerJumbo(r2, c2, rand);            
            var rand = Math.floor(Math.random()*tileTypes.length);
            this.powerJumbo(r1, c1, rand);
            var rand = Math.floor(Math.random()*tileTypes.length);
            this.powerJumbo(r2, c2, rand);
        }
        else if(tileArray[r1][c1].power == 3 && tileArray[r2][c2].power == 3){
            this.powerCandy(r1, c1);
            this.powerCandy(r2, c2);
        }
        else if(tileArray[r1][c1].power == 2 && tileArray[r2][c2].power == 2){
            this.powerHorizontal(r1, c1);
            this.powerVertical(r2, c2);
        }
        else if(tileArray[r1][c1].power == 1 && tileArray[r2][c2].power == 1){
            this.powerVertical(r1, c1);
            this.powerHorizontal(r2, c2);
        }
        else if((tileArray[r1][c1].power == 4 && (tileArray[r2][c2].power == 1 || tileArray[r2][c2].power == 2) ) || ((tileArray[r1][c1].power == 1 || tileArray[r1][c1].power == 2) && tileArray[r2][c2].power == 4)){
            if(tileArray[r1][c1].power == 4){
                this.powerJumbo(r1, c1, tileArray[r2][c2].val);

                for(var i=0; i<matchResultTile.length; i++){
                    globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
                    tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
                }

                var temp = matchResultTile;

                for(var i=0; i<temp.length; i++)
                    this.powerCandyCreate(temp[i].row, temp[i].col, temp[i].val, 1);

                for(var i=0; i<temp.length; i++){
                    if(tileArray[temp[i].row][temp[i].col].power == 1)
                        this.powerVertical(temp[i].row, temp[i].col);
                    else
                        this.powerHorizontal(temp[i].row, temp[i].col);
                }
            }
            else{
                this.powerJumbo(r2, c2, tileArray[r1][c1].val);

                for(var i=0; i<matchResultTile.length; i++){
                    globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
                    tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
                }

                var temp = matchResultTile;
                for(var i=0; i<temp.length; i++)
                    this.powerCandyCreate(temp[i].row, temp[i].col, temp[i].val, 1);

                for(var i=0; i<temp.length; i++){
                    if(tileArray[temp[i].row][temp[i].col].power == 1)
                        this.powerVertical(temp[i].row, temp[i].col);
                    else
                        this.powerHorizontal(temp[i].row, temp[i].col);
                }
            }
        }

        else if((tileArray[r1][c1].power == 4 && tileArray[r2][c2].power == 3) || (tileArray[r1][c1].power == 3 && tileArray[r2][c2].power == 4)){
            if(tileArray[r1][c1].power == 4){
                this.powerJumbo(r1, c1, tileArray[r2][c2].val);

                for(var i=0; i<matchResultTile.length; i++){
                    globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
                    tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
                }

                var temp = matchResultTile;
                matchResultTile = [];
                
                for(var i=0; i<temp.length; i++)
                    this.powerCandyCreate(temp[i].row, temp[i].col, temp[i].val, 3);

                for(var i=0; i<temp.length; i++)
                    this.powerCandy(temp[i].row, temp[i].col);
            }
            else{
                this.powerJumbo(r2, c2, tileArray[r1][c1].val);

                for(var i=0; i<matchResultTile.length; i++){
                    globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
                    tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
                }

                var temp = matchResultTile;
                matchResultTile = [];

                for(var i=0; i<temp.length; i++)
                    this.powerCandyCreate(temp[i].row, temp[i].col, temp[i].val, 3);

                for(var i=0; i<temp.length; i++)
                    this.powerCandy(temp[i].row, temp[i].col);
            }
        }
        else if((tileArray[r1][c1].power == 3 && tileArray[r2][c2].power == 2) || (tileArray[r1][c1].power == 2 && tileArray[r2][c2].power == 3)){
            this.powerHorizontal(r1, c1);
            this.powerHorizontal(r2, c2);
            this.powerVertical(r1, c1);
            this.powerVertical(r2, c2);
        }
        else if((tileArray[r1][c1].power == 3 && tileArray[r2][c2].power == 1) || (tileArray[r1][c1].power == 1 && tileArray[r2][c2].power == 3)){
            this.powerHorizontal(r1, c1);
            this.powerHorizontal(r2, c2);
            this.powerVertical(r1, c1);
            this.powerVertical(r2, c2);
        }
        else if((tileArray[r1][c1].power == 1 && tileArray[r2][c2].power == 2) || (tileArray[r1][c1].power == 2 && tileArray[r2][c2].power == 1)){
            this.powerVertical(r1, c1);
            this.powerHorizontal(r2, c2);
        }

        return 0;
    },

    process_matchResultTile:function(){
        if(matchHorizontalTile.length >= matchSize && matchVerticalTile.length >= matchSize){
            for(var i=0; i<matchHorizontalTile.length; i++){
                if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 2 )
                    this.powerHorizontal(matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 1 )
                    this.powerVertical( matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 3 )
                    this.powerCandy(matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else
                    matchResultTile.push(matchHorizontalTile[i]);
            }

            for(var i=1; i<matchVerticalTile.length; i++){
                if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 1)
                    this.powerVertical( matchVerticalTile[i].row, matchVerticalTile[i].col);
                else if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 2)
                    this.powerHorizontal(matchVerticalTile[i].row, matchVerticalTile[i].row);
                else if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 3 )
                    this.powerCandy(matchVerticalTile[i].row, matchVerticalTile[i].col);
                else
                    matchResultTile.push(matchVerticalTile[i]);
            }

            if(matchHorizontalTile.length >= 5 || matchVerticalTile.length >= 5){
                powerTileArray.push({
                    row: matchHorizontalTile[0].row,
                    col: matchHorizontalTile[0].col,
                    val: matchHorizontalTile[0].val,
                    power: 4
                });
            }
            else if(matchHorizontalTile[0].val == matchVerticalTile[0].val){
                if( matchHorizontalTile[0].row == matchVerticalTile[0].row && matchHorizontalTile[0].col == matchVerticalTile[0].col){
                    powerTileArray.push({
                        row: matchHorizontalTile[0].row,
                        col: matchHorizontalTile[0].col,
                        val: matchHorizontalTile[0].val,
                        power: 3
                    });
                }
            }
        }

        else if(matchHorizontalTile.length >= matchSize){
            for(var i=0; i<matchHorizontalTile.length; i++){
                if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 2 )
                    this.powerHorizontal(matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 1 )
                    this.powerVertical(matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else if(tileArray[matchHorizontalTile[i].row][matchHorizontalTile[i].col].power == 3 )
                    this.powerCandy(matchHorizontalTile[i].row, matchHorizontalTile[i].col);
                else
                    matchResultTile.push(matchHorizontalTile[i]);
            }

            if(matchHorizontalTile.length == 4){
                powerTileArray.push({
                    row: matchHorizontalTile[0].row,
                    col: matchHorizontalTile[0].col,
                    val: matchHorizontalTile[0].val,
                    power: 1
                });
            }
            else if(matchHorizontalTile.length >= 5){
                powerTileArray.push({
                    row: matchHorizontalTile[0].row,
                    col: matchHorizontalTile[0].col,
                    val: matchHorizontalTile[0].val,
                    power: 4
                });
            }
        }

        else if(matchVerticalTile.length >= matchSize){
            for(var i=0; i<matchVerticalTile.length; i++){
                if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 1)
                    this.powerVertical(matchVerticalTile[i].row, matchVerticalTile[i].col);
                else if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 2)
                    this.powerHorizontal(matchVerticalTile[i].row, matchVerticalTile[i].col);
                else if(tileArray[matchVerticalTile[i].row][matchVerticalTile[i].col].power == 3 )
                    this.powerCandy(matchVerticalTile[i].row, matchVerticalTile[i].col);
                else
                    matchResultTile.push(matchVerticalTile[i]);
            }

            if(matchVerticalTile.length == 4){
                powerTileArray.push({
                    row: matchVerticalTile[0].row,
                    col: matchVerticalTile[0].col,
                    val: matchVerticalTile[0].val,
                    power: 2
                });
            }
            else if(matchVerticalTile.length >= 5){
                powerTileArray.push({
                    row: matchVerticalTile[0].row,
                    col: matchVerticalTile[0].col,
                    val: matchVerticalTile[0].val,
                    power: 4
                });
            }
        }

        return 0;
    },

    fallTile:function(row,col,height){
        if(gold_count == 50){
            gold_count = 0;
            var randomTile = Math.floor(Math.random()*3);
            var sprite;
            switch(randomTile){
                case 0:
                    sprite = cc.Sprite.createWithSpriteFrame("res/egg.png");
                    sprite.val = "egg";
                    sprite.power = "egg";
                    sprite.picked = false;
                    sprite.setScale(0.40);    
                break;

                case 1:
                    sprite = cc.Sprite.createWithSpriteFrame("res/coin.png");
                    sprite.val = "coin";
                    sprite.power = "coin";
                    sprite.picked = false;
                    sprite.setScale(0.50);    
                break;

                case 2:
                    sprite = cc.Sprite.createWithSpriteFrame("res/food.png");
                    sprite.val = "food";
                    sprite.power = "food";
                    sprite.picked = false;
                    sprite.setScale(0.50);    
                break;
            }
            
            globezLayer.addChild(sprite,0);
            sprite.setPosition(col*tileSize+tileSize/2,(fieldSize+height)*tileSize);
            var moveAction = cc.MoveTo.create(0.75, new cc.Point(col*tileSize+tileSize/2,row*tileSize+tileSize/2));
            sprite.runAction(moveAction);
            tileArray[row][col] = sprite;
        }
        else{
            var randomTile = Math.floor(Math.random()*tileTypes.length);
            var sprite = cc.Sprite.createWithSpriteFrame("res/candy.png" ,tileImage[0][randomTile]);
            sprite.val = randomTile;
            sprite.power = 0;
            sprite.picked = false;
            sprite.setScale(0.55);
            globezLayer.addChild(sprite,0);
            sprite.setPosition(col*tileSize+tileSize/2,(fieldSize+height)*tileSize);
            var moveAction = cc.MoveTo.create(0.75, new cc.Point(col*tileSize+tileSize/2,row*tileSize+tileSize/2));
            sprite.runAction(moveAction);
            tileArray[row][col] = sprite;
        }

        gold_count++;

        return 0;
    },

    fallTileAnimation: function(){
        for(i = 1; i < fieldSize; i ++){
            for(j = 0; j < fieldSize; j ++){
                if(tileArray[i][j] != null){
                    var holesBelow = 0;
                    for(var k = i - 1; k >= 0; k --){
                        if(tileArray[k][j] == null){
                            holesBelow++;
                        }
                    }
                    if(holesBelow>0){
                        var moveAction = cc.MoveTo.create(0.75, new cc.Point(tileArray[i][j].x,tileArray[i][j].y-holesBelow*tileSize));
                        // cc.moveTo() can also be used
                        tileArray[i][j].runAction(moveAction);
                        tileArray[i - holesBelow][j] = tileArray[i][j];
                        tileArray[i][j] = null;
                    }
                }
            }
        }

        return 0;
    },

    deleteMatchTile:function(){
        resultFlag = false;
        for(var i=0; i<matchResultTile.length; i++){
            globezLayer.removeChild(tileArray[matchResultTile[i].row][matchResultTile[i].col]);
            tileArray[matchResultTile[i].row][matchResultTile[i].col]=null;
        }

        if(matchResultTile.length>5){
            score += matchResultTile.length*200; 
            score_label.setString("Score: "+ (score));
        }
        else{
            score += matchResultTile.length*100; 
            score_label.setString("Score: "+ (score));
        }

        // food coin collection
        var dircFC = [[0,1], [1,0], [0,-1], [-1,0]];
        for(var i=0; i<matchResultTile.length; i++){
            for(var j=0; j<dircFC.length; j++){
                if((matchResultTile[i].row + dircFC[j][0] >= 0 && matchResultTile[i].row + dircFC[j][0] < fieldSize) && (matchResultTile[i].col + dircFC[j][1] >= 0 && matchResultTile[i].col + dircFC[j][1] < fieldSize)){
                    if(tileArray[matchResultTile[i].row + dircFC[j][0]][matchResultTile[i].col + dircFC[j][1]] !=  null){
                        if (tileArray[matchResultTile[i].row + dircFC[j][0]][matchResultTile[i].col + dircFC[j][1]].val == "food" || tileArray[matchResultTile[i].row + dircFC[j][0]][matchResultTile[i].col + dircFC[j][1]].val == "coin"){
                            globezLayer.removeChild(tileArray[matchResultTile[i].row + dircFC[j][0]][matchResultTile[i].col + dircFC[j][1]]);
                            tileArray[matchResultTile[i].row + dircFC[j][0]][matchResultTile[i].col + dircFC[j][1]]=null;
                        }            
                    }
                }
            }
        }

        // create power tile
        for(var i=0; i<powerTileArray.length; i++){
            var sprite = cc.Sprite.createWithSpriteFrame( "res/candy.png" ,tileImage[powerTileArray[i].power][powerTileArray[i].val]);
            sprite.power = powerTileArray[i].power;
            if(sprite.val = powerTileArray[i].power == 4)
                sprite.val = 6;
            else
                sprite.val = powerTileArray[i].val;
            sprite.picked = false;
            sprite.setScale(0.55);
            globezLayer.addChild(sprite,1);
            sprite.setPosition(powerTileArray[i].col*tileSize+tileSize/2,powerTileArray[i].row*tileSize+tileSize/2);
            tileArray[powerTileArray[i].row][powerTileArray[i].col] = sprite;
        }

        this.fallTileAnimation();

        return 0;
    },

    searchSameTile:function(){
        matchResultTile = [];
        powerTileArray = [];

        // compare for power candy clash

        if(tileArray[visitedTiles[0].row][visitedTiles[0].col].power > 0 && tileArray[visitedTiles[1].row][visitedTiles[1].col].power > 0)
            this.powerCandyClash(visitedTiles[0].row, visitedTiles[0].col, visitedTiles[1].row, visitedTiles[1].col);
        else if(tileArray[visitedTiles[0].row][visitedTiles[0].col].power == 4 || tileArray[visitedTiles[1].row][visitedTiles[1].col].power == 4){
            if(tileArray[visitedTiles[0].row][visitedTiles[0].col].power == 4)
                this.powerJumbo(visitedTiles[0].row, visitedTiles[0].col, tileArray[visitedTiles[1].row][visitedTiles[1].col].val);
            else
                this.powerJumbo(visitedTiles[1].row, visitedTiles[1].col, tileArray[visitedTiles[0].row][visitedTiles[0].col].val)
        }
        else{
            this.searchMatchTile(visitedTiles[0].row, visitedTiles[0].col);
            this.process_matchResultTile();

            this.searchMatchTile(visitedTiles[1].row, visitedTiles[1].col);
            this.process_matchResultTile();
        }
        // Delete Match Tile
        if(matchResultTile.length>=matchSize)
            this.deleteMatchTile();

        return 0;
    },

    fallTileCreate: function(){
        for(var i = 0; i < fieldSize; i ++){
            for(j = fieldSize-1; j>=0; j --){
                if(tileArray[j][i] != null){
                    break;
                }
            }
            var missingGlobes = fieldSize-1-j;
            if(missingGlobes>0){
                for(var j=0;j<missingGlobes;j++){
                    if(tileArray[fieldSize-j-1][i] == null){
                    //var target = event.getCurrentTarget();
                    //target.fallTile(fieldSize-j-1,i,missingGlobes-j);   
                    this.fallTile(fieldSize-j-1,i,missingGlobes-j);   
                    }
                }
            }
        }

        return 0;
    },

    checkCollision:function(){
        matchResultTile = [];
        powerTileArray = [];
        for(var i=0; i<checkCollisionTile.length; i++){
            for(var j=checkCollisionTile[i].row; j<fieldSize; j++){
                matchHorizontalTile = [];
                matchVerticalTile = [];
                this.searchMatchTile(j, checkCollisionTile[i].col);
                this.process_matchResultTile();
            }
        }

        // Delete Match Tile
        if(matchResultTile.length>=matchSize){
            this.collect_egg();
            for(var i=0; i<gold_egg_collect.length; i++)
                matchResultTile.push(gold_egg_collect[i]);
            return true;
        }
        else if(this.collect_egg()){
            matchResultTile = [];
            for(var i=0; i<gold_egg_collect.length; i++)
                matchResultTile.push(gold_egg_collect[i]);
            return true;
        }

        return false;
    },

    collect_egg: function(){
        gold_egg_collect = [];
        var egg = false;
        for(var i=0; i<fieldSize; i++)
            if(tileArray[0][i] != null)
                if(tileArray[0][i].val == "egg"){
                    gold_egg_collect.push({
                        row: 0,
                        col: i
                    });
                    egg = true;
                }

    if(gold_egg_collect.length>0){

        score += 1000; 
        score_label.setString("Score: "+ score);

        current_gold_egg_number += gold_egg_collect.length;
        egg_count_label.setString(current_gold_egg_number+"/"+need_gold_egg_number);
    
        var dd = new cc.LabelTTF("+"+gold_egg_collect.length, "Arial", 40);
        dd.x = size.width/2 + layer_posX/4 + tileSize;
        dd.y = size.height / 2 + layer_posY;
        dd.setColor(cc.color(255,0,0));
        globezLayer.addChild(dd, 1);
    
        var action = new cc.FadeOut.create(1.5);
        var actionIn = new cc.ScaleTo.create(1.5,1.5,1.5);
        var seq = new cc.Sequence.create(actionIn, action);
        dd.runAction(seq);
    }

        return egg;
    },

    UpdateFunction: function(){
        play = false;
        var that = this;
        // checkCollisionTile = [];
        // checkCollisionTile = matchResultTile;

        if(this.checkCollision()){
            this.deleteMatchTile();
            this.fallTileCreate();
            setTimeout(function(){
                that.UpdateFunction();
                return 0;
            }, 850);
        }
        else {
            //checkCollisionTile = [];
            if(move_left == 0){
                cc.log("Game End");
                var scene = new HelloWorldScene2;
                cc.director.pushScene(scene);
            }
            play = true;

            if(this.IsShuffelNeed()){
                cc.log("Shuffel Need");
                this.doShuffel();
                this.UpdateFunction();
            }
            // else
            //     cc.log("Shuffel NOT Need");
        }
        return 0;        
    },

    onMouseDown: function (event) {
        if(play){
            play = false;
            pickedRow = Math.floor( (event._y - layer_posY) / tileSize);
            pickedCol = Math.floor( (event._x - layer_posX) / tileSize);

            if( (pickedRow >= 0 && pickedRow < fieldSize) && (pickedCol >= 0 && pickedCol < fieldSize) ){
                tileArray[pickedRow][pickedCol].setOpacity(128);
                tileArray[pickedRow][pickedCol].picked = true;
                startColor = tileArray[pickedRow][pickedCol].val;
                visitedTiles.push({
                    row: pickedRow,
                    col: pickedCol
                });   
            }
        }
    },

    onMouseUp: function(event){
        if(startColor!=null){
            startColor=null;
            resultFlag = true;
            if (visitedTiles.length == 2){ 
                this.swapCandyAnimation();

                var that = this;

                setTimeout(function(){
                    // matchResultTile Array process
                    that.searchSameTile();
                    if(resultFlag)
                        that.swapCandyAnimation();
                    else{
                        move_left--;
                        move_left_label.setString("Moves: "+move_left);
                        // New tile create after remove
                        that.fallTileCreate(); // 0.75 second   
                        setTimeout(function(){
                            that.UpdateFunction();
                        },850);
                    }
                    setTimeout(function(){
                        visitedTiles = [];
                        play = true;
                    },350);
                },300);
            }
            else{
                if( (pickedRow >= 0 && pickedRow < fieldSize) && (pickedCol >= 0 && pickedCol < fieldSize) ){
                    tileArray[visitedTiles[0].row][visitedTiles[0].col].setOpacity(255);
                    tileArray[visitedTiles[0].row][visitedTiles[0].col].picked=false;
                    visitedTiles = [];
                    play = true;
                }
            }
        }
        else play = true;
    },

    onMouseMove: function(event){
        if(startColor!=null && visitedTiles.length <= 1){
            var currentRow = Math.floor( (event._y - layer_posY) / tileSize);
            var currentCol = Math.floor( (event._x - layer_posX) / tileSize);

            if( (currentRow >= 0 && currentRow < fieldSize) && (currentCol >= 0 && currentCol < fieldSize) ){
                if( (visitedTiles[0].row - currentRow) == 0 || (visitedTiles[0].col - currentCol) == 0 ){
                    if(!tileArray[currentRow][currentCol].picked){
                        if(Math.abs(currentRow - visitedTiles[visitedTiles.length - 1].row) <= 1 && Math.abs(currentCol - visitedTiles[visitedTiles.length -1].col) <= 1){
                            tileArray[currentRow][currentCol].setOpacity(128);
                            tileArray[currentRow][currentCol].picked=true;
                            visitedTiles.push({
                                row:currentRow,
                                col:currentCol
                            });
                        }
                    }
                }
            }
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

