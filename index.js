const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const jwt = require('jsonwebtoken')
const port=process.env.PORT || 5000
app.use(cors({
origin:['http://localhost:5173'],
credentials:true

}))
app.use(express.json())
app.use(cookieParser())

const verifyToken=async(req,res,next)=>
{
const token=req.cookies.token
console.log('token',token)
if(!token)return res.send({message:'Not Authorized'})
jwt.verify(token,process.env.Access_Token,(err,decoded)=>{
if(err)return res.send({message:'Not Authorized'})
req.user=decoded
next()
})
next()

}

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.dqsrrse.mongodb.net/?retryWrites=true&w=majority`
;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

const ProductsDB = client.db("ProductDB").collection("products");
const Cart = client.db("CartDB").collection("CartItems");




app.get('/cart', verifyToken,async (req, res) => {
  try {
    const cursor = Cart.find();
    const cartItems = await cursor.toArray();
    res.send(cartItems);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});


app.get('/brandPage/:brand', async (req, res) => {
  const brand = req.params.brand;
  const products = await ProductsDB.find({ brandName: brand }).toArray();
res.send(products)
})

app.get('/:name', async (req, res) => {
  const name = req.params.name;
  const product = await ProductsDB.findOne({ name: name });
res.send(product)
})

app.get('/update/:name', async (req, res) => {
  const name = req.params.name;
  const product = await ProductsDB.findOne({ name: name });
res.send(product)
})

app.post('/jwt',async(req,res)=>{
const user=req.body
const token=jwt.sign(user,process.env.Access_Token,{expiresIn:'1h'})
res.cookie('token',token,{
httpOnly:true,
secure:false,

})
res.send({success:true})

})


app.post('/addProduct',async(req,res)=>{
const newProduct=req.body

  const result = await ProductsDB.insertOne(newProduct);
res.send(result)

})

app.post('/addtoCart',async(req,res)=>{
const newProduct=req.body

  const result = await Cart.insertOne(newProduct);
res.send(result)

})




app.post('/update/:id',async(req,res)=>{
const newProduct=req.body
const id=req.params.id
const query={_id:new ObjectId(id)}
const result = await Cart.insertOne(newProduct);
res.send(result)

})

app.put('/update/:id',async(req,res)=>{
const id = req.params.id;

const { name,brandName, price, Description, rating }=req.body
const query={_id:new ObjectId(id)}
 const updateDoc = {
      $set: {
        name:name,
        brandName:brandName,
        price:price,
        Description:Description,
        rating:rating

      },
    };

const result = await ProductsDB.updateOne(query, updateDoc);
res.send(result)

})

 app.delete('/:name',async(req,res)=>{

 const name = req.params.name;
const query={ name: name }
 const result = await Cart.deleteOne(query);
res.send(result)

})






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }


}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Connection to the server is working.');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





// /
// app.get('/coffee',async(req,res)=>{

//  const cursor=  coffeecollection.find()
// const coffees=await cursor.toArray()
// res.send(coffees)

// })


// app.get('/coffee/:id',async(req,res)=>{
// const id=req.params.id
// const query={_id:new ObjectId(id)}
//  const coffee = await coffecollection.findOne(query)
// res.send(coffee)

// })




// app.post('/coffee',async(req,res)=>{
// const newcoffee=req.body

//   const result = await coffeecollection.insertOne(newcoffee);
// res.send(result)

// })


