
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95g0ypv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        // await client.connect();

        const touristSpotCollection = client.db('touristSpotDB').collection('touristSpot');


        app.get('/touristSpot', async (req, res) => {
            const cursor = touristSpotCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/touristSpot', async (req, res) => {
            const newTouristSpot = req.body;
            console.log(newTouristSpot);
            const result = await touristSpotCollection.insertOne(newTouristSpot);
            res.send(result);
        })

        app.get('/singleDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await touristSpotCollection.findOne(query);
            res.send(result);
        })





        //Country Information 
        const counteryInfoCollection = client.db('touristSpotDB').collection('countryInfo');

        app.post('/countryData', async (req, res) => {
            const country = req.body;
            const result = await counteryInfoCollection.insertOne(country);
            res.send(result);
        });

        app.get('/countryData', async (req, res) => {
            const cursor = counteryInfoCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })





        // user data

        const userCollection = client.db('touristSpotDB').collection('userData');


        app.get('/userData', async (req, res) => {
            const cursor = userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        })

        app.get('/userData', async (req, res) => {
            try {

                const sortOrder = req.query.sortOrder === 'desc' ? 1 : -1;

                const pipeline = [
                    {
                        $group: {
                            _id: null,
                            avgCost: { $avg: { $toInt: '$cost' } }
                        }
                    }
                ];

                const avgCostResult = await client.db('touristSpotDB').collection('userCollection').aggregate(pipeline).toArray();

                const cursor = client.db('touristSpotDB').collection('userCollection').find().sort({ cost: sortOrder });
                const users = await cursor.toArray();

                res.json({ avgCost: avgCostResult[0].avgCost, users });
            } catch (error) {
                console.error('Error fetching user data:', error);
                res.status(500).send('Internal Server Error');
            }
        });


        app.get('/allTouristSingleDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(query);
            res.send(result);
        })



        app.get('/updateData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(query);
            res.send(result);
        })


        app.put('/updateData/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedTouristSpot = req.body;

            const tourSpot = {
                $set: {
                    image: updatedTouristSpot.image,
                    spotsName: updatedTouristSpot.spotsName,
                    cost: updatedTouristSpot.cost,
                    seasonality: updatedTouristSpot.seasonality,
                    country: updatedTouristSpot.country,
                    location: updatedTouristSpot.location,
                    description: updatedTouristSpot.description,
                    travelTime: updatedTouristSpot.travelTime,
                    visitors: updatedTouristSpot.visitors
                }
            }
            const result = await userCollection.updateOne(filter, tourSpot, options);
            res.send(result);
        })

        app.post('/userData', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.delete('/deleteData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })






        app.get('/myList/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await userCollection.find({email: req.params.email}).toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Tourism management System is running")
})

app.listen(port, () => {
    console.log(`Tourism management System is running on port: ${port}`);
})
