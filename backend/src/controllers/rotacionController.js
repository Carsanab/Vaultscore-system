const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const estadoEvaluacion = require('../services/estadoEvaluacion');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Usar memoryStorage para no guardar en disco (mejor para la nube)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // ✅ AUMENTADO: Límite de 15MB
});

// 1. Middleware para procesar la imagen
exports.subirImagenRotacion = upload.single('imagen');

// 2. Lógica para subir a Supabase Storage y activar
exports.activarRotacion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const fileName = 'rotacion.jpg';
    const bucketName = 'rotaciones';

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true // Sobreescribe si ya existe
      });

    if (error) {
      console.error('Error al subir a Supabase:', error);
      return res.status(500).json({ error: 'Error al guardar la imagen en la nube' });
    }

    // Obtener la URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Guardamos la URL en el estado global para que las pantallas la lean
    estadoEvaluacion.setImagenRotacion(urlData.publicUrl);
    estadoEvaluacion.setModoRotacion(true);

    res.json({ 
      message: 'Imagen subida y rotación activada', 
      imageUrl: urlData.publicUrl 
    });

  } catch (error) {
    console.error('Error en activarRotacion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 3. Desactivar rotación
exports.desactivarRotacion = async (req, res) => {
  estadoEvaluacion.setModoRotacion(false);
  res.json({ message: 'Rotación desactivada' });
};

// 4. Obtener estado actual
exports.getEstadoRotacion = async (req, res) => {
  res.json({ 
    activa: estadoEvaluacion.getModoRotacion(),
    imageUrl: estadoEvaluacion.getImagenRotacion() || null
  });
};