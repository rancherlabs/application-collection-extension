var express = require('express')
const { localValues } = require('../clients/helm')
var router = express.Router()

router.get('/:name/:version/local-values', function(req, res, next) {
  const { name, version } = req.params
  localValues(name, version)
    .then(values => res.json({ values })) 
    .catch(err => {
      console.error('Unexpected error fetching local values', err)
      res.json({})
    })
})

module.exports = router
