
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
    const findToken = res.locals.sessao.userId
    
    try {
        await movimentCollections.insertOne({value, description, date: date, type: "input", userId: findToken})
        return res.sendStatus(201)
    } catch (error) {
        return res.status(500).send(error.message)
    }
}

export async function editInput(req, res){
    const {id, value, description} = req.body

   
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
    const findToken = res.locals.sessao.userId

    try {
        await movimentCollections.insertOne({value, description, date: date, type: "output", userId: findToken})
        return res.sendStatus(201)
    } catch (error) {
        return res.status(500).send(error.message)
    }
}

export async function editOutput(req, res){
    const {id, value, description} = req.body
   
    try {
     const result = await movimentCollections.updateOne({_id:ObjectId(id)}, {$set: {value, description}})
     if(result.modifiedCount === 0) return res.status(404).send("Essa movimentação não existe!")
     res.send("Movimentação atualizada")
     
    } catch (error) {
     return res.status(500).send(error.message)
    }
}

export async function listMoviments(req, res){
  const findToken = res.locals.sessao.userId

    try {
      const movimentsList = await movimentCollections.find({userId: findToken}).toArray()
      return res.status(200).send(movimentsList)
  
    } catch (error) {
      return res.status(500).send(error.message)
    }
  
}

export async function deleteMoviment(req, res){
    const id = req.body.id
  
    try {
  
      const findId = await movimentCollections.findOne({_id: ObjectId(id)})
      if(!findId) return res.sendStatus(404)
  
      await movimentCollections.deleteOne({_id:ObjectId(id)})
      return res.sendStatus(200)
  
    } catch (error) {
      return res.status(500).send(error.message)
    }
  
}


