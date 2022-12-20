function preload(){
    let images = 5;
    let path;
    walk_ani = [];
    zombie_ani = [];
    special_ani = [];
    test_arr = [];
    explode_ani = [];
    for (let i = 0; i <= images; i++){
        path = 'player/walk/tile00' + str(i) + '.png';
        walk_ani.push(loadImage(path));
    }
    for (let i = 0; i <= images; i++){
        path = 'enemy/zombies/tile00' + str(i) + '.png';
        zombie_ani.push(loadImage(path));
    }
    for (let i = 0; i <= images; i++){
        path = 'enemy/special/tile00' + str(i) + '.png';
        special_ani.push(loadImage(path));
    }
    start = loadImage('imgs/start.png');
    end = loadImage('imgs/end.png');
    test = loadImage('map/test.png');
    lv1 = loadImage('map/lv1.png');
    lv2 = loadImage('map/lv2.png');
    lv3 = loadImage('map/lv3.png');
    lv4 = loadImage('map/lv4.png');
    lv5 = loadImage('map/lv5.png');
    blood_frame = loadImage('imgs/blood_frame.png');
    blood = loadImage('imgs/blood.png');
    lv_count = 4;
    tile_map = [];
    for (let i = 0; i <= lv_count; i++){
        path = 'map/tile_map/lv' + str(i+1) + '.png';
        tile_map.push(loadImage(path));
    }

    t_lv3 = loadImage('map/tile_map/lv3.png');
    key_img = loadImage('imgs/keys.png');
    images = 42;
    bug_ani = [];
    for(let i = 0; i <= images; i++){
        if(i<10){
            path = 'imgs/bug/tile00' + str(i) + '.png';
        }
        else{
            path = 'imgs/bug/tile0' + str(i) + '.png';
        }
        bug_ani.push(loadImage(path));
    }

    for(let i = 0; i <= 10; i++){
        if(i<10){
            path = 'imgs/explode/tile00' + str(i) + '.png';
        }
        else{
            path = 'imgs/explode/tile0' + str(i) + '.png';
        }
        explode_ani.push(loadImage(path));
    }
    bomb_new = loadImage('imgs/bomb_new.png');
    bomb_destroyed = loadImage('imgs/bomb_destroyed.png');
}

function setup(){
    game_time = 0;
    frameRate(60);
    key_status = false;
    state = 'start';
    breath_sound = document.getElementById('breath');
    walk_sound = document.getElementById('walk');
    chase_sound = document.getElementById('chase');
    pickup_sound = document.getElementById('pickup');
    heartbeat_sound = document.getElementById('heartbeat');
    explode_sound = document.getElementById('explode');
    hit_sound = document.getElementById('hit');
    opacity = 0;
    debug_mode = false;
    canvas_x = 1088;
    canvas_y = 896;
    createCanvas(canvas_x,canvas_y);
    bomb_arr = [];
    bomb_pos_arr = [[2, 300, 400], [4, 300, 230], [4, 250, 320]];
    //enemy loc array
    lv1_enemy_pos = [[300,133, 'idle'], [700, 300, 'idle'], [300, 450, 'idle']];
    lv2_enemy_pos = [[550, 150, 'idle']];
    lv3_enemy_pos = [[900, 700, 'path', [[940,680], [940, 145], [135, 131]]],
                    [418, 221, 'path', [[418,221], [417, 568], [509, 625], [781, 625]]]];
    lv4_enemy_pos = [[416, 256, 'idle', 0, 200]

    ];
    lv5_enemy_pos = [];
    lv1_enemy_pos_s = [];
    lv2_enemy_pos_s = [];
    lv3_enemy_pos_s = [];
    lv4_enemy_pos_s = [[750, 750]];
    lv5_enemy_pos_s = [[850, 300], [950, 250]];
    map_index = 4;
    maps = [lv1, lv2, lv3, lv4, lv5];
    key_pos = [[[830, 287]], [[939, 144]], [[659, 308], [192, 432]], [[925, 450]], [[775, 52]]];
    lv_enemy = [lv1_enemy_pos, lv2_enemy_pos, lv3_enemy_pos, lv4_enemy_pos, lv5_enemy_pos];
    lv_special_enemy = [lv1_enemy_pos_s, lv2_enemy_pos_s, lv3_enemy_pos_s, lv4_enemy_pos_s, lv5_enemy_pos_s]
    enemy_arr = [];
    pressed = false;
    curmap = maps[map_index];
    bug_status = false;
    player_start_loc = [[540, 680], [540, 680], [50, 100], [900, 100], [150, 100]];
    bugs_arr = [];
    bugs = new bug();



    grid = [];
    cellSize = 32;
    gridWidth = 34;
    gridHeight = 28;

// where the creatures start in the grid (0,0) and where they want to get to (19,19)
    startX = 0;
    startY = 0;
    endX = 13;
    endY = 13;

// array to hold all creature objects that will move through the grid
    creatures = [];

    for (var x = 0; x < gridWidth; x++) {
        var newRow = [];
        for (var y = 0; y < gridHeight; y++) {
          // each cell in our grid holds an object to define its color, whether it is solid, and pathing info, including pointers to the next cell that will bring us closer to the optimal path to
          // the desired end point of the maze
          // we assume at the beginning that we don't know how far it is to get to the end (-1)
          // and we default these pointers to "unknown"
          newRow.push({color:0, solid: false, stepsToEnd: -1, nextX: "unknown", nextY: "unknown", nextDirection: -1});
        }
        grid.push(newRow);
      }
    
      // find all paths to the end point - there is where the magic hawippens!
      findPaths();

      level_start();

}
function level_start_matrix_adjust(){
    findPaths();
    for(let i = 0; i < gridWidth; i++){
        for(let u = 0; u < gridHeight; u++){
            grid[i][u].solid = false;
            grid[i][u].color = 0;
        }
    }
    for(let i = 0; i < gridWidth; i++){
        for(let u = 0; u < gridHeight; u++){
            let clr = red((curmap.get(i*cellSize+cellSize/2, u*cellSize+cellSize/2)));
            if(clr==0){
                grid[i][u].color = 128;
                grid[i][u].solid = true;
            }
        }
    }
}

