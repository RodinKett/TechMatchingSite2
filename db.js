require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.URI;
const client = new MongoClient(uri);

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("Connected to MongoDB");
  }
  return client;
}

module.exports = { connectDB };
