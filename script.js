const grid = document.getElementById('grid-container');
const ChangeEndButton = document.getElementById("change-end-button")
const ChangeStartButton = document.getElementById("change-start-button")
const StartButton =document.getElementById("start-button")
const StopButton = document.getElementById("stop-button");
const ResetButton = document.getElementById("reset-button")

let startNode = null;
let endNode = null;
let mouseDown = false;
let algorithmRunning = false;
let stopRequest = false;

const gridData = [];

const ROW = 20;
const COL = 20;

document.body.classList.add("placing-start")

for (let row = 0; row < ROW; row++) {

    const currentRow = [];

    for (let col = 0; col < COL; col++) {

        const cell = document.createElement("div");

        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.classList.add("cell");

        const node = {
            row: row,
            col: col,
            isWall: false,
            distance: Infinity,

            gCost: Infinity,
            hCost: 0,
            fCost: Infinity,

            visited: false,
            element: cell,


        };

        cell.addEventListener("click", () => {

        console.log("Row:", cell.dataset.row, "Column:",cell.dataset.col);

        if (!startNode) {

            startNode = node;
            cell.classList.add("start");

            document.body.classList.remove("placing-start")
            document.body.classList.add("placing-end");
            
            return;
        }

        if (!endNode && node !== startNode) {

            endNode = node;
            cell.classList.add("end");

            document.body.classList.remove("placing-end");
            document.body.classList.add("placing-walls");

            return;
        }

    });

    cell.addEventListener("mouseenter", () => {

    if (
        !document.body.classList.contains("placing-walls")
    ) return;

    if (algorithmRunning) return;

    if (
    !mouseDown ||
    !document.body.classList.contains("placing-walls")) {
    return;
}

    if (node === startNode || node === endNode) return;

        node.isWall = true;
        cell.classList.add("wall");

    });

        currentRow.push(node);

        grid.appendChild(cell);

    }

        gridData.push(currentRow);
    
}

StartButton.addEventListener("click", () => {
    const algorithm = document.getElementById("select-algorithm").value;

    if (algorithm === "dijkstra") {
        dijkstra();
    }

    else if (algorithm === "bfs") {
        bfs();
    }

    else if (algorithm === "dfs") {
        dfs();
    }

    else if (algorithm === "astar") {
        astar();
    }

});

StopButton.addEventListener("click", () => {
    stopRequest = true;
});

ResetButton.addEventListener("click", resetGrid);

document.getElementById("select-algorithm")
.addEventListener("change", () => {

    clearPathData();

    mouseDown = false;

});

document.addEventListener("mouseup", () => {
    mouseDown = false;

});

document.addEventListener("mousedown", () => {
    mouseDown = true;
});



ChangeEndButton.addEventListener("click", () => {

    if (!endNode) return;

    endNode.element.classList.remove("end");

    endNode = null;

    document.body.classList.remove("placing-start","placing-walls");
    document.body.classList.add("placing-end");

});
    
ChangeStartButton.addEventListener("click", () => {

    if (!startNode) return;

    startNode.element.classList.remove("start");

    startNode = null;

    document.body.classList.remove("placing-end","placing-walls");
    document.body.classList.add("placing-start");

});

function getNeighbors(node) {

    const { row, col } = node;

    const neighbors = [];

    if (row > 0) {
        neighbors.push(gridData[row-1][col]);

    }

    if (row < ROW - 1) {
        neighbors.push(gridData[row+1][col]);

    }

    if (col > 0) {
        neighbors.push(gridData[row][col-1]);

    }

    if (col < COL -1) {
        neighbors.push(gridData[row][col+1]);

    }
    
    return neighbors;

}

function getAllNodes() {

    const nodes = [];

    for (const row of gridData) {

        for (const node of row) {

            nodes.push(node);
            
        }

 }

 return nodes;

}

function updateNeighbors(node) {

    const neighbors = getNeighbors(node);

    for (const neighbor of neighbors) {

        if (neighbor.visited) continue;        
        if (neighbor.isWall) continue;

        const newDistance = node.distance + 1;

        if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance;
            neighbor.previousNode = node;

        }

    }
    
}