function findPaths() {
    // step 1: clear all existing pathfinding information in the grid
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        grid[i][j].stepsToEnd = -1;
        grid[i][j].nextX = "unknown";
        grid[i][j].nextY = "unknown";
        grid[i][j].dx = 0;
        grid[i][j].dy = 0;
        grid[i][j].nextDirection = -1;
      }
    }
  
    // step 2: mark the end path as 0 steps
    try{
        grid[endX][endY].stepsToEnd = 0;
        grid[endX][endY].nextX = "none";
        grid[endX][endY].nextY = "none";
        grid[endX][endY].dx = 0;
        grid[endX][endY].dy = 0;
        grid[endX][endY].nextDirection = -1;
    }
    catch(error){
        console.log(error);
    }
    
  
    // step 3: find all this loop keeps calling 'findPathIterative' until all cells in the grid have
    // pointers to the optimal end path
    while (true) {
      if (findPathIterative() === 0) {
        break;
      }
    }
  
    // tell all the creatures to recompute their paths
    for (var c in creatures) {
      creatures[c].recomputePath();
    }
  }
  
  // this function visits every tile on the page and computes its optimal path to the ending cell
  // note that this function gets called multiple times since it only computes the path for cells
  // that have existing pathing info (at the beginning this will only be the end cell, followed
  // by its direct neighbors, until finally it spreads out to all cells).  we do this iteratively
  // since a recursive implementation can be a big memory intensive and can cause performance issues
  function findPathIterative() {
    // start off by making a deep copy of the entire array
    var gridCopy = makeDeepCopy(grid);
  
    // assume we need to make 0 changes to the pathing info in the grid - this is important
    // since if this number fails to change during the computation phase below we can assume
    // that we have computed a valid optimal path to the end cell
    var numChanges = 0;
  
    // visit every cell in the grid
    for (var x = 0; x < grid.length; x++) {
      for (var y = 0; y < grid[x].length; y++) {
        // only need to do something if this is tile is not solid or we know pathing info for the tile already
        if (grid[x][y].solid === false && grid[x][y].stepsToEnd == -1) {
          // check element: RIGHT
          if (x < grid.length-1) {
            // is it solid and do we know the pathfinding info for this tile?
            if (grid[x+1][y].solid === false && grid[x+1][y].stepsToEnd >= 0) {
              // mark this tile with pathfinding info based on the cell we are visiting (+1)
              gridCopy[x][y].stepsToEnd = grid[x+1][y].stepsToEnd+1;
              gridCopy[x][y].nextX = x + 1;
              gridCopy[x][y].nextY = y;
              gridCopy[x][y].dx = 1;
              gridCopy[x][y].dy = 0;
              gridCopy[x][y].nextDirection = "right";
  
              numChanges++;
            }
          }
  
          // check element: LEFT
          if (x >= 1) {
            // is it solid and do we know the pathfinding info for this tile?
            if (grid[x-1][y].solid === false && grid[x-1][y].stepsToEnd >= 0) {
              // mark this tile with pathfinding info based on the cell we are visiting (+1)
              gridCopy[x][y].stepsToEnd = grid[x-1][y].stepsToEnd+1;
              gridCopy[x][y].nextX = x-1;
              gridCopy[x][y].nextY = y;
              gridCopy[x][y].dx = -1;
              gridCopy[x][y].dy = 0;
              gridCopy[x][y].nextDirection = "left";
  
              numChanges++;
            }
          }
  
          // check element: DOWN
          if (y < grid[x].length-1) {
            // is it solid and do we know the pathfinding info for this tile?
            if (grid[x][y+1].solid === false && grid[x][y+1].stepsToEnd >= 0) {
              // mark this tile with pathfinding info based on the cell we are visiting (+1)
              gridCopy[x][y].stepsToEnd = grid[x][y+1].stepsToEnd+1;
              gridCopy[x][y].nextX = x;
              gridCopy[x][y].nextY = y+1;
              gridCopy[x][y].dx = 0;
              gridCopy[x][y].dy = 1;
              gridCopy[x][y].nextDirection = "down";

              numChanges++;
            }
          }
  
          // check element: UP
          if (y >= 1) {
            // is it solid and do we know the pathfinding info for this tile?
            if (grid[x][y-1].solid === false && grid[x][y-1].stepsToEnd >= 0) {
              // mark this tile with pathfinding info based on the cell we are visiting (+1)
              gridCopy[x][y].stepsToEnd = grid[x][y-1].stepsToEnd+1;
              gridCopy[x][y].nextX = x;
              gridCopy[x][y].nextY = y-1;
              gridCopy[x][y].dx = 0;
              gridCopy[x][y].dy = -1;
              gridCopy[x][y].nextDirection = "up";
  
              numChanges++;
            }
          }
        }
      }
    }
  
    // update the grid with the copy that we made
    grid = gridCopy;
  
    // tell the caller how many changes we made (if 0 the caller will stop the 'while' loop and a path has been computed)
    return numChanges;
  }
function place_enemies(){
    let arr = lv_enemy[map_index];
    for(let i = 0; i<arr.length; i++){
        if(arr[i].length == 4){
            zomb = new regular_enemy(arr[i][0], arr[i][1], i, arr[i][2], arr[i][3]);
        }
        else if(arr[i].length == 5){
            zomb = new regular_enemy(arr[i][0], arr[i][1], i, arr[i][2], arr[i][3], arr[i][4]);
        }
        else{
            zomb = new regular_enemy(arr[i][0], arr[i][1], i, arr[i][2]);
        }
        enemy_arr.push(zomb);
    }

    let arr2 = lv_special_enemy[map_index];
    for(let i = 0; i<arr2.length; i++){
        if(arr2[i].length == 4){
            ppl = new Creature(arr2[i][0], arr2[i][1]);
        }
        else{
            ppl = new Creature(arr2[i][0], arr2[i][1]);
        }
        special_enemy_arr.push(ppl);
    }

    for(let i=0; i<bomb_pos_arr.length; i++){
        if(bomb_pos_arr[i][0]==map_index){
            let bomb = new explosives(bomb_pos_arr[i][1], bomb_pos_arr[i][2]);
            bomb_arr.push(bomb);
        }
    }
}

