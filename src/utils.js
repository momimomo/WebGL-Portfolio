function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor(limits) {
  if (limits.length !== 6) {
    throw new Error("Invalid limits array length. It should be of length 6.");
  }

  const hexChars = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    const limit = limits[i];
    const minIndex = hexChars.indexOf(limit[0]);
    const maxIndex = hexChars.indexOf(limit[1]);

    if (minIndex === -1 || maxIndex === -1 || minIndex > maxIndex) {
      throw new Error(`Invalid limit at position ${i}.`);
    }

    const randomIndex = getRandomInt(minIndex, maxIndex);
    color += hexChars[randomIndex];
  }

  return color;
}

function getRandomValueFromArray(arr) {
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function rotate(cube, axis, times) {
  const temp = cube.split("");
  for (let t = 0; t < times; t++) {
    let order;
    if (axis === "x") order = [4, 5, 2, 3, 0, 1];
    else if (axis === "y") order = [1, 0, 4, 5, 2, 3];
    else order = [2, 3, 0, 1, 4, 5];

    const newCube = new Array(6);
    for (let i = 0; i < 6; i++) {
      newCube[i] = temp[order[i]];
    }
    temp.splice(0, 6, ...newCube);
  }
  return temp.join("");
}

function getAllRotations(cube) {
  const rotations = new Set();
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        const rotatedCube = rotate(
          rotate(rotate(cube, "x", x), "y", y),
          "z",
          z
        );
        rotations.add(rotatedCube);
      }
    }
  }
  return Array.from(rotations);
}




const getAllShapesVariants = (shapes) => {
  let allShapesVariants = []
  for (let shape of shapes) {
    const shapeVariants = getAllRotations(shape);
    allShapesVariants = [...allShapesVariants, ...shapeVariants]
  }
  return allShapesVariants;
}

function getCompatibleNeighbors(shape, direction, allShapes) {
  const compatibleNeighbors = [];

  allShapes.forEach((neighborShape) => {
    if (shape === neighborShape) return;

    let matchingFace;
    switch (direction) {
      case '-X':
        matchingFace = 1;
        break;
      case '+X':
        matchingFace = 0;
        break;
      case '-Y':
        matchingFace = 3;
        break;
      case '+Y':
        matchingFace = 2;
        break;
      case '-Z':
        matchingFace = 5;
        break;
      case '+Z':
        matchingFace = 4;
        break;
      default:
        throw new Error('Invalid direction');
    }

    if (shape[matchingFace] === neighborShape[matchingFace]) {
      compatibleNeighbors.push(neighborShape);
    }
  });

  return compatibleNeighbors;
}

function createGrid(n, allowedShapes) {
  const array = new Array(n);

  for (let x = 0; x < n; x++) {
    array[x] = new Array(n);

    for (let y = 0; y < n; y++) {
      array[x][y] = new Array(n);

      for (let z = 0; z < n; z++) {
        array[x][y][z] = { allowed: allowedShapes };
      }
    }
  }

  return array;
}

// only if a cell has a shape already
function reduceAllowedNeighbors (position, grid) {
  const [x, y, z] = position;
  const currentCell = grid[x][y][z];
  const shape = currentCell.shape;
  let neighborCell = {};
  let newAllowed = {}
  for (let i = 0; i < 6; i++) {
    switch (i) {
      case 0:
        neighborCell = grid[x - 1] && grid[x - 1][y] && grid[x - 1][y][z];
        if (neighborCell) {
          newAllowed = neighborCell.allowed.filter(i => shape[0] === i[1]);
          grid[x - 1][y][z]['allowed'] = newAllowed;
        }
        break;
      case 1:
        neighborCell = grid[x + 1] && grid[x + 1][y] && grid[x + 1][y][z];
        if (neighborCell) {
        newAllowed = neighborCell.allowed.filter(i => shape[1] === i[0]);
        grid[x + 1][y][z]['allowed'] = newAllowed;
        }
        break;
      case 2:
        neighborCell = grid[x] && grid[x][y - 1] && grid[x][y - 1][z];
        if (neighborCell) {
        newAllowed = neighborCell.allowed.filter(i => shape[2] === i[3]);
        grid[x][y - 1][z]['allowed'] = newAllowed;
        }
        break;
      case 3:
        neighborCell = grid[x] && grid[x][y + 1] && grid[x][y + 1][z];
        if (neighborCell) {
        newAllowed = neighborCell.allowed.filter(i => shape[3] === i[2]);
        grid[x][y + 1][z]['allowed'] = newAllowed;
        }
        break;
      case 4:
        neighborCell = grid[x] && grid[x][y] && grid[x][y][z - 1];
        if (neighborCell) {
        newAllowed = neighborCell.allowed.filter(i => shape[4] === i[5]);
        grid[x][y][z - 1]['allowed'] = newAllowed;
        }
        break;
      case 5:
        neighborCell = grid[x] && grid[x][y] && grid[x][y][z + 1];
        if (neighborCell) {
        newAllowed = neighborCell.allowed.filter(i => shape[5] === i[4]);
        grid[x][y][z + 1]['allowed'] = newAllowed;
        }
        break;
    }
  }
}

const findLowestEntropyCell = (grid) => {
  let lowestEntropy = 31; // 1 larger than number of all possible unique shapes (31 unique rotations of initial 7)
  let lowestEntropyCell;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid.length; y++) {
      for (let z = 0; z < grid.length; z++) {
        const target = grid[x][y][z];
        const isCollapsed = target.shape;
        if (!isCollapsed) {
          const numberOfShapes = target.allowed.length
          if (numberOfShapes < lowestEntropy) {
            lowestEntropy = numberOfShapes;
            lowestEntropyCell = [x,y,z];
          } 
        }
      }
    }
  }
  if (!lowestEntropyCell) {
    return false
  }
  return lowestEntropyCell;
}


module.exports = {
    createGrid,
    findLowestEntropyCell,
    getAllRotations,
    getAllShapesVariants,
    getRandomInt,
    getRandomValueFromArray,
    getCompatibleNeighbors,
    randomHexColor,
    reduceAllowedNeighbors,
    rotate,
}