const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

const processFiles = (routeParams) => {
  if (routeParams && routeParams[0]?.maxCount && routeParams[0]?.maxCount > 1) {
    const updatedParams = routeParams.map((param) => ({
      ...param,
      name: `${param.name}[]`,
    }))
    return upload.fields(updatedParams)
  }

  return upload.fields(routeParams)
}

module.exports = { processFiles }