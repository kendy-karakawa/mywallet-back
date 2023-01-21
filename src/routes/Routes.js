import { Router } from "express";
import { login, registration, input,editInput,output,editOutput,listMoviments,deleteMoviment } from "../controller/Controller.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { registrationSchema, movimentSchema, loginSchema} from "../schema/schema.js";
import { tokenVerification } from "../middleware/tokenVerification.js";

const router = Router()

router.post("/", validateSchema(loginSchema), login);
router.post("/cadastro",validateSchema(registrationSchema), registration);

router.use(tokenVerification)
router.post("/nova-entrada",validateSchema(movimentSchema), input);
router.put("/nova-entrada",validateSchema(movimentSchema), editInput);
router.post("/nova-saida",validateSchema(movimentSchema), output);
router.put("/nova-saida",validateSchema(movimentSchema), editOutput);
router.get("/home", listMoviments);
router.delete("/home", deleteMoviment);

export default router