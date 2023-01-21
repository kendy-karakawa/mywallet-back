import joi from "joi";
import dayjs from "dayjs";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { ObjectId } from "mongodb";
import db from "../config/database.js";

const registCollection = db.collection("registration");
const movimentCollections = db.collection("moviment");
const sessions = db.collection("sessions")
const date = dayjs().format("DD/MM")

export async function login(req, res){
    const {email, password} = req.body

    try {
        const findUser = await registCollection.findOne({email})
        if (findUser && bcrypt.compareSync(password, findUser.password)){

          const token = uuid()

          await sessions.insertOne({userId:findUser._id, token})


          return res.status(200).send(token)
        } else{
          return res.status(400).send("E-mail ou senha incorreto")
        }

        
    } catch (error) {
        return res.status(500).send(error.message)
    }
}

export async function registration(req, res){
    const { name, email, password, repeatPassword } = req.body;
    
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
    const findEmail = await registCollection.findOne({email})
    if (findEmail) return res.status(409).send("Este e-mail ja foi utilizado")

    const criptPassaword = bcrypt.hashSync(password, 10)
    
    await registCollection.insertOne({
      name,
      email,
      password: criptPassaword
    });

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function input(req, res){
    const {value, description} = req.body
    const {authorization} = req.headers
    
    const token = authorization?.replace("Bearer ", "")
    
    if (!token) return res.sendStatus(401)
    
    const findToken = await sessions.findOne({token})
    if (!findToken) return res.sendStatus(401)

    const schema = joi.object({
        value: joi.number().required(),
        description: joi.string().min(3).required()
    })

    const verification = schema.validate({value, description})
    if(verification.error) return res.status(422).send(verification.error)

    try {
        await movimentCollections.insertOne({value, description, date: date, type: "input", userId: findToken.userId})
        return res.sendStatus(201)
    } catch (error) {
        return res.status(500).send(error.message)
    }
}

export async function editInput(req, res){
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
}

export async function output(req, res){
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
}

export async function editOutput(req, res){
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
}

export async function listMoviments(req, res){
    const email = req.headers.email

    const findUser = await registCollection.findOne({email: email})
    if(!findUser) return res.sendStatus(401)
  
    try {
      const movimentsList = await movimentCollections.find({email: email}).toArray()
      return res.status(200).send(movimentsList)
  
    } catch (error) {
      return res.status(500).send(error.message)
    }
  
}

export async function deleteMoviment(req, res){
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
  
}


