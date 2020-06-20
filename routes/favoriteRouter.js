const express = require('express');
const cors = require('./cors');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();
const authenticate = require('../authenticate');

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,(req, res, next) => {
    Favorite.find({user : req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }).catch(err => next(err));
}).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user : req.user._id})
    .then(favorite =>{
        if(favorite){
            req.body.forEach(
                fav => {
                    const documentDoesntHasFavorite = !favorite.campsites.includes(fav._id);
                    if(documentDoesntHasFavorite){
                        favorite.campsites.push(fav._id);
                    }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }else{
            Favorite.create({user:req.user._id, campsites:req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
}).
put(cors.cors,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite){
            favorite.remove()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
        })
            .catch(err => next(err))
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
        .then(favorite => {
            if(favorite){
                const favoritedId = req.params.campsiteId;
                const currentFavorites = favorite.campsites;
                if(currentFavorites.includes(favoritedId)){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.send('This campsite is already favorited.');
                }else{
                    currentFavorites.push(favoritedId);
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
                }
            }else{
                Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }
        })
})
.put(cors.cors,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite){
            const favId = req.params.campsiteId;
            const currentFavs = favorites.campsites;
            const index = currentFavs.indexOf(favId);

            if(index > -1) currentFavs.splice(index, 1);
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }).catch(err => next(err)); 
        }else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }
    }).catch(err => next(err)); 
});

module.exports = favoriteRouter;