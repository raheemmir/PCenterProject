// Javscript's fetch functionality wasn't working, so the dataset is pasted in here
const data = {
    "nodes": [
        { "id": 1, "name": "Sacremento", "lat": 38.575764 , "lon": -121.478851, "population": 526384},
        { "id": 2, "name": "Stockton", "lat": 	37.961632 , "lon": 	-121.275604, "population": 319543},
        { "id": 3, "name": "Oakland", "lat": 37.804363, "lon": -122.271111 , "population": 436504 },
        { "id": 4, "name": "San Francisco", "lat": 37.773972, "lon": -122.431297, "population": 808988 },
        { "id": 5, "name": "San Jose", "lat": 	37.335480, "lon": -121.893028, "population": 969655},
        { "id": 6, "name": "Fresno", "lat": 36.746841, "lon": -119.772591, "population": 545716},
        { "id": 7, "name": "Bakersfield", "lat": 35.393528, "lon": -119.043732, "population": 413381},
        { "id": 8, "name": "Los Angeles", "lat": 34.052235, "lon": -118.243683, "population": 3820914},
        { "id": 9, "name": "Long Beach", "lat": 33.770050, "lon": -118.193741, "population": 449468},
        { "id": 10, "name": "Anaheim", "lat": 33.835293, "lon": -117.914505, "population": 340512},
        { "id": 11, "name": "Riverside", "lat": 33.953350, "lon": -117.396156, "population": 318858},
        { "id": 12, "name": "San Diego", "lat": 32.715736, "lon": -117.161087, "population": 1388320}
    ],
    "edges": [
        { "source": 1, "target": 2, "name": "Sacremento->Stockton", "distance": 48.3},
        { "source": 2, "target": 3, "name": "Stockton->Oakland", "distance": 71.6},
        { "source": 3, "target": 4, "name": "Oakland->SanFrancisco","distance": 12.4},
        { "source": 4, "target": 5, "name": "SanFrancisco->SanJose", "distance": 48.4},
        { "source": 5, "target": 6, "name": "SanJose->Fresno", "distance": 149.4},
        { "source": 6, "target": 7, "name": "Fresno->Bakersfield", "distance": 108.8},
        { "source": 7, "target": 8, "name": "Bakersfield->LosAngeles", "distance": 112.6},
        { "source": 8, "target": 9, "name": "LosAngeles->LongBeach","distance": 23.9},
        { "source": 9, "target": 10, "name": "LongBeach->Anaheim", "distance": 25.5},
        { "source": 10, "target": 11, "name": "Anaheim->Riverside","distance": 37.3},
        { "source": 11, "target": 12, "name": "Riverside->SanDiego","distance": 98.9}
    ]
}

// Initialize the map (using Leaflet.js for visuals)
const map = L.map("map").setView([38.575764, -121.478851], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors',
}).addTo(map);


// base visualization (cities, edges)
function initializeMap(data) {
       // Plot cities
       data.nodes.forEach((node) => {
        const marker = L.marker([node.lat, node.lon]).bindPopup(`${node.name}`);
        marker.addTo(map);
    });
        // Plot edges
        data.edges.forEach((edge) => {
            const source = data.nodes.find((node) => node.id === edge.source);
            const target = data.nodes.find((node) => node.id === edge.target);
            L.polyline(
                [
                    [source.lat, source.lon],
                    [target.lat, target.lon],
                ],
                { color: "red" }
            ).bindPopup(`Distance: ${edge.distance} miles`).addTo(map); // can click on an edge to see its length
        });
}

initializeMap(data);

// Class representing cities / nodes in the dataset
class City {
    constructor(id, name, lat, lon, population) {
        this.id = id;
        this.name = name;
        this.lat = lat;
        this.lon = lon; 
        this.population = population;
        this.nextCity = null;
        this.distanceToNext = 0;
    }
    setNextCity(nextCity, distanceToNext) {
        this.nextCity = nextCity;
        this.distanceToNext = distanceToNext;
    }

    getNextCity() {
        return this.nextCity
    }
}

// This class links all the city objects together into a path
// Similar thinking/strategy to implementing linked lists
class Path {
    constructor() {
        this.startingCity = null;
    }
    setFirstNode(startingCity) {
        this.startingCity = startingCity;
    }
    traverse() {
        let currentCity = this.startingCity;
        while (currentCity !== null) {
            console.log(currentCity);
            currentCity = currentCity.nextCity;
        }
    }
}

// Parses the dataset to construct city objects and path
function buildPath(data) {
    const cities = [];

    for (let i = 0; i < data.nodes.length; i++) {
        const node = data.nodes[i];
        const city = new City(node.id, node.name, node.lat, node.lon, node.population);
        cities.push(city);
    }
    //console.log(cities);
    //console.log(cities.length)

    for (let i = 0; i < data.edges.length; i++) {
        const edge = data.edges[i];
        sourceCity = cities.find(city => city.id == edge.source);
        targetCity = cities.find(city => city.id == edge.target);
        sourceCity.setNextCity(targetCity, edge.distance);
    }

    //console.log(cities);

    const path = new Path();
    firstNode = cities.find(city => city.id == 1);
    path.setFirstNode(firstNode);

    return path;
}

// function that performs unweighted p-center on a path with edge lengths
// places facilities on cities/nodes
// greedy approach
// strategy for placing first facility is always placing on the leftmost node
function pCenter(path, p, lambda) {
    const facilities = [];
    const coveredCities = [];
    placedFacilitiesCount = 0;
    let currentCity = path.startingCity;

    console.log(`Running P-Center Algorithm with p = ${p}, lambda = ${lambda}`);

    while(currentCity !== null) {
        if (placedFacilitiesCount >= p) {
            console.log('No, not feasible');
            return {feasible: false, facilities, coveredCities};
        }

        facilities.push(currentCity);
        coveredCities.push(currentCity); 
        placedFacilitiesCount++;
        //console.log(`Placing facility at City: ${currentCity.name} (ID: ${currentCity.id})`);

        let cumulativeDistance = 0;
        while (currentCity.nextCity !== null) {
            cumulativeDistance += currentCity.distanceToNext;

            if (cumulativeDistance > lambda) {
                //console.log(`Coverage exceeded at City: ${currentCity.nextCity.name} (ID: ${currentCity.nextCity.id})`);
                break;
            }
            else {
                currentCity = currentCity.nextCity;
                coveredCities.push(currentCity);
                //console.log(`City: ${currentCity.name} (ID: ${currentCity.id}) is covered.`);
            }
        }
        currentCity = currentCity.nextCity; // After exiting the inner loop, move onto the next city
    }
    console.log("All cities covered. Returning YES.");
    return {feasible: true, facilities, coveredCities};
}

// function that finds the optimal lambda, given p, using a binary search approach
// the initial search space ranges from the longest edge length to the sum of all edges
// calls pCenter() to test if a given lambda is feasible or not
function findOptimalLambda(path, p) {
    let minLambda = 0;
    let maxLambda = 0;

    let currentCity = path.startingCity;
    while(currentCity.nextCity !== null) {
        maxLambda += currentCity.distanceToNext;
        minLambda = Math.max(minLambda, currentCity.distanceToNext);
        currentCity = currentCity.nextCity;
    }

    console.log(`Initial Lambda range: min = ${minLambda}, max = ${maxLambda}`);
    let optimalLambda = maxLambda; // initialize before search

    while (minLambda <= maxLambda) {
        const midLambda = Math.floor((minLambda + maxLambda) / 2); 
        console.log(`Testing lambda = ${midLambda}`);

        const result = pCenter(path, p, midLambda);

        if (result.feasible == true) {
            optimalLambda = midLambda;
            maxLambda = midLambda - 1;
            console.log(`Lambda = ${midLambda} is feasible.`);
        }
        else {
            minLambda = midLambda + 1;
            console.log(`Lambda = ${midLambda} is not feasible.`);
        }
    }
    console.log(`Optimal lambda found: ${optimalLambda}`);
    return optimalLambda;
}

// Brings everything together
function runOptimalPCenter(path, p) {
    const optimalLambda = findOptimalLambda(path, p);
    const result = pCenter(path, p, optimalLambda);
    return {feasible: result.feasible, facilities: result.facilities, optimalLambda: optimalLambda};
}

// Visualizes results of p-center algorithm
function visualizeResults(results) {
    // clears previous facility visuals
    map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

    // Using circles to highlight facility locations
    results.facilities.forEach((facility) => {
        L.circle([facility.lat, facility.lon], {
            radius: 15000, 
            color: "red",
            fillColor: "red",
            fillOpacity: 0.7,
        })
            .bindPopup(`Facility`)
            .addTo(map);
    });
}

// User input handling
document.getElementById("runPCenter").addEventListener("click", () => {
    const p = parseInt(document.getElementById("pValue").value, 10);
    if (p <= 0) {
        alert("Please enter a valid value for p (p > 0)");
        return;
    }
    const path = buildPath(data);
    const results = runOptimalPCenter(path, p);
    visualizeResults(results);
    document.getElementById("optimalLambdaValue").textContent = results.optimalLambda;
})




// Old code used during development
// Prior to the visuals being set up, used to node.js to test/run code using cli

/*
const fs = require('fs');
const path = require('path');

function loadJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function main() {
    const data = loadJsonFile('./cities.json'); // Replace with your file path
    const path = buildPath(data);
     //console.log("Path Network");
    // Traverse and print the path
    //path.traverse();
    
    //console.log('******ALGORITHM OUTPUT******');
    //const algorithmResult = pCenter(path, 12, 600);
    //console.log(algorithmResult);
    //const result = findOptimalLambda(path, 1);
    const result = runOptimalPCenter(path, 2);
    console.log(result.facilities);
}

main(); 
*/
