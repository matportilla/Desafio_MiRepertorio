// Importar módulos necesarios
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());  // Middleware para procesar datos JSON en las solicitudes
app.use(cors());  // Middleware para habilitar el CORS (Cross-Origin Resource Sharing)

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Rutas
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");  // Enviar archivo HTML al acceder a la ruta principal
});

app.get("/canciones", (req, res) => {
    try {
        // Leer y enviar datos de canciones desde un archivo JSON
        const canciones = JSON.parse(fs.readFileSync("repertorio.json", "utf8"));
        res.json(canciones);
    } catch (error) {
        next(error);
    }
});

app.post("/canciones", (req, res, next) => {
    try {
        // Añadir nueva canción a la lista en el archivo JSON
        const cancion = req.body;

        // Validar si algún campo está vacío antes de agregar la canción
        if (Object.values(cancion).some((value) => value === "")) {
            return res.status(400).json({ message: "Falta completar un campo" });
        }

        const canciones = JSON.parse(fs.readFileSync("repertorio.json", "utf8"));
        fs.writeFileSync(
            "repertorio.json",
            JSON.stringify([...canciones, cancion])
        );

        res.send("Canción agregada");
    } catch (error) {
        next(error);
    }
});

app.put("/canciones/:id", (req, res, next) => {
    try {
        // Actualizar información de una canción existente
        const { id } = req.params;
        const cancion = req.body;

        // Validar si algún campo está vacío antes de actualizar la canción
        if (Object.values(cancion).some((value) => value === "")) {
            return res.status(400).json({ message: "Falta completar un campo" });
        }

        const canciones = JSON.parse(fs.readFileSync("repertorio.json", "utf8"));
        const index = canciones.findIndex((cancion) => cancion.id === id);

        // Verificar si la canción con el ID proporcionado existe en la lista
        if (index === -1) {
            return res.status(404).json({ message: "No se encuentra la canción en la lista" });
        }

        canciones[index] = cancion;

        fs.writeFileSync("repertorio.json", JSON.stringify(canciones));
        res.send("Canción actualizada");
    } catch (error) {
        next(error);
    }
});

app.delete("/canciones/:id", (req, res, next) => {
    try {
        // Eliminar una canción de la lista por su ID
        const { id } = req.params;
        const canciones = JSON.parse(fs.readFileSync("repertorio.json", "utf8"));
        const index = canciones.findIndex((cancion) => cancion.id === id);

        // Verificar si la canción con el ID proporcionado existe en la lista
        if (index === -1) {
            return res.status(404).json({
                message: "El recurso que desea eliminar no se encuentra en la lista",
            });
        }

        canciones.splice(index, 1);
        fs.writeFileSync("repertorio.json", JSON.stringify(canciones));
        res.send("Canción eliminada");
    } catch (error) {
        next(error);
    }
});

// Configuración del puerto y arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}, ingresa en el siguiente link http://localhost:3000`);
});
