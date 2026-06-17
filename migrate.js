const { MongoClient } = require('mongodb');

const oldUri = "mongodb+srv://admin:shahir484m@librarydb.bqnxcrb.mongodb.net/?appName=LibraryDB";
const newUri = "mongodb+srv://albayanmedia786_db_user:KuhTcODaxAMiVr3X@cluster0.0sx6md0.mongodb.net/?appName=Cluster0";

const options = { tlsAllowInvalidCertificates: true };

async function migrate() {
    console.log("Connecting to Old Database...");
    const oldClient = new MongoClient(oldUri, options);
    await oldClient.connect();
    const oldDb = oldClient.db('test'); // Mongoose defaults to 'test'

    console.log("Connecting to New Database...");
    const newClient = new MongoClient(newUri, options);
    await newClient.connect();
    const newDb = newClient.db('test');

    const collections = await oldDb.listCollections().toArray();
    console.log("Found collections: ", collections.map(c => c.name));

    for (const coll of collections) {
        if (coll.type === 'view' || coll.name === 'system.views') continue;
        console.log(`Reading collection: ${coll.name}...`);
        const docs = await oldDb.collection(coll.name).find({}).toArray();
        if (docs.length > 0) {
            console.log(`Writing ${docs.length} documents to new database for ${coll.name}...`);
            await newDb.collection(coll.name).insertMany(docs);
        } else {
            console.log(`No documents in ${coll.name}.`);
        }
    }

    console.log("Migration completed successfully!");
    await oldClient.close();
    await newClient.close();
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
