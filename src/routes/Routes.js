import { Router } from "express";
import { login, registration, input,editInput,output,editOutput,listMoviments,deleteMoviment } from "../controller/Controller.js";

const router = Router()

router.post("/", login);
router.post("/cadastro", registration);
router.post("/nova-entrada", input);
router.put("/nova-entrada", editInput);
router.post("/nova-saida", output);
router.put("/nova-saida", editOutput);
router.get("/home", listMoviments);
router.delete("/home", deleteMoviment);

export default router