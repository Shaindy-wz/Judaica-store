import multer from 'multer';

const MAX_SIZE_MB = 5;

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(Object.assign(new Error('ניתן להעלות קבצי תמונה בלבד'), { status: 400 }));
};

// Kept in memory so the controller can store the bytes in MongoDB.
const single = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single('file');

export function uploadSingle(req, res, next) {
  single(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return next(Object.assign(new Error(`התמונה גדולה מדי (עד ${MAX_SIZE_MB}MB)`), { status: 400 }));
    }
    next(err);
  });
}
