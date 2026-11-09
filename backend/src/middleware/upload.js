import multer from 'multer';

// The admin page shrinks photos before sending them; this ceiling only matters
// when the browser could not (an unusual format), so it allows a full-size
// phone photo while staying well under MongoDB's 16MB document limit.
const MAX_SIZE_MB = 12;

// Some browsers send a photo with no type (or a generic one); its extension decides.
const IMAGE_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp', avif: 'image/avif', heic: 'image/heic', heif: 'image/heif',
};

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  const byName = IMAGE_TYPES[file.originalname.split('.').pop().toLowerCase()];
  if (byName && /^(application\/octet-stream|)$/.test(file.mimetype)) {
    file.mimetype = byName;
    return cb(null, true);
  }
  cb(Object.assign(new Error(`הקובץ "${file.originalname}" אינו תמונה — ניתן להעלות קבצי תמונה בלבד`), { status: 400 }));
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