function level_start(){
    enemy_arr = [];
    special_enemy_arr = [];
    bomb_arr = [];
    key_status = false;
    place_enemies();
    curmap = maps[map_index];
    bugs = new bug();
    bug_status = false;
    key_arr = [];
    for(let i = 0; i < key_pos[map_index].length; i++){
        let k = new keys(key_pos[map_index][i][0], key_pos[map_index][i][1]);
        key_arr.push(k);
    }
    plyr = new player(player_start_loc[map_index][0], player_start_loc[map_index][1]);
    plyr.state = 'alive';
    level_start_matrix_adjust();
}

function level_restart(){
    curmap -= 1;
    level_start();
}

function draw(){
    background(0);
    if(state == 'game'){
        displayMap(maps[map_index]);
        plyr.move();
        for(let i = 0; i<key_arr.length; i++){
            key_arr[i].display();
        }
        for(let i = 0; i<enemy_arr.length; i++){
            if(enemy_arr[i].state != 'dead'){
                enemy_arr[i].move();
            }
        }
        

        if (bug_status == true) {
            bugs.move();
        }
        strokeWeight(1);
        stroke(255);
        fill(255);
        text(round(frameRate()), 50, 50);
        


        //path finding
        if(special_enemy_arr.length!=0){


        noStroke()
        
        let end_x = (plyr.x_cent - (plyr.x_cent % cellSize))/cellSize;
        let end_y = (plyr.y_cent - (plyr.y_cent % cellSize))/cellSize;
        endX = end_x;
        endY = end_y;
        try {
            if(grid[end_x][end_y].solid){
                if(grid[end_x+1][end_y].solid == false){
                    endX += 1;
                }
                else if(grid[end_x-1][end_y].solid == false){
                    endX -= 1;
                }
                else if(grid[end_x][end_y+1].solid == false){
                    endY += 1;
                }
                else if(grid[end_x][end_y-1].solid == false){
                    endY -= 1;
                }
            }
        }
        catch(error){
            console.log(error);
        }
            
        
        startX = 1;
        startY = 1;
        findPaths();
        for (var row = 0; row < grid.length; row++) {
        for (var col = 0; col < grid[row].length; col++) {

    
            if (debug_mode) {
            fill(0,255,0)
            text(grid[row][col].stepsToEnd, row*cellSize+cellSize/2, col*cellSize+cellSize/2)        
            }
        }
        }
    
        // draw start and end points
        if(debug_mode){
        noStroke();
    
        fill(0,255,0,150);
        rect(startX*cellSize, startY*cellSize, cellSize, cellSize);
        fill(0,255,0,150);
        rect(endX*cellSize, endY*cellSize, cellSize, cellSize);
    
        // draw the mouse indicator
        stroke(255);
        strokeWeight(5);
        noFill();
        var gx = int(mouseX / cellSize);
        var gy = int(mouseY / cellSize);
        rect(gx*cellSize, gy*cellSize, cellSize, cellSize);
        }
        // every 10 frames spawn a creature
        
    
        // move and display creatures
        for(let i = 0; i<special_enemy_arr.length; i++){
            special_enemy_arr[i].display();
            if (special_enemy_arr[i].isAtEnd()) {
                //special_enemy_arr[i].die();
            }
        }
        }
        for(let i = 0; i<bomb_arr.length; i++){
            bomb_arr[i].display();
        }
    }
    else if(state == 'end'){
        image(end, 33, 50);
    }
    else if(state == 'start'){
        image(start, 33, 50);
    }
}

function displayMap(cur){
    curmap = cur;
    image(cur, 0, 0);
    image(tile_map[map_index], 0, 0);
}

class player{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.angle = 0; 
        this.rotating = false;
        this.diff;
        this.turnangle = 0;
        this.animation = walk_ani;
        this.frame = 0;
        this.diff = 0;
        this.t_angle = 0;
        this.front_pointer = [this.x+20, this.y];
        this.width = 35;
        this.height = 57;
        this.x_cent;
        this.y_cent
        this.spd = 1;
        this.blood_loc = [];
        this.state = 'alive';
        this.death_timer = 0;

