let numPts = 5;
let points = [];
let path = [];
let running = false;
let isReset = true;


let runSpeed = 7;
let tick = 0;

const LARGE_NUMBER = 100000000;

let evolutions = 0;

let visited = [];
let unvisited = [];
let current = null;

let edges = [];

let permutations;
let perm_index = 0;

let i_index = 0;
let j_index = 0;

let best = null;
let best_current = null;
let best_dist = LARGE_NUMBER;

let edge_search = false;

let algorithm = "Greedy";

let adjacencyList;

let pathToFollow = [];

const canvasX = 600;
const canvasY = 600;

const resetBtn = document.getElementById("reset");
const selectedTxt = document.getElementById("current");
const timeTxt = document.getElementById("time");
const infoTxt = document.getElementById("info");
const pointsNum = document.getElementById("num");
const slider = document.getElementById("myRange");

const bruteForceBtn = document.getElementById("Brute-Force");

const time_complexities = {
    "Nearest Neighbour":"O(n^2 log2 n)",
    "Brute-Force":"O(n!)",
    "Christofides Algorithm":"O(n^2 log n)"
}

slider.oninput = function() {
    numPts = this.value;
    reset();
}

function reset(){
    points = [];
    path = [];
    running = false;
    visited = [];
    unvisited = [];
    current = null;
    isReset = true;

    evolutions = 0;

    best = null;
    best_dist = LARGE_NUMBER;


    setup();

}

function selectAlgorithm(new_algorithm){
    algorithm = new_algorithm;
    running = false;

    path = [];
    path.push(points[0]);
    evolutions = 0;

    best = null;
    best_dist = LARGE_NUMBER;
    //reset();
}


function getDistance(x_1, y_1, x_2, y_2){
    return Math.sqrt(Math.pow((x_2-x_1), 2) + Math.pow((y_2-y_1), 2));
}

function getTotalDistance(path){
    let d = 0;
    for (let i = 0; i < path.length-1; i++){
        d += getDistance(path[i].x, path[i].y, path[i+1].x, path[i+1].y);
    }
    return d;
}

function activate(){
    // Reset path
    path = [];
    path.push(points[0]);

    running = true;

    evolutions = 0;

    i_index = 0;
    j_index = 0;

    switch(algorithm){
        case "Nearest Neighbour":
            // Set up variables for algorithm
            visited.push(points[0]);
            unvisited = [...points];
            unvisited.shift();
            current = points[0];
            break;

        case "Brute-Force":
            unvisited = [...points];
            unvisited.shift();
            permutations = permutator(unvisited);
            perm_index = 0;
            break;

        case "Christofides Algorithm":
            path = [];
            edges = [];

        
            unvisited = [...points];
            unvisited.splice(0, 1);
            visited = [];
            visited.push(points[0]);

            i_index = 0;

            while(unvisited.length > 0){
                best_dist = LARGE_NUMBER;
                for (let i=0; i<visited.length;i++){
                    for (let j=0; j<unvisited.length;j++){
                        d = getDistance(visited[i].x, visited[i].y, unvisited[j].x, unvisited[j].y);
                        if (d < best_dist){
                            best_dist = d;
                            best = unvisited[j];
                            current_i = j;
                            best_current = visited[i];
                        }
                    }
                }

                edges.push([best_current, best]);

                unvisited.splice(current_i, 1);
                visited.push(best);

            }
            path = [];
            for(let i=0; i<edges.length;i++){
                path.push(edges[i][0]);
                path.push(edges[i][1]);
            }
            


            adjacencyList = new Map();

            points.forEach(addNode);
            edges.forEach(edge => addEdge(...edge));

            path = Array.from(treeRoute(points[0]));
            path.push(points[0]);
            break;
    }
  
}

function addNode(node){
    adjacencyList.set(node, []);
}

function addEdge(origin, destination){
    adjacencyList.get(origin).push(destination);
    adjacencyList.get(destination).push(origin);
}

function treeRoute(origin, visited = new Set()){
    visited.add(origin);
    const destinations = adjacencyList.get(origin);

    for(const destination of destinations){
        if(!visited.has(destination)){
            result = treeRoute(destination, visited);
            for (const visit of result){
                visited.add(visit)
            }
        }
    }

    return visited;
}

const permutator = (inputArr) => {
    let result = [];
  
    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
       }
     }
   }
  
   permute(inputArr)

   return result;
  }


// p5.js Code

function setup() {
    createCanvas(canvasX, canvasY);
    for(let i =0; i< numPts; i++){
        let new_x = random(10, canvasX-10);
        let new_y = random(10, canvasY-10);

        points.push({
            x: new_x,
            y: new_y,
            state: 0
        });
    }
    path.push(points[0]);
}

function draw() {

    pointsNum.innerHTML = "Number of Points: " + numPts;
    selectedTxt.innerHTML = "Selected Algorithm: " + algorithm;
    timeTxt.innerHTML = "Time Complexity: " + time_complexities[algorithm];
    infoTxt.innerHTML = "Evolution no. " + evolutions + " | Total Distance: " + getTotalDistance(path);

    if(numPts > 8){
        bruteForceBtn.disabled = true;
    }else{
        bruteForceBtn.disabled = false;
    }

    background(220);
  
    drawEllipses();
    drawLines(path);
    tick++;
        if (running){
            switch(algorithm){
                case "Nearest Neighbour":
                    if (tick % runSpeed == 0){
                        if(unvisited === []){
                            running = false;
                        }
                        else{
                            let current_i = null;
                            let invalid_count = 0;
                            for (let i=0; i < unvisited.length; i++){
                                evolutions++;
                                if (unvisited[i] != undefined){
                                    let d = getDistance(current.x, current.y, unvisited[i].x, unvisited[i].y);
                                    if (d < best_dist){
                                        best_dist = d;
                                        best = unvisited[i];
                                        current_i = i;
                                    }
                                }
                                else{
                                    invalid_count++;
                                }
                            }
        
                            if (invalid_count === unvisited.length){
                                path.push(points[0]);
                                running = false;
                            }
                            
                            delete unvisited[current_i];
                            path.push(best)
                            current = best;
                            best_dist = LARGE_NUMBER;
                        }
                    }
                    break;

                case "Brute-Force":
                    if (perm_index === permutations.length){
                        path.push(points[0]);
                        running = false;
                    }
                    else{
                        evolutions++;
                        let d = getTotalDistance(permutations[perm_index]);
                        if (d < best_dist){
                            best_dist = d;
                            path = [];
                            path.push(points[0]);
                            for (let i=0; i<permutations[perm_index].length; i++){
                                path.push(permutations[perm_index][i]);
                            }
                        }
                        perm_index++;
                    }

                    break;
            }
        }
}
    

function drawEllipses(){
  noStroke();
  for(let i =0; i < points.length; i++){
    if (i === 0){
        fill(200, 0, 255);
    }else if (points[i].state === 1){
        fill(0, 200, 0)
    }else{
        fill(255, 255, 255)
    }
    let x = points[i].x;
    let y = points[i].y;
    ellipse(x, y, 7);
  }
}

function drawLines(path){
    if (path != null && path.length > 1){
        stroke(0);
        for (let i=0; i < path.length-1; i++){
            line(path[i].x, path[i].y, path[i+1].x, path[i+1].y)
        }
    }
}