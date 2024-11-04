//cargar los modulos
const express = require('express');
const app = express();

//para gestionar las rutas de los ficheros
const path = require('node:path');

//obtener el numero de puerto
process.loadEnvFile();
const PORT = process.env.PORT
console.log(PORT);

//cargar los datos
const datos = require('../data/customers.json');

//odernar por orden alfabetico del cliente (descendente A-> Z) donde a y b son objetos dentro del array (datos json)
datos.sort((a, b) => a.surname.localeCompare(b.surname, "es-ES"));

//para que pueda leer los ficheros estaticos que estan dentro de public
app.use(express.static(path.join(__dirname, '../public')));
console.log(datos);

app.get("/", (request, response) => {
    // console.log("Estamos en la /");
    // forma 01
    //response.sendFile(path.join(__dirname, '../public/index.html')); //probamos que carga el archivo index
    // forma 02
    response.sendFile(__dirname + '/index.html')
});

//ruta API global
app.get("/api", (request, response) => {
    response.json(datos);
});

//ruta para filtrar los cliente por el apellido
app.get("/api/apellido/:cliente_apellido", (request, response) => {
    const apellido = request.params.cliente_apellido.toLocaleLowerCase(); //params devuelce un array
    const filtroClientes = datos.filter(cliente => cliente.surname.toLocaleLowerCase() === apellido);
    // console.log(filtroClientes);
    if (filtroClientes.length == 0) {
        return response.status(404).send("No hay clientes con este apellido")
    }
    response.json(filtroClientes)
})

//ruta para filtrar por nombre y apellido: api/nombre_apellido/john/Bezzo
app.get("/api/nombre_apellido/:cliente_nombre/:cliente_apellido", (request, response) => {
    const apellido = request.params.cliente_apellido.toLocaleLowerCase(); //params devuelce un array
    const nombre = request.params.cliente_nombre.toLocaleLowerCase(); //params devuelve un array
    const filtroClientes = datos.filter(cliente => cliente.surname.toLocaleLowerCase() === apellido && cliente.name.toLocaleLowerCase() === nombre);
    // console.log(filtroClientes); //muestra en consola
    if (filtroClientes.length == 0) {
        return response.status(404).send("No hay clientes con este nombre y apellido")
    }
    response.json(filtroClientes)
})


// Ruta para filtrar por nombre y por las primeras letras del apellido:
// api/nombre/Barbara?apellido=Jo            http://localhost:4000/api/nombre/Maria?surname=jobs
app.get("/api/nombre/:nombre", (request, response) => {
    const nombre = request.params.nombre.toLocaleLowerCase()
    const apellido = request.query.apellido
    // Si no se incluye el apellido valdrá undefined
    // mostraremos un filtro solo por el nombre
    if (apellido == undefined) {
        // Si no tenemos el apellido filtrar solo por el nombre
        const filtroClientes = datos.filter(cliente => cliente.name.toLocaleLowerCase() == nombre)

        // Nos aseguramos que el array con los clientes no esté vacío
        if (filtroClientes.length == 0) {
            return express.response.status(404).send("Cliente no encontrado")
        }
        // Devolver el filtro solo por el nombre del cliente
        return response.json(filtroClientes)
    }

    // console.log(nombre, apellido);

    // para saber cuantas letras tiene el apellido escrito por el usuario
    const letras = apellido.length

    const filtroClientes = datos.filter(cliente => cliente.surname.slice(0, letras).toLocaleLowerCase() == apellido && cliente.name.toLocaleLowerCase() == nombre)

    // Si no se encuentran coincidencias, mostrar un mensaje
    if (filtroClientes.length == 0) {
        return response.status(404).send("Cliente no encontrado")
    }

    // Devolver los datos filtrados
    response.json(filtroClientes)

});


// Filtrar por la marca : qué productos se han comprado de una marca en concreto
// api/marca/:marca                  http://localhost:4000/api/marca/apple
app.get("/api/marca/:marca", (request, response) => {
    const marca = request.params.marca.toLocaleLowerCase()
    // console.log(marca);

    // console.log(datos.flatMap(cliente => cliente.compras));

    const filtroMarca = datos.flatMap(cliente => cliente.compras.filter(compra => compra.marca.toLocaleLowerCase() == marca))

    if (filtroMarca.length == 0) {
        return response.status(404).send(`No se ha realizado ninguna compra de ${marca}`)
    }

    // Devolver los datos filtrados
    response.json(filtroMarca)

})





//cargar pa pagina 404 - Error
app.use((request, response) => response.status(404).sendFile(path.join(__dirname, '../public/error.html')));
// forma 02
// app.use((request, response) => response.status(404).sendFile(path.join(__dirname , "../public", "404.html")));


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