        //walk 35*57
    }
    move(){
        if(this.state != 'dead'){
        this.y_cent = this.y+this.height/2;
        this.x_cent = this.x+this.width/2;
        if(this.spd == 1){
            if(red(curmap.get(this.x_cent, this.y_cent))==222){
                if(isPlaying(hit_sound)==false){
                    hit_sound.play();
                }
                this.spd = 0.75;
                this.blood_loc = [this.x_cent, this.y_cent];
            }
        }
        else{
            image(blood_frame, 0, 0);
            image(blood, this.blood_loc[0], this.blood_loc[1]);
        }
        if(frameCount%10 == 0){
            this.frame ++;
        }
        if(this.frame >= this.animation.length){
            this.frame = 0;
        }
        if(keyIsDown(65)&&keyIsDown(68)==false){
            this.x -=this.spd;
            if(isPlaying(walk_sound)==false){
                walk_sound.play();
            }
            if(keyIsDown(87)){
                this.front_pointer = [this.x, this.y+this.height];
            }
            else if(keyIsDown(83)){
                this.front_pointer = [this.x, this.y];
            }
            else{
                this.front_pointer = [this.x-31, this.y_cent];
            }
        }
        else if(keyIsDown(68)&&keyIsDown(65)==false){
            this.x +=this.spd;
            if(isPlaying(walk_sound)==false){
                walk_sound.play();
            }
            if(keyIsDown(87)){
                this.front_pointer = [this.x+this.width, this.y+this.height];
            }
            else if(keyIsDown(83)){
                this.front_pointer = [this.x+this.width, this.y];
            }
            else{
                this.front_pointer = [this.x+31+this.width, this.y_cent];
            }
        }
        if(keyIsDown(87)&&keyIsDown(83)==false){
            this.y -= this.spd;
            if(isPlaying(walk_sound)==false){
                walk_sound.play();
            }
            if(keyIsDown(68)){
                this.front_pointer = [this.x+this.width, this.y];
            }
            else if(keyIsDown(65)){
                this.front_pointer = [this.x, this.y];
            }
            else{
                this.front_pointer = [this.x_cent, this.y-20];
            }
        }
        else if(keyIsDown(83)&&keyIsDown(87)==false){
            this.y +=this.spd;
            if(isPlaying(walk_sound)==false){
                walk_sound.play();
            }
            this.t_angle = 270;
            if(keyIsDown(68)){
                this.front_pointer = [this.x+this.width, this.y+this.height];
            }
            else if(keyIsDown(65)){
                this.front_pointer = [this.x, this.y+this.height];
            }
            else{
                this.front_pointer = [this.x_cent, this.y+20+this.height];
            }
        }
        else if(keyIsDown(16)){
            for(let i=0; i<enemy_arr.length; i++){
                if(enemy_arr[i].state != 'dead'){
                    enemy_arr[i].display_range();
                }
            }
        }
        if(debug_mode=='player'){
            strokeWeight(3);
            stroke(255,0,0);
            fill(255,0,0);
            line(this.front_pointer[0], this.front_pointer[1], this.x_cent, this.y_cent);
        }
        push();

            translate(this.x_cent, this.y_cent);
            imageMode(CENTER);
            let angle_between = Math.atan2(this.y_cent-this.front_pointer[1], this.x_cent-this.front_pointer[0]);
            rotate(angle_between-PI/2-PI/2);
            image(plyr.animation[plyr.frame],0, 0);
        
        pop();

        this.collision();
    }
        if(this.state == 'dead'){
            this.dead();
        }
        
    }
    dead(){
        if(this.death_timer==0){
            this.death_timer=frameCount;
        }
        if(frameCount - this.death_timer > 60){
            level_restart();
        }
        image(blood, this.x, this.y, 54, 54);
        image(blood_frame, 0, 0);
    }
    collision(){
        this.pointer = [this.x_cent, this.y_cent];
        if(red(curmap.get(this.x_cent, this.y_cent))==200){
            door();
        }
        this.wall_collision();
    }
    wall_collision(){
        this.up_pointer = [this.x_cent, this.y_cent - this.width/3];
        this.down_pointer = [this.x_cent, this.y_cent + this.width/3];
        this.left_pointer = [this.x_cent-this.width/3, this.y_cent];
        this.right_pointer = [this.x_cent+this.width/3, this.y_cent];

        if(red(curmap.get(this.up_pointer[0], this.up_pointer[1]))==0){
            this.y += 2;
        }
        if(red(curmap.get(this.down_pointer[0], this.down_pointer[1]))==0){
            this.y -= 2;
        }
        if(red(curmap.get(this.right_pointer[0], this.right_pointer[1]))==0){
            this.x -= 2;
        }
        if(red(curmap.get(this.left_pointer[0], this.left_pointer[1]))==0){
            this.x += 2;
        }
        
    }
}


