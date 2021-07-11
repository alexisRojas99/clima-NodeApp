require('dotenv').config()
const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");


const main = async() => {

    
    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1:
                // Mostrar Mensaje
                const texto_busqueda = await leerInput('Ciudad:')
                
                // Buscar los Lugares
                const lugares = await busquedas.ciudad(texto_busqueda)
                
                // Seleccionar el Lugar
                const id = await listarLugares(lugares);
                // Validar la opcion de cancelar
                if(id === '0') continue;

                const lugarSeleccionado = lugares.find(lugar => lugar.id === id);
                // console.log(lugarSeleccionado)
                // Guardar en DB
                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                // Clima
                const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng)
                //  console.log(clima)
                // Mostrar Resultados
                console.clear();
                console.log(`\nInformacion de la ciudad\n`.green)
                console.log('Ciudad:', lugarSeleccionado.nombre.green)
                console.log('Latitud:', lugarSeleccionado.lat)
                console.log('Longitud:', lugarSeleccionado.lng)
                console.log('---Temperaturas---',)
                console.log('Temp Actual:',clima.temp)
                console.log('Temp Mínima:',clima.min)
                console.log('Temp Máxima:',clima.max)
                console.log('Como esta el clima:',clima.desc.green)
            break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar,i) => {
                    const idx = `${i + 1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
            break;
        
            default:
                break;
        }
        if(opt !==0) await pausa();

    } while (opt !== 0);
    
}

main()