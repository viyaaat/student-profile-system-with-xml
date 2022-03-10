const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const xmlParser = require('xml2json');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3003);

app.get('/', (req, res) => {
    res.render('signup.ejs');
})


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const checkUser = (/^[a-zA-Z]+$/).test(username);
    const checkPassword = (/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{5}$/).test(password);
    if (!checkUser) res.send('Username should only contain letters');
    else if (!checkPassword) res.send('1.Password Length = 6, 2.Password should not start with special character, 3.Password should contain atleast one letter, one digit and one special character');
    else {
        fs.readFile('./data.xml', (err, data) => {
            const xmlObj = xmlParser.toJson(data, { reversible: true, object: true });
            userObj = xmlObj['userlist'][username];
            if (userObj == undefined) {
                xmlObj['userlist'][username] = { password: password };
                xmlObj['userlist'][username].rollno = { $t: '' };
                xmlObj['userlist'][username].name = { $t: '' };
                xmlObj['userlist'][username].fathername = { $t: '' };
                xmlObj['userlist'][username].branch = { $t: '' };
                xmlObj['userlist'][username].year = { $t: '' };
                xmlObj['userlist'][username].email = { $t: '' };
                xmlObj['userlist'][username].address = { $t: '' };

                const string = JSON.stringify(xmlObj);
                const finalXml = xmlParser.toXml(string);
                fs.writeFile('./data.xml', finalXml, (err, res) => {
                    if (err) console.log(err);
                    else console.log('success');
                });

                res.redirect('/update?username=' + username);
            }
            else if (userObj.password != password) {
                res.send('Password incorrect');
            }
            else {
                res.redirect('/update?username=' + username);
            }
        })
    }
})

app.get('/update', (req, res) => {
    username = req.query.username;
    fs.readFile('./data.xml', (err, data) => {
        const xmlObj = xmlParser.toJson(data, { reversible: true, object: true });
        userObj = xmlObj['userlist'][username];
        res.render('update.ejs', { username, userObj });
    })
})

app.post('/update', (req, resp) => {
    updatedObj = req.body;
    username = updatedObj.username;
    fs.readFile('./data.xml', (err, data) => {
        const xmlObj = xmlParser.toJson(data, { reversible: true, object: true });
        xmlObj['userlist'][username].rollno.$t = updatedObj.rollno;
        xmlObj['userlist'][username].name.$t = updatedObj.name;
        xmlObj['userlist'][username].fathername.$t = updatedObj.fathername;
        xmlObj['userlist'][username].branch.$t = updatedObj.branch;
        xmlObj['userlist'][username].year.$t = updatedObj.year;
        xmlObj['userlist'][username].email.$t = updatedObj.email;
        xmlObj['userlist'][username].address.$t = updatedObj.address;


        const string = JSON.stringify(xmlObj);
        const finalXml = xmlParser.toXml(string);
        fs.writeFile('./data.xml', finalXml, (err, res) => {
            if (err) console.log(err);
            else resp.redirect('/');
        });
    });
})