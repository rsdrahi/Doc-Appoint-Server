// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config();
const app = express()
app.use(cors());

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db('docappoint')
    const appointCollection = db.collection('allAppointment');

    app.get('/all-appointment', async (req, res) => {
      const cursor = appointCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/all-appointment/:id', async (req, res) => {
      const { id } = req.params;
      const query = {_id: new ObjectId(id)}
      const result = await appointCollection.findOne(query)
      res.send(result);
    })

    app.get('/featured', async (req, res) => {
      const result = await appointCollection.find().limit(3).toArray();
      res.send(result);
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