import multer from 'multer'

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(new Error('Only image files are allowed'))
        }

        callback(null, true)
    },
    limits: { fileSize: 2 * 1024 * 1024 }
})

export default upload