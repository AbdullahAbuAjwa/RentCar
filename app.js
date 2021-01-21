const { static } = require('express');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
let port = process.env.PORT || 1234;
const Car = require('./models/car');
const User = require('./models/user');
const app = express();
app.set('view engine', 'ejs');
// connect to mongoose db connection then listen
mongoose.connect('mongodb+srv://ahmed:ahmed123321@rentcarcluster.vjavb.mongodb.net/cars?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then((result) => app.listen(port));
// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.get('/', (req, res) => {
  res.redirect('/home');
});
app.get('/home', (req, res) => {
  global.message = 0;
  res.render('index', { title: 'Home' });
});
/*app.get('/car/create', (req, res) => {
  const car = new Car({
    name: 'Renault Symbol',
    cost: 102,
    cartype: 'الاقتصادية',
    fuletype: 'بنزين',
    gertype: 'عادي',
    capacity: 5,
    from: new Date(2020, 0, 1),
    to: new Date(2020, 0, 2),
    available: true
  });
  car.save().then((result) => {
    res.redirect('all_cars');
  }).catch((err) => {
    console.log(err);
  });
});*/
app.get('/rent_info', (req, res) => {
  global.message = 0;
  res.render('rent_info', { title: 'Information', message: global.message });
});
app.get('/all_cars', (req, res) => {
  global.dates = { from: '', to: '' };
  global.message = 0;
  Car.find().then((result) => {
    res.render('all_cars', { title: 'All Cars', cars: result });
  }).catch((err) => {
    res.status(404).render('404', { title: 'Error' });
  });
});
app.post('/rent_info_details', (req, res) => {
  global.message = 0;
  let em = req.body.email;
  let idn = req.body.idnumber;
  if (em.length >= 12 && idn.length >= 9) {
    User.find({ email: req.body.email, idnumber: req.body.idnumber }).then((result) => {
      res.render('rent_info_details', { title: 'Information Details', user: result[0] });
    }).catch((err) => {
      res.status(404).render('404', { title: 'Error' });
    });
  } else {
    global.message = 1;
    res.render('rent_info', { title: 'Information', message: global.message });
  } 
});
app.get('/user_info_page/:id', (req, res) => {
  Car.findById(req.params.id).then(result => {
    res.render('user_info_page', { title: 'User Information', car: result, globa: global.dates, message: global.message });
  }).catch(err => {
    res.status(404).render('404', { title: 'Error' });
  });
});
app.post('/search_result', (req, res) => {
  global.dates = { from: req.body.receive_date, to: req.body.arrive_date };
  if ((Date.parse(req.body.receive_date) >= Date.parse(new Date())) && (Date.parse(req.body.arrive_date) > Date.parse(new Date())) && (Date.parse(req.body.arrive_date) > Date.parse(req.body.receive_date))){
    global.message = 0;
    Car.find({ available: true }).then((result) => {
      res.render('search_result', { title: 'Search Result', cars: result });
    }).catch((err) => {
      res.status(404).render('404', { title: 'Error' });
    });
  } else {
    global.message = 1;
    res.render('index', { title: 'Home', message: global.message });
  }
});
app.post('/search_result/filter', (req, res) => {
  Car.find({ available: true, cartype: req.body.cartype, fuletype: req.body.fuletype, gertype: req.body.gertype }).then((result) => {
    res.render('search_result', { title: 'Search Result', cars: result });
  }).catch((err) => {
    res.status(404).render('404', { title: 'Error' });
  });
});
// add new user and car to mongodb
app.post('/user/new', (req, res) => {
  global.message = 0;
  if ((Date.parse(req.body.from) >= Date.parse(new Date())) && (Date.parse(req.body.to) > Date.parse(new Date())) && (Date.parse(req.body.to) > Date.parse(req.body.from))){
    Car.findByIdAndUpdate(req.body.carid, { available: false, from: req.body.from, to: req.body.to }).then((result1) => {
      const underdata = { id: req.body.carid, name: result1.name, cost: result1.cost, from: new Date(req.body.from), to: new Date(req.body.to) };
      User.findOneAndUpdate({ email: req.body.email }, { $addToSet: { underrents: underdata } }).then(result2 => {
        if (result2 == null) {
          // add new user
          const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            birthdate: req.body.birthdate,
            idnumber: req.body.idnumber,
            city: req.body.city,
            underrents: [underdata],
            lastrents: []
          });
          user.save().then((result) => {
            res.render('rent_info_details', { title: 'Information Details', carid: req.body.carid, user: user });
          }).catch((err) => {
            res.status(404).render('404', { title: 'Error' });
          });
        } else {
          User.findById(result2.id).then(result => {
            res.render('rent_info_details', { title: 'Information Details', carid: req.body.carid, user: result });
          });
        }
      }).catch(err => {
        res.status(404).render('404', { title: 'Error' });
      });
    }).catch(err => {
      res.status(404).render('404', { title: 'Error' });
    });
  } else {
    global.message = 1;
    res.redirect(`/user_info_page/${req.body.carid}`);
  }
});
// move user underrent car to lastrent then delete it
app.post('/edit_car', (req, res) => {
  User.findByIdAndUpdate(req.body.userid, {
    $push: { lastrents: { id: req.body.carid, name: req.body.name, cost: req.body.cost, from: new Date(req.body.from), to: new Date(req.body.to) } },
    $pull: { underrents: { id: req.body.carid } }
  }).then(result => {
    Car.findByIdAndUpdate(req.body.carid, { available: true }).then(result => {
      User.findById(req.body.userid).then(result => {
        res.render('rent_info_details', { title: 'Information Details', carid: req.body.carid, user: result });
      });
    }).catch(err => {
      res.status(404).render('404', { title: 'Error' });
    });
  }).catch(err => {
    res.status(404).render('404', { title: 'Error' });
  });
});
// delete a car from lastrent
app.post('/delete_car', (req, res) => {
  User.findByIdAndUpdate(req.body.userid, { $pull: { lastrents: { id: req.body.carid } } }).then(result1 => {
    User.findById(req.body.userid).then(result => {
      res.render('rent_info_details', { title: 'Information Details', carid: req.body.carid, user: result });
    });
  }).catch(err => {
    res.status(404).render('404', { title: 'Error' });
  });
});
// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: 'Error' });
});
