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

// Thinking we parse the json dataset and use these city objects like a linked list