class regular_enemy{
    constructor(x, y, index, state, path = 0, hearing = 0){
        this.index = index;
        this.state = state;
        this.x = x;
        this.y = y;
        this.animation = zombie_ani;
        this.frame = 0;
        this.width = 54;
        this.spd = 1;
        this.hspd = 1.5;
        this.vspd = 1.5;
        this.dist;
        this.visual_range = 180;
        this.hearing_range = 250;
        this.alert_range = 110;
        this.angle = random(-2, 2);
        this.offset = 0;
        this.angle_between;
        this.view_range = 0.9;
        this.attracted = false;
        this.path_pointer = path;
        this.cur = 0;
        this.cur_path_pointer = path[this.cur];
        this.path_multiplier = 1;
        this.t = 0;
        this.state_frame = 0;
        this.pointer_arr = new Queue();
        this.r = random(255);
        this.g = random(255);
        this.b = random(255);
        this.close_range = false;
        this.max = 0;
        this.sec = 0;
        if(hearing != 0){
            this.hearing_range = hearing;
        }
    }
    move(){
        if(this.index==2){
            //console.log(this.state);
        }
        
        this.x_cent = this.x+this.width/2;
        this.y_cent = this.y+this.width/2;
        this.close_range = false;
        this.angle_between = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
        this.dist = dist(this.x_cent, this.y_cent, plyr.x_cent, plyr.y_cent);
        this.x_cent = this.x+this.width/2;
        this.y_cent = this.y+this.width/2;
        this.play_ani();
        this.state_frame ++;
        if(this.angle_between < 0){
            this.angle_between += 2*PI;
        }
        for(let i = 0; i<=2; i+=0.1){
            let len = 1;
            push();
            translate(this.x_cent, this.y_cent);
            let ptr = p5.Vector.fromAngle(i*PI, len);
            pop();

            let clr = red(curmap.get((this.x_cent + ptr.x), (this.y_cent + ptr.y)));

            while(clr != 0 && clr != null ){
                len += 10;
                ptr = p5.Vector.fromAngle(i*PI, len);
                clr = red(curmap.get((this.x_cent + ptr.x), (this.y_cent + ptr.y)));
            }
            if(len < 150){
                this.free_ptr = this.navigateSpace();
                this.close_range = true;
                break;
            }
        }
        if(this.state_frame == 60*20 && this.state != 'path'){
            this.state_frame = 0;
            this.state = 'idle';
        }
        if(this.state == 'attract'){
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
            this.angle_between = Math.atan2(this.y_cent-bugs.y, this.x_cent-bugs.x);
            if(dist(this.x, this.y, bugs.x, bugs.y)>50){
                this.m = createVector(this.x_cent-bugs.x, this.y_cent-bugs.y);
                this.m.normalize();
                this.x -= this.m.x * this.vspd;
                this.y -= this.m.y * this.hspd;
            }
            push();
            fill(0);
            stroke(0);
            strokeWeight(1);
            text('???', this.x_cent, this.y-10);
            pop();
            this.rotateBy(this.angle_between);
        }
        else if(this.state == 'path'){
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
            this.visual_range = 180;
            this.hearing_range = 190;
            this.alert_range = 100;
            this.vspd = 0.5;
            this.hspd = 0.5;
            this.m = createVector(this.x_cent-this.cur_path_pointer[0], this.y_cent-this.cur_path_pointer[1]);
            this.angle_between = Math.atan2(this.y_cent-this.cur_path_pointer[1], this.x_cent-this.cur_path_pointer[0]);
            this.m.normalize();
            this.x -= this.m.x * this.vspd;
            this.y -= this.m.y * this.hspd;
            if(dist(this.x_cent, this.y_cent, this.cur_path_pointer[0], this.cur_path_pointer[1])<1 ){
                if(this.cur == this.path_pointer.length-1){
                    this.path_multiplier = -1;
                }
                else if(this.cur == 0){
                    this.path_multiplier = 1;
                }
                this.cur += this.path_multiplier;
                this.cur_path_pointer = this.path_pointer[this.cur];
            }

            this.rotateBy(this.angle_between);

        }
        if(this.dist < this.visual_range && this.angle_between > this.angle - this.view_range && this.angle_between < this.angle + this.view_range){
            this.state = 'track';
            this.hspd = 1.5;
            this.vspd = 1.5;
            push();
            fill(212, 68, 32);
            stroke(212, 89, 32);
            strokeWeight(1);
            text('!!!', this.x_cent-10, this.y-10);
            pop();
        }
        else if(this.dist < this.hearing_range){
            this.state = 'sensed';
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
        }
        if(this.dist < this.alert_range  && this.state != 'track' && this.state != 'alerted'){
            this.state = 'alerted';
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
        }
        if(this.state == 'track'){
            if(isPlaying(chase_sound)==false){
                chase_sound.play();
            }
            this.m = createVector(this.x_cent-plyr.x_cent, this.y_cent-plyr.y_cent);
            this.m.normalize();
            this.x -= this.m.x * this.vspd;
            this.y -= this.m.y * this.hspd;
            this.rotateBy(this.angle_between);
        }
        else if(this.state == 'idle'){
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
            this.rotateBy(this.angle);
            this.perlin_rotate_reg();
        }
        else if(this.state == 'sensed'){
            //this.angle = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
            this.zomb_navi_sensed();
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
        }
        else if(this.state == 'alerted'){
            if(isPlaying(breath_sound)==false){
                breath_sound.play();
            }
            this.angle = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
            if(this.angle<0){
                this.angle += 2*PI;
            }
            this.perlin_rotate_fixed(0.1);
            this.rotateBy(this.angle);
        }

        this.check_collision();

    }
    perlin_rotate_fixed(scale){
        this.offset = this.offset + random(0.001, 0.01);
        let n = noise(this.offset)*scale-0.05;
        this.angle += n;
        if(this.angle < 0){
            this.angle += 2*PI;
        }
    }
    zomb_navi_sensed(){
        this.navigateSpace();
        let v = p5.Vector.fromAngle(this.angle, 10);
        if(this.close_range == true){
            push();
            translate(this.x_cent, this.y_cent);
            let ang = Math.atan2(this.free_ptr.y, this.free_ptr.x);
            ang += PI;
            let t = p5.Vector.fromAngle(ang, 200);
            fill(0);
            circle(t.x, t.y, 10);
            pop();
            if(ang/PI - this.angle/PI < 0){
                //console.log('sub_angle, desired: '+(ang/PI)+' actual: '+(this.angle/PI));
                this.angle -= 0.008*PI;
                if(this.max<200){
                    this.angle -= PI;
                    console.log('turnning');
                }
            }
            else{
                this.angle += 0.008*PI;9
                if(this.max<200){
                    this.angle += PI;
                    console.log('turnning'+this.max);
                }

            }
            let dif = ang/PI - this.angle;
            this.perlin_rotate_fixed(0.1);
            v = p5.Vector.fromAngle(this.angle, 100);
            push();
            translate(this.x_cent, this.y_cent);
            line(0, 0, -v.x, -v.y);
            stroke(245,40,145);
            strokeWeight(4);
            line(0, 0, this.free_ptr.x, this.free_ptr.y);
            pop();
            v.normalize();
            this.x -= v.x * 0.2;
            this.y -= v.y * 0.2;
        }
        else{
            v.normalize();
            this.x -= v.x * 0.2;
            this.y -= v.y * 0.2;
            this.perlin_rotate_fixed(0.1);
        }
        this.rotateBy(this.angle);
        push();
        fill(212, 164, 32);
        stroke(212, 164, 32);
        strokeWeight(1);
        text('???', this.x_cent-10, this.y-10);
        pop();
    }
    perlin_rotate_reg(){
        this.offset = this.offset + random(0, 0.01);
        let n = noise(this.offset)*4-2;
        this.angle = n;
    }
    rotateBy(angle){
        push();
        translate(this.x_cent, this.y_cent);
        imageMode(CENTER);
        rotate(angle-PI/2);
        image(this.animation[this.frame],0, 0, 54, 54);
        this.angle = angle;
        pop();
    }
    display_range(){
        if(opacity < 60){
            opacity += 0.3;
        }
        fill(255, 255, 255, opacity);
        stroke(255, 255,255, opacity+30);
        ellipse(this.x_cent, this.y_cent, this.hearing_range*2);
        push();
        fill(73, 132, 245, opacity);
        stroke(0, 75, 194, opacity+40);
        strokeWeight(1);
        let v = p5.Vector.fromAngle(this.angle, this.visual_range);
        let v2 = p5.Vector.fromAngle(this.angle-this.view_range, this.visual_range);
        let v3 = p5.Vector.fromAngle(this.angle+this.view_range, this.visual_range);
        translate(this.x_cent, this.y_cent);
        line(0, 0, -v.x, -v.y);
        line(0, 0, -v2.x, -v2.y);
        line(0, 0, -v3.x, -v3.y);


        
        arc(0, 0, this.visual_range*2, this.visual_range*2, (this.angle-this.view_range)-PI,(this.angle+this.view_range)-PI);
        noFill();
        circle(0, 0, this.visual_range*2);
        fill(192, 71, 1, opacity);
        stroke(0, 75, 194, opacity+40);
        ellipse(0, 0, this.alert_range*2);
        pop();
    }
    navigateSpace(){
        this.max = 0;
        this.sec = 0;
        let maxptr;
        for(let i = this.angle/PI-3/7+1; i<=this.angle/PI+3/7+1; i+=0.05){
            let len = 1;
            push();
            translate(this.x_cent, this.y_cent);
            let ptr = p5.Vector.fromAngle(i*PI, len);
            pop();

            let clr = red(curmap.get((this.x_cent + ptr.x), (this.y_cent + ptr.y)));

            while(clr != 0 && clr != null ){
                len += 10;
                ptr = p5.Vector.fromAngle(i*PI, len);
                clr = red(curmap.get((this.x_cent + ptr.x), (this.y_cent + ptr.y)));
            }
            this.pointer_arr.enqueue([ptr, len]);
            if(len>this.max){
                this.sec = this.max;
                this.max = len;
                maxptr = ptr;
            }

        }
        if(debug_mode==true){
            for(let i = 0; i<=this.pointer_arr.length+1; i++){
                let ptr = this.pointer_arr.dequeue()[0];
                push();
                translate(this.x_cent, this.y_cent);
                stroke(this.r,this.g,this.b);
                line(0, 0 , ptr.x, ptr.y);
                pop();
            }
        }
        let v2 = p5.Vector.fromAngle(this.angle-this.view_range, this.visual_range/3);
        let v3 = p5.Vector.fromAngle(this.angle+this.view_range, this.visual_range/3);
        let left = red(curmap.get((this.x_cent - v2.x), (this.y_cent - v2.y)));
        let right = red(curmap.get((this.x_cent - v3.x), (this.y_cent - v3.y)));
        if(debug_mode){
            ellipse(this.x_cent - v2.x, this.y_cent - v2.y, 10);
            ellipse(this.x_cent - v3.x, this.y_cent - v3.y, 10);
        }

        if(this.index == 2){
        }
        if(left==0 && right != 0){
            this.angle += 0.01*PI;
        }
        else if(left != 0 && right == 0){
            this.angle -= 0.01*PI;
        }
        else if(left == 0 && right == 0){
            this.angle += PI;
        }
        return maxptr;



        
    }

