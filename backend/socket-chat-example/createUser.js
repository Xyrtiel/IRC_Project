import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

// MongoDB URL et base de données
const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'chatApp';
const client = new MongoClient(mongoUrl);

async function createUser(username, password) {
  try {
    // Connexion à MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion de l'utilisateur dans la base de données
    await usersCollection.insertOne({ username, password: hashedPassword });
    console.log(`User "${username}" created successfully.`);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    // Fermeture de la connexion à MongoDB
    await client.close();
  }
}

// Créez des utilisateurs avec des noms d'utilisateur et des mots de passe
createUser('sophie', 'password123');  // Crée un utilisateur "sophie"
createUser('john', '123456');         // Crée un utilisateur "john"
