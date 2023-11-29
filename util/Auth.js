const jwt = require('jsonwebtoken');
require('dotenv').config();

class Auth {
    constructor() { }
    static async middlewareAuth(req, res, next) {
        try{
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(" ")[1];
            if(Auth.checkToken(token)){
                next();
            }else{
                return res.status(401).json({'mensagem': 'Não autorizado'})
            }
        }catch(err){
            return res.status(401).json({'mensagem': 'Não autorizado'})
        }
    }
    
    static checkToken(token) {
    
        if(!token){
            return false;
        }
        try{
            const secret = process.env.SECRET;
            jwt.verify(token, secret);
            return true;
        }catch(error){
            return false;
        }
    }
}


module.exports = 
    Auth
;