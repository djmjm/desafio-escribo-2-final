const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        nome: {type: String, required: true, maxLength: 64 },
        email: {type: String, required: true, maxLength: 64, unique: true }, 
        senha: {type: String, required: true, maxLength: 64 },
        telefones: { type: [{
                        numero: {type: String, required: true, maxLength: 9 }, 
                        ddd: {type: String, required: true, maxLength: 2 }
                    }
                    ], validate: [arrayLimit, "Excedeu número máximo de telefones."]
                },

        data_criacao: {type: String, required: true, maxLength: 32 },
        data_atualizacao: {type: String, required: true, maxLength: 32 },
        ultimo_login: {type: String, required: true, maxLength: 32 },
        token: {type: String, required: true, maxLength: 256 }
    }
)

function arrayLimit(val) {
    return val.length <= 3;
}

const User = mongoose.model('User', userSchema);

module.exports = User;