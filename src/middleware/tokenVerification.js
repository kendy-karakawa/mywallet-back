import db from "../config/database.js";


export async function tokenVerification(req,res,next){
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ", "")
    
    if (!token) return res.status(422).send("Informe o token!")
    
    try {
        
        const checkSession = await db.collection("sessions").findOne({token})

        if (!checkSession) return res.sendStatus(401)

        res.locals.sessao = checkSession

        next()

    } catch (error) {
        res.status(500).send(error)
    }


}