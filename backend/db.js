const mongoose = require("mongoose");

const url =
  "mongodb://ezekiel:Nothing5265@cluster0-shard-00-00.z7unp.mongodb.net:27017,cluster0-shard-00-01.z7unp.mongodb.net:27017,cluster0-shard-00-02.z7unp.mongodb.net:27017/?ssl=true&replicaSet=atlas-qkc5sa-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const connectToDatabase = () => {
  mongoose
    .connect(url)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB", err));
};

module.exports = connectToDatabase;