    check_collision(){
        //check enemy collision
        for(let i=0; i<enemy_arr.length; i++){
            if(dist(this.x_cent, this.y_cent, enemy_arr[i].x_cent, enemy_arr[i].y_cent)<this.width){
                this.m = createVector(this.x_cent-enemy_arr[i].x_cent, this.y_cent-enemy_arr[i].y_cent);
                this.m.normalize();
                this.x += this.m.x * this.vspd;
                this.y += this.m.y * this.hspd;
            }
        }
        if(dist(this.x_cent, this.y_cent, plyr.x_cent, plyr.y_cent)<40){
            this.m = createVector(this.x_cent-plyr.x_cent, this.y_cent-plyr.y_cent);
            this.m.normalize();
            this.x += this.m.x * this.vspd;
            this.y += this.m.y * this.hspd;
            plyr.state = 'dead';
        }
        this.wall_collision();
    }

    

    wall_collision(){
        this.up_pointer = [this.x_cent, this.y_cent - this.width/3];
        this.down_pointer = [this.x_cent, this.y_cent + this.width/3];
        this.left_pointer = [this.x_cent-this.width/3, this.y_cent];
        this.right_pointer = [this.x_cent+this.width/3, this.y_cent];


        if(debug_mode == true){
            ellipse(this.up_pointer[0], this.up_pointer[1], 5);
            ellipse(this.down_pointer[0], this.down_pointer[1], 5);
            ellipse(this.left_pointer[0], this.left_pointer[1], 5);
            ellipse(this.right_pointer[0], this.right_pointer[1], 5);
        }
        if(red(curmap.get(this.up_pointer[0], this.up_pointer[1]))==0){
            this.y += 2;
        }
        if(red(curmap.get(this.down_pointer[0], this.down_pointer[1]))==0){
            this.y -= 2;
        }
        if(red(curmap.get(this.right_pointer[0], this.right_pointer[1]))==0){
            this.x -= 2;
        }
        if(red(curmap.get(this.left_pointer[0], this.left_pointer[1]))==0){
            this.x += 2;
        }
        
    }
    play_ani(){
        if(this.state == 'idle'){
            if(frameCount%60 == 0){
                this.frame ++;
            }
        }
        else if(this.state == 'sensed' || this.state == 'alerted'){
            if(frameCount%20 == 0){
                this.frame ++;
            }
        }
        else{
            if(frameCount%5 == 0){
                this.frame ++;
            }
        }
        if(this.frame >= this.animation.length){
            this.frame = 0;
        }
    }
}

class keys{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.status = true;
    }
    display(){
        if(this.status == true){
            image(key_img, this.x, this.y, 48, 48);
        }
        else{
            image(key_img, canvas_x-80, canvas_y-80, 48, 48);
        }
        if(dist(this.x, this.y, plyr.x, plyr.y) < 60 && this.status == true){
            this.status = false;
            key_status = true;
            if(isPlaying(pickup_sound)==false){
                pickup_sound.play();
            }
        }
    }
}

