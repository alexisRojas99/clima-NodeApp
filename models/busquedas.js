const fs = require('fs')
const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // Leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1))

            return palabras.join(' ')
        })
    }

    get paramsMapbox() {

        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    async ciudad(lugar = '') {
        // console.log('Ciudad', lugar);
        
        try {
            // Peticion HTTP

            // La Instancia de axios se encuentra en la documentacion npm axios, debes seguir la estructura ya que es estricta
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get()
            // const resp = await axios.get('https://reqres.in/api/users?page=2')

            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (error) {
            return [];
        }
    }

    get paramsWeather() {

        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async climaLugar(lat, lon) {
        try {
            // Instance axios.create()
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather?',
                params: {...this.paramsWeather, lat, lon}
            })
            // resp.data
            const resp = await instance.get()
            // console.log(resp)
            const {weather, main} = resp.data

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log('puta mierda' + error)
        }
    }

    agregarHistorial(lugar = '') {

        // Validar que no se repita la ciudad
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        } 

        // Mantiene un arreglod de 5 elementos
        this.historial = this.historial.splice(0, 4)

        // Almacenar en arreglo
        this.historial.unshift(lugar.toLocaleLowerCase());

        // Grabar en DB
        this.guardarDB()
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {

        if(!fs.existsSync(this.dbPath)) return null;

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        this.historial = data.historial;
    }

}

module.exports = Busquedas