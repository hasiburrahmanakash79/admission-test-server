const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvcivem.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const CollegeCollection = client
      .db("admissionTest")
      .collection("allCollege");
    const usersCollection = client.db("admissionTest").collection("users");
    const applyCollection = client.db("admissionTest").collection("apply");

    app.get("/allCollege", async (req, res) => {
      const colleges = CollegeCollection.find();
      const result = await colleges.toArray();
      res.send(result)
    });

    app.get("/collegeDetail/:id", async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await CollegeCollection.findOne(query)
      res.send(result)
    })

    app.get("/users", async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send([]);
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    app.post('/apply', async(req, res) => {
      const query = req.body
      const result = await applyCollection.insertOne(query)
      res.send(result)
    })

    app.get('/apply', async(req, res) => {
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const cursor = applyCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Admission Test");
});

app.listen(port, () => {
  console.log(`Admission test is running on ${port}`);
});