class bug{
    constructor(x, y, targetx, targety){
        this.x = x;
        this.y = y;
        this.targetx = targetx;
        this.targety = targety;
        this.spd = 1;
        this.m = createVector(this.x-targetx, this.y-targety);
        this.m.normalize();
        this.ani_index = 0;
        this.sing = false;
    }
    move(){

        if(this.sing == false){
            if(dist(this.x, this.y, this.targetx, this.targety)<5){
                this.sing = true;
            }
            this.x -= this.m.x * this.spd;
            this.y -= this.m.y * this.spd;
        }
        else{
            for(let i=0; i<enemy_arr.length; i++){
                let zomb = enemy_arr[i];
                if(dist(zomb.x_cent, zomb.y_cent, this.x, this.y)<zomb.hearing_range && zomb.attracted == false){
                    zomb.state = 'attract';
                    zomb.attracted = true;
                }
            }
        }

        image(bug_ani[this.ani_index], this.x, this.y, 32, 48);
        if(this.ani_index == bug_ani.length-1){
            this.ani_index = -1;
        }
        this.ani_index ++;
        
    }
}

function mouseClicked(){
    if(state == 'start' && frameCount > 50){
        state = 'game';
        map_index = 0;
        game_time = frameCount;
        level_start();
    }
    if(state == 'end'){
        state = 'start';
    }
    var gx = int(mouseX / cellSize);
    var gy = int(mouseY / cellSize);
    test_arr.push([gx,gy]);
    console.log(bug_status);
    if(bug_status == false && state == 'game' && frameCount - game_time > 20 && game_time != 0){
        bugs = new bug(plyr.x, plyr.y , mouseX, mouseY);
        bug_status = true;
    }
}

function keyPressed(){
    if(keyCode==16){
        opacity = 10;
        if(isPlaying(heartbeat_sound)==false){
            heartbeat_sound.play();
        }
    }
}

function keyReleased(){
    if(keyCode==16){
        if(isPlaying(heartbeat_sound)==true){
            heartbeat_sound.pause();
        }
    }
}

function door(){
    if(map_index == 4 && key_status==true){
        state = 'end';
    }
    else if(key_status==true){
        map_index++;
        level_start();
    }
}

class Queue{
    constructor(){
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element){
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue(){
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    get length(){
        return this.tail - this.head;
    }
    get isEmpty(){
        return this.length === 0;
    }
    printQueue(){
        var str = "";
        for(var i = 0; i < this.elements.length; i++)
            str += this.elements[i] +" ";
        return str;
}
    
}

class Creature {

    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.nodeX = int( this.x / cellSize );
      this.nodeY = int( this.y / cellSize );
      this.desiredX = grid[this.nodeX][this.nodeY].nextX * cellSize + 0.5*cellSize;
      this.desiredY = grid[this.nodeX][this.nodeY].nextY * cellSize + 0.5*cellSize;
      this.color = color( random(255), random(255), random(255) );
      this.nodeHistory = [];
      this.nodeHistory.push([this.nodeX, this.nodeY]);
      this.dead = false;
      this.animation = special_ani;
      this.frame = 0;
      this.state = 'idle';
      this.hearing_range = 300;
      this.visual_range = 250;
      this.alert_range = 100;
      this.distPlayer = 1000;
      this.angle = 0;
      this.offset;
      this.width = 54;
      this.x_cent = this.x -= this.width/2;
      this.y_cent = this.y -= this.width/2;
      this.view_range = 0.9;
    }
  
    display() {
        if(isNaN(this.desiredX)){
            this.nodeX = int( this.x / cellSize );
            this.nodeY = int( this.y / cellSize );
            console.log(this.nodeX);
            this.desiredX = grid[this.nodeX][this.nodeY].nextX * cellSize + 0.5*cellSize;
            this.desiredY = grid[this.nodeX][this.nodeY].nextY * cellSize + 0.5*cellSize;
        }
        if(this.state != 'dead'){
            console.log(this.desiredX, this.desiredY);
            this.x_cent = this.x - this.width/2;
            this.y_cent = this.y - this.width/2;
            this.state_detect();
            this.play_ani();
            if(dist(this.x, this.y, plyr.x, plyr.y) < 40){
                plyr.state = 'dead';
            }

            if (!this.dead && this.state == 'persuit') {
                if(isPlaying(chase_sound)==false){
                    chase_sound.play();
                }
                this.angle = Math.atan2(this.y-this.desiredY, this.x-this.desiredX);
                this.rotateBy(this.angle);
                this.move();
            }
            else if(!this.dead && this.state == 'alert'){
                if(isPlaying(breath_sound)==false){
                    breath_sound.play();
                }
                this.perlin_rotate_fixed(0.1);
                this.rotateBy(this.angle);
            }
            else if(!this.dead && this.state == 'idle'){
                if(isPlaying(breath_sound)==false){
                    breath_sound.play();
                }
                this.rotateBy(this.angle);
            }
            if(keyIsDown(16)){
                for(let i=0; i<special_enemy_arr.length; i++){
                    if(special_enemy_arr[i].state != 'dead'){
                        special_enemy_arr[i].display_range();
                    }
                }
            }
        }
    }

    rotateBy(angle){
        push();
        translate(this.x, this.y);
        imageMode(CENTER);
        rotate(angle-PI/2);
        image(this.animation[this.frame],0, 0, 54, 54);
        this.angle = angle;
        pop();
    }

    state_detect(){
        this.distPlayer = dist(this.x_cent, this.y_cent, plyr.x_cent, plyr.y_cent);
        if(this.distPlayer < this.hearing_range && this.distPlayer > this.visual_range && this.state != 'persuit'){
            this.state = 'alert';
        }
        else if(this.distPlayer < this.visual_range){
            this.state = 'persuit';
        }
    }
    perlin_rotate_fixed(scale){
        this.offset = this.offset + random(0.001, 0.01);
        let n = noise(this.offset)*scale-0.05;
        this.angle += n;
        if(this.angle < 0){
            this.angle += 2*PI;
        }
    }
    display_range(){
        if(opacity < 60){
            opacity += 0.3;
        }
        fill(255, 255, 255, opacity);
        stroke(255, 255,255, opacity+30);
        ellipse(this.x, this.y, this.hearing_range*2);
        push();
        fill(73, 132, 245, opacity);
        stroke(0, 75, 194, opacity+40);
        strokeWeight(1);
        let v = p5.Vector.fromAngle(this.angle, this.visual_range);
        let v2 = p5.Vector.fromAngle(this.angle-this.view_range, this.visual_range);
        let v3 = p5.Vector.fromAngle(this.angle+this.view_range, this.visual_range);
        translate(this.x, this.y);
        line(0, 0, -v.x, -v.y);
        line(0, 0, -v2.x, -v2.y);
        line(0, 0, -v3.x, -v3.y);


        
        arc(0, 0, this.visual_range*2, this.visual_range*2, (this.angle-this.view_range)-PI,(this.angle+this.view_range)-PI);
        noFill();
        circle(0, 0, this.visual_range*2);
        fill(192, 71, 1, opacity);
        stroke(0, 75, 194, opacity+40);
        ellipse(0, 0, this.alert_range*2);
        pop();
    }
    play_ani(){
        if(this.state == 'idle'){
            if(frameCount%60 == 0){
                this.frame ++;
            }
        }
        else if(this.state == 'sensed' || this.state == 'alerted'){
            if(frameCount%20 == 0){
                this.frame ++;
            }
        }
        else{
            if(frameCount%5 == 0){
                this.frame ++;
            }
        }
        if(this.frame >= this.animation.length){
            this.frame = 0;
        }
    }
  
    die() {
      this.dead = true;
    }
  
    isAtEnd() {
      if (this.nodeX == endX && this.nodeY == endY) {
        return true;
      }
      return false;
    }
  
    move() {
      if (!this.dead) {
        // move based on current movement vector
        if (this.x < this.desiredX) {
          this.x += 1;
        }
        else if (this.x > this.desiredX) {
          this.x -= 1;
        }
        if (this.y < this.desiredY) {
          this.y += 1;
        }
        else if (this.y > this.desiredY) {
          this.y -= 1;
        }
  
        // have we reached our new position?  if so, compute a new node value
        if (dist(this.x, this.y, this.desiredX, this.desiredY) < 2) {
          // snap to our desired position
          this.x = this.desiredX;
          this.y = this.desiredY;
  
          // note this position
          this.nodeHistory.push([this.nodeX, this.nodeY]);
  
          // see where we need to go next!
          this.recomputePath();
        }
      }
    }
  
    recomputePath() {
      if (!this.dead) {
        // compute new node value
        this.nodeX = int( this.x / cellSize );
        this.nodeY = int( this.y / cellSize );
  
        // add this to our node history
        this.nodeHistory.push([this.nodeX, this.nodeY]);
  
        // make sure we aren't stuck in a solid tile!
        if (grid[this.nodeX][this.nodeY].solid) {
          // find the most recently visited node that is not solid and move back there
          for (var i = this.nodeHistory.length-1; i >= 0; i--) {
            if (grid[this.nodeHistory[i][0]][this.nodeHistory[i][1]].solid === false) {
              // move back to this previous node
              this.desiredX = this.nodeHistory[i][0] * cellSize + 0.5*cellSize;
              this.desiredY = this.nodeHistory[i][1] * cellSize + 0.5*cellSize;
              break;
            }
          }

        }
        else {
          // compute new desired value
          this.desiredX = grid[this.nodeX][this.nodeY].nextX * cellSize + 0.5*cellSize;
          this.desiredY = grid[this.nodeX][this.nodeY].nextY * cellSize + 0.5*cellSize;
        }
      }
    }
  }

