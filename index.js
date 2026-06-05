// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();
const app = express()
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // console.log(token, "Token");
  try {
    const { payload } = await jwtVerify(token, JWKS)
  console.log(payload);
  next();
  } catch (error) {
    return res.status(403).json({message: "Forbidden"})
  }
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db('docappoint')
    const appointCollection = db.collection('allAppointment');
    const bookCollection = db.collection('bookDoctorAppointment');
    const userCollection = db.collection('user');

    app.get('/all-appointment', async (req, res) => {
      const cursor = appointCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/all-appointment/:id', verifyToken,  async (req, res) => {
      const { id } = await req.params;
      // console.log(id, "Id");
      const query = { _id: id }
      // console.log(query, 'query');
      const result = await appointCollection.findOne(query)
      // console.log(result, "result");
      res.send(result);
    })

    app.post('/book-appointment', async (req, res) => {
      const appointment = req.body;
      console.log(appointment, "appointment");
      const result = await bookCollection.insertOne(appointment);
      res.send(result);
    })

    app.get('/book-appointment', async (req, res) => {
      const result = await bookCollection.find().toArray();
      res.send(result);
    })

    app.patch('/book-appointment/:id', async (req, res) => {
      const { id } = req.params;
      const updataData = req.body
      const result = await bookCollection.updateOne(
        { _id: new ObjectId(id) },
        {$set: updataData}
      )
      res.send(result);
    })

    app.delete('/book-appointment/:id', async (req, res) => {
      const { id } = await req.params;
      const query = {_id: new ObjectId(id) }
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    })

    app.patch('/user/update/:email', async (req, res) => {
      const email = req.params.email;
      const { name, image } = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: { name, image } }
      );
      res.send(result)
    })

    app.get('/featured', async (req, res) => {
      const result = await appointCollection.find().limit(3).toArray();
      res.json(result);
    })



    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is Running Fine')
})



app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
})