// 1. Importar las librerías
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Cargamos las credencias de firebase
const serviceAccount = require('./clave-firebase.json')

// Inicializador de la app de Firebase
admin.initializeApp ({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore();

// Inicializador de la aplicacion Express
const app = express();
const port = 3000;
app.use(cors());


// 4. Definir el "Endpoint" de Fabricantes
app.get('/api/fabricantes', async (req, res) => {
    console.log("Peticion recibida en /api/fabricantes (desde  Firebase)");

    try {
        // Obtiene la tabla (coleccion) 'fabricantes'
        const fabricantesSnapshot = await db.collection('fabricantes').get();

        // Se prepara un array para la respuesta al usuario
        const fabricantes = [];

        // Se recorre cada fila que vino de Firebase
        fabricantesSnapshot.forEach(doc => {
            let fabricante = {
                id: doc.id,
                nombre: doc.data().nombre
            };
            fabricantes.push(fabricante);
        });
        // Aca se envia la lista de fabricantes como JSON
        res.json(fabricantes);
    } catch (error) {
        console.error("Error al obtener fabricantes", error);
        res.status(500).send("Error al obtener datos");
    }
});

// Definir endpoint de modelos
app.get('/api/modelos/:fabricanteId', async (req, res) => {
    //se obtiene el ID del fabricante
    const id = req.params.fabricanteId;
    console.log(`Peticion recibida en /api/modelos/ (Firebase) para el ID: ${id}`);

    try {
        //Se crea la consulta a Firebase y busca en la coleccion 'modelos'
        const modelosRef = db.collection('modelos');
        const q = modelosRef.where('fabricante_id', '==', id);

        //Ejecutamos la consulta
        const snapshot = await q.get();

        if (snapshot.empty) {
            console.log('No se encontraron modelos para ese ID.')
            res.json([]) //Se envia un array vacio por si no hay modelos
            return;
        }

        // Se prepara el array de respuesta
        const modelosFiltrados = []
        snapshot.forEach(doc => {
            modelosFiltrados.push({
                id: doc.id,
                nombre: doc.data().nombre
            });
        });

        // Se envia la respuesta
        console.log(`Encontrados: ${modelosFiltrados.length} modelos.`);
        res.json(modelosFiltrados);
    } catch (error) {
        console.error("Error al obtener modelos:", error);
        res.status(500).send("Error al obtener los datos");
    }
});

// ENDPOINT DE MODELOS/VEHICULOS
app.get('/api/vehiculos/:modeloId', async (req, res) => {
    const id = req.params.modeloId;
    console.log(`Peticion recibida en /api/vehiculos/ (Firebase) para el ID: ${id}`);

    try {
        //Buscamos en la coleccion vehiculos
        const vehiculosRef = db.collection('vehiculos');
        const q = vehiculosRef.where('modelo_id', '==', id);
        const snapshot = await q.get();

        if (snapshot.empty) {
            console.log('No se encontraron vehiculos para ese ID.');
            res.json([]);
            return;
        }
        const vehiculosFiltrados = [];
        snapshot.forEach(doc => {
            vehiculosFiltrados.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(`Encontrados: ${vehiculosFiltrados.length} vehiculos.`);
        res.json(vehiculosFiltrados);
    } catch (error) {
        console.error("Error al obtener vehiculos:", error);
        res.status(500).send("Error al obtener datos")
    }
});

app.get('/api/tareas/:vehiculoId', async (req, res) => {
    // Se obtiene el ID del vehiculo de la URL
    const id = req.params.vehiculoId;
    console.log(`Peticion recibida en /api/tareas/ (Firebase) para el ID: ${id}`);

    try {
        // Se crea la consulta a Firebase
        const tareasRef = db.collection('tareas_mantenimiento');
        const q = tareasRef.where('vehiculo_id', '==', id);

        // Se ejecuta la consulta
        const snapshot = await q.get();

        if (snapshot.empty) {
            console.log('No se encontraront areas para ese ID')
            res.json([]);
            return;
        }

        // Se prepara el array de respuesta
        const tareasFiltradas = [];
        snapshot.forEach(doc => {
            tareasFiltradas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Se enviar la respuesta
        console.log(`Encontradas: ${tareasFiltradas.length} tareas.`);
        res.json(tareasFiltradas);

    } catch(error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).send("Error al obtener datos");
    }
});

// 5. Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor de AutoLog corriendo en http://localhost:${port}`);
    console.log("CONECTANDO A FIREBASE");
});