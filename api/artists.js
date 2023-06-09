const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const artistsRouter = express.Router();

module.exports = artistsRouter;

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get('SELECT * FROM Artist WHERE id = $id', {
        $id: Number(id)
    }, (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.status(404).send();
        }
    });
});

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({artist: req.artist});
});

const validateArtist = (req, res, next) => {
    const toCreateArtist = req.body.artist;
    if (!toCreateArtist.name || !toCreateArtist.dateOfBirth || !toCreateArtist.biography) {
        return res.status(400).send();
    }
    if (!toCreateArtist.isCurrentlyEmployed) {
        req.body.artist.isCurrentlyEmployed = 1;
    }
    next();
};

artistsRouter.post('/', validateArtist, (req, res, next) => {
    const toCreateArtist = req.body.artist;    
    db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)', {
        $name: toCreateArtist.name,
        $dateOfBirth: toCreateArtist.dateOfBirth, 
        $biography: toCreateArtist.biography, 
        $isCurrentlyEmployed: toCreateArtist.isCurrentlyEmployed
    }, function(err) {
        if (err) {
            next(err);
        }
        db.get('SELECT * FROM Artist WHERE id = $id', {
            $id: this.lastID
        }, (err, artist) => {
            if (!artist) {
                return res.status(500).send();
            }
            res.status(201).send({artist: artist});
        });
    });
});

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    const newArtist = req.body.artist;    
    db.run('UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id', {
        $id: req.artist.id,
        $name: newArtist.name,
        $dateOfBirth: newArtist.dateOfBirth, 
        $biography: newArtist.biography, 
        $isCurrentlyEmployed: newArtist.isCurrentlyEmployed
    }, (err) => {
        if (err) {
            next(err);
        }
        db.get('SELECT * FROM Artist WHERE id = $id', {
            $id: req.artist.id
        }, (err, artist) => {
            if (err) {
                next(err);
            } else if (!artist) {
                return res.status(500).send();
            }
            res.status(200).send({artist: artist});
        });
    });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $id', {
        $id: req.artist.id,
    }, (err) => {
        if (err) {
            next(err);
        }
        db.get('SELECT * FROM Artist WHERE id = $id', {
            $id: req.artist.id
        }, (err, artist) => {
            if (err) {
                next(err);
            } else if (!artist || artist.is_currently_employed !== 0) {
                return res.status(400).send();
            } 
            res.status(200).send({artist: artist});
        });
    });
});
