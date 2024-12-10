// This file contains previous attempts to implement p-center 
// Lots of this code is updated/edited (partly to work with city objects / the dataset) in algorithm.js

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

function is_feasible(lambda, weights, positions, p) {
    // Calculate coverage radius for each city
    let coverageRadius = {};
    for (let city in weights) {
        coverageRadius[city] = lambda / weights[city];
    }

    // Find the best p facilities that minimize the maximum coverage radius
    let facilities = [];
    let coveredCities = new Set();
    let remainingCities = new Set(Object.keys(positions));

    // Greedy approach to select p facilities that cover most cities
    while (facilities.length < p && remainingCities.size > 0) {
        let bestFacilityCity = null;
        let maxCoveredCities = 0;

        // Find the best facility location
        for (let candidateCity of Object.keys(positions)) {
            if (facilities.includes(positions[candidateCity])) continue;

            let candidatePosition = positions[candidateCity];

            // Check cities that would be covered by placing a facility here
            let potentialCoveredCities = new Set();
            for (let city of Object.keys(positions)) {
                let distanceToCity = Math.abs(positions[city] - candidatePosition);
                if (distanceToCity <= coverageRadius[city]) {
                    potentialCoveredCities.add(city);
                }
            }

            // Choose the facility that covers the most cities
            if (potentialCoveredCities.size > maxCoveredCities) {
                bestFacilityCity = candidateCity;
                maxCoveredCities = potentialCoveredCities.size;
            }
        }

        if (bestFacilityCity === null) break;

        // Add the best facility
        let bestFacilityPosition = positions[bestFacilityCity];
        facilities.push(bestFacilityPosition);

        // Mark cities covered by this facility
        for (let city of Object.keys(positions)) {
            let distanceToCity = Math.abs(positions[city] - bestFacilityPosition);
            if (distanceToCity <= coverageRadius[city]) {
                coveredCities.add(city);
            }
        }
    }

    // Check if all cities are covered and we have exactly p facilities
    return {
        feasible: facilities.length === p && coveredCities.size === Object.keys(positions).length,
        facilities: facilities,
        coveredCities: Array.from(coveredCities)
    };
}

function findOptimalLambdaAndFacilities(threshold, weights, positions, p) {
    let lambdaMin = 0;
    let lambdaMax = Math.max(...Object.values(weights)) * Math.max(...Object.values(positions));
    let bestResult = null;

    // Perform binary search
    while (lambdaMax - lambdaMin > threshold) {
        let lambdaMid = Math.floor((lambdaMin + lambdaMax) / 2);

        // Check feasibility
        let result = is_feasible(lambdaMid, weights, positions, p);

        if (result.feasible) {
            // If feasible, try to minimize lambda
            bestResult = result;
            bestResult.optimalLambda = lambdaMid;
            lambdaMax = lambdaMid;
        } else {
            // If not feasible, increase lambda
            lambdaMin = lambdaMid + 1;
        }
    }

    // Final check
    if (bestResult === null) {
        return {
            feasible: false,
            message: `It is not possible to cover all cities with exactly ${p} facilities.`,
            optimalLambda: null,
            facilities: []
        };
    }

    return bestResult;
}

function pCenter(threshold, weights, positions, p) {
    // Ask the user if they want to specify lambda
    readline.question("Do you want to specify the lambda? (yes/no): ", (answer) => {
        if (answer.toLowerCase() === "yes") {
            readline.question("Enter the lambda value: ", (lambdaInput) => {
                let lambda = parseFloat(lambdaInput);
                let result = is_feasible(lambda, weights, positions, p);
                console.log("Feasibility:", result.feasible);
                console.log("Facility Locations:", result.facilities);
                console.log("Covered Cities:", result.coveredCities);
                console.log(
                    "Facility City Names:",
                    result.facilities.map((pos) =>
                        Object.keys(positions).find((city) => positions[city] === pos)
                    )
                );
                readline.close();
            });
        } else {
            // Find the optimal lambda
            let result = findOptimalLambdaAndFacilities(threshold, weights, positions, p);
            console.log("Optimal Lambda:", result.optimalLambda);
            console.log("Feasibility:", result.feasible);
            console.log("Facility Locations:", result.facilities);
            console.log("Covered Cities:", result.coveredCities);
            console.log(
                "Facility City Names:",
                result.facilities.map((pos) =>
                    Object.keys(positions).find((city) => positions[city] === pos)
                )
            );
            readline.close();
        }
    });
}

// Test Case figure out a way to get the dataset from the json
let weights = {
    "Sacremento": 526384,
    "Stockton": 319543,
    "Oakland": 436504,
    "SanFrancisco": 808988,
    "SanJose": 969655,
    "Fresno": 545716,
    "Bakersfield": 413381,
    "LosAngeles": 3820914,
    "LongBeach": 449468,
    "Anaheim": 340512,
    "Riverside": 318858,
    "SanDiego": 1388320
};

let positions = {
    "Sacremento": 0,
    "Stockton": 48.3,
    "Oakland": 119.9,
    "SanFrancisco": 132.3,
    "SanJose": 180.7,
    "Fresno": 330.1,
    "Bakersfield": 438.9,
    "LosAngeles": 551.5,
    "LongBeach": 575.4,
    "Anaheim": 600.9,
    "Riverside": 638.2,
    "SanDiego": 737.1
};

let p = 12;
let threshold = 1;

// Call the function
pCenter(threshold, weights, positions, p);

