function preload(){
    let images = 5;
    let path;
    walk_ani = [];
    zombie_ani = [];
    for (let i = 0; i <= images; i++){
        path = 'player/walk/tile00' + str(i) + '.png';
        walk_ani.push(loadImage(path));
    }
    for (let i = 0; i <= images; i++){
        path = 'enemy/zombies/tile00' + str(i) + '.png';
        zombie_ani.push(loadImage(path));
    }
    test = loadImage('map/test.png');
    lv1 = loadImage('map/lv1.png');
    lv2 = loadImage('map/lv2.png');
    lv3 = loadImage('map/lv3.png');
    lv_count = 2;
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
}

function setup(){
    frameRate(60);
    opacity = 0;
    debug_mode = true;
    canvas_x = 1050;
    canvas_y = 800;
    createCanvas(canvas_x,canvas_y);
    //enemy loc array
    lv1_enemy_pos = [[300,133, 'idle'], [700, 300, 'idle'], [300, 450, 'idle']];
    lv2_enemy_pos = [[550, 150, 'idle']];
    lv3_enemy_pos = [[900, 700, 'path', [[940,680], [940, 145], [135, 131]]],
                    [418, 221, 'path', [[418,221], [417, 568], [509, 625], [781, 625]]]];
    map_index = 0;
    maps = [lv1, lv2, lv3];
    key_pos = [[[473, 287]], [[939, 144]], [[659, 308], [192, 432]]];
    lv_enemy = [lv1_enemy_pos, lv2_enemy_pos, lv3_enemy_pos];
    enemy_arr = [];
    pressed = false;
    curmap = maps[map_index];
    bug_status = false;
    player_start_loc = [[540, 680], [540, 680], [50, 100]];
    level_start();
    bugs_arr = [];
    bugs = new bug();
}

function place_enemies(){
    let arr = lv_enemy[map_index];
    for(let i = 0; i<arr.length; i++){
        if(arr[i].length == 4){
            zomb = new regular_enemy(arr[i][0], arr[i][1], i, arr[i][2], arr[i][3]);
        }
        else{
            zomb = new regular_enemy(arr[i][0], arr[i][1], i, arr[i][2]);
        }
        enemy_arr.push(zomb);
    }
}

function level_start(){
    enemy_arr = [];
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
}

function level_restart(){
    curmap -= 1;
    level_start();
}

function draw(){
    background(0);
    displayMap(maps[map_index]);
    plyr.move();
    for(let i = 0; i<key_arr.length; i++){
        key_arr[i].display();
    }
    for(let i = 0; i<enemy_arr.length; i++){
        enemy_arr[i].move();
    }

    if (bug_status == true) {
        bugs.move();
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
        //walk 35*57
    }
    move(){
        this.y_cent = this.y+this.height/2;
        this.x_cent = this.x+this.width/2;
        if(frameCount%10 == 0){
            this.frame ++;
        }
        if(this.frame >= this.animation.length){
            this.frame = 0;
        }
        if(keyIsDown(65)&&keyIsDown(68)==false){
            this.x --;
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
            this.x ++;
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
            this.y --;
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
            this.y ++;
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
                enemy_arr[i].display_range();
            }
        }
        if(debug_mode==true){
            strokeWeight(3);
            stroke(255,0,0);
            fill(255,0,0);
            line(this.front_pointer[0], this.front_pointer[1], this.x_cent, this.y_cent);
            ellipse(this.front_pointer[0], this.front_pointer[1],10);
        }
        push();
            translate(this.x_cent, this.y_cent);
            imageMode(CENTER);
            let angle_between = Math.atan2(this.y_cent-this.front_pointer[1], this.x_cent-this.front_pointer[0]);
            rotate(angle_between-PI/2-PI/2);
            image(plyr.animation[plyr.frame],0, 0);
            ellipse(0, 0, 10);

        pop();

        this.collision();


        
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
}


class regular_enemy{
    constructor(x, y, index, state, path = 0){
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
        this.alert_range = 130;
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
    }
    move(){
        this.angle_between = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
        this.dist = dist(this.x_cent, this.y_cent, plyr.x_cent, plyr.y_cent);
        this.x_cent = this.x+this.width/2;
        this.y_cent = this.y+this.width/2;
        this.play_ani();
        this.state_frame ++;
        if(this.state_frame == 60*20 && this.state != 'path'){
            this.state_frame = 0;
            this.state = 'idle';
        }
        if(this.state == 'attract'){
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
            this.visual_range = 180;
            this.hearing_range = 200;
            this.alert_range = 130;
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
        }
        if(this.dist < this.alert_range  && this.state != 'track' && this.state != 'alerted'){
            this.state = 'alerted';
        }
        if(this.state == 'track'){
            this.m = createVector(this.x_cent-plyr.x_cent, this.y_cent-plyr.y_cent);
            this.m.normalize();
            this.x -= this.m.x * this.vspd;
            this.y -= this.m.y * this.hspd;
            this.rotateBy(this.angle_between);
        }
        else if(this.state == 'idle'){
            this.rotateBy(this.angle);
            this.perlin_rotate_reg();
        }
        else if(this.state == 'sensed'){
            //this.angle = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
            this.perlin_rotate_fixed();
            this.navigateSpace();
            let v = p5.Vector.fromAngle(this.angle, 10);
            this.m = createVector(this.x_cent+v.x, this.y_cent-v.y);
            v.normalize();
            this.x -= v.x * 0.2;
            this.y -= v.y * 0.2;
            this.rotateBy(this.angle);
            push();
            fill(212, 164, 32);
            stroke(212, 164, 32);
            strokeWeight(1);
            text('???', this.x_cent-10, this.y-10);
            pop();
        }
        else if(this.state == 'alerted'){
            this.angle = Math.atan2(this.y_cent-plyr.y_cent, this.x_cent-plyr.x_cent);
            this.perlin_rotate_fixed();
            this.rotateBy(this.angle);
        }

        this.check_collision();

    }
    perlin_rotate_fixed(){
        this.offset = this.offset + random(0.001, 0.01);
        let n = noise(this.offset)*0.1-0.05;
        this.angle += n;
        if(this.angle >= 2){
            this.angle -= 2;
        }
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
        fill(245, 73, 114, opacity);
        stroke(245, 73, 114, opacity+30)
        ellipse(this.x_cent, this.y_cent, this.hearing_range*2);
        push();
        fill(73, 132, 245, opacity);
        stroke(0, 75, 194, opacity+40);
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
        let v2 = p5.Vector.fromAngle(this.angle-this.view_range, this.visual_range/4);
        let v3 = p5.Vector.fromAngle(this.angle+this.view_range, this.visual_range/4);
        let left = red(curmap.get((this.x_cent - v2.x), (this.y_cent - v2.y)));
        let right = red(curmap.get((this.x_cent - v3.x), (this.y_cent - v3.y)));
        ellipse(this.x_cent - v2.x, this.y_cent - v2.y, 10);
        ellipse(this.x_cent - v3.x, this.y_cent - v3.y, 10);
        if(this.index == 2){
            console.log(left, right);
        }
        if(left==0 && right != 0){
            this.angle += 0.05;
            console.log('turnright');
        }
        else if(left != 0 && right == 0){
            this.angle -= 0.05;
            console.log('turnleft');
        }

        if(left==0 && right==0){
            this.angle -= 1;
            if(this.angle <=0){
                this.angle += 2;
            }
            console.log('turnback');
        }
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
            level_restart();
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
        if(dist(this.x, this.y, plyr.x, plyr.y) < 60){
            this.status = false;
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
    console.log(mouseX, mouseY);
    if(bug_status == false){
        bugs = new bug(plyr.x, plyr.y , mouseX, mouseY);
    }
    bug_status = true;
}

function keyPressed(){
    if(keyCode==16){
        opacity = 10;
    }
}

function door(){
    map_index++;
    level_start();
}
