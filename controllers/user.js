const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const DateUtil = require('../util/DateUtil');
const AuthToken = require('../util/Auth');

require('dotenv').config();

const middlewareAuth = AuthToken.middlewareAuth;

const getUser = async (req, res) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1];
        const user = await User.find({token:token},'-senha -token');
        return res.status(200).json({user});
    }catch(err){
        console.log(err);
        return res.status(500).json({
            'mensagem': 'erro interno no servidor.'
        });
    }
}

const getUsers = async (req, res) => {
    const {query, params} = req.body;
    let user;
    if(!params){
        user = await User.find(query,'-senha -token');
    }else{
        user = await User.find(query,params);
    }

    return res.status(200).json({user});
}

const startApi = (req, res) => {
    res.status(200).json({'mensagem': 'Backend - Desafio Técnico 2 - Escribo Inovação para o Aprendizado'})
}

const createNewUser = async (req, res) => {

    try{
        const {nome, email, senha, telefones} = req.body;

        if(!nome){
            return res.status(422).json({'mensagem': 'Necessário campo nome.'})
        }

        if(!email){
            return res.status(422).json({'mensagem': 'Necessário campo email.'})
        }

        if(!senha){
            return res.status(422).json({'mensagem': 'Necessário campo senha.'})
        }

        if(!telefones){
            return res.status(422).json({'mensagem': 'Necessário campo telefones.'})
        }

        if(telefones.length > 3){
            return res.status(422).json({'mensagem': 'Excede o número máximo do campo telefones.'})
        }

        let emailUpper = email.toUpperCase();
        let nomeUpper = nome.toUpperCase();

        const userExists = await User.findOne({email: emailUpper});

        if(userExists){
            return res.status(409).json({'mensagem': 'E-mail já existente.'})
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(senha, salt);

        const createdAt = new DateUtil().getDateNowYYYYMMDD_HHMMSS();

        const user = new User({
            nome: nomeUpper, email: emailUpper, senha: passwordHash, telefones: telefones,
            ultimo_login: "null", data_criacao: createdAt, data_atualizacao: createdAt, token: 'null'
        });


        await user.save();
        res.status(201).json({
            'id': user._id,
            'data_criacao': createdAt,
            'data_atualizacao': createdAt,
            'ultimo_login': user.ultimo_login

        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            'mensagem': 'erro interno no servidor.'
        })
        
    }
}

const loginUser = async (req, res) => {
    const {email, senha} = req.body;

    if(!email){
        return res.status(422).json({'mensagem': 'Necessário campo email.'})
    }

    if(!senha){
        return res.status(422).json({'mensagem': 'Necessário campo senha.'})
    }

    const secret = process.env.SECRET;
    let emailUpper = email.toUpperCase();

    const userExists = await User.findOne({email: emailUpper});
    if(!userExists){
        return res.status(401).json({'mensagem': 'Usuário ou senha inválidos'})
    }


    const checkPassword = await bcrypt.compare(senha, userExists.senha);
    if(!checkPassword){
        return res.status(401).json({'mensagem': 'Usuário ou senha inválidos'})
    }

        
    if(AuthToken.checkToken(userExists.token)){
        res.status(200).json({
            'id': userExists._id,
            'data_criacao': userExists.data_criacao,
            'data_atualizacao': userExists.data_atualizacao,
            'token': userExists.token
        })
        return
    }

    try{

        const token = await jwt.sign({
            id: userExists._id,
        }, secret, {
            expiresIn: '30m'
        }
        )

        const dateNow = new DateUtil().getDateNowYYYYMMDD_HHMMSS();
        await User.findOneAndUpdate({_id:userExists._id}, {data_atualizacao: dateNow, ultimo_login: dateNow, token: token});

        res.status(200).json({
            'id': userExists._id,
            'data_criacao': userExists.data_criacao,
            'data_atualizacao': dateNow,
            'token': token

        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            'mensagem': 'erro interno no servidor.'
        })
    }
    
}

const notFound = (req, res) => {
    res.status(404).json({'mensagem': 'endpoint não encontrado.'});
}

module.exports = {
    notFound, createNewUser, loginUser, startApi, getUsers, getUser, middlewareAuth
}

