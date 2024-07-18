//#region 
import { createClient } from "@vercel/postgres";
import express, { Request , Response } from "express";
import {config } from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import  cors  from "cors";

//#endregion
//#region
config(); 


const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const client = createClient({
    connectionString: process.env.DATABASE_URL

})

client.connect();

app.use(cors({ 
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
//#endregion

io.on("connection", (socket) =>{ 
console.log("A user connected");

socket.on ("message-sent", (message)=> { 
    client.query(`INSERT INTO messages (content) VALUES ($1)`, [message], (error)=>{    
if (!error) io.emit ("message-receivd", message)
})
io.emit("message-received", message)
})

socket.on("disconnected", ()=>{
    console.log("USer disconnected")
})
})



app.get("/", (req: Request, res: Response) =>{ 
res.send("Hello World!")
})


app.get("/api/messages",  (req: Request, res: Response) =>{ 
   
    client.query("SELECT * FROM messages", function(error, response){
         
        if (error) res.status(400).json({error})
            else res.status(200).json(response.rows)        
    });
})


app.post("/api/messages", (req: Request, res: Response) =>{
 
const {content} = req.body; //destructoring, quello che ho dopo l'uguale, la chiave viene estratto dall'oggetto
client.query(`INSERT INTO messages (content) VALUES ($1)`, [content], (error, response)=>{
    
if (error) res.status(500).send({error})
    else res.status(200).send({message: "succesfully created"})
})
} )


app.listen(8080, () =>{ 
    console.log(`Server is running on http://localhost:${8080}`)
})
server.listen(3000, () =>{ 
    console.log(`Server is running on http://localhost:${3000}`)
})
