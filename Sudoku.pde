int boardSize = 450;
int gap = 2;
PVector selectedNumber;
int x = 0;
int y = 0;
int[][] mem = new int[9][9];
boolean exit = false;
PFont font;

class Tile {
  int value = 0;
  PVector pos;
  int size = 50 - gap;
  boolean selected = false;
  
  
  Tile(float x, float y) {
    pos = new PVector(x, y);
  }
  
  void show() {
    stroke(150, 150, 150);
    rect(pos.x, pos.y, size, size);
    textFont(font, (size / 4) * 3);
    fill(0, 0, 0);
    if (value != 0) text(value, pos.x + (size / 3), pos.y + (size - (size / 4)));
    fill(255, 255, 255);
  }
  
  void setValue(int nr) {
    value = nr;
  } 
  
  int getValue() {
    return value;
  }
  
  void select() {
    selected = true;
  }
  
  void unselect() {
    selected = false;
  }
  
  boolean isSelected() {
    return selected;
  }
  
  void drawSelected() {
    stroke(0, 0, 0);
    strokeWeight(3);
    rect(pos.x, pos.y, size, size);
    strokeWeight(1);
    stroke(150, 150, 150);
    textFont(font, (size / 4) * 3);
    fill(0, 0, 0);
    if (value != 0) text(value, pos.x + (size / 3), pos.y + (size - (size / 4)));
    fill(255, 255, 255);
  }
}

Tile[][] tiles = new Tile[9][9];

void setup() {
  frameRate(60);
  size(450, 450);
  colorMode(RGB);
  font = createFont("Arial", 16, true);
  
  for (int i = 0; i < 9; i++) {
    for (int j = 0; j < 9; j++) {
      tiles[i][j] = new Tile(i * 50, j * 50);
    }
  }
  tiles[0][0].select();
  selectedNumber = new PVector(x, y);
  selectedNumber.x = 0;
  selectedNumber.y = 0;
  int row = 0;
  int col = 0;
  int bfr = 0;
  int number = 0;
  int attempts = 0;
  int attemptsX = 0;
  boolean validNumber = false;
  boolean override = false;
  
  for (int boxX = 0; boxX < 3; boxX++) {
    for (int boxY = 0; boxY < 3; boxY++) {
      print("| Box (", boxX, boxY, "): ");
      attempts = 0;
      for (int cellX = 0; cellX < 3; cellX++) {
        for (int cellY = 0; cellY < 3; cellY++) {
           validNumber = false;
           row = (boxX * 3) + cellX;
           col = (boxY * 3) + cellY;
           while (!validNumber) {
             if (!override) {
               float rand = random(9);
               number = int(rand) + 1;
             }
             else {
               if (number == 9) number = 1;
               else number++;
             }
             
             override = false;
             
             bfr = 0;
             for (int i = 0; i < 9; i++) {
               if (number == tiles[row][i].getValue()) bfr++;
               if (number == tiles[i][col].getValue()) bfr++;
             }
             
             for (int i = 0; i < 3; i++) {
               for (int j = 0; j < 3; j++) {
                 if (number == tiles[(boxX * 3) + i][(boxY * 3) + j].getValue()) bfr++;
               }
             }
                         
             if (bfr == 0) {
               validNumber = true;
               print(number, "");
               tiles[row][col].setValue(number);
             }
             else attempts++;
             if (attempts > 50) {
               attempts = 0;
               attemptsX++;
               override = true;
               validNumber = true;
             }
             if (attemptsX > 9) {
               cellX = 0;
               cellY = 0;
               validNumber = true;
             }
           }
        }
      }
    }
  }
  print("\nActivity log:\n");
  
}

void draw() {
  if (!exit) {
    strokeWeight(1);
    fill(255, 255, 255);
    for (int i = 0; i < 9; i++) {
      for (int j = 0; j < 9; j++) {
        if (tiles[i][j].isSelected()) tiles[i][j].drawSelected();
        else tiles[i][j].show();
        
        stroke(255, 255, 255);
        line((i * 50 - 1), 0, (i * 50 - 1), boardSize);
        line(0, (i * 50 - 1), boardSize, (i * 50 - 1));
        stroke(150, 150, 150);
      }
    }
    stroke(0, 0, 0);
    strokeWeight(2);
    for (int i = 0; i < 4; i++) {
      line((i * 150) - 1, 0, (i * 150 - 1), boardSize);
    }
    for (int i = 0; i < 4; i++) {
      line(0, (i * 150) - 1, boardSize, (i * 150 - 1));
    }
  }
  
}

void keyPressed() {
  switch(key) {
    case CODED:
      switch(keyCode) {
        case UP:
          if (selectedNumber.y > 0) {
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].unselect();
            selectedNumber.y -= 1;
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].select();
            print("up -> ");
          }
          break;
        case DOWN:
          if (selectedNumber.y < 8) {
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].unselect();
            selectedNumber.y += 1;
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].select();
            print("down -> ");
          }
          break;
        case LEFT:
          if (selectedNumber.x > 0) {
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].unselect();
            selectedNumber.x -= 1;
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].select();
            print("left -> ");
          }
          break;
        case RIGHT:
          if (selectedNumber.x < 8) {
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].unselect();
            selectedNumber.x += 1;
            tiles[int(selectedNumber.x)][int(selectedNumber.y)].select();
            print("right -> ");
          }
          break;
      }
  }
  
  if (key >= '1' && key <= '9') { 
    print("tile (", int(selectedNumber.x), int(selectedNumber.y), ") changed from", tiles[int(selectedNumber.x)][int(selectedNumber.y)].getValue());
    tiles[int(selectedNumber.x)][int(selectedNumber.y)].setValue(key - 48);
    print(" to", tiles[int(selectedNumber.x)][int(selectedNumber.y)].getValue(), "-> ");
  }
}
