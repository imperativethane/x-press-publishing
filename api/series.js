const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE Series.id = $seriesId';
    const values = {$seriesId: seriesId};
    
    db.get(sql, values, (err, series) => {
        if (err) {
            next(err);
        } else if (!series) {
            res.sendStatus(404);
        } else {
            req.series = series;
            next();
        }
    });
});

seriesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Series'

    db.all(sql, (err, series) => {
        if (err) {
            next(err);
        } else {
            res.json({series: series});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.send({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    };

    const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
    const values = {
        $name: name,
        $description: description
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        };

        const sql = `SELECT * FROM Series WHERE Series.id = ${this.lastID}`
        db.get(sql, (err, series) => {
            res.status(201).send({series: series});
        });
    });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    };
    
    const sql = 'UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId';
    const values = {
        $name: name,
        $description: description,
        $seriesId: req.params.seriesId
    };

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        };

        const sql = `SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`
        db.get(sql, (err, series) => {
            res.status(200).send({series: series});
        });
    })
});

module.exports = seriesRouter;