
import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // --- BASIC CRUD ---
    // Create - Add a new book
    await books.insertOne({
      title: "The Silent Patient",
      author: "Alex Michaelides",
      year: 2019,
      genre: "Psychological Thriller"
    });

    // Read - Find a book by title
    const book = await books.findOne({ title: "1984" });
    console.log("Found Book:", book);

    // Update - Change the year of "Moby Dick"
    await books.updateOne(
      { title: "Moby Dick" },
      { $set: { year: 1852 } }
    );

    // Delete - Remove a book by title
    await books.deleteOne({ title: "The Silent Patient" });

    // --- ADVANCED QUERIES ---
    // Filtering: Find all books published after 1950
    const recentBooks = await books.find({ year: { $gt: 1950 } }).toArray();
    console.log("Books after 1950:", recentBooks);

    // Projection: Get only title and author fields
    const titlesAndAuthors = await books.find({}, { projection: { title: 1, author: 1, _id: 0 } }).toArray();
    console.log("Titles and Authors:", titlesAndAuthors);

    // Sorting: Sort books by year descending
    const sortedBooks = await books.find().sort({ year: -1 }).toArray();
    console.log("Sorted Books:", sortedBooks);

    // --- AGGREGATION PIPELINES ---
    // Count books by each author
    const booksByAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    console.log("Books by Author:", booksByAuthor);

    // Average publication year
    const avgYear = await books.aggregate([
      { $group: { _id: null, avgYear: { $avg: "$year" } } }
    ]).toArray();
    console.log("Average Year:", avgYear);

    // --- INDEXING ---
    await books.createIndex({ title: 1 });
    console.log("Index created on title field.");

    // Use explain to demonstrate performance
    const result = await books.find({ title: "1984" }).explain("executionStats");
    console.log("Execution Stats:", result.executionStats);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

// Run the function
run();