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
        this.distanceToNext = this.distanceToNext
    }

    getNextCity() {
        return this.nextCity, this.distanceToNext
    }
}

class Path {
    constructor() {
        this.startingCity = null;
    }
    setFirstNode(startingCity) {
        this.startingCity = startingCity;
    }
    traverse() {
        return "not implemented yet"
    }
}


// data is the json file, somehow load it in
// not tested yet
function buildPath(data) {
    cities = []

    for (let i = 0; i < data.nodes.length; i++) {
        node = data.nodes[i];
        const city = new City(node.id, node.name, node.lat, node.lon, node.population);
        cities.push(city);
    }

    for (let i = 0; i < data.edges.length; i++) {
        edge = data.edges[i];
        sourceCity = cities.find(city => city.id == edge.source);
        targetCity = cities.find(city => city.id == edge.target);
        sourceCity.setNextCity(targetCity, edge.distance);
        if (sourceCity.getNextCity() != null, 0) {
            print('valid');
        }
    }

    const Path = new Path();
    firstNode = cities.find(city => city.id == 1);
    Path.setFirstNode(firstNode);

    return Path;
}
