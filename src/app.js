import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db();
  console.log("Conectado ao mongodb");
} catch (error) {
  console.log("Deu erro no mongodb", error.message);
}

const registCollection = db.collection("registration");
const movimentCollections = db.collection("moviment");
const date = dayjs().format("DD/MM")

app.post("/", async (req, res)=>{
    const {email, password} = req.body

    try {
        const findUser = await registCollection.findOne({email})
        if (!findUser) return res.status(404).send("User not found")
        if (findUser && findUser.password !== password) return res.status(401).send("Invalid password")

        return res.sendStatus(200)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})


app.post("/cadastro", async (req, res) => {
  const { name, email, password, repeatPassword } = req.body;
    console.log("1")
  const schema = joi.object({
    name: joi.string().alphanum().min(3).max(10).required(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
    password: joi.string().alphanum().min(3).max(10).required(),
    repeatPassword: joi.ref("password")
  });

  const verification = schema.validate(
    { name, email, password, repeatPassword },
    { abortEarly: false }
  );
  if (verification.error) {
    return res.status(422).send(verification.error);
  }

  try {
    const findName = registCollection.findOne({name})
    if (findName) return res.sendStatus(409)
    
    await registCollection.insertOne({
      name,
      email,
      password,
      repeatPassword
    });

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post("/nova-entrada", async (req, res)=>{
    const {value, description} = req.body
    const email = req.headers.email

    const findUser = await registCollection.findOne({email: email})
    if(!findUser) return res.sendStatus(401)

    const schema = joi.object({
        value: joi.number().required(),
        description: joi.string().min(3).required()
    })

    const verification = schema.validate({value, description})
    if(verification.error) return res.status(422).send(verification.error)

    try {
        await movimentCollections.insertOne({value, description, date: date, type: "input", email: email})
        return res.sendStatus(201)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

app.put("/nova-entrada", async (req, res)=>{
 const email = req.headers.email
 const {id, value, description} = req.body

 const findUser = await registCollection.findOne({email: email})
 if(!findUser) return res.sendStatus(401)

 const schema = joi.object({
     value: joi.number().required(),
     description: joi.string().min(3).required()
 })

 const verification = schema.validate({value, description})
 if(verification.error) return res.status(422).send(verification.error)

 try {
  const result = await movimentCollections.updateOne({_id:ObjectId(id)}, {$set: {value, description}})
  if(result.modifiedCount === 0) return res.status(404).send("Essa movimentação não existe!")
  res.send("Movimentação atualizada")
  
 } catch (error) {
  return res.status(500).send(error.message)
 }
})

app.post("/nova-saida", async (req, res)=>{
  const {value, description} = req.body
  const email = req.headers.email

  const findUser = await registCollection.findOne({email: email})
  if(!findUser) return res.sendStatus(401)
    
  const schema = joi.object({
      value: joi.number().required(),
      description: joi.string().min(3).required()
  })

  const verification = schema.validate({value, description})
  if(verification.error) return res.status(422).send(verification.error)

  try {
      await movimentCollections.insertOne({value, description, date: date, type: "output", email: email})
      return res.sendStatus(201)
  } catch (error) {
      return res.status(500).send(error.message)
  }
})

app.put("/nova-saida", async (req, res)=>{
  const email = req.headers.email
  const {id, value, description} = req.body
 
  const findUser = await registCollection.findOne({email: email})
  if(!findUser) return res.sendStatus(401)
 
  const schema = joi.object({
      value: joi.number().required(),
      description: joi.string().min(3).required()
  })
 
  const verification = schema.validate({value, description})
  if(verification.error) return res.status(422).send(verification.error)
 
  try {
   const result = await movimentCollections.updateOne({_id:ObjectId(id)}, {$set: {value, description}})
   if(result.modifiedCount === 0) return res.status(404).send("Essa movimentação não existe!")
   res.send("Movimentação atualizada")
   
  } catch (error) {
   return res.status(500).send(error.message)
  }
 })

app.get("/home", async (req, res)=>{
  const email = req.headers.email

  const findUser = await registCollection.findOne({email: email})
  if(!findUser) return res.sendStatus(401)

  try {
    const movimentsList = await movimentCollections.find({email: email}).toArray()
    return res.status(200).send(movimentsList)

  } catch (error) {
    return res.status(500).send(error.message)
  }


})

app.delete("/home", async (req, res)=>{
  const email = req.headers.email
  const id = req.body.id

  try {
    const finduser = await registCollection.findOne({email})
    if(!finduser) return res.sendStatus(401)

    const findId = await movimentCollections.findOne({_id: ObjectId(id)})
    if(!findId) return res.sendStatus(404)

    await movimentCollections.deleteOne({_id:ObjectId(id)})
    return res.sendStatus(200)

  } catch (error) {
    return res.status(500).send(error.message)
  }

})

const port = 5000;
app.listen(port, () => console.log("Server is running !!"));
