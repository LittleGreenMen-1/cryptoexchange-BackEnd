const express = require('express')
const server = express()
const Currency = require('../../models/currency')
const isAuth = require('../../middleware/isAuth')

server.get('/crypto', isAuth, async (req, res) => {
    const availableCrypto = await Currency.find();
  
    if (!availableCrypto) {
      res.status(404).json({
        message: "No crypto available",
      })
    } else {
      res.status(200).json({
        availableCrypto,
      })
    }
  })

module.exports = server
