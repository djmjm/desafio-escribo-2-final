
const controller = require('../../controllers/user');
const User = require('../../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth = require('../../util/Auth');

jest.mock('../../model/User');
describe("Testes controllers", () => {
    describe("Inicializar API", () => {
        test("Deve poder acessar endpoint '/user' ", async () => {
            const request = {};
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
    
            await controller.startApi(request, response);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'Backend - Desafio Técnico 2 - Escribo Inovação para o Aprendizado'}
            );
        }) 
    
        test("Rota inexistente deve retornar 404", async () => {
            const request = {};
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
    
            await controller.notFound(request, response);
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'endpoint não encontrado.'}
            );
        }) 
    })

    describe("Criando Usuarios", () => {
        test("Se email já existir, deve retornar 409", async () => {
            User.findOne = jest.fn().mockResolvedValue([{
                    _id: '65651f6da05d14bd227bda59',
                    nome: 'Douglas',
                    email: 'teste@email.com',
                    telefones: [{numero: '123456789', ddd: '51'}],
                    data_criacao: '2023-11-27|23:34:38',
                    data_atualizacao: '2023-11-27|23:34:38',
                    ultimo_login: '2023-11-27|23:34:38'
                }
            ])

            const request = {
                body: {
                    nome: 'Douglas',
                    email: 'teste@email.com',
                    senha: 'HelloWorld',
                    telefones: [{numero: '123456789', ddd: '51'}]
                }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            await controller.createNewUser(request, response);
            expect(response.status).toHaveBeenCalledWith(409);
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'E-mail já existente.'}
            );
        });

        test("Se email não existir, deve criar usuário e retornar 201", async () => {

            const dateNow = '2023-11-27|23:34:59';

            bcrypt.genSalt = jest.fn().mockResolvedValue('dsdsdsdsdsddcdc');
            bcrypt.hash = jest.fn().mockResolvedValue('$2b$12$SXwza6XUL3j65e3O35zdCOkSXIpHCnXtl.i21rv/Y354vmoifuOZu');
            createdAt = jest.fn().mockResolvedValue(dateNow);

            User.findOne = jest.fn().mockResolvedValue(false);

            const request = {
                body: {
                    nome: 'Douglas',
                    email: 'teste@email.com',
                    senha: 'HelloWorld',
                    telefones: [{numero: '123456789', ddd: '51'}]
                }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            await controller.createNewUser(request, response);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User).toHaveBeenCalledTimes(1);


        });

    })

    describe("Logando Usuarios", () => {
        test("Se email estiver errado, deve retornar 401 e negar acesso", async () => {
            User.findOne = jest.fn().mockResolvedValue(false)

            const request = {
                body: {
                    nome: 'Douglas',
                    email: 'teste111@email.com',
                    senha: 'HelloWorld',
                    telefones: [{numero: '123456789', ddd: '51'}]
                }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            await controller.loginUser(request, response);
            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'Usuário ou senha inválidos'}
            );
        });

        test("Se senha estiver errada, deve retornar 401 e negar acesso", async () => {
            User.findOne = jest.fn().mockResolvedValue(true)
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            const request = {
                body: {
                    nome: 'Douglas',
                    email: 'teste@email.com',
                    senha: 'HelloWorldkoko',
                    telefone: [{numero: '123456789', ddd: '51'}]
                }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            await controller.loginUser(request, response);
            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'Usuário ou senha inválidos'}
            );
        });

        test("Se ambos estiverem corretos, deve gerar token e retornar 200", async () => {
            User.findOne = jest.fn().mockResolvedValue(true);
            User.findOneAndUpdate = jest.fn().mockResolvedValue(true);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            jest.spyOn(Auth, 'checkToken').mockImplementation(() => false);
            jwt.sign = jest.fn().mockResolvedValue(true);


            const request = {
                body: {
                    nome: 'Douglas',
                    email: 'teste@email.com',
                    senha: 'HelloWorld',
                    telefone: [{numero: '123456789', ddd: '51'}]
                }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            await controller.loginUser(request, response);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledTimes(1);
        });

    })

    describe("Autenticando Usuários", () => {
        test("Se o token não for reconhecido, deve retornar 401 e negar acesso", async () => {
            jest.spyOn(Auth, 'checkToken').mockImplementation(() => false);
            next = jest.fn().mockResolvedValue(false);

            const request = {
                body: {
                    "query": {}
                },
                headers: { Authorization: `Bearer dsf7dsf87sdf7dsf7f78d7fdf` }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

           await Auth.middlewareAuth(request, response, next )
            expect(response.status).toHaveBeenCalledWith(401);
            expect(Auth.checkToken()).toBe(false)
            expect(response.json).toHaveBeenCalledWith(
                {'mensagem': 'Não autorizado'}
            );
        });

        test("Se o token for reconhecido, aceitar acesso e passar para proxima requisição", async () => {
            jest.spyOn(Auth, 'checkToken').mockImplementation(() => true);
            next = jest.fn().mockResolvedValue(200);

            const request = {
                body: {
                    "query": {}
                },
                headers: { Authorization: `Bearer dsf7dsf87sdf7dsf7f78d7fdf` }
            };
            
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

           await Auth.middlewareAuth(request, response, next )
            expect(response.status).toHaveBeenCalledTimes(0);
            expect(Auth.checkToken()).toBe(true)
        });

    })
    
})