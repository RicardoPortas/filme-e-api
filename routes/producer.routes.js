import { Router } from 'express'
import User from '../models/user.model.js'
import Producer from '../models/producer.model.js'
import Company from '../models/company.model.js'
import Movie from '../models/movie.model.js'

import fileUpload from '../config/cloudinary.config.js'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'

const producerRouter = Router()

producerRouter.post('/', isAuthenticatedMiddleware, async (req, res) => {
    const payload = req.body
    try {
        const newProducer = await Producer.create(payload)
        return res.status(201).json(newNf)
    } catch (error) {
        console.log(error)
        if(error.name === 'ValidationError') {
            return res.status(422).json({message: "Validation error. Check your input."})
        }
        return res.status(500).json({message: "Error while creating Producer"})
    }
})

producerRouter.get('/', isAuthenticatedMiddleware, async (req, res) => {
    const { name, order } = req.query
    const query = {}
    if(name) {
        query.name = name
    }
    try {
        const producer = await Producer.find(query)
                        .populate('movie', 'title -_id')
                        .sort(order)
        return res.status(200).json(producer)
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
})

producerRouter.get('/:id', isAuthenticatedMiddleware, async (req, res) => {
    const { id } = req.params
    try {
        const producer = await producer.findById(id)
            .populate('cast comments')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            })
        if(!producer) {
            return res.status(404).json({message: 'Not Found'})
        }
        return res.status(200).json(producer)
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
})

producerRouter.put('/:id', isAuthenticatedMiddleware, async (req, res) => {
    const { id } = req.params
    const payload = req.body
    try {
        const updatedProducer = await Producer.findOneAndUpdate({_id: id}, payload, { new: true })
        
        await Movie.updateMany({_id: {$in: payload.movies}}, {$push: {movies: updatedMovie._id}})
        
        if(!updatedProducer) {
            return res.status(404).json({message: 'Not Found'})
        }
        return res.status(200).json(updatedProducer)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal server error"})
    }
})

producerRouter.delete('/:id', isAuthenticatedMiddleware, async (req, res) => {
    const { id } = req.params
    try {
        await Producer.findOneAndDelete({_id: id})
        return res.status(204).json()
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
})

producerRouter.post("/upload", isAuthenticatedMiddleware, fileUpload.single('producerDocument'), (req, res) => {
    res.status(201).json({url: req.file.path})
})

export default producerRouter