function sortNodesByDistance(nodes) {

    nodes.sort((a, b) => (a.distance - b.distance));

}
function clearPathData() {

    document.getElementById("visited-count").textContent = 0;
    document.getElementById("path-length").textContent = 0;

    for (const row of gridData) {

        for (const node of row) {

            node.distance = Infinity;
            node.visited = false;
            node.previousNode = null;

            node.gCost = Infinity;
            node.hCost = 0;
            node.fCost = Infinity;

            node.element.classList.remove(
                "visited",
                "shortest-path"
            );

        }
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function heuristic(nodeA, nodeB) {

    return(
        Math.abs(nodeA.row - nodeB.row) + 
        Math.abs(nodeA.col - nodeB.col)
    );
}

function sortNodesByFCost(nodes) {
    nodes.sort((a,b) => a.fCost-b.fCost);

}

async function dijkstra() {

    let visitedCount = 0;

    algorithmRunning = true;

    stopRequest = false

    if (!startNode || !endNode) {
        alert("Select a start and an end node first");
        algorithmRunning = false;
        return;
        
    }

    clearPathData();

    startNode.distance = 0;

    const unvisitedNodes = getAllNodes();

    while (unvisitedNodes.length) {

        if (stopRequest) {
            algorithmRunning = false;
            return;
        }

        sortNodesByDistance(unvisitedNodes);

        const closestNode = unvisitedNodes.shift();

        if (closestNode.visited) continue;
        if (closestNode.isWall) continue;

        if (closestNode.distance === Infinity) break;
        
        visitedCount++;

        closestNode.visited = true;

        if (closestNode !== startNode && closestNode !== endNode) {
            closestNode.element.classList.add("visited");
         }

        await sleep(50);

        if (closestNode === endNode) {
            document.getElementById("visited-count").textContent = visitedCount;
            console.log("End node reached!");
            algorithmRunning = false;
            await drawShortestPath();
            return;
        }

        updateNeighbors(closestNode);

    }

    algorithmRunning = false;
    mouseDown = false

}
async function bfs(){

    algorithmRunning = true;

    stopRequest = false

    let visitedCount = 0

    if (!startNode || !endNode) {
        alert("Select a start and an end node first");
        algorithmRunning = false;
        return;
    }
    
    clearPathData();

    const queue =[];

    startNode.visited = true;

    queue.push(startNode);

    while (queue.length > 0) {

        if (stopRequest) {
            algorithmRunning = false;
            return;
        }

        const currentNode = queue.shift();

        visitedCount++;

        if (currentNode !== startNode && currentNode !== endNode) {
            currentNode.element.classList.add("visited");

        }

        await sleep(50);

        if (currentNode === endNode) {

            document.getElementById("visited-count").textContent = visitedCount;

            await drawShortestPath();

            algorithmRunning = false;

            return;
        }

        const neighbors = getNeighbors(currentNode);

        for (const neighbor of neighbors) {

            if (neighbor.visited) continue;

            if (neighbor.isWall) continue;

            neighbor.visited = true;

            neighbor.previousNode = currentNode;

            queue.push(neighbor);

        }
        
    }
    algorithmRunning = false;
    mouseDown = false
}


async function dfs(){

    algorithmRunning = true;

    stopRequest = false

    let visitedCount = 0

    if (!startNode || !endNode) {
        alert("Select a start and an end node first");
        algorithmRunning = false;
        return;
    }
    
    clearPathData();

    const stack =[];

    startNode.visited = true;

    stack.push(startNode);

    while (stack.length > 0) {

        if (stopRequest) {
            algorithmRunning = false;
            return;
        }

        const currentNode = stack.pop();

        visitedCount++;

        if (currentNode !== startNode && currentNode !== endNode) {
            currentNode.element.classList.add("visited");

        }

        await sleep(50);

        if (currentNode === endNode) {

            document.getElementById("visited-count").textContent = visitedCount;

            await drawShortestPath();

            algorithmRunning = false;

            return;
        }

        const neighbors = getNeighbors(currentNode);

        for (const neighbor of neighbors) {

            if (neighbor.visited) continue;

            if (neighbor.isWall) continue;

            neighbor.visited = true;

            neighbor.previousNode = currentNode;

            stack.push(neighbor);

        }
        
    }

    algorithmRunning = false;
    mouseDown = false

}

async function astar(){

    algorithmRunning = true;

    stopRequest = false

    let visitedCount = 0;

    if (!startNode || !endNode) {
        alert("Select a start and an end node first")
        algorithmRunning = false;
        return;
    }

    clearPathData();

    const openSet = [];

    startNode.gCost = 0;
    startNode.hCost = heuristic(startNode, endNode);
    startNode.fCost = startNode.gCost + startNode.hCost;

    openSet.push(startNode);

while (openSet.length > 0) {

    if (stopRequest) {
        algorithmRunning = false;
        return;
    }

    sortNodesByFCost(openSet);

    const currentNode = openSet.shift();

    visitedCount++;

    currentNode.visited = true;

    if (currentNode !== startNode &&
        currentNode !== endNode) {

        currentNode.element.classList.add("visited");
    }

    await sleep(50);

    if (currentNode === endNode) {

        document.getElementById(
            "visited-count"
        ).textContent = visitedCount;

        await drawShortestPath();

        algorithmRunning = false;

        return;
    }

    const neighbors = getNeighbors(currentNode);

    for (const neighbor of neighbors) {

        if (neighbor.visited) continue;

        if (neighbor.isWall) continue;

        const tentativeGCost =
            currentNode.gCost + 1;

        if (tentativeGCost < neighbor.gCost) {

            neighbor.previousNode =
                currentNode;

            neighbor.gCost =
                tentativeGCost;

            neighbor.hCost =
                heuristic(neighbor, endNode);

            neighbor.fCost =
                neighbor.gCost +
                neighbor.hCost;

            if (!openSet.includes(neighbor)) {

                openSet.push(neighbor);
            }
        }
    }
}
algorithmRunning = false;
mouseDown = false
}

async function drawShortestPath() {

    const path = [];

    let currentNode = endNode;

    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }

    document.getElementById("path-length").textContent = path.length -1;

    for (const node of path) {
        if (stopRequest) {
            algorithmRunning = false;
            return;
        }
        if (node !== startNode && node !== endNode) {
            node.element.classList.add("shortest-path");
        }
        await sleep(50);
    }

    algorithmRunning = false;
    mouseDown = false
    
}

function resetGrid() {

    document.body.classList.remove("placing-end","placing-walls");
    document.body.classList.add("placing-start");

    document.getElementById("visited-count").textContent = 0;
    document.getElementById("path-length").textContent = 0;

    console.log("RESET");

    startNode = null;
    endNode = null;

    for (const row of gridData) {

        for (const node of row) {

            node.isWall = false;
            node.distance = Infinity;
            node.visited = false;
            node.previousNode = null;

            node.element.classList.remove("start", "end", "wall", "visited", "shortest-path");
            
        }

    }
    
}

console.log("NEEEEEWW")