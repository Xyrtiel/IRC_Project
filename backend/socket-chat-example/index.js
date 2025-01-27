import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

// Configuration MongoDB
const mongoUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl);
const dbName = 'chatApp';
let usersCollection, channelsCollection, channelMessagesCollection, privateMessagesCollection;

// Connexion à la base de données
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        usersCollection = db.collection('users');
        channelsCollection = db.collection('channels');
        channelMessagesCollection = db.collection('channelMessages');
        privateMessagesCollection = db.collection('privateMessages');
        await usersCollection.createIndex({ username: 1 }, { unique: true });
    } catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
    }
}

await connectToDatabase();

// Initialisation du serveur
const app = express();
const server = createServer(app);
const io = new Server(server);

// Utilisation de __dirname avec ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Route pour servir la page HTML
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Middleware d'authentification
io.use(async (socket, next) => {
    const { username, password } = socket.handshake.auth;

    if (!username || !password) {
        socket.emit('auth_error', 'Username and password are required.');
        return next(new Error('Username and password are required.'));
    }

    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
            socket.emit('auth_error', 'Invalid username or password.');
            return next(new Error('Invalid username or password.'));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            socket.emit('auth_error', 'Invalid username or password.');
            return next(new Error('Invalid username or password.'));
        }

        socket.username = username;
        next();
    } catch (error) {
        socket.emit('auth_error', 'Internal server error.');
        return next(new Error('Internal server error.'));
    }
});

// Gestion des événements Socket.IO
io.on('connection', async (socket) => {
    console.log(`User "${socket.username}" connected.`);

    // Envoyer la liste des channels existants
    const channels = await channelsCollection.find().toArray();
    socket.emit('channel list', channels);

    // Envoyer un message dans un channel
    socket.on('chat message', async (msg, channelName) => {
        if (channelName) {
            const channel = await channelsCollection.findOne({ name: channelName });
            if (channel && channel.members.includes(socket.username)) {
                const message = { channel: channelName, sender: socket.username, content: msg, timestamp: new Date() };
                await channelMessagesCollection.insertOne(message);
                io.to(channelName).emit('chat message', message);
            } else {
                socket.emit('error', 'You are not a member of this channel');
            }
        } else {
            socket.emit('error', 'Channel name is required');
        }
    });

    // Récupérer l'historique des messages d'un channel
    socket.on('fetch channel messages', async (channelName) => {
        if (channelName) {
            const messages = await channelMessagesCollection.find({ channel: channelName }).sort({ timestamp: 1 }).toArray();
            socket.emit('channel messages', messages);
        } else {
            socket.emit('error', 'Channel name is required');
        }
    });

    // Messages privés entre utilisateurs
    socket.on('private message', async (msg, recipient) => {
        const user = await usersCollection.findOne({ username: recipient });
        if (user) {
            const message = { sender: socket.username, recipient, content: msg, timestamp: new Date() };
            await privateMessagesCollection.insertOne(message);
            socket.to(recipient).emit('private message', message);
        } else {
            socket.emit('error', 'Recipient does not exist');
        }
    });

    // Récupérer l'historique des messages privés
    socket.on('fetch private messages', async (recipient) => {
        const messages = await privateMessagesCollection.find({
            $or: [
                { sender: socket.username, recipient },
                { sender: recipient, recipient: socket.username }
            ]
        }).sort({ timestamp: 1 }).toArray();
        socket.emit('private messages', messages);
    });

    // Création d'un channel
    socket.on('create channel', async (channelName) => {
        if (channelName) {
            const existingChannel = await channelsCollection.findOne({ name: channelName });
            if (existingChannel) {
                socket.emit('error', 'Channel already exists');
            } else {
                await channelsCollection.insertOne({ name: channelName, members: [socket.username] });
                io.emit('channel list', await channelsCollection.find().toArray());
            }
        } else {
            socket.emit('error', 'Channel name is required');
        }
    });

    // Joindre un channel
    socket.on('join channel', async (channelName) => {
        if (channelName) {
            const channel = await channelsCollection.findOne({ name: channelName });
            if (channel) {
                if (!channel.members.includes(socket.username)) {
                    await channelsCollection.updateOne(
                        { name: channelName },
                        { $push: { members: socket.username } }
                    );
                }
                socket.join(channelName);
                socket.emit('joined channel', channelName);
            } else {
                socket.emit('error', 'Channel does not exist');
            }
        } else {
            socket.emit('error', 'Channel name is required');
        }
    });

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        console.log(`User "${socket.username}" disconnected.`);
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
