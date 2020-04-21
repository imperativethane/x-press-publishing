const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = 'SELECT * FROM Issue WHERE id = $issueId';
    const values = {$issueId: issueId};
    db.get(sql, values, (err, issue) => {
        if (err) {
            next(err);
        } else if (issue) {
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

issuesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Issue WHERE series_id = $seriesId';
    const values = {$seriesId: req.params.seriesId};

    db.all(sql, values, (err, issues) => {
        if (err) {
            next(err);
        } else {
            res.send({issues: issues})
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.sendStatus(400);
    };
    const validationSql = `SELECT * FROM Artist WHERE id = ${artistId}`

    const createSql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) ' +
    'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';

    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.params.seriesId,
    };

    db.get(validationSql, (err, artist) => {
        if (err) {
            next(err);
        } else if (!artist) {
            res.status(400).send('Artist ID not valid');
        } else {
            db.run(createSql, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    const sql = `SELECT * FROM Issue WHERE id = ${this.lastID}`
                    db.get(sql, (err, issue) => {
                        res.status(201).send({issue: issue});
                    });
                }
            });
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.sendStatus(400);
    };  
    
    const validationSql = `SELECT * FROM Artist WHERE id = ${artistId}`

    const updateSql = 'UPDATE Issue SET ' +
    'name = $name, ' +
    'issue_number = $issueNumber, ' +
    'publication_date = $publicationDate, ' +
    'artist_id = $artistId, ' +
    'series_id = $seriesId ' +
    'WHERE id = $issueId ';

    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.params.seriesId,
        $issueId: req.params.issueId
    };

    db.get(validationSql, (err, artist) => {
        if (err) {
            next(err);
        } else if (!artist) {
            res.status(400).send('Artist ID not valid');
        } else {
            db.run(updateSql, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    const sql = `SELECT * FROM Issue WHERE id = ${req.params.issueId}`
                    db.get(sql, (err, issue) => {
                        res.status(200).send({issue: issue});
                    });
                }
            });
        }
    });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    const sql = 'DELETE FROM Issue WHERE id = $issueId';
    const values = {$issueId: req.params.issueId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = issuesRouter;