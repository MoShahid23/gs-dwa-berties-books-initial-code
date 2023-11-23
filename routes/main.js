module.exports = function(app, shopData) {

    // Handle our routes
    //Homepage
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });

    //About page
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    //list all books and their prices from database.
    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            //pass in all relevant data for ejs template render.
            let newData = Object.assign({}, shopData, {availableBooks:result});
            res.render("list.ejs", newData)
         });
    });

    //Listing books under £20
    app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            //pass in all relevant data for ejs template render.
            let newData = Object.assign({}, shopData, {availableBooks:result});
            res.render("bargainbooks.ejs", newData)
            });
    });

    //Render search page and manage form GET req.
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery; // query database to get the books.

        //determine what type of search user wants to perform and build sql query.
        if(req.query['search-type'] == 'similar'){
            sqlquery = `SELECT name, price FROM books WHERE name LIKE '%${req.query.keyword}%';`;
        }
        else{
            sqlquery = `SELECT name, price FROM books WHERE LOWER(name) = LOWER('${req.query.keyword}');`;
        }

        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            //pass in all relevant data for ejs template render.
            let newData = Object.assign({}, shopData, {availableBooks:result, keyword:req.query.keyword, exact:req.query['search-type']=="exact"});
            res.render('searched.ejs', newData);
        });
    });

    //Register
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);
    });
    app.post('/registered', function (req,res) {
        // saving data in database
        res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);                                                                              
    });

    //Adding a book to database
    app.get('/addbook', function (req,res) {
        res.render('addbook.ejs', shopData);
    });
    app.post('/bookadded', function (req,res) {
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.book, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          }
          else {
            //send a response confirming addition of book.
            //script to automatically redirect to list page to confirm book has been added.
            res.send(
                'This book is added to database, name: '+ req.body.book +
                ', price: '+ req.body.price
                + "<br>You will shortly be redirected to the list page..."
                +`
                <script>
                setTimeout(function() {
                    window.location.href = './list';
                }, 2000);
                </script>`
            );
          }
        });
    });
}
