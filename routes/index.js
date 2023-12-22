var express = require('express');
var router = express.Router();
const mysql = require('mysql2');
const Redis = require('ioredis');

const connection = mysql.createConnection({
    host: 'host name',
    port:3306,
    user: 'user',
    password: 'userPassword',
    database: 'database'
  });

  // Replace with the actual IP and port of your Redis server
const redis = new Redis({
  host: 'hostname',
  port: 6379,
});

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');
  });

/* GET home page. */
router.post('/store-products', function(req, res, next) {
  const data = req.body;
  var dataToStore = data.products;
  // Prepare the SQL statement with placeholders
  const sql = 'INSERT INTO employees (name, price, availability) VALUES (?, ?, ?)';

    var count=0;
    // Insert each row in a loop
    dataToStore.forEach(product => {
      var values = [];
      values.push(product.name)
      values.push(product.price)
      values.push(product.availability)
        connection.query(sql, values, (error, results) => {
            if(error){
                res.status(500).json({"error":"Failed to add data to table"}).send()
                return
            }
            count++   
        });
        if(count==dataToStore.length-1)
            res.status(200).json({"message":"success"}).send()
    });
});

router.get("/list-products",function(req,res){
    var sql = "select * from products";

    // Example: Get a value by key
    redis.get('products').then((value) => {
      if(value==null){
        connection.query(sql, (err, results, fields) => {
          if (err) {
            res.status(500).json({"error":err}).send();
          }
          else{
              redis.set('products',JSON.stringify(results))
              .then(()=>{
                res.status(200).json({"products":result,cache:false}).send();
              })
          }
        })
      }
      else{
        var result = JSON.parse(value);
        res.status(200).json({
          products : result,
          cache:true
        })
      }  
    });
})

router.get("/test-redis",function(req,res){
  redis.ping((err, result) => {
    if (err) {
      console.error('Error connecting to Redis:', err);
    } else {
      console.log('Connected to Redis');
    }
    redis.quit();
  });
})

router.get("/ping",function(req,res){
  res.send("Smaple resource")
})

module.exports = router;


