## **IRC - Internet Relay Chat**
An Internet Relay Chat application built with **Nest.js**, **Typescript**, **Socket.IO**, and **React.js**.

### **Table of Contents**
- [About the Project](#about-the-project)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Authors](#authors)

---

## **About the Project**
This project is an **IRC (Internet Relay Chat)** system that communicate via real-time messaging, and manage chat rooms dynamically. It consists of:
- A **server** built with **Typescript** and **Nest.js**, managing connections and channels.
- A **client** built with **React.js** and **Typescript** providing an intuitive chat interface.
- **Socket.IO** for real-time communication between clients and the server.

---

## **Features**
✅ Users can set a nickname  
✅ Users can list all available channels  
✅ Users can create, delete, and rename channels   
✅ Users can send messages in channels  
✅ Users can send private messages  
✅ Notifications for user join/leave events  
✅ Persistent storage for messages and channels  
✅ Well-designed UI for a smooth chat experience

---

## **Installation**
### **1️⃣ Clone the repository**
```bash
git clone git@github.com:EpitechMscProPromo2027/T-JSF-600-MPL_8.git
cd T-JSF-600-MPL_8/
```

### **2️⃣ Install dependencies**
#### **Server**
```bash
cd backend/
npm install
```
#### **Client**
```bash
cd frontend/
npm install
```

### **3️⃣ Run the project**
#### **Start the server**
```bash
cd backend/
npm run start
```
#### **Start the client**
```bash
cd frontend/
npm start
```
The server will run on `http://localhost:3000`  
The client will run on `http://localhost:3000`

---

## **Usage**
1. Open the client (`http://localhost:3000`) in a browser.
2. Enter a nickname.
3. List available channels or create a new one.
4. Join a channel and start chatting in real-time!

---

## **Commands**
| Command | Description |
|---------|------------|
| `/nick nickname` | Change your nickname |
| `/list` | List all available channels |
| `/create channel` | Create a new channel |
| `/delete channel` | Delete a channel |
| `/join channel` | Join a channel |
| `/quit channel` | Leave a channel |
| `/users` | List users in a channel |
| `/msg nickname message` | Send a private message |
| `message` | Send a message in the current channel |

---

## **Testing**
Run unit tests with:
```bash
npm test
```
Ensure that the test suite covers:
- User connection and disconnection
- Message handling
- Channel management
- Private messaging

---

## **Technologies Used**
- **Backend**: Nest.js,Typescript, Socket.IO
- **Frontend**: React.js, Typescript, HTML, CSS
- **Database**: MongoDB, localstorage
- **Testing**: Jest

---

## **Authors**
- [Geoffrey Deparcy](https://github.com/Xyrtiel)
- [Tiffany Gomez](https://github.com/TiffanyGomez)
- [Alysson Deligny](https://github.com/AlyssonDeligny)

---

## **License**
This project is licensed under the **MIT License**.

---
