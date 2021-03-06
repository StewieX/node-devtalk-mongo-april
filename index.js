/**
 * Created by steve on 4/26/2017.
 */
// locatie mongodb:
//     cd D:\MongoDB\version 3.2\bin
// mongod:
//     mongod.exe --port 27021 --dbpath “D:\temp\data"
let initCollaborators = [{firstName: 'Evert', lastName: 'Rossel', age: 18}, {
    firstName: 'Jos',
    lastName: 'Lennen',
    age: 33
}];
let initProject = {title: 'Support Platform', organisation: 'Foreach', collaborators: []};

let express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    http = require('http'),
    projectStore = require('./models/project'),
    collaboratorStore = require('./models/collaborator');

let app = express();

mongoose.connect('mongodb://localhost:27021/devtalks', (err) => console.log(err));

mongoose.connection.on('open', () => {

    collaboratorStore.remove((err) => {
        if (err) console.log(err);

        for (let i = 0; i < initCollaborators.length; i++) {
            collaboratorStore.create(initCollaborators[i], (err, collaborator) => {
                if (err) console.log(err);
                else console.log(collaborator.getFullName() + ' created');
            });
        }
    });

    projectStore.remove((err) => {
        if (err) console.log(err);
        collaboratorStore.find({}, (err, collaborators) => {
            if (err) console.log(err);
            else {
                initProject.collaborators = collaborators;
                projectStore.create(initProject, (err, project) => {
                    if (err) console.log(err);
                    else console.log(project.title + ' project created');
                });
            }
        });
    });
});

app.use(bodyParser.json());

let server = http.createServer(app);
let port = 8081;

app.post('/collaborator', (req, res) => {
    collaboratorStore.create(req.body, (err, collaborator) => {
        if(err){
          res.status(400).send(err);
        } else{
            res.status(200).send(collaborator)
        }
    });
});

app.get('/collaborators', (req, res) => {
    collaboratorStore.find({}, (err, collaborators) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.status(200).send(collaborators);
        }
    });
});

app.post('/project', (req, res) => {
    projectStore.create(req.body, (err, project) => {
        if(err){
            res.status(400).send(err);
        } else{
            res.status(200).send(project)
        }
    });
});

app.get('/projects', (req, res) => {
    projectStore.find({}, (err, projects) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.status(200).send(projects);
        }
    });
});

app.get('/projectsWithCollaborators', (req, res) => {
    projectStore.find({}).populate('collaborators').exec((err, projects) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.status(200).send(projects);
        }
    });
});

server.listen(port, () => {
    console.log('App is running on http://localhost:' + port);
});

