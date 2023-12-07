import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

const app = express();

// Middleware para manejar errores de Multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).send(`Multer Error: ${error.message}`);
    } else if (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
    next();
});

// Para enviar multiples archivos desde el navegador
app.post("/multipleFiles", upload.array("files", 10), async (req, res) => {
    console.log(req.files);
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    try {
        await saveFiles(req.files);
        res.send("Upload success");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

async function saveFiles(files) {
    try {
        await Promise.all(
            files.map(async (file) => {
                const oldPath = join(__dirname, file.path);
                const newPath = join(__dirname, "uploads", file.originalname);

                await fs.rename(oldPath, newPath);
                console.log("Rename complete!");
            }),
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Para enviar un solo archivo desde el navegador
app.post("/singleFile", upload.single("file"), async (req, res) => {
    console.log(req.file);
    if (!req.file || req.file.length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    try {
        await saveFile(req.file);
        res.send("Upload success");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

async function saveFile(file) {
    try {
        const oldPath = join(__dirname, file.path);
        const newPath = join(__dirname, "uploads", file.originalname);

        await fs.rename(oldPath, newPath);
        console.log("Rename complete!");
    } catch (error) {
        console.log(error);
        throw error;
    }
}

app.listen(3000, () => console.log("Server is running on port 3000"));