  function makeDeepCopy(g) {
    var gridCopy = [];
  
    for (var x = 0; x < g.length; x++) {
      var newRow = [];
  
      for (var y = 0; y < g[x].length; y++) {
        var newObj = {};
  
        for (var property in g[x][y]) {
          newObj[property] = g[x][y][property];
        }
  
        newRow.push(newObj);
      }
  
      gridCopy.push(newRow);
    }
  
    return gridCopy;
  }
  
  class explosives{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.img = bomb_new;
        this.destroyed_time = 0;
        this.state = 'new';
        this.width = 54;
        this.blood_loc = [];
        this.frame = 0;
    }
    display(){
        image(this.img, this.x, this.y);
        let dis = dist(this.x, this.y, plyr.x, plyr.y);
        if(this.state != 'new' && this.frame < 11){
            this.explosion();
        }
        if(dis < 50 && this.state == 'new'){
            if(isPlaying(explode_sound)==false){
                explode_sound.play();
            }
            if(isPlaying(hit_sound)==false){
                hit_sound.play();
            }
            this.img = bomb_destroyed;
            this.state = 'player_destroyed';
            this.destroyed_time = frameCount;
            plyr.state = 'dead';
        }
        if(this.destroyed_time != 0 && this.state == 'player_destroyed'){
            if(plyr.spd==1){
                image(blood_frame, 0, 0);
            }
            if(frameCount - this.destroyed_time > 30){
                level_restart();
            }
        }
        for(let i=0; i<special_enemy_arr.length; i++){
            if(dist(special_enemy_arr[i].x, special_enemy_arr[i].y, this.x+this.width/2, this.y+this.width/2)<50 && this.state=='new'){
                special_enemy_arr[i].state = 'dead';
                this.state = 'destroyed';
                if(isPlaying(explode_sound)==false){
                    explode_sound.play();
                }
                this.img = bomb_destroyed;
            }
            //console.log(dist(special_enemy_arr[i].x, special_enemy_arr[i].y, this.x, this.y));
        }
        for(let i=0; i<enemy_arr.length; i++){
            if(dist(enemy_arr[i].x, enemy_arr[i].y, this.x+this.width/2, this.y+this.width/2)<50 && this.state=='new'){
                enemy_arr[i].state = 'dead';
                this.state = 'destroyed';
                if(isPlaying(explode_sound)==false){
                    explode_sound.play();
                }
                this.img = bomb_destroyed;
            }
            //console.log(dist(special_enemy_arr[i].x, special_enemy_arr[i].y, this.x, this.y));
        }
    }
    explosion(){
        image(explode_ani[this.frame], this.x-10, this.y-10, this.width+60, this.width+60);
        this.frame ++;
    }
  }
  function isPlaying(audelem) { return !audelem.paused